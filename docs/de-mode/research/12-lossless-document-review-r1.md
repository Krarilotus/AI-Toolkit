# Independent D1 code review - round 1

2026-10-22. Reviewed the seven new D1 files in the uncommitted working tree on
`e6733cabc81731f4c8f0b71013456caa201657fd`, branch `de/separate-game-mode`.
Read the verbatim goal, working contract, plan, Review 07 (all R1-R6 and ten
fixture groups) and completed handoff 10 first. Concurrent F1 and central-doc
changes were excluded. This reviewer owns only this report; reproducible scratch
probes and their output are outside Git in
`S:\Projects\UCP\de-research\review-d1-r1`.

**Decision: NO-GO for COMMIT of D1 in this revision.** Three P2 defects below
need a bounded correction and independent re-review. There are no observed P0/P1
defects, successful byte serialization/patching did not corrupt input, and the
checked-in game schema itself matches the pinned source. The blockers concern
the stability/truth of the schema-based assessment and the mandatory no-op edit
contract. The P3 fixture defect should be corrected in that same small round.

**Separate integration decision: NO-GO.** This review does not approve routing
the editor through D1, UI/toggle exposure, binary/AIV codecs, package planning or
installation, invented playable defaults, game acceptance or Classic conversion.
Even after the code findings are fixed, those require their separate gates.

Evidence labels: **observed** means independently read or executed here;
**source-confirmed** means explicit behavior in the pinned decompilation;
**inferred** means the review consequence; **unverified** means no runtime or
other required evidence was obtained. No implementation edits, commits, pushes,
CI/build/baseline runs, PRs, child agents, app/game launches or installed writes
were performed. Every shell call used explicit Toolkit `exec_command.workdir`.

## Severity-ranked findings

### P2 / D1-R1-01: a shallow-frozen schema remains mutable after create()

**Observed:** `src/js/de-lord-format.js:10-15` skips the entire recursive walk
when the current object is already frozen. `create()` calls that helper at line
28 and closes over the caller's original schema. Freezing just the outer object
therefore leaves `fields`, field descriptors and policy mutable. Inspection
subsequently reads those descriptors at lines 102-132 and policy at line 141.

Minimal reproduction from the Toolkit directory:

```js
const l = require('./src/js/de-lord-format');
const s = structuredClone(l.schema);
Object.freeze(s);                 // Ordinary shallow Object.freeze.
const api = l.create(s);
s.fields.find(f => f.name === 'farm_types').length = 0; // Succeeds.
console.log(Object.isFrozen(api.schema.fields));       // false
```

In the scratch probe, replacing only the complete fixture's `farm_types` token
with `[]` then yields `typedShape: 'complete-int32-shape'` and
`canonicalStructure: 'complete-exact-arrays'` through this API. The default API
correctly returns `not-certified` for those same bytes. Assessment can thus
change after creation without a new target/schema identity; this is not only a
missing `Object.isFrozen` assertion. The pinned transfer directly reads indices
0-7 ([transfer lines 4318-4325][farm-transfer]). Runtime remains labeled
unverified, but the claimed structural certification is already false.

**Required correction (inferred):** establish an immutable validated internal
schema snapshot, or recursively freeze descendants even when an ancestor is
already frozen. Test pre-frozen outer objects and pre-frozen nested containers,
and verify that caller mutation cannot alter the assessment. Preserve the
original generic document independently of any schema failure.

### P2 / D1-R1-02: the pinned-schema boundary accepts different or malformed contracts

**Observed:** `src/js/de-lord-format.js:19-26` checks an ID, aggregate counts and
one aggregate word sum. It does not check the exact reviewed names/lengths,
array-length integer/range constraints, required provenance or target policy.
These are distinct from the post-create mutation in finding 01: fresh plain JSON
objects with these changes also pass `create()` and are frozen successfully.

```js
const l = require('./src/js/de-lord-format');
const s = structuredClone(l.schema);
s.fields.find(f => f.name === 'farm_types').length = 0;
s.fields.find(f => f.name === 'sell_all').length = 23;
const api = l.create(s); // Accepted: 118 names, 14 arrays, 279 aggregate words.
```

The scratch probe gives this API a complete input with zero farm entries and 23
sell entries; it reports `complete-exact-arrays` under the unchanged pinned ID.
The game declarations require 8 and 15, respectively. Further independent
reproductions:

- Lengths `-1` and `24` for those two arrays also pass the inventory check.
- Renaming `opponent_type_for_speech` to `invented_speech` and deleting provenance
  passes; a document with the invented name instead of speech is certified
  complete under `de-lord-game-bc8b6a39-v1`.
- Deleting `targetPolicy` passes creation, but `inspect()` subsequently throws a
  TypeError at line 141, even for an otherwise valid generic document.

**Required correction (inferred):** validate the structural contract and required
policy at creation. An API naming this pinned target must enforce its exact
118-field name/type/array-length inventory and provenance identity, or explicitly
represent a different target rather than certifying it as the pinned one. Reject
malformed schema data early with a clear schema error. Add negative-schema tests
in both CommonJS and the browser factory.

**Response to handoff 10's inherited objection:** the handoff explicitly calls
browser schema input trusted and disclaims cryptographic authenticity. No signing
or cryptographic authenticity mechanism is requested here. Trusted input can
still contain a stale length, omitted policy or accidental schema drift. Counts
alone do not enforce the pinned inventory promised by R4 and the factory error
messages; nor do they make an incomplete typed document complete. The supplied
repository schema is correct, so these failures are confined to the public
`create(schema)` boundary, not the default CommonJS schema bytes.

### P2 / D1-R1-03: same-value edits can fail before no-op recognition

**Observed:** `src/shared/lossless-json.js:361-374` emits the replacement spelling
and rejects its length at line 372 before comparing decoded/numeric identity at
line 373. An existing valid token can use a shorter spelling than the emitter.

```js
const j = require('./src/shared/lossless-json');
const d = j.parse(Buffer.from('"\\n"'), { limits: { maxTokenBytes: 4 } });
d.edit([], d.root.value); // Throws edit/max-token-bytes; should return d.

const n = j.parse(Buffer.from('1'), { limits: { maxTokenBytes: 1 } });
n.edit([], j.numberToken('1.0')); // Same failure despite equal decimal value.
```

This also occurs under the defaults: a 400,002-byte JSON string containing
200,000 `\\n` escapes parses successfully, but setting it to its own decoded
string fails because the emitter expands every escape to `\\u000a`, exceeding
the default 1 MiB token cap. The original bytes remain safe; the defect is an
unnecessary failed edit, including failure of an otherwise valid batch.

**Required correction (inferred):** recognize permissible same-value scalar
no-ops before enforcing limits on a replacement that will not be written. Keep
rejecting new lone-surrogate values and unsafe numeric Numbers as explicitly
documented; this finding uses valid scalar strings/exact numeric tokens. Add
default-limit and tight-limit regressions, including a batch with another real
edit, and assert original-byte equality and unchanged revision for a full no-op.

### P3 / D1-R1-04: the complete fixture's advertised Unicode variant is a no-op

**Observed:** `tests/fixtures/de-documents/complete-synthetic.lordjson:2` contains
`Gr??e ??`, and line 123 likewise has question marks. There are **zero non-ASCII
bytes after its leading BOM**. `tests/de-lord-format.test.js:234-239`, specifically
line 236, tries to replace `Grüße 🏰` with escaped spelling; that string is absent,
so the alleged variant silently equals the original fixture. Handoff 10 therefore
overstates that particular fixture's Unicode coverage.

The generic suite really does contain UTF-8/astral cases, and this review's own
LORD/generic byte probes cover real multibyte text, so this is a fixture/coverage
defect rather than evidence of a broken Unicode codec. Restore deliberate UTF-8
fixture content and assert that the replacement target exists and the two byte
variants differ before testing them. Keep the synthetic, non-playable label.

## Independent checks and R1-R6 disposition

**Observed:** `node --test tests/lossless-json.test.js tests/de-lord-format.test.js`
passed **73 tests, zero failures/skips** on Node `v26.7.0`. No broad baseline,
build, native tests or package command was run. The unexposed default APIs have
no current UI/backend callers in the reviewed scope. A passing focused suite does
not cover the four findings above.

Final scratch probe and machine-readable results:

- `S:\Projects\UCP\de-research\review-d1-r1\review-probes.cjs`
- `S:\Projects\UCP\de-research\review-d1-r1\probe-results.json`

Reproduce with explicit working directory `S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node --test tests/lossless-json.test.js tests/de-lord-format.test.js
node 'S:\Projects\UCP\de-research\review-d1-r1\review-probes.cjs'
```

The scratch script asserts the current failures intentionally and records them;
its successful exit is evidence that those reproductions hold, not that they
have been fixed. It also reads source through full-commit `git show` and
`rev-parse`, without checkout/ref mutations. It stores SHA-256 fingerprints of all
seven reviewed files and the two relevant installed binaries. Its own SHA-256 is
`fe45a76700a6c5f35df4c20b036cf141026b4b0235b3b2adb5f84c9364f646c3`.

- **R1: substantially met for the correct default schema.** Syntax, encoding,
  unsupported encoding and resource failures are distinct `DocumentError`
  categories with recoverable byte copies and no partial tree. Generic roots,
  absent/null/nonobject lord, known wrong types, incomplete typed input and
  unverified target/runtime outcomes remain separate. Finding 02 covers the
  supplied-schema exception. `classify()` calling an object-lord with a bad known
  type `de-lordjson` is acceptable recognition: its separate interpretation is
  `invalid-shape` and typed target is not certified; no gameplay validity follows.
- **R2: blocked by finding 03.** Otherwise checked exact unchanged bytes; input,
  serialization and slice copy isolation; frozen ordered nodes/members/spans;
  contiguous token/trivia coverage; BOM/trailing trivia; exact prefix/token/suffix
  edits after multibyte/astral content; length-changing revisions; stale, foreign
  and forged handles; overlapping and failed-batch atomicity. Escaped-equivalent
  duplicate keys/ancestors fail semantic lookup, while unrelated unique edits
  retain every occurrence. No container/insert/delete/reorder fallback exists.
- **R3: checked, subject to the R2 no-op defect.** Differential probes compared
  26,500 grammar cases to JSON.parse and 85,544 UTF-8 sequences to fatal
  TextDecoder, including every two-byte sequence and valid Unicode range edges.
  Grammar failures retained their opaque source. BOM, UTF-16/32 rejection,
  escaped lone surrogates, actual astral bytes and string control escaping were
  checked. 10,000 decimal no-op comparisons used an independent bounded BigInt
  rational oracle; a 100,000-digit exponent equivalence case did not expand the
  exponent. Huge/underflow/raw numeric tokens survived adjacent edits. Exact
  byte/token/node/depth boundaries, including depth 256/257, failed atomically
  without a stack failure or partially successful document in these probes.
- **R4: supplied schema metadata passes; factory blocked by findings 01/02.**
  Independently extracted all 118 declarations and compared every name, type,
  array length, source line and initializer to the repository schema. Counted
  14 arrays and 279 words. Every scalar has one matching transfer reference and
  every array's transfer indices cover exactly its declared range. Focused tests
  and probes retain distinct speech, negative values, unknown semantic IDs,
  Int32 edges, all positions and longer tails. Wrong tail types are diagnosed;
  ignored tails remain intact and explicitly not runtime-lossless. Missing
  fields stay missing; declaration metadata is not a playable/default template.
- **R5: boundary met within D1.** Content classification keeps ordinary AIVJSON
  and UCP Character JSON generic and synthetic BAIC/wire/BAIV-like bytes
  unparsed; filename and byte length do not select a LORD parser. No converter,
  current castle normalizer, binary decoder or installer was called. CommonJS
  and browser-global factories were exercised in a Node VM, including foreign
  module handles. A real renderer/browser integration remains unverified.
- **R6: boundary respected; implementation intentionally deferred.** D1 supplies
  no package planner or install authority. This is consistent with the bounded
  D1 assignment, not a claim that R6's future manifest/rollback/name/media rules
  have already been implemented or accepted.

All ten Review 07 fixture groups were read and mapped to the focused suite and
the independent probes: complete document; array/type edges; duplicates;
extreme numbers; Unicode/trivia; invalid grammar/encoding; generic roots;
revision/patch/no-op behavior; prototype/resource limits; negative format
classification. The remaining concrete gaps are recorded above, not waived by
the number of passing probes. No prototype pollution was observed from ordinary
`__proto__`, `constructor` or nested `prototype` input keys.

## Primary provenance and runtime limits

**Observed/source-confirmed:** the read-only source pins resolve to develop
`7e199e6f0818173794bdeeb0c4c32d74500b0eec` and main
`a23aa1b32276d670ffbb2a7b641d23b500d8e298`. The independent schema comparison uses
develop's [NewAIC declaration lines 163-400][game-schema] and
[CreateAILordConfigData lines 4303-4586][transfer]. Checked source Git blobs:

- `CustomisationFileManager.cs`: `9cd4c4ad0a601aab1217bb786e741ef15a39f1be`.
- `EngineInterface.cs`: `97bf5fcabdd626a6e80c1e17e546f357fc2d4874`.

This verifies the implementation against the pinned game decompilation; it is
not a new independent decompilation, recompilation or deserializer experiment.
The game-only speech declaration is explicit at line 167, farm length 8 at 187,
and the explicit `200/5/7` initializers at 395/397/399. They do not establish
missing-field/runtime defaults.

**Observed fresh SHA-256 hashes**, read without loading either installed DLL:

- `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data\Managed\Assembly-CSharp.dll`:
  `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`.
- `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data\Plugins\x86_64\CrusaderDE.dll`:
  `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.

The hashes match schema provenance and Review 07. No new claim is made about
official-editor/SE equivalence, binary-codec correctness, all supported enum
values, playable AI behavior or media licensing.

**Unverified/inherited limits:** Unity duplicate/escaped-name selection,
fraction/exponent Int32 acceptance, missing-field initialization and defaults,
unknown IDs and array-tail runtime behavior; official-editor assembly identity;
a known-good complete playable template; AIV timing/grid/marker validation;
isolated package discovery, media decoding/playback, save/reload and Classic
regression/integration acceptance. Resource probes are finite evidence, not a
proof against every adversarial allocation at the configurable hard maxima.

## Precise next bounded handoff

The coordinator should assign a D1 correction round limited to the same D1
modules/tests/schema/fixture/handoff, leaving F1 and existing integrations alone.
Sequence: (1) validate and stabilize the schema boundary, including malformed and
partly frozen schema regressions; (2) repair no-op recognition without weakening
invalid-value/limit checks, including failed-batch and default-limit regressions;
(3) restore actual Unicode fixture bytes and make the intended variant
observable; (4) update handoff 10 with actual results. Re-run only the focused
D1 suite and new relevant regressions, then request a new independent review
round with these findings and responses. Parent owns resolution, commit and
acceptance; this reviewer made no fixes and grants no conditional self-approval.

After that review permits a commit of unexposed D1, the next integration task
still needs explicit document/session and edition routing rules. AIV validation
and R6's manifest-first package planner remain separate bounded work, with the
parent's isolation/game acceptance gates intact.

[game-schema]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L163-L400
[transfer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4303-L4586
[farm-transfer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4318-L4325
