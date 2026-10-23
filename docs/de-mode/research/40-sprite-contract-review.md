# Independent SPR1 review and bounded SPR2 contract

2026-10-23. **Conditional GO for the small SPR2 asset-core implementation,
with new P2 SPR1-R1-01 corrected before promotion.** All 41 real base Sprites
and 16 paired masks reproduce exactly. The scratch translation raster cannot
be promoted unchanged: its global-coordinate triangle union is not generally
equivalent to the pinned source's triangle-local masks. This finding does not
reopen the accepted metadata/crop findings or invalidate the 57 real outputs.
Root owns acceptance, integration and commits. No scene/game acceptance follows.

## Scope, ownership and exact inputs

Read goal00, contract01, plan02 and engineering05 first, followed by full reports
02/08/14/27/31/34/37, the exact external SPR1 final receipt, performance rationale,
native-parity/cache contracts and relevant implementation/source. The explicit
resume governs this review. Sol6.1; no children. Every Toolkit shell/subprocess
used explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`. This is shared mode, not
worktree isolation. Start and final observed HEAD:
`e3d891cb815a9758542b897065141e71da4a7ca2`, branch `de/separate-game-mode`.

Only this new report was written inside Git. Reviewer source, binaries, synthetic
fixtures, proprietary pixels and logs are outside Git at
**R = `S:/Projects/UCP/de-research/review-sprite-contract-spr1`**.
**S = `S:/Projects/UCP/de-research/sprite-reconstruction-spr1`** identifies the
reviewed implementer evidence. No production edit, dependency installation,
commit/push, CI/dispatch/PR/merge/release, app/game/Steam/DLL launch, live/original
profile/settings, Classic or OS change occurred. Teammate changes were left alone.

**Fresh observed** below means executed/read in this review; **inherited** means
verified existing evidence; **source-confirmed** means inspected pinned source;
**required** describes the SPR2 contract; **unverified** means acceptance remains.

Fresh SHA-256 verification checks **501 input/artifact receipts**, plus the two
separately listed DLL receipts, with zero mismatches. This includes report37,
old/fresh oracle pixels, source files, tool binaries and consumer binaries.
S/`final-receipt.json` is 116797 B, SHA-256
`d4fcd7b8d57cfe0de005a5fd6179f25d177238746cdf6c74c4280d2e6d3e3c0e`.
Report37 is 33884 B,
`6292888010275d7b30f4970b300596f7ac176b351fad40ff665c105865544261`.

All **38 actual crate files** match both S/`core-preservation.json` and PXL2's
accepted `final-core-sha256.json` at start/end. Git commit
`61c2fa16524c7b06d1638eed9c1593afd689e469` matches their content: 29 blobs match
exactly, nine match after CRLF/LF normalization. Those nine are notice files and
the authored BC7 transcript; the exact working bytes remain unchanged. A1's
geometry correction and all PXL2 code/tests remain unchanged. `core-start.json`
records both Git/working hashes and that distinction; `core-end.json` records
the final working hashes. This is preservation evidence, not another full-suite run.

## New finding: SPR1-R1-01, P2

**Preserve triangle-local scan coordinates in the UV translation branch.**
S/`src/main.rs:490-512` draws every translated triangle in global canvas
coordinates and clips to its min/max rectangle. Pinned UnityPy `copy_triangle`
instead subtracts that triangle's source minima, draws a local mask on its
exclusive-max cropped rectangle, then pastes it at the destination minima.
Integer translation does not preserve every float32 scanline rounding decision.
Matching all 41 real examples does not establish that equivalence for the
supported synthetic geometry domain.

An independently specified 512-case source-local comparison fails at case24,
triangle **`[(70,111),(76,72),(13,5)]`** on a 128x129 canvas. The pinned Pillow
algorithm itself distinguishes local and global masks at lower-left pixel
**`(41,58)`**: local coverage255, global coverage0. The Rust global raster agrees
with the global Pillow mask. Thus this is an invalid coordinate-equivalence
assumption, not evidence that Pillow's direct polygon port is generally broken.

The finite witness was then embedded in a complete synthetic serialized Sprite:

```text
positions = [(70,111,0),(76,72,0),(13,5,0),
             (0,0,0),(128,0,0),(128,129,0)]
triangles = [(0,1,2),(2,3,4),(1,4,5)]
PPU = 1; UV = ((x+32)/256,(y+48)/256)
texture = 256x256 BC1a; crop = (32,48,128,129)
one triangle submesh; baseVertex = firstVertex = 0; settingsRaw = 64
```

All six vertices are used. The other two triangles establish the complete
canvas without covering the witness pixel. Through the **actual unchanged
crate's serialized index, `validate_sprite`, source-bound Texture2D lookup and
`crop_texture`**, followed by unchanged SPR1 plan/reconstruction, both Rust1.98.1
and1.88.0 produce `[0,0,0,0]` at top-left output **`(41,70)`**. Actual pinned
UnityPy/Pillow triangle copies produce `[255,0,0,255]`. Exactly one pixel/two
channel bytes differ. No caller-modified metadata supplies crop authority.
`wire_witness.py`, `wire-witness.json` and the two `wire-*-actual_source_bound_*`
logs reproduce this failure; Cargo exits101 are expected evidence of the finding.

The relevant edge slope is float32 `57/106 = 0.5377358198165894`.
At the half-pixel row, local multiplication gives `28.499998092651367`;
adding global x13 rounds the intersection to `41.5`. The pinned `ROUND_UP`
then makes different coverage decisions. This explains the observed one-pixel
loss without changing the oracle, tolerances or extracted game metadata.

**Smallest required correction, owner SPR2:** retain each triangle's local
origin and exclusive width/height while calculating its scan intersections;
translate only writes into the shared coverage canvas. Continue decoding one
enclosing PXL2 crop and unioning binary coverage. No per-triangle texture decode,
affine renderer, new library or temporary image framework is necessary. Preserve
the source's clipping and corner rules. Add the authored source-bound witness
as a regression and demonstrate it against unchanged source expectations.
No implementation correction was made in this review.

## Real pixels, geometry and oracle independence

**Fresh observed:** rebuilt an ordinary release consumer from the exact
S/`src/main.rs` (SHA-256
`4c8ad9cb7105a9dccc65026971204b242152c38f128c56294c729219ce547918`), with Cargo's
path dependency compiling the actual unmodified asset crate. One reconstructed
and one owned raw-crop round each cover all57 planes. Every reconstructed RGBA
byte/alpha byte matches both saved full-Sprite exports and saved fresh-source
outputs; maximum error0. All209 vertices/UV tuples,127 ordered triangles and41
canvas sizes match the separately parsed metadata transcript exactly.

The reviewer also freshly invokes the pinned **actual** `render_sprite_mesh`
and `mask_sprite`, without reimplementing them. An independent bounded crop proxy
reads compressed rows using newly read UnityPy Texture2D metadata and Pillow's
BC1/BC7 decoder. Every one of its57 planes matches the new Rust output exactly.
It reads3449 rows/607904 encoded bytes. Inputs are hashed on retained Windows
read/share-locked handles before/after each evidence run:

```text
resources.assets       114825928  9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a
resources.assets.resS  1396428560  be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e
```

The named cases remain closed as extraction findings:

- **Healer640/103049:** five vertices/three triangles; fractional render rect
  `(5944.1181640625,6740,34.881675720214844,85)`, canvas35x85, local origin
  `(15,68)`. Against its reconstructed-source raw crop, base differs481 bytes/
  4 alpha, mask792 bytes/198 alpha. A rectangle alone is insufficient.
- **Camel512/28503:** eleven vertices/nine triangles,87x211, local origin
  `(35,175)`. Raw crop includes neighbouring art:11333 base bytes/1126 alpha
  and25213 mask bytes/6818 alpha differ. Reconstruction clears hidden RGB too.
- **Camel517/117735:** render extent height194.97325134277344 at
  y1802.0267333984375, yet mesh canvas138x198 and UV source origin `(704,1799)`.
- **Healer644/82120:** fractional render extent35.8809700012207x87.92388153076172,
  mesh canvas37x89 and UV source origin `(5734,6925)`. Deriving its canvas from
  the render rectangle loses pixels. Continuous local origins and pixel-row
  flip `H-1-y` remain separate contracts.

**Independence assessment:** Rust parsing/geometry access differs from UnityPy's
parser/TPK/Boost path; Rust block decoding differs from the Pillow crop path;
the fresh proxy also independently calculates compressed-row addresses. Earlier
full-atlas exports and fresh row crops exercise different allocation/read and
fixture routes. However, both pixel oracles use the same UnityPy extraction
algorithm, MeshHandler conventions and Pillow raster/codec family. They are
cross-checks of the parser/pixel/fixture boundary, **not two independent Unity
rasterizers**. The new P2 demonstrates why this distinction matters. Database
schema interpretation, Pillow wheel-to-source reproducibility, Unity GPU fill,
sampling/gamma/blending and actual game appearance remain unverified.

## Pairing, bounds, work, provenance and performance

**Source-confirmed:** freshly read immutable managed `spriteLoader.cs` at
Serpens commit `7e199e6f0818173794bdeeb0c4c32d74500b0eec`; Git blob SHA-256
`24e57447e342a45fdf0eee0da844bc466e4132619f94508784c19e33ed3bb59a`.
Lines246-285 load AllTileSprites without a mask and body15/body16 with
`makeMask:true`; lines465-509 load `path+"_m"` as Texture and bind `_TeamMask`.
The known pairs are Texture2D23/`body16Sprites` ->12/`body16Sprites_m` and
42/`body15Sprites` ->50/`body15Sprites_m`;
AllTileSprites31 is explicitly unmasked. Same-named Sprite69712 is excluded
by class28 resolution. Fresh synthetic checks on both Rust versions exercise
batched zero/many Texture2D matches and a separate one-Sprite match. All57 real
planes exercise the one-match resource path. Unknown resource families must not
inherit a suffix-pairing policy or become unmasked merely because lookup is zero.
Known missing masks and ambiguity must fail explicitly.

Report08/14's native stationary selection and outpost tables remain accepted
source evidence, not freshly re-disassembled here. Preserve their chimp/GM/
marker/native-image/Unity-suffix domains; named selectors belong to a semantic
catalogue, not a generic mesh rasterizer. Raw mask red/green/alpha are separate
from base pixels. Shader58 program3 arithmetic and its hash
`0373bd054a0f2b5c8da0d06195b6ac145fb42d4fb010a88af0ff329dbc09128e` were inspected;
player colour, cutoff and final appearance are outside this extraction API.

**Fresh observed:** eight supplied raster cases and scratch assertions for
shared exhaustion, pre-allocation cancellation, partial-progress cancellation
at charge12, visit limit, output limit and ties-to-even rounding pass. Four
supplied scratch Rust tests plus515 independently specified direct Pillow mask
cases pass on current Rust. These direct-mask cases do not exercise triangle-
local translation; the separate source-local workload fails at case24 and does
not claim all512 passed. Source-change/codec/parser negatives and the622M legal
repeated-index-range regression are inherited from27/34, with exact source/test
hash preservation; their large suites were not gratuitously rerun.

**Required SPR2 boundaries:** use one private shared float32 stream/geometry
helper for validation and reconstruction. Preserve every validated index visit,
raw fractional/negative metadata and A1's cumulative Work/cancellation semantics.
Keep one-submesh XY, base/firstVertex0, unrotated/unpacked and audited zero-UV
mask or rounded integer-translation branches. Refuse affine/packing/rotation/
external/alpha/secondary/unknown layout cases explicitly; no silent crop fallback.
Retain the audited mip0 extraction profile and original identities.

Replace the scratch ledger/reservation bridge with the existing private
`Work::charge` in the asset owner. Charge geometry, scanlines/edges, coverage
visits, copies and zeroing; keep cancellation at completion, including the last
visit. In `find_names`, charge/check every object **before** class filtering;
the present filtered iterator skips nonmatching entries without individual
checks. The scratch pre-accounting traversal is disclosed evidence scaffolding,
not shipping cancellation policy. Batch any name catalogue once in background
preparation; do not scan137773 objects per Sprite plane or frame.

Plan checked combined crop+coverage+result memory before pixel allocation/I/O,
including encoded-row and geometry scratch. Pixel buffers alone are **9WH**,
not4WH. Keep PXL2's16MiB output/8192-axis/262144-block/32KiB-row defaults,
separate raster-visit and scratch/output caps, fallible new allocations, bounds
before narrowing, one cumulative allowance and no partial-success output.
Preserve source-bound ObjectKeys, both SourceStamps, crop/mip/format/decode
identity and a named extraction-convention revision. Completion must recheck
assets and pixel sources after reconstruction, not merely after crop decode.
Ordinary NTFS/cooperating ReadAt/noncryptographic-stamp limits remain; privileged
file-symlink behavior remains inherited unexercised evidence.

**Provenance:** inspected UnityPy SpriteHelper/MeshHelper/Texture2DConverter at
`807f3888b8a2ddaa6504fca0737481baab4d6a99`, with the separate accepted ObjectReader
pin retained. Pillow Draw.c/_imaging.c are pinned at
`293218ad059d994baf1777d882911bed6a49704a`; Draw.c SHA-256
`5aefa0c335e8e6c3a30c9e61a4e5aa790d72544aa9be0f41704b184e503b2e0d`.
The C wrapper truncates floats; Draw.c uses float32 edges, corner handling and
its distinct ROUND_UP/DOWN rules. The port is source-derived. SPR2 must retain
the full1457B Pillow notice
`15181e7363dca9aed78b79bebebc7fde7f1814b8bd311ea3b87ae8ccadfc185b`, relevant
Draw.c copyright attribution, exact source links/pins and adaptation provenance,
beside existing UnityPy/decoder notices. The pinned notice itself calls the
license MIT-CMU; preserving its actual text is preferable to relying on report37's
HPND shorthand. No game pixels, oracle package or schema dataset is to ship.

**Fresh finite cost witness:** one equal57-plane workload in the same owned
release binary visits34246 blocks,1761 rows,448688 encoded bytes and2065456
returned bytes. PXL2 debit491370 and added raster debit3549264/967444 visits match
report37. Maximum requested additional live allocation is249327B reconstructed
versus112318B raw. One OS-warm timed round is203.404ms versus192.518ms; this is
diagnostic, not a statistical comparison or UI evidence. Report37's larger
noninterleaved warm samples remain inherited, not a portable latency promise.
No product runtime path consumes this crate. Later integration must preserve
retained worker scenes/latest-only queues, batching, caches/dirty invalidation
and deferred work, exclude probe/hash/decode/per-frame IPC from draw/input, and
compare affected interactive workloads on an owned equal-condition baseline.

## Reproduction, receipts and next owner

Run from explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`, using existing dependencies
and locked/offline Cargo builds with targets under R:

```powershell
python -B S:/Projects/UCP/de-research/review-sprite-contract-spr1/review.py
python -B S:/Projects/UCP/de-research/review-sprite-contract-spr1/source_oracle.py
# source_oracle.py deliberately exposes case24: exit1; its fresh57 planes pass.
python -B S:/Projects/UCP/de-research/review-sprite-contract-spr1/witness.py
python -B S:/Projects/UCP/de-research/review-sprite-contract-spr1/wire_witness.py
python -B S:/Projects/UCP/de-research/review-sprite-contract-spr1/final_audit.py
```

The witness drivers require Cargo101 with the specific pixel-mismatch diagnostic,
then exit0 themselves. `commands.json`, `source-oracle-command.json`,
`supported-sprite-witness.json`, `wire-commands.json` and logs retain exact argv,
cwd, environments and exits. `review.py` intentionally recreates its owned probe;
run these in order when reproducing. It never modifies S or the production crate.
The release binary used for real crops is419840B,
`29fa7a4abd72443c3a24e625aaea2e3da6641aa734d642c898c8123e604c3f1e`;
its differing hash from S's binary is recorded, not asserted byte-reproducible.

Selected reviewer evidence SHA-256:

```text
review.py                 489f456263f07de095eb972f18bf87e4fdaa9a7171de2b3d92d533e0fcf746ea
source_oracle.py          513b2d3b427f062a0a1dd4facc660dd40b80f308e4a5b5878e92b3141ba4f911
wire_witness.py           dcefcc09a89e248195942e68d1c3f6b6172a1e2d20cb357435cd6a7ee12d83c7
reproduction.json        1e31168e365c7c6bf4ca9f3df8e6a0ebc7cfcf46ec6c8c04e0e179826593e656
fresh-source-oracle.json f64069293221d95b997ee1248fbdef4fa77d175c2285813f2f1665d753e94677
wire-witness.json        77638fa84987f1677e1952c872b7fa3161c176cb6c954b2e99627953c104c9d8
```

Reviewer setup corrections are retained honestly: the receipt comparison first
compared differently shaped records, then encountered Git newline normalization;
both were corrected without altering bytes. A read requested nonexistent
`src/sprite.rs`; the owner is `metadata.rs`. The first source-bound synthetic
builder accidentally appended an extra bone-colour word with zero bones and
correctly hit `Corrupt("trailing bytes")`; initial logs remain in
`wire-setup-initial`. The final fixture passes parsing/validation/crop and fails
only the stated pixel comparison on both Rust versions. No oracle was tuned.

Assign the same Rust asset owner the bounded module/tests/exports/docs/notices,
the shared private geometry extraction and name-walk correction. Require the new
local-coordinate witness, original57-plane parity and preserved A1/PXL2 negatives
on both Rust versions before root accepts its implementation. No further broad
research gate, renderer/cache framework or host implementation is needed here.
Unity/game rasterization, shader colours, world-facing/placement, flat/lowered,
complete Stockade/overlays, persistent caches/profile/window lifetime, both-host
integration, Classic regression and interactive/game acceptance remain open.
