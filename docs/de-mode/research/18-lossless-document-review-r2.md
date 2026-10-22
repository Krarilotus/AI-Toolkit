# Independent D1 code review - round 2

2026-10-22. Reviewed the seven uncommitted D1 files on HEAD
`7f227286c6bd90f60a3ba3fd709484538efd66af`, branch
`de/separate-game-mode`. Read the verbatim goal, working contract, plan,
Review 07 in full (R1-R6 and all ten fixture groups), current handoff 10 and
prior NO-GO Review 12 before deciding. This review owns only this report.
Reproducible probes/logs are outside Git in
`S:\Projects\UCP\de-research\review-d1-r2`.

**Decision: GO for COMMIT of the reviewed additive, unexposed D1 files only.**
All four Review 12 findings are independently closed. No new severity-ranked
actionable finding was observed in this bounded review. The focused suite passes
180/180, and the independent probes below pass in CommonJS and a browser-global
Node VM. The reviewed files match the correction deliverable's seven hashes and
remained unchanged during review. This is a review recommendation; the parent
owns approval, staging, commits, integration and acceptance.

The GO does not establish UI/session integration, binary/AIV validation,
package/install behavior, playable defaults, Classic compatibility or game
acceptance. Those gates remain open. R6's future package planner is deferred
within the agreed scope, rather than a reason to block this additive commit.

Evidence labels: **observed** = independently read/executed here;
**source-confirmed** = explicit pinned-source behavior;
**inferred** = review consequence/design boundary;
**unverified** = evidence not obtained. No implementation/test/schema/prior-report
or central-document edits, commits, pushes, ref/checkout changes, dependencies,
broad suites, CI, PRs, children, goals, game/editor launches, profile/Steam changes
or installed-app writes were performed. Installed DLLs were read only for hashes.
Concurrent F1/A1/central-document work was excluded. Every Toolkit shell command
used explicit `exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE`.

## Severity-ranked findings and prior finding closures

**No new P0/P1/P2/P3 actionable findings observed.** No implementation correction
is requested by this round. The exact formerly failing operations now have the
following outcomes; closure does not rely on the implementer's assertions.

| Prior finding | Independent disposition | Reviewed locations and reproduction evidence |
| --- | --- | --- |
| D1-R1-01, P2: partly frozen caller schema can change certification | **Closed.** The validated schema is a private recursively frozen snapshot. Caller objects are neither retained nor newly frozen. Empty farm arrays remain uncertified after caller mutation. | `src/js/de-lord-format.js:10-15,66-85,117-122`; `tests/de-lord-format.test.js:160-197`. Five independent freeze configurations per environment: unfrozen, outer frozen, fields array frozen, nested parents frozen, and mixed outer/array freezes. Recursively proved no shared caller/snapshot object identity, preserved caller freeze states, then changed field lengths/names, initializer metadata, source lines, policy and extra nested metadata. Complete and incomplete assessments remain identical to their pre-mutation assessments. |
| D1-R1-02, P2: aggregate checks accept a different pinned contract | **Closed.** Creation rejects exact name/type/length/provenance/policy drift with a schema-specific TypeError before inspection. | `src/js/de-lord-format.js:18-62,86-115`; `tests/de-lord-format.test.js:99-158`. **312 independent rejected schemas per environment**, including every one of 118 renamed fields and 118 altered types, all 14 balanced array-length changes, delete/change tests of 23 required metadata leaves, and malformed metadata. Valid reordered inventory with descriptive extras still works. Full source/transfer comparison independently confirms the required manifest. |
| D1-R1-03, P2: valid same-value edits hit unused emission limits | **Closed.** Admissible scalar validation precedes identity checks; unused spellings do not consume the document's emission cap. Actual edits remain limited and atomic. | `src/shared/lossless-json.js:357-382,384-419`; `tests/lossless-json.test.js:111-192`. Original short-string, exact-number and default-cap newline reproductions return the same document/revision and bytes. Per environment, 192 successful no-op cases and 90 different-number edits include 256 bounded independent BigInt-rational comparisons. Two mixed no-op/real-edit batches succeed; 23 CommonJS / 24 VM failed batches preserve original bytes/revision. New lone-surrogate strings, unsafe Numbers, overlapping selections and stale/forged handles remain rejected. |
| D1-R1-04, P3: advertised Unicode fixture variant silently does nothing | **Closed.** Fixture contains actual UTF-8, and variant preconditions prevent a silent replacement miss. | `tests/fixtures/de-documents/complete-synthetic.lordjson:2,123`; `tests/de-lord-format.test.js:201-205,352-371`. Independently measured **5,079 bytes**, BOM `EF BB BF`, **14 non-ASCII bytes after BOM**, literal `Grüße 🏰` before known values and `ä🦊` after them. Four byte-distinct original/no-BOM/LF/escaped variants decode the intended strings and survive exact scalar edits in each environment. |

### Exact reproductions of the corrected boundaries

Run from the Toolkit workdir. The standalone review probe applies these same
expectations to both environments and expands their adjacent failure cases.

```js
const fs = require('node:fs');
const j = require('./src/shared/lossless-json');
const l = require('./src/js/de-lord-format');
const s = structuredClone(l.schema);
Object.freeze(s);
const api = l.create(s);
s.fields[11].length = 0; // Caller descendant is still mutable.
console.log(api.schema.fields[11].length); // 8, isolated from caller mutation.
console.log(Object.isFrozen(api.schema.fields[11])); // true
const complete = api.parse(fs.readFileSync(
  './tests/fixtures/de-documents/complete-synthetic.lordjson'));
const original = complete.serialize(), farm = complete.find(['lord', 'farm_types']);
const short = api.parse(Buffer.concat([
  original.subarray(0, farm.span.start), Buffer.from('[]'),
  original.subarray(farm.span.end),
]));
console.log(api.inspect(short).target.typedShape); // not-certified
console.log(api.inspect(short).target.canonicalStructure); // blocked

const drift = structuredClone(l.schema);
drift.fields[11].length = 0;
drift.fields[47].length = 23;
// l.create(drift) throws:
// TypeError: Invalid pinned LORD schema at schema.fields.11.length: expected 8

const a = j.parse(Buffer.from(String.raw`"\n"`), {limits:{maxTokenBytes:4}});
console.log(a.edit([], a.root.value) === a); // true
const b = j.parse(Buffer.from('1'), {limits:{maxTokenBytes:1}});
console.log(b.edit([], j.numberToken('1.0')) === b); // true
const c = j.parse(Buffer.from('"' + '\\n'.repeat(200000) + '"'));
console.log(c.byteLength, c.edit([], c.root.value) === c, c.revision);
// 400002 true 0
```

The other original malformed schemas produce, in both environments:

- `farm_types:-1 / sell_all:24`: schema error at `schema.fields.11.length`, expected 8.
- Renamed speech plus removed provenance: schema error at `schema.provenance`, missing required metadata.
- Removed policy: schema error at `schema.targetPolicy`, missing required metadata.

The 312 independent rejections are additional probes, distinct from the focused
suite's 48 schema-negative tests per environment. Tests also cover null/sparse
descriptors, numeric/nonfinite lengths, incorrect initializer/source metadata and
missing fields. Extra descriptive JSON metadata and field ordering are deliberately
permitted; this is exact structural/provenance drift detection, not cryptographic
authentication or proof of hostile-code safety.

## Original R1-R6 foundation assessment

| Requirement | Assessment for this D1 commit | Evidence and limits |
| --- | --- | --- |
| R1: separate parse, interpretation and explicit target outcomes | **Met within D1.** | Generic roots, wrong/nonexistent lord, wrong known types, incomplete inputs and canonical/semantic/runtime statuses remain distinct. Encoding, unsupported encoding, syntax and resource errors retain opaque bytes without an editable partial tree (`lossless-json.js:28-42,61-79,92-100`; `de-lord-format.js:124-185,231-254`). `de-lordjson` is content recognition, not certification: an object lord with a bad known type still has `invalid-shape` and an uncertified target. |
| R2: immutable bytes, ordered syntax, exact spans, no-op identity and atomic edits | **Met within D1; prior blocker closed.** | Source buffers and public byte copies cannot mutate retained bytes; nodes/members/spans are frozen. Tokens partition complete UTF-8 bytes, including BOM/trivia. Independently edited every one of **279 known scalar/array slots per environment**, asserting original-prefix/replacement/original-suffix equality, unchanged original document and one revision increment. Length-changing successive edits rebase spans. Duplicate decoded names/ancestors reject semantic edits; unrelated edits retain duplicates. Same-value edits preserve original lexemes and revision. Missing paths, overlapping selections, stale/foreign/forged handles and failed batches are explicit errors (`lossless-json.js:229-300,357-419`). |
| R3: explicit encoding, string and exact numeric policies | **Met within the declared UTF-8 scope.** | Actual multibyte/astral characters before and after edits, BOM and escaped variants pass. Original escaped lone surrogates remain preservable with diagnostics; submitting a new lone-surrogate argument still fails before no-op recognition. Invalid UTF-8 and UTF-16/32 BOMs remain separate failures. Huge/underflow/unsafe-integer lexemes remain raw; the independent oracle checks 256 decimal comparisons per environment and a 12,000-digit exponent equivalence without exponent expansion. Real UTF-8 token overflow is detected by candidate reparse even where the emitter's preliminary UTF-16-length check passes; it publishes no document. Error recovery for that reparse contains the candidate, as documented; the original remains intact. |
| R4: exact game schema and conservative diagnostics | **Met within D1; both factory blockers closed.** | Freshly extracted all 118 declarations, their actual source lines/types/array lengths/initializers, and compared every descriptor to the supplied schema. Independently checked all 279 transfer references, including every indexed array position. Each factory enforces this manifest and copies/freezes its private schema. Independent complete-fixture probes cover all 14 arrays as short/long/bad-tail variants plus nine Int32 type/spelling/boundary cases: 51 target cases per environment. Longer fully typed arrays can have complete typed shape while remaining noncanonical with ignored-tail/runtime-loss diagnostics. Speech stays distinct; no defaults, coercion, clamping, trimming or enum substitution occur. |
| R5: preserve format/capability boundaries | **Met within D1.** | Classifier remains content-only: binary-size synthetic inputs fail opaquely; AIVJSON/UCP Character JSON and ordinary JSON roots stay generic despite a misleading filename. No BAIC/BAIV/wire codec, converter, castle normalizer, installer or game interface was added/called. Repository search found no production callers outside these two new modules. Browser evidence is a Node VM of the browser-global scripts, not a real renderer/browser integration test. |
| R6: manifest-first vanilla package planner | **Boundary respected; implementation deferred.** | D1 supplies no package planner, installation/persistence authority or media payload selection. The later planner still needs variant/source/target identity, both destination roots, matching media basename, collision/containment checks and rollback manifest. AIV executable validation and actual discovery/playback remain separate gates. No requirement for those later proofs is imposed on this unexposed D1 commit. |

All ten Review 07 fixture groups are represented in the reviewed focused suite
and/or these independent probes. This round deliberately did **not** repeat
Review 12's 26,500 grammar, 85,544 UTF-8 and 10,000 decimal sweeps. Those are prior
observations, not fresh results claimed here. Review of the before/current module
diff confirms parser grammar, UTF-8 validation and decimal-identity arithmetic
were unchanged by this correction; new probes concentrate on the changed schema
boundary/no-op ordering and adjacent byte/atomicity requirements. Finite probes
do not establish a general worst-case allocation/time bound at every hard limit.

## Primary-source verification and binary identity

**Observed/source-confirmed:** read-only clone remote refs still resolve to:

- Develop `7e199e6f0818173794bdeeb0c4c32d74500b0eec` (D).
- Main `a23aa1b32276d670ffbb2a7b641d23b500d8e298` (M).

Fresh `git show <full-commit>:<path>` extraction compares the schema against
[game declarations 157-400][game-schema], with actual declarations at 165-399,
and [indexed transfer 4303-4586][transfer]. The comparison checks each field's
declaration initializer separately from the explicitly unverified runtime
missing-field default. Speech is declared at line 167; farm length 8 at 187;
explicit scalar initializers 200/5/7 at 395/397/399. All 104 scalar references
appear once and every array's transfer indices match its exact declared range.
This verifies correspondence with pinned decompiled source, not a new
decompilation, recompilation or Unity deserializer experiment.

Fresh Git blob comparisons match D and M for all four relevant code paths:

| File relative to `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/` | D = M Git blob |
| --- | --- |
| `managed/BC8B6A39/decompiled/CustomisationFileManager.cs` | `9cd4c4ad0a601aab1217bb786e741ef15a39f1be` |
| `managed/BC8B6A39/decompiled/EngineInterface.cs` | `97bf5fcabdd626a6e80c1e17e546f357fc2d4874` |
| `managed/BC8B6A39/decompiled/AIVLoader.cs` | `9b3dd0a64af8a3d0e276c375a462270958fceb06` |
| `exports/semantic-decompiled-functions.c` | `2aee03bdea5e6728865d263f80e02bf991af9d7a` |

The fresh identity reads remain different: [D identity lines 3-8][identity-d]
names SE commit `10628df85cd432184742a50a1dee3969a66cf89e`; [M identity
lines 2-8][identity-m] names `5908e1f12437deb7ef5f5b1dc2d64e301178fba3`.
Code-blob parity is not parity of all SE metadata or knowledge notes. The AIV
and native-code checks here compare blob identities only; no new binary-codec or
native importer correctness claim follows.

**Observed fresh SHA-256**, reading bytes without loading either DLL. Paths are
under `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\`
`Stronghold Crusader Definitive Edition_Data\`:

| Binary | Bytes | SHA-256 |
| --- | ---: | --- |
| `Managed\Assembly-CSharp.dll` | 3,693,056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Plugins\x86_64\CrusaderDE.dll` | 3,451,392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |

Both match required schema provenance and Review 07. No source clone, pull,
checkout, ref update or game/editor execution was needed.

## Commands, counts and reproducible evidence

Run all commands with explicit workdir `S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node --check src/shared/lossless-json.js
node --check src/js/de-lord-format.js
node --check tests/lossless-json.test.js
node --check tests/de-lord-format.test.js
node --test --test-reporter=tap tests/lossless-json.test.js tests/de-lord-format.test.js
node 'S:\Projects\UCP\de-research\review-d1-r2\review-probes.cjs'
```

**Observed:** Node `v26.7.0`; four syntax checks pass; focused suite **180 passed,
0 failed, 0 skipped, 0 cancelled**. No broad suite/build/native/dependency command
was run. The scratch script exits 0 and records 13 successful groups. Counts
below overlap within a group and are not advertised as extra Node test cases:

| Independent probe | CommonJS | Browser-global VM |
| --- | ---: | ---: |
| Caller freeze/snapshot mutation configurations | 5 | 5 |
| Rejected drift/malformed schemas | 312 | 312 |
| Valid no-op cases | 192 | 192 |
| Different-number exact edits within numeric group | 90 | 90 |
| Bounded BigInt-rational comparisons, included above | 256 | 256 |
| Mixed no-op/real-edit successful batches | 2 | 2 |
| Failed atomic batches, including limits/handles | 23 | 24 |
| Fixture variants / full token partitions | 4 / 4 | 4 / 4 |
| Every known scalar/array slot edited exactly | 279 | 279 |
| Complete-fixture array/Int32 target cases | 51 | 51 |
| Generic-root/negative-format cases | 10 | 10 |
| Opaque syntax/encoding/resource failures | 22 | 22 |
| Decoded duplicate path/ancestor cases | 2 | 2 |

The VM has one additional cross-module foreign-handle batch. Each environment
also tests unsupported insert/delete/reorder/container replacement, caller byte
isolation, schema-prototype-like keys, original surrogate preservation versus
invalid new strings, and retained original document state after failures.

Scratch artifacts:

- `focused-tests.tap`: fresh focused-suite output.
- `review-probes.cjs`: independent source/identity/closure/regression probes.
- `review-probes.log`: concise successful group/count output.
- `probe-results.json`: full results, exact original-reproduction errors,
  source pins/blobs/identity objects, binary hashes and seven-file fingerprints.

Probe SHA-256:
`6bd3144da194c223e85212f00d0eaa40b89bd2194254ecc6b96080e9726d94f9`.
The first scratch run stopped on a reviewer-harness assertion comparing limit
option `maxNodes` to documented error code `max-nodes`. Correcting only that
scratch mapping made the complete run pass; it was not a product failure or an
implementation change. Review 12's old failure-asserting probe was not rerun.

Reviewed source fingerprints, freshly captured and equal to the implementer's
`fix-d1-r2/correction-results.json` values:

| Reviewed file | SHA-256 |
| --- | --- |
| `src/shared/lossless-json.js` | `9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1` |
| `src/js/de-lord-format.js` | `c4a315e23e7bead4adab3c2a5e15ff517a08a80e6f0259905f7c03cbbba605c0` |
| `config/de-lord-schema.json` | `aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4` |
| `tests/lossless-json.test.js` | `9f1defee7d7138f42de52aed44ae17863784cd6995993f778dcadc5cb423ccee` |
| `tests/de-lord-format.test.js` | `76bd5dffc0069481ed05f4e43ff1d1ffe2a132e0008a198a70074861452b17ff` |
| `tests/fixtures/de-documents/complete-synthetic.lordjson` | `a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15` |
| `docs/de-mode/research/10-lossless-document-handoff.md` | `401f4cab233d97eae54cc5feed8686ea8d92e72e1b74dbd1d4764b1fda2385df` |

The schema also equals the correction's read-only `before/` copy byte-for-byte.
The reviewed JavaScript diff against that copy changes schema validation/copying
and scalar no-op recognition; it does not add integration callers.

## Remaining scope boundaries and next bounded handoff

**Known unsupported operations:** insertion/deletion, member/key replacement,
container replacement, reorder, explicit duplicate occurrence resolution,
non-UTF-8 editing, streaming I/O, binary BAIC/BAIV/wire/AIV codecs, AIV executable
validation, converters, package/install/persistence/media operations and UI.
Original document revisions remain independently usable; revision handles are
document-instance ownership checks, not a mutable session or compare-and-swap
concurrency service. Schema checks detect accidental contract drift and copy
JSON data; they do not authenticate who supplied executable code/schema files.

**Still unverified:** Unity duplicate/escaped-name selection; fraction/exponent
Int32 acceptance; missing-field/default behavior; arbitrary enum IDs and array
tails at runtime; official-editor assembly identity; a known-good complete
playable template; AIV order/timing/grid/footprint/marker capabilities; actual
renderer/browser integration; isolated package discovery/media decoding/playback,
save/reload and Classic integration/game regressions. No synthetic fixture is
promoted to playable AI. These are explicit future work, with full acceptance
remaining open under the parent's contract.

**Next bounded task for the coordinator:** first compare the exact seven hashes
above before staging the D1 milestone; commit only the reviewed D1 changes and
chosen review documentation under the existing no-CI policy. Concurrent F1/A1
changes need their own review decisions. Do not silently include them in D1's GO.
If a reviewed D1 file changes, review the new diff and rerun relevant checks.

Then commission a separate document/session-and-edition-routing design slice,
initially without UI or live game writes: define source-byte ownership, active
document revision/dirty state, save/reload byte identity, explicit duplicate/error
presentation, and safe mode-switch/cancellation handling. Keep diagnostic
structural certification distinct from semantic/runtime acceptance in all
consumers. Route genuine `.lordjson` content through this document model without
passing it through existing Classic/AIV/Character normalizers. Request independent
review of that slice before callers or toggle exposure. AIV validation and R6's
data-only manifest-first package planner remain separately owned subsequent
tasks; profile isolation and real-game acceptance stay with the coordinator.

[game-schema]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L157-L400
[transfer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4303-L4586
[identity-d]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json#L3-L8
[identity-m]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json#L2-L8
