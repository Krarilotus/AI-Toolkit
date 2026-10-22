# Independent domain contract review — round 1

Date: 2026-10-22. Toolkit baseline `818503dc40971defef3769ca883f82290405ab94`,
branch `de/separate-game-mode`. Read the verbatim goal, working contract, plan,
reports 01/02/03 and coordinator synthesis before reviewing. This is a bounded
review of D1 and the first vanilla package boundary, not another full survey.

**Decision: GO to implement D1 as new, unexposed modules, with R1–R6 below as
mandatory acceptance conditions. NO-GO for treating the current narrative alone
as a sufficiently precise implementation contract.** The coordinator's raw
source/schema overlay/separate export validation response addresses the major
conversion objections. The remaining fixes are concrete API and fixture rules,
not a reason to postpone the isolated foundation for further broad research.

This does not approve UI integration, installation, game acceptance, arbitrary
runtime values, redistribution of local artwork, or SE/Fixes execution. No
implementation or baseline suite was run or changed here. Only this report was
written; no child delegation, Git mutation, game/app launch or installed write.

Evidence labels: **observed** = independently read/probed in this review;
**source-confirmed** = explicit pinned source behavior; **inferred** = review
policy/design consequence; **unverified** = unresolved runtime/provenance claim.

## Independent checks and provenance objections

**Observed:** the read-only Serpens objects resolve to develop
`7e199e6f0818173794bdeeb0c4c32d74500b0eec` (D) and main
`a23aa1b32276d670ffbb2a7b641d23b500d8e298` (M). The relevant source blobs are
identical on both pins:

- `CustomisationFileManager.cs`: `9cd4c4ad0a601aab1217bb786e741ef15a39f1be`.
- `AIVLoader.cs`: `9b3dd0a64af8a3d0e276c375a462270958fceb06`.
- `EngineInterface.cs`: `97bf5fcabdd626a6e80c1e17e546f357fc2d4874`.
- `exports/semantic-decompiled-functions.c`:
  `2aee03bdea5e6728865d263f80e02bf991af9d7a`.

The `IDENTITY.json` blobs differ. [M lines 2–8][identity-main] name SE commit
`5908e1f12437deb7ef5f5b1dc2d64e301178fba3`; [D lines 3–8][identity-develop]
name `10628df85cd432184742a50a1dee3969a66cf89e`. Neither is the separately
inspected local SE pin `4014ca67c96974a5e6d697665baf5351cbfebde6`.
**Required correction to provenance wording:** shared native/game code is
applicable to this hash pair; it does not establish that every knowledge note,
SE header or historical runtime capture was refreshed for the current SE.
The editor decompilation under `_inspect/AI-Toolkit-DE` is D-only, not M.

**Observed fresh SHA-256 checks:**

- Installed `..._Data/Managed/Assembly-CSharp.dll`: 3,693,056 bytes,
  `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`.
- Installed `..._Data/Plugins/x86_64/CrusaderDE.dll`: 3,451,392 bytes,
  `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
- Shipped `StreamingAssets/CustomMediaExample/ReadMe.txt`: 7,162 bytes,
  `7962a7cded30b14a2022d40011078d41631bb2e1b337bf521e134b975acdd2f9`.
- `reference-aive-0.9.6/AIVE_0.9.6/AIVEditor.exe`:
  `6474c8b7433e99532d5d4a90d1ffe40f9e3fb6b652ed5b917529e46c05ec12b4`.
- Its `plugins/aivconverter.exe`:
  `a1825e1e4a04c68e0222b60bde4283383ad6a0e87cc7bacbb3ec918f12e18e04`.

The game hashes agree with both identities. The reported official-editor
assembly hash `3735ef057cac15c7173b3cecb12801e2b76a9a913f87dc4131419b7ad5bf1b64`
remains **unverified locally**; it is not the AIVE executable hash or game DLL.
No inference about installed editor schema follows from the AIVE executable.

**Observed/source-confirmed:** independently counted 118 game declarations,
14 arrays and 279 public Int32 words; all 14 transfer index ranges exactly
cover the declared lengths. The editor declaration has 117 fields, with
`opponent_type_for_speech` the only game-only field. See [game declarations
157–400][game-schema], [transfer 4303–4586][transfer] and [editor 26–267][editor].
The SE converter explicitly skips speech on public export and sets it equal to
`opponent_type` on import ([128, 252–254][public-aic]); its null/short-array zero
fill at 562–565 is converter policy, not a verified vanilla default.

**Observed/source-confirmed:** native importer RVA `0x55320`, 2,648 contiguous
bytes, hashes to
`82c2ec8b15861341f35073bf176c2c19e5fd76ab5b1d3344d9b8c7e5209ec645`, matching
[M semantic-functions.jsonl line 721][native-record]. Its negative-type branch
and marker addressing agree with the reports ([49184–49221 and
49376–49384][native-import]). This check is specific to that span; no general
contiguous-function hashing claim is made. Independently counted **77 function
entries / 77 names** in the local native PE export directory, contradicting
[SEMANTIC_INFO.md line 96][semantic-info]'s 78 including `entry`. This narrative
error does not invalidate the hash-matching importer; do not propagate it.

## R1 — Define three independent outcomes, not one “valid” flag

**Required review policy (inferred):** distinguish successful JSON parsing,
successful LORDJSON interpretation, and compatibility with an explicit target.
Preservation must not depend on the latter two.

- Malformed JSON: truncated token/container, missing separator, comments,
  trailing comma, raw control character in a string, bad escape, `01`, `+1`,
  `NaN`, `Infinity`, or another non-whitespace document after the first root.
  Return a location-bearing syntax error; do not repair/re-serialize it.
- Valid JSON but not interpretable LORDJSON: primitive/array root, absent/null/
  non-object `lord`, wrong field type. The generic document remains preservable;
  the LORD overlay returns diagnostics instead of manufacturing an empty lord.
- Valid JSON/LORD shape but target-incompatible or unverified: Int32 overflow,
  incomplete arrays/fields, extra array tails, unknown semantic IDs, ambiguous
  known keys, noncanonical numeric spellings, or extension data. Keep the input
  and allow unambiguous supported edits; report target status separately.
- Unsupported encoding and resource limits are their own failures, not evidence
  of malformed JSON. Preserve original bytes for an optional opaque recovery
  path; do not expose a partially parsed tree as a valid editable document.

The generic grammar accepts duplicate members and every JSON value at the root.
Duplicates are an interoperability issue; JSON numbers can exceed binary64;
escaped lone surrogates have uncertain interoperability. UTF-8 and optional BOM
handling need an explicit implementation policy. These distinctions follow
from [RFC 8259 §§2–8][rfc]; the stricter export choices below are Toolkit review
policy, not claims about Unity's acceptance of every edge case.

## R2 — Lossless means retained bytes plus ordered syntax nodes

The source of truth is immutable original bytes with ordered member/element
nodes and exact token/trivia spans. Decoded names/values are an overlay, never
an object passed through `JSON.stringify`. Keep root/lord/nested extensions,
duplicate members, ordering, whitespace/newlines, array tails and all numeric
and string token spellings. New edits must not require enumerating known keys
into a replacement object. Treat `__proto__`, `constructor` and similar names as
ordinary data, without object-prototype effects.

An unchanged save returns identical bytes, including BOM and final whitespace.
A scalar/index edit replaces only that selected value token. All other bytes
must equal the original prefix/suffix, even if the replacement length changes.
Setting a field to its existing decoded value should be a no-op, retaining its
lexeme. Defer insertion/deletion/reordering if their whitespace contract is not
implemented; an explicit unsupported operation is preferable to a whole-object
rewrite. A sequence of edits must rebase spans or use a fresh revision. Reject
stale node handles and overlapping patch batches before changing output.

**Duplicate known keys:** retain every occurrence, but never apply first-wins or
last-wins implicitly. Compare decoded names, so `opponent_type` and
`opponent\u005ftype` collide. Duplicate root `lord` makes the overlay ambiguous;
duplicate known members make that field ambiguous. Return all occurrence spans.
Block ordinary semantic edits through an ambiguous ancestor/field and block
target compatibility until an explicit resolution operation exists. A low-level
API may select a specific node occurrence, but cannot silently resolve the
document by doing so. Other uniquely addressed values can still be edited.
Unknown duplicates also survive; report them. For the first package, reject
unresolved duplicate names in root/`lord` scopes conservatively, without claiming
that Unity rejects them. Unknown nested duplicates are not a reason to corrupt
or discard that subtree.

## R3 — Make encoding, string tokens and numeric tokens explicit

- D1's supported editable byte encoding is UTF-8, with or without a single
  leading `EF BB BF`. Retain that prefix separately; reject invalid UTF-8
  fatally rather than inserting U+FFFD. UTF-16/32 BOMs return unsupported
  encoding, not a speculative conversion. Game discovery uses `StreamReader`
  ([659–662, 693–696][discovery]); this is not proof that every file it can read
  must be supported by D1. Additional encodings can be a later explicit feature.
- A second/out-of-place BOM is not whitespace in the JSON grammar. U+FEFF inside
  a string is data. Preserve escapes (`\/`, `\u0061`, surrogate-pair spelling)
  and actual non-ASCII bytes. Do not normalize Unicode, case, slashes or line
  endings. Byte offsets and JavaScript UTF-16 indices are different; choose one
  span unit and test multibyte/astral text before edited tokens.
- Preserve syntactically allowed escaped lone surrogates unchanged, with an
  interoperability diagnostic; do not decode/re-encode their values into UTF-8
  replacement characters. Do not certify them for the first game package.
  Reject new invalid string values/escapes in the edit API. Changed strings
  require proper JSON escaping, including controls; untouched string tokens
  never run through a string emitter.
- Unknown numbers remain raw numeric tokens, including `9007199254740993`,
  `1e400`, `1e-9999`, `-0`, exponent case/sign and fractional trailing zeroes.
  Never coerce them through Number, a generic object projection or BigInt JSON
  serialization. Unknown magnitude alone is not a syntax error. Depth/token/
  size limits must fail explicitly without truncating or expanding exponents.

**Observed diagnostic probe, Node v26.7.0:** `JSON.parse`/`JSON.stringify` turns
the above integer into `9007199254740992`, `1e400` into `null`, and `-0` and
`1e-9999` into `0`; escaped duplicate `opponent_type` selects the last value.
Default `TextDecoder` strips a leading BOM; `ignoreBOM:true` retains it. Fatal
UTF-8 decoding rejects `C0 AF`. Encoding a decoded lone `\uD800` value with
`Buffer.from(value,'utf8')` produces `EF BF BD`. These are reasons to retain
tokens/bytes, not successful D1 codec tests.

## R4 — The LORD overlay is pinned game schema, not defaults or normalization

The schema JSON must identify D commit, exact source path/lines and game managed
and native hashes above. Store all 118 exact names and signed Int32/array types.
Record declaration initializers separately from runtime defaults. Do not use
the D-only 117-field `lord-schema.json` as the game schema. An editor/SE export
missing speech stays missing; do not derive speech from `opponent_type`.

The 14 array lengths are: `farm_types` 8; `sell_all` 15;
`chance_of_defensive`, `chance_of_harrasment`, `chance_of_seiging` and
`troop_production_rate` 3 each; `defensive_troops`, `harrasment_troops`,
`harrasment_machines`, `siege_machines` 8 each; `siege_wall_troops` 24;
`starting_troops_normal`, `starting_troops_deathmatch`,
`starting_troops_crusader` 28 each. Keep all positions, including starting
slots 7/17/18/19. Never clamp negatives: the editor explicitly offers `-999`
for the three production choices ([5294, 5312, 5330][negative-values]).

For target validation require an unambiguous object `lord`, decimal-integer
number tokens in `[-2147483648,2147483647]` for known scalar/array values, and
arrays for the 14 known array members. No strings/booleans/null coercion,
rounding, unsigned wrap or zero padding. Check integer token magnitude exactly
before converting a known value to Number. Accept `-0` without respelling it.
**Conservative policy:** tokens such as `1.0`/`1e0` remain valid preserved JSON
but are not certified Int32 inputs until Unity's typed-number behavior is
probed; their mathematical integrality does not prove deserializer behavior.

Missing known members stay missing. The first complete export profile requires
all 118; missing/null/short arrays are target errors because the transfer reads
each indexed position directly. This is a conservative complete-input policy,
not a claim that every absent scalar crashes Unity. An array with more than N
entries is preserved in full: the current transfer reads the first N and ignores
the rest, so “exactly N required by the loader” would overstate the evidence.
Require every tail entry to satisfy the declared Int32 element type before
certifying typed shape, and issue an ignored-tail/extension diagnostic. The
first canonical package should use exact lengths; do not trim another user's
longer array or label its runtime transfer lossless. Unknown enum IDs stay raw
signed values with unknown semantic status, not substituted UI indices.

Do not claim a self-authored all-zero or declaration-initializer template is a
known-good AI. `200/5/7` are observed declaration initializers, not evidence for
missing-field semantics or all gameplay defaults. D1 fixtures can be complete
and shape-valid without being a playable acceptance fixture.

## R5 — Maintain format and capability boundaries

**Source-confirmed:** raw SE BAIC is the packed 377-word/1,508-byte structure,
including parent at `0x450` and reserved words through `0x5E0`
([InternalAIC 5–385][internal-aic]). Game `EncodeLordConfig` emits version word
2 plus 279 public words (1,120 bytes), not BAIC ([4589–4873][wire]). BAIV is a
different variable-length Int16 operation stream ([AIVLoader 35–84][aiv-writer]).
LORDJSON is neither one nor UCP Character JSON. D1 must not sniff these binary
formats by a convenient size, accept them as JSON, call a public converter to
normalize them, or claim a BAIC/BAIV round trip. Future binary editing needs
original bytes and verified format-specific offsets/tails.

AIV work is outside D1. Preserve its generic JSON tokens without integrating
the current castle normalizer. The native counted frame branch tests type <0;
zero with multiple offsets cannot be encoded by negating zero. The managed
writer narrows to Int16, caps pauses at 49 plus sentinel, and subtracts 9000
once only for misc type >9000. Vanilla marker number 10 aliases another class
through class*10+number. Fixes' 30-slot feature is a separate capability:
reviewed class lists cover 6–19 and 22–28, not all markers or class 29
([26–56 and 575][fixes]). Thus “all DE troops have 30 supported spots” would be
an incorrect extrapolation from the editor UI.

The Sushi source independently confirms dense marker renumbering on import
([543–550][sushi]) and restricted low classes/numbers plus pause truncation on
export ([734–748][sushi]). This supports rejecting it as a hidden normalizer.
Report 01's binary execution probes were reviewed, not rerun here; binary/source
build provenance and exit-zero failures are inherited observations, not a fresh
claim that the Python pin built the bundled executable.

## R6 — First vanilla package plan is data-only and manifest-first

**GO for a later bounded planner after D1 review**, without install execution.
The game requires at least one successfully converted immediate `.lordjson`
and `.aivjson` in a named lord directory ([622–722][discovery]). Neither filename
must be `Default`; do not make the sample layout a new requirement. Avatar is
optional, exactly 144×144 and strictly less than 80,000 bytes ([724–747][avatar]).
The shipped README lines 5–24 independently confirm matching-name
`CustomMedia/<name>` and shared media for equal local/Workshop names.

Planner input must keep package/source identity, target profile identity,
actual folder/media basename, config/castle variants and hashes separate.
Successful JSON parsing cannot make an AIV variant executable; the later AIV
validator must own order, pauses, grid/footprint and marker-capability checks.
Keep both destination roots in one plan/rollback manifest. Check existing-file
and case/path collisions, reserved/unsafe names and physical containment before
any later writes; do not silently sanitize a name and break media matching.
Unknown files and extensions stay in the source document without being silently
promoted into an installation payload.

The first planner must not require SE, scripts, DLLs, `info.json`, `lordmeta.json`
or Fixes preferences. Do not require all 32 WAVs/four WebMs to make a lord
discoverable: missing-media fallback is separately source-confirmed
([speech 1360–1388][speech], [video 1800–1823][video]). The 99-byte conservative
native speech-reference bound concerns the separately reviewed SE/native path;
it is not a LORDJSON string limit or a proved universal vanilla filename limit.
Media playback/decoding, isolated game discovery, constructor behavior and
save/reload remain unverified. Authentic Unity sample extraction from report 02
neither licenses redistribution nor establishes idle/world-render parity.

## Focused D1 fixtures and review gate

Use self-authored bytes, no game assets or third-party lord fixture committed.
Every success case needs unchanged byte equality and, when edited, exact
original-prefix/replacement/original-suffix equality. Expected semantics alone
or parse/stringify equality is insufficient.

1. Complete 118-key fixture, distinct opponent/speech, unique values at every
   array position, all three 28-arrays, 24 wall slots, `-999`, root/lord/nested
   extensions. Edit one scalar then one array index; nothing else changes.
2. Missing/null/object/empty/short/exact/long arrays; Int32 boundaries and
   overflow by one; string/bool/null/fraction/exponent in known fields and tails.
   Preserve all; report precise paths/spans and target error versus ignored tail.
3. Duplicate root `lord`; duplicate known scalar/array; escaped-equivalent known
   key; duplicate unknown key/subtree. Preserve order/occurrences; ambiguous
   semantic lookup/edit fails without selecting first/last. Unrelated unique
   scalar edit retains every duplicate.
4. Unknown integer >2^53, huge integer, `1e400`, `1e-9999`, `-0`, `1.2300E+02`
   adjacent to edited known fields. Their lexemes remain exactly unchanged.
5. UTF-8 with/without BOM, CRLF/LF/mixed trivia, tabs, trailing whitespace and
   no final newline; umlaut/astral characters before/after edited spans;
   escaped slash/quote/backslash/Unicode, surrogate pair and escaped lone
   surrogate. Unknown strings are not decoded/re-emitted on ordinary save.
6. Invalid UTF-8, UTF-16 BOM, second BOM outside a string, malformed escape,
   unescaped control, leading zero, truncated container, comment, trailing comma,
   concatenated roots; distinguish syntax/encoding/limit errors and retain
   original bytes without partial mutable success. U+FEFF inside string passes.
7. Generic valid roots `null`, `[]`, `17`, `{}` and absent/null/wrong-type lord:
   generic preservation succeeds, LORD diagnostics fail cleanly; no auto-fill.
8. Repeated edits with shorter/longer replacement tokens after multibyte text;
   stale handles, overlapping edits and edit failure are atomic. No-op edit
   retains original spelling; serialize/reparse retains duplicate occurrences.
9. Unknown `__proto__`/`constructor` keys, depth/token/byte limit boundaries:
   no prototype mutation, exponent expansion, stack failure or truncation.
10. Negative boundary fixture for the D1 classifier: synthetic BAIC-sized bytes,
    BAIV-like bytes, AIVJSON and UCP-character JSON never become a LORD document
    merely from extension/length. Generic JSON may still preserve the latter two.

The next implementer may own only new shared `lossless-json.js`,
`de-lord-format.js`, a game-pinned schema JSON and their focused synthetic tests
(coordinator assigns exact directories, consistent with the existing shared JS
module convention). No UI, existing castle/character codecs, backend plumbing,
package installation or Classic changes. Implement raw parser/serializer first,
then unique-path patching, then LORD overlay/target diagnostics, then the above
fixtures. Expose no misleading global `validForGame=true` or “known-good lord”
label. Return focused local test results and diff for independent review;
coordinator owns acceptance, integration, central docs and milestone commits.

## Reproduction and remaining bounded questions

All commands in this review used explicit Toolkit `exec_command.workdir =
S:\Projects\UCP\AI-Toolkit-DE`. No clone, pull, checkout or ref update was needed.
Git source reads use `git -C <source> show <full-commit>:<path>` and `rev-parse
<full-commit>:<path>`; source files/line ranges are linked below.

Minimal independent schema reproduction, executed as a Python stdin probe
from that workdir (no writes):

```python
import subprocess, re
r = r'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods'
c = '7e199e6f0818173794bdeeb0c4c32d74500b0eec'
b = '_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/'
def read(path):
    return subprocess.check_output(['git','-C',r,'show',c+':'+path], text=True)
s = read(b+'CustomisationFileManager.cs')
s = s.split('public class NewAIC')[1].split('\n\t}')[0]
f = re.findall(r'public int(\[\])? (\w+)(?: = ([^;]+))?;', s)
print(len(f), sum(bool(a) for a,n,v in f))  # 118, 14
print(sum(int(re.search(r'\[(\d+)\]',v)[1]) if a else 1 for a,n,v in f)) # 279
t = read(b+'EngineInterface.cs').splitlines()[4302:4586]
for a,n,v in f:
    if a:
        ids = [int(i) for line in t for i in re.findall(r'source\.'+n+r'\[(\d+)\]',line)]
        assert ids == list(range(int(re.search(r'\[(\d+)\]',v)[1])))
```

For binary identity, use `Get-FileHash -Algorithm SHA256 -LiteralPath <absolute
file>` on the exact files listed above. For the targeted native probe, read PE
section headers, map RVA `0x55320` to its raw section offset and SHA-256 exactly
2,648 bytes; compare M JSONL line 721. Read the export directory's
`NumberOfFunctions`/`NumberOfNames` at offsets +20/+24 for 77/77. These operations
only read bytes; do not load the native DLL.

Reproduce the numeric trap with Node stdin:

```js
const raw = String.raw`{"lord":{"opponent_type":1,"opponent\u005ftype":3},"x":9007199254740993,"y":1e400,"z":-0,"q":1e-9999}`;
console.log(JSON.stringify(JSON.parse(raw)));
// {"lord":{"opponent_type":3},"x":9007199254740992,"y":null,"z":0,"q":0}
```

Unresolved, and deliberately not gates on D1 raw preservation: Unity treatment
of duplicate/escaped known names, decimal/exponent spelling for Int32, missing
fields/array initialization, unknown IDs and ignored tails; official-editor
assembly provenance on this machine; an actually playable complete template;
AIV executable validation and real media/package acceptance. Resolve these with
small later probes under the parent's isolation/acceptance plan, without
weakening original-byte preservation or substituting converter behavior.

[identity-main]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json#L2-L8
[identity-develop]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json#L3-L8
[game-schema]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L157-L400
[transfer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4303-L4586
[editor]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorJsonReadWrite.cs#L26-L267
[public-aic]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AICDecoder/src/SHCDESE.AICDecoder/PublicAIC.cs#L123-565
[internal-aic]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AICDecoder/src/SHCDESE.AICDecoder/InternalAIC.cs#L5-385
[wire]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4589-L4873
[native-record]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-functions.jsonl#L721
[native-import]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L49184-L49384
[semantic-info]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/SEMANTIC_INFO.md#L89-L96
[rfc]: https://www.rfc-editor.org/rfc/rfc8259.html#section-2
[discovery]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L622-L722
[avatar]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L724-L747
[negative-values]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorLordViewModel.cs#L5282-L5331
[aiv-writer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/AIVLoader.cs#L35-L84
[fixes]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L26-575
[sushi]: https://codeberg.org/SuschisWorld/AIVConverter/src/commit/25ec0c430029fda0ef268fe7420ccb4048c9f181/aivconverter.py#L543
[speech]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SFXManager.cs#L1360-L1388
[video]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SFXManager.cs#L1800-L1823
