# D1 implementation handoff — correction round 2

2026-10-22. Implementation only; fresh independent review is pending. This
correction starts from the seven uncommitted D1 files reviewed by Review 12 on
HEAD `e6733cabc81731f4c8f0b71013456caa201657fd`, branch
`de/separate-game-mode`. Read the goal, working contract, plan, synthesis,
Review 07, the original handoff and Review 12 in full. Review 12's NO-GO is not
superseded by this implementer's tests or handoff; the coordinator owns resolution.
Six owned files were revised; the correct `config/de-lord-schema.json` was
retained byte-for-byte. No existing integration, central docs, profiles, Classic
codecs, application settings or installations were modified by this correction.
No children, commits, pushes, CI, PRs, converters, package installs or launches.
The shared checkout is not claimed to be a T3-isolated worktree.

## Owned files

- `src/shared/lossless-json.js`
- `src/js/de-lord-format.js`
- `config/de-lord-schema.json`
- `tests/lossless-json.test.js`
- `tests/de-lord-format.test.js`
- `tests/fixtures/de-documents/complete-synthetic.lordjson`
- `docs/de-mode/research/10-lossless-document-handoff.md`

The fixture is self-authored synthetic data, explicitly labeled **not playable**.
Its values distinguish speech/opponent, all array positions, the three 28-slot
starting arrays, 24 wall slots and negative production choices. No game/lord
fixture or implementation code from a third party was copied into the repository.
It now deliberately includes literal `Grüße 🏰` before known scalar tokens and
`ä🦊` in an extension after them, plus the original UTF-8 BOM, CRLF and trivia.

## Responses to Review 12

All four findings are accepted; no original finding is disputed or waived.
The following are implementation responses for independent re-review, not
self-approval, integration permission or game acceptance.

1. **D1-R1-01 (P2), schema stability:** `create(inputSchema)` copies JSON data
   recursively into a private snapshot before validation/use, then freezes every
   descendant. It neither retains nor freezes caller-owned containers. The
   recursive freeze also traverses already frozen parents. CommonJS and browser
   regressions cover unfrozen input, a pre-frozen outer object, and pre-frozen
   nested fields/provenance/policy containers. Successful caller mutations to
   lengths, initializers, names, provenance and policy cannot alter the API's
   complete-fixture assessment or falsely certify a fixture with `farm_types:[]`.
   The exposed snapshot is frozen throughout and the short input remains
   `not-certified` / `blocked`.
2. **D1-R1-02 (P2), pinned contract validation:** the factory now checks an
   independent in-module pin manifest in both module environments. Required own
   metadata includes schema ID/format/version, 118 fields, 14 arrays, 279 words,
   repository/commit, both source paths/line ranges/Git blobs, both binary hashes
   and every required target policy value. Every exact field name, signed type,
   array length, source line, initializer and unverified missing-field default is
   checked. Schema field order may differ; the inventory must not. Invalid input
   fails at creation with `TypeError: Invalid pinned LORD schema at <path>: ...`;
   generic source documents remain independently preservable. There are **48
   negative cases per environment** including 0/23 and -1/24 swaps, renamed speech
   with/without provenance, absent policy, type/length/identity/policy drift,
   sparse/cyclic data and accessors. This checks accidental drift and shape;
   it does not introduce signing or claim cryptographic authenticity.
3. **D1-R1-03 (P2), scalar no-ops:** valid equal strings are recognized before
   quoting; exact numeric identity is recognized before a document token cap is
   applied to unused spelling. Original bytes and the same document/revision are
   returned. Regressions include `"\\n"` at cap 4, `1` versus `numberToken('1.0')`
   at cap 1, and the 400,002-byte / 200,000 escaped-newline string at the default
   1 MiB cap. Tight/default-cap batches also combine string/numeric no-ops with
   a real edit and verify exact prefix/replacement/suffix bytes and one revision
   increment. New lone-surrogate string arguments and unsafe Numbers remain
   rejected even when they resemble existing values. Actual token-byte,
   multibyte UTF-8 and document-byte overflows still fail atomically; a different
   oversized newline string is still rejected.
4. **D1-R1-04 (P3), Unicode fixture:** restored deliberate UTF-8 data at both
   fixture locations without changing its synthetic/not-playable designation.
   The fixture is **5,079 bytes**, retains `EF BB BF`, and has **14 non-ASCII bytes
   after the BOM**. Tests require the literal replacement target to exist,
   require different literal/escaped bytes with equal decoded text, and require
   four distinct BOM/no-BOM/CRLF/LF/escape test variants before running exact
   edits. The former silent no-op substitution cannot pass those assertions.

## API contract

CommonJS: `require('../shared/lossless-json')` and
`require('./de-lord-format')`, with paths relative to the caller. Browser globals
are `losslessJson` and `deLordFormat`. Browser callers explicitly load
`config/de-lord-schema.json` and call `deLordFormat.create(schema)`; no HTML or
asset loader integration was added. Both environments are covered by focused
tests using the same implementations.

### Generic document

- `parse(Uint8Array | ArrayBuffer, {limits?})` returns a frozen document. Decoded
  strings as file input are deliberately unsupported: that would lose the
  original encoding evidence. Caller byte buffers are copied.
- `document.serialize()` returns a fresh byte copy. `document.slice(span)`
  returns a fresh copy of the addressed revision bytes. Unchanged serialization
  includes a single optional leading UTF-8 BOM and every byte of trivia.
- `document.root` is an ordered frozen tree. Objects have `members` containing
  separate key/value nodes, arrays have `elements`, numbers have **lexeme only**,
  strings/booleans/null have decoded `value`. Duplicate occurrences remain
  distinct. No object projection supplies serialization.
- **Every span is half-open UTF-8 byte offsets**, including the BOM:
  `{start,end,unit:'utf8-byte'}`. `tokens` partitions the complete source into
  punctuation, scalar/key tokens, contiguous trivia runs and optional BOM.
  Object members also expose key/value/colon spans; containers expose delimiters.
- `find(document, path)` / `document.find(path)` uses an array of decoded string
  keys and numeric array indices. Missing paths and duplicate decoded names
  fail explicitly. Escaped-equivalent names collide. Dangerous-looking names
  remain ordinary members; Maps/ordered arrays avoid prototype assignments.
- `handle(document,path)` / `document.handle(path)` returns an opaque handle.
  `patch(document,[{path,value} | {handle,value}])` returns a new frozen document
  after applying non-overlapping scalar token replacements and reparsing. All
  spans rebase; handles from another document/revision are rejected. The input
  document remains unchanged even if any edit/reparse fails. A complete no-op
  batch returns the same document and revision. Original revisions remain
  independently usable; this module is not a mutable session/CAS store.
- `document.edit(path,value)` is one-path shorthand. Values may be strings,
  booleans, null, finite safe numeric Numbers, BigInts, or `numberToken(lexeme)`.
  Unsafe integer Numbers are rejected. Decimal numeric no-op comparison works
  on digit strings without Number/BigInt exponent conversion or expansion;
  spelling such as `-0`, `1.0` and `1.2300E+02` is retained. Escaped-equivalent
  valid string no-ops retain the original token. Scalar validation precedes
  no-op recognition; limits on unused replacement spelling do not reject a
  valid no-op. Limits on real edits remain enforced. New strings reject lone
  surrogates, including attempts to submit the decoded value of an existing
  escaped lone surrogate. Such original tokens remain preservable and can be
  left untouched or replaced by a valid scalar string.
- Insertion, deletion, key replacement, container replacement and reorder are
  unsupported. A supplied operation other than `replace` fails explicitly.

UTF-8 validation is fatal and locates the invalid byte; no replacement decoding
occurs. UTF-16/32 BOMs produce `unsupported-encoding`, not speculative conversion.
A second/out-of-place UTF-8 BOM produces `syntax`; U+FEFF in strings is data.
Escaped lone surrogates are preserved with interoperability diagnostics.

`DocumentError` has `category`, `code`, byte `offset`, `spanUnit`, details and
`serializeOriginal()` for opaque recovery. Parse categories are `syntax`,
`encoding`, `unsupported-encoding`, `limit`. Failures never expose a partial
editable tree. Edit failures use `edit`; caller API misuse/new invalid string
values can throw TypeError/RangeError. A candidate reparse failure retains the
candidate bytes in its error; the original document itself remains unchanged.

Default limits: 8 MiB input, depth 128, 200,000 nodes, 500,000 tokens, 1 MiB per
token. Configurable hard maxima are 64 MiB, depth 256, 1,000,000 nodes, 2,000,000
tokens and 64 MiB per token. Depth starts at zero for the root; children and
object key nodes add one. Node counts include keys. Token counts/byte lengths
include punctuation, BOM and contiguous trivia runs. No truncation or partial
editable success is returned. Byte-copy recovery still requires memory for the
caller-supplied source; this is an in-memory foundation, not a streaming reader.

### LORD overlay

- `inspect(document)` returns independent `syntax`, `interpretation`, `target`
  outcomes and location-bearing `diagnostics`. It never manufactures fields.
- Interpretation distinguishes `not-lord`, `interpretable`, `invalid-shape` and
  `ambiguous`. Missing/null/array/nonobject root `lord` has no chosen lord node.
  Known field duplicates expose all key/value occurrence spans. Missing known
  fields use the containing lord span, explicitly labeled `spanRole`.
- Target `typedShape` is `not-certified` or `complete-int32-shape`;
  `canonicalStructure` is `blocked` or `complete-exact-arrays`. Both describe
  structure only. `semanticStatus` and `runtimeAcceptance` remain `unverified`.
  No `validForGame`/playable flag or known-good AI generator exists.
- Decimal integer token magnitude is compared lexically to signed Int32 bounds;
  known values never need Number conversion. `-0` is accepted unchanged.
  Fraction/exponent spellings remain preserved and unverified, blocking the
  canonical policy. No coercion, padding, clamping or enum substitution occurs.
- All 118 fields and exact arrays are required for complete canonical
  structure. Longer arrays remain complete typed shapes if **every** element,
  including tails, satisfies Int32. They receive ignored-tail diagnostics,
  `runtimeLossless:false`, and block the exact-array canonical policy. Nothing
  is trimmed. Every known field's semantic status is explicitly unverified,
  including arbitrary numeric enum IDs; no enum catalogue was invented.
- Root/lord duplicate names block canonical structure by Review 07 policy,
  including unknown duplicates. Nested unknown duplicates remain unverified.
  Unique unrelated paths remain editable; semantic paths through duplicate
  ancestors/fields fail. No occurrence-resolution operation is supplied.
- `classify(bytes, options?)` returns `de-lordjson`, `ambiguous-lordjson`,
  `generic-json`, or `unparsed` with its opaque parse error. Only content matters;
  filename/extension/length are never used. A recognized LORD document still
  needs its separate assessment. Generic AIVJSON/UCP Character JSON remains
  generic; binary BAIC/wire/BAIV/Classic AIV is not decoded or identified.
- `parse` and `patch` are the generic functions; this layer adds diagnostics,
  not a target-gated edit restriction. CommonJS and browser `create(schema)`
  validate a private immutable snapshot against the exact pinned inventory,
  provenance identity and required policy. The caller's objects are not retained
  or frozen. Schema data must be JSON data with dense arrays and enumerable data
  properties; accessors, cycles and nesting of 32 or more ancestor objects are
  rejected with a schema error. Extra descriptive metadata may be retained;
  required contract values cannot be overridden. This is not a cryptographic
  schema authenticity mechanism. No browser renderer/UI wiring was added.

## Schema provenance and reproduction

Read the pinned source through `git -C <research clone> show
7e199e6f0818173794bdeeb0c4c32d74500b0eec:<path>`; extracted only declaration
metadata into the new JSON. Counted **118 fields, 14 arrays, 279 transferred
Int32 words**, and checked every array's transfer indices against its declared
length. Source pin, paths, lines, Git blob IDs, managed/native full SHA-256 and
independent Review 07 provenance are recorded in the JSON. This uses game
NewAIC, not the editor's 117-field schema. Declaration initializer metadata is
separate from `runtimeMissingFieldDefault:'unverified'`; speech is never inferred.

## Focused verification

Every Toolkit command used explicit working directory
`S:\Projects\UCP\AI-Toolkit-DE`; PowerShell was used without changing execution
policy. No npm/build/baseline/native test script was needed.

```powershell
node --check src/shared/lossless-json.js
node --check src/js/de-lord-format.js
node --check tests/lossless-json.test.js
node --check tests/de-lord-format.test.js
node --test tests/lossless-json.test.js tests/de-lord-format.test.js
node 'S:\Projects\UCP\de-research\fix-d1-r2\correction-probes.cjs'
```

Final result: four syntax checks pass; **180 tests passed, 0 failed, 0 skipped**
on Node `v26.7.0`. Verification observed shared HEAD
`7f227286c6bd90f60a3ba3fd709484538efd66af`; this agent made no commits while
the shared checkout advanced from its starting HEAD. This is the original
73 tests plus 96 negative-schema tests,
six schema-snapshot mutation tests and five no-op regression tests. The existing
Unicode/fixture tests are strengthened. The first correction run passed 179/180;
a new test's literal byte-count assertion said 17 instead of 16. Correcting that
test's cap/count made its intended real-edit overflow check run and pass. All ten
Review 07 groups remain represented in the named tests, including byte equality,
exact token patches, multibyte/astral spans, duplicate ambiguity, lexical numeric
extremes, encoding/grammar/limit error distinctions, stale/overlapping edits,
prototype safety, type/array edges and negative domain classification. No feature
acceptance follows from this suite. Existing format paths were untouched and
their suites were not rerun. No broad tests, build or native checks were run.

Scratch evidence stays outside Git at
`S:\Projects\UCP\de-research\fix-d1-r2`: `before/` contains the seven starting
files; `before-hashes.json` and `before-status.txt` record the input boundary;
`focused-tests.tap` contains the final focused TAP output (using
`--test-reporter=tap`); `correction-probes.cjs` independently exercises the four
original reproductions with corrected expectations. Its **four finding checks
pass**, and `correction-results.json` records their exact results, Node/HEAD and
SHA-256 fingerprints of all seven delivered files. It does not run Review 12's
old intentionally failing probe or modify that report.
`correction.diff` compares only the six revised files with their saved input;
the seventh owned file, `config/de-lord-schema.json`, is unchanged.

## Review handoff and remaining objections

Commission a fresh independent review of all four Review 12 findings and the
responses above, especially the copied schema boundary, exact pin manifest,
validation-before-no-op ordering and Unicode byte evidence. No implementation
objection to those requested corrections remains known to this implementer;
independent resolution is outstanding. Review parser grammar/UTF-8 validation,
numeric normalization, span/handle ownership, duplicate policy and target-status
vocabulary before any later integration. R6's actual package planner/installer
remains a later parent-owned task.

Unresolved runtime evidence remains unchanged: Unity duplicate/escaped-name,
fraction/exponent Int32, missing-field/default and array-tail behavior; unknown
enum semantics; official-editor assembly identity; a playable complete template;
AIV execution/timing/markers; profile-isolated package discovery/media and real
game acceptance. These modules provide neither binary codecs nor AIV validation,
media/package/install logic, persistence, UI integration or Classic conversion.
Return to the coordinator for independent review; no integration or commit was
performed.
