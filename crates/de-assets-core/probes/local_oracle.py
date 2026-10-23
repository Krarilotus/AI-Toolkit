"""Optional UnityPy oracle, called only by hash-gated local_parity.ps1.

No game execution or writes. All metadata transcripts/reports go to an explicit
scratch directory outside Git. Synthetic cargo tests do not invoke Python.
"""
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import sys
import time

sys.dont_write_bytecode = True
game, deps, layouts, scratch, probe = map(Path, sys.argv[1:])
scratch = scratch.resolve()
repo = Path(__file__).resolve().parents[3]
if scratch == repo or repo in scratch.parents:
    raise RuntimeError("scratch must stay outside the core crate/repository")
scratch.mkdir(parents=True, exist_ok=True)

# Per-file pins from Review14. CRLF normalization matches its provenance audit.
pins = {
    "UnityPy/files/SerializedFile.py": "340f64f1c9aea3375b3c8b8e08a8d82537fb140fb7990ca9951c22a76d448b78",
    "UnityPy/files/ObjectReader.py": "022f54712c6394323a11a3a10876fb27d5c2801fedeb99a7cd9a9beb407b4238",
    "UnityPy/helpers/Tpk.py": "c03830556a4b5cf29aa3ef27b822e5e6ed199989198901f4e6da819892fc27f2",
}
for name, expected in pins.items():
    assert hashlib.sha256((deps/name).read_bytes().replace(b"\r\n",b"\n")).hexdigest() == expected, name
assert hashlib.sha256((deps/"UnityPy/resources/uncompressed.tpk").read_bytes()).hexdigest() == "3777edf16f1a57908640ef6d1e49fa51533e545424188b239c1b8e2ead3988da"
# Additional local execution pins, not assigned invented upstream commits.
for name, expected in {
    "UnityPy/helpers/TypeTreeHelper.py":"cbacde65daabdd9be41bb99a74528d43cc775c93dee7c1250c2b26b28a5cc58d",
    "UnityPy/UnityPyBoost.cp314-win_amd64.pyd":"b57ba7de45fedf1c4f430d8e8684a73d511cc09ca6cf8f72d43b8067e000943c",
}.items():
    assert hashlib.sha256((deps/name).read_bytes()).hexdigest()==expected,name
layout_pins = {213: ("Sprite", "f661930315e8fb7f46ba8d07216206b3f691b9e26a817c7607de16862964cc5f"),28: ("Texture2D", "ec92966a3d251274e6e4ad89d66f0a277f7fb8d6806b0211d65f222fcf99f26e")}
def tree(class_id):
    name, expected = layout_pins[class_id]
    raw = (layouts/(name+"-2021.3.45f2-layout.json")).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == expected
    nodes = json.loads(raw)["nodes"]
    def at(i):
        n = dict(nodes[i]); n["kids"] = []; j = i+1
        while j < len(nodes) and nodes[j]["m_Level"] > n["m_Level"]:
            child, j = at(j); n["kids"].append(child)
        return n,j
    return at(0)[0]

primitives = {"int":"i", "unsigned int":"I", "SInt64":"q", "UInt64":"Q", "float":"f", "UInt8":"B", "char":"B", "bool":"B"}
def canonical(node, value):
    kind = node["m_Type"]; kids = node["kids"]
    if kind == "string":
        b = value.encode("utf-8"); return struct.pack("<i",len(b))+b
    if kind == "TypelessData":
        return struct.pack("<i",len(value))+bytes(value)
    if kind in primitives:
        return struct.pack("<"+primitives[kind], value)
    if kind == "pair":
        return b"".join(canonical(n,v) for n,v in zip(kids,value,strict=True))
    if kids and kids[0]["m_Type"] == "Array":
        element = kids[0]["kids"][1]
        return struct.pack("<i",len(value))+b"".join(canonical(element,v) for v in value)
    return b"".join(canonical(n,value[n["m_Name"]]) for n in kids)

sys.path.insert(0,str(deps))
import UnityPy
assert UnityPy.__version__ == "1.24.2"
env = UnityPy.load(str(game/"resources.assets"))
source = next(iter(env.files.values()))
wanted = re.compile(r"^(?:body_camel_lancer-51[2-9]|body_bedouin_healer-64[0-7]|tile_buildings2 (?:129\d|130\d|131[0-4]))$")
extra = {"body_bedouin_healer-0x", "body_skirmisher-2135", "body_skirmisher-2172", "body16Sprites_m"}
selected = []; named = {}; missing = True; originals = 0
for obj in source.objects.values():
    cid = obj.type.value
    if cid not in (213,28): continue
    name = obj.peek_name()
    if cid == 213 and name == "body_skirmisher-2136": missing = False
    if cid == 28 or wanted.fullmatch(name) or name in extra:
        d = obj.read_typetree(); selected.append((obj.path_id,cid,name,d)); named[(cid,name)] = d
        if cid == 213 and wanted.fullmatch(name): originals += 1
assert missing and originals == 41
assert sum(cid == 28 for _,cid,_,_ in selected) == 41
assert named[(213,"body_bedouin_healer-640")]["m_RD"]["m_VertexData"]["m_VertexCount"] == 5
assert named[(213,"body_camel_lancer-512")]["m_RD"]["m_VertexData"]["m_VertexCount"] == 11
assert named[(213,"tile_buildings2 1290")]["m_RD"]["m_VertexData"]["m_VertexCount"] == 4
assert named[(28,"body6Sprites_m")]["m_TextureFormat"] == 12
assert named[(28,"UIMask")]["m_MipCount"] == 6
assert named[(28,"TrialExpiredTexture")]["m_MipCount"] == 12
assert named[(28,"Font Texture")]["m_ImageCount"] == 0
assert len(named[(28,"text")]["image data"]) > 0
assert (213,"body16Sprites_m") in named and (28,"body16Sprites_m") in named
assert (213,"body_bedouin_healer-0x") in named
request = "".join(f"{cid} {pid}\n" for pid,cid,_,_ in selected)
started=time.perf_counter()
result = subprocess.run([str(probe),str(game)],input=request,text=True,capture_output=True,check=False)
rust_seconds=time.perf_counter()-started
(scratch/"rust-transcript.tsv").write_text(result.stdout,encoding="utf-8")
(scratch/"rust-stderr.txt").write_text(result.stderr,encoding="utf-8")
if result.returncode:
    raise RuntimeError(f"Rust probe failed ({result.returncode}): {result.stderr}")
actual = {int(line.split("\t")[0]): line.split("\t")[2] for line in result.stdout.splitlines()}
trees = {cid:tree(cid) for cid in (213,28)}
summary = []
for pid,cid,name,d in selected:
    expected = canonical(trees[cid],d)
    got = bytes.fromhex(actual[pid])
    assert got == expected, (pid,name,len(got),len(expected),next((i for i,(a,b) in enumerate(zip(got,expected)) if a != b),None))
    summary.append(dict(id=pid,class_id=cid,name=name,canonical_bytes=len(got),sha256=hashlib.sha256(got).hexdigest(),all_fields_equal=True))
(scratch/"parity.json").write_text(json.dumps(dict(original_sprites=41,textures=41,extra_sprites=len(selected)-82,missing_skirmisher_2136=True,rust_seconds=rust_seconds,rows=summary),indent=2),encoding="utf-8")
print(f"Full-field f32-bit parity: 41 original sprites + 41 textures + {len(selected)-82} extra sprites; all pass")
print(f"Rust index, uncached names, metadata, geometry/range checks: {rust_seconds:.3f}s (diagnostic, not a startup benchmark)")
print(result.stderr.strip())
