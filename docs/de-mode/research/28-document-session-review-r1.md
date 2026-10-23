# Independent DS1 document-session review — round 1

2026-10-23. Reviewed the eight DS1 inputs on branch `de/separate-game-mode`,
starting HEAD `773f80b8a31d9337cd83342957bd8b76d969515c`, in the shared checkout
`S:\Projects\UCP\AI-Toolkit-DE`. Read goal00, contract01, plan02 and standard05
first, then reports07/10/12/18/21/23/26 in full. The historical pause does not
override the user's explicit resumption. No worktree isolation is claimed.

**Decision: NO-GO for the DS1 additive commit at this snapshot.** Two bounded
P2 findings below need correction by the DS1 owner and focused independent
re-review. No P0/P1 defect was observed. The parsing/preservation boundary,
ordinary save receipts, monotonic revisions and generated schema direction are
sound in the checks performed. All four prior D1 findings remain closed.
Neither passing tests nor this recommendation constitute desktop/game acceptance.
Root retains scope reconciliation, acceptance, integration and commits.

This reviewer wrote only this report in Git. All scratch scripts, generated
bundles, logs, synthetic output copies and measurements are in
`S:\Projects\UCP\de-research\review-document-session-ds1-r1`. No source/test
fix, child delegation, commit/push, CI/dispatch/PR/merge/release, dependency
install, application/game/Steam launch or live/original profile/settings/Classic
change occurred. Every Toolkit `exec_command` explicitly used the actual
Toolkit repository as its workdir. Concurrent C1/A1/root edits were excluded.

Evidence labels: **observed** means read/executed in this review; **inherited**
means an earlier pinned review or implementer result, not newly reproduced;
**inferred** means the consequence of the observed code/measurement;
**unverified** means the required evidence was not obtained.

## Severity-ranked findings

### P2 / DS1-R1-01 — full-document history has no aggregate retention bound

**Observed:** `src/shared/de-document-session.js:32,52-63` retains every real
edit's complete D1 document in `history`. D1 reparses into fresh private bytes,
nodes, tokens and decoded strings for each real edit
(`src/shared/lossless-json.js:384-419`). No session entry/count/byte/work budget
limits that accumulation. Saves do not prune it; undo retains the redo branch.
The default 8 MiB document limit bounds each revision, not a session. Report26
discloses the omission, but disclosure does not provide bounded resource behavior.

The independent finite probe opens valid JSON of **1,048,618 bytes**, with two
524,288-character extension strings and one editable `opponent_type`, then makes
32 different scalar edits. All inputs are within D1's default limits. All 32
undo operations subsequently succeed, confirming retention rather than merely
temporary candidate allocation. With explicit garbage collection, the sampled
retained state grew from **6,032,880 to 40,016,496 heap bytes**, from
**3,289,465 to 51,525,958 ArrayBuffer bytes**, and from **51,802,112 to
138,510,336 RSS bytes**. These are process samples, not an exact per-document
allocation formula; allocator/finalizer behavior affects the totals. Branching
after undo releases the discarded redo documents, consistent with the inspected
ownership. The probe deliberately stops after 32 edits and does not attempt OOM.

**Inferred impact:** a valid bounded file and an ordinary sequence of scalar
changes can grow retained memory without a session-level bound. At larger
supported files or node counts, a modest edit history can exhaust the renderer
and lose unsaved work. This is a resource correctness gap in the new session,
not a request to redesign D1 or impose a stylistic abstraction.

**Smallest owner correction:** DS1 should give retained undo/redo history an
explicit finite policy, using a bounded entry count and/or aggregate retained
cost. Choose the routine limit in implementation and document its behavior.
Either evict the oldest undo entries predictably or reject the candidate with a
clear atomic resource error. Keep original/current/saved documents and an active
save snapshot valid, preserve no-ops, and do not reinterpret dirty state as
revision equality. Count shared retained documents once where appropriate;
there is no need for a generic history framework or a second parser. Add a small
boundary/recovery test covering the selected policy, branch release, saved
content and pending/unknown snapshots. A new benchmark suite is unnecessary.

Evidence: `history-memory-probe.cjs`, `history-memory-results.json` and
`history-memory-probe.log` in the review scratch directory.

### P2 / DS1-R1-02 — receipt outcome is checked and then read again

**Observed:** `src/shared/de-document-session.js:102-106` checks
`receipt.status` against the four permitted outcomes, then reads that
caller-owned property again into `status`. That second value drives commit,
destination adoption and pending-slot release at lines107-115. Unlike the seven
correlation fields, the applied outcome is not necessarily the validated value.

Minimal reproduction after an edit and `snapshotForSave(1, 'new')`:

```js
// r has all seven exact snapshot metadata fields.
let reads = 0;
Object.defineProperty(r, 'status', {
  enumerable: true,
  get: () => ++reads === 1 ? 'failed' : 'committed',
});
session.acknowledgeSave(snapshot, r);
// reads === 2; dirty === false; path === 'new'; lastSave.status === 'committed'.
```

The failure-asserting probe reproduces this for initially `failed`, `cancelled`
and `unknown` outcomes in both CommonJS and browser-global VM. An accessor that
first returns `unknown` and then `unsupported` is also accepted: `lastSave.status`
becomes `unsupported` and the pending slot is released, allowing a new save
without explicit reconciliation. No mismatched field or stale snapshot is needed.

**Scope:** ordinary JSON-decoded data-only receipts and mutations after an
acknowledgement pass the independent tests; they do not exhibit this defect.
This finding concerns an accepted caller-owned accessor object and inconsistent
validation/use. It does not assert that these checks authenticate malicious
renderer code, or that a fully matching fabricated receipt can be authenticated
by this module. The backend still owns write truth and operation authority.

**Smallest owner correction:** capture the outcome once, validate that captured
primitive, and use only it for publication. Alternatively reject accessors at an
explicit data-only receipt boundary. Keep all seven metadata comparisons and
exact snapshot identity. Add one focused regression showing an outcome cannot
change between validation and application, including unknown retaining its slot.
No backend/context policy belongs in this correction.

Evidence: `receipt-status-probe.cjs`, `receipt-status-probe.log` and
`receipt-status-result.json`. This script exits successfully when it reproduces
the defect; its exit zero is not evidence that the defect is fixed.

## Preservation, ownership and architecture assessment

**Observed:** the session imports the existing LORD API and delegates parsing,
classification, patching and serialization to D1. It has no DOM, filesystem,
Node-builtin import, Classic normalizer, game-root selector or object-projection
serializer. Strings capture document/owner/source identity immutably. Host/core
integration must supply unique open identities and context lifetime/epoch IDs;
decoding a context DTO or selecting a root in this module would duplicate policy.

Real edits, undo and redo advance a session-owned monotonic safe-integer
revision, independent of D1 document revisions that repeat on an undo branch.
Failed/stale edits leave published state intact. No-ops preserve document bytes,
history, revision and dirty state, including redo availability. Dirty compares
persisted content bytes, so undo/redo and a real edit back to saved bytes behave
correctly. Current, original and saved documents remain distinct when needed.

Snapshots copy retained bytes and return fresh copies; freezing a TypedArray is
not used as a substitute. The exact pending snapshot object is required, so
clones, foreign-session snapshots, settled snapshots and old envelopes cannot
settle another save. All seven metadata fields are checked. The one pending save
slot is reserved before WebCrypto awaits. Delayed hashing, subsequent edits,
undo/branch changes and old successful acknowledgement keep later content and
dirty state correct. Plain-data failed/cancelled receipts retain prior destination
and content. Unknown remains explicit and blocks another save until the same
snapshot receives a final matching receipt. Finding02 is the accessor exception.

Target diagnostics do not gate preservation Save. Generic JSON, incomplete LORD
data, duplicates, huge numeric lexemes and ignored array tails remain preservable;
structural edits remain unsupported. The synthetic complete fixture and the real
older 117-field Rat input remain runtime-unverified. Rat's missing speech member
is not inserted, inferred or certified playable.

The generator removes the independently maintained runtime name/array inventory
and source-line/initializer arithmetic from the overlay. JSON is the maintained
inventory; generated output is frozen, marked generated and compared
deterministically. Both modes use the same selected source values. Check mode
rejects missing/stale output without repairing it, including an appended obsolete
code suffix; LF writes and CRLF checkout tolerance are explicit. Generation from
a changed scratch schema succeeds, demonstrating why regeneration is not source
approval. The unchanged independent 118-name/14-array/279-word oracle remains an
approval gate. Valid reordered inventories and descriptive extensions remain
accepted. The generated file is a drift guard, not an authenticity signature.

The small direct API and single pending-save state earn their complexity for the
named edit/Save As/reopen workflow. No additional abstraction or formatting cleanup
is requested. History retention is the substantive resource omission.

## Prior D1 protection status

All four Review12 findings, closed by Review18 and committed in D1 `b4b319f`,
remain closed at this snapshot:

1. **Schema mutability:** copied recursively frozen private snapshots survive
   partly frozen caller input and later nested caller mutation in both
   environments. The canonical JSON and parser are unchanged.
2. **Incomplete pin checking:** fresh balanced length drift, missing metadata,
   name/type/provenance/policy drift and malformed schemas still fail creation.
   Source generation replaces maintained duplication without removing exact
   comparison. The independent reviewed oracle is unchanged apart from the
   required browser pin-load line in its test harness.
3. **Valid no-op emission limits:** the original tight-cap newline and numeric
   reproductions and the 400,002-byte default-cap escaped-newline reproduction
   return the same document and bytes. Actual invalid/oversized edits remain
   atomic failures in the focused D1 suite.
4. **Unicode fixture:** exact **5,079 bytes**, BOM `EF BB BF`, actual `Grüße 🏰`
   and `ä🦊`, with the reviewed exact SHA-256 retained. The focused suite still
   verifies byte-distinct Unicode/BOM/line-ending variants and exact patches.

The primary source pin is retained as
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, with declaration blob
`9cd4c4ad0a601aab1217bb786e741ef15a39f1be` and transfer blob
`97bf5fcabdd626a6e80c1e17e546f357fc2d4874`. Required managed/native SHA-256
remain `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`
and `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
Their correspondence with the game is inherited from Reviews07/18; this review
did not redo decompilation, the source extraction or installed-binary hashing.

## Independent checks and reproducible evidence

**Observed on Node v26.7.0:** seven owned JS/MJS syntax checks pass; the default
generator `--check` passes. The focused D1/session run passes **195 tests, zero
failures/skips/cancellations**: all 180 D1 cases plus 15 session cases. The two
authored generator tests were read and syntax-checked but not rerun because their
scratch path is hardcoded to the implementer's directory. This review exercised
generation independently under its own authorized directory. Report26's197 is
an inherited implementer count, not a fresh197 claimed here. No unrelated broad,
C1/native, packaging or Classic suite was rerun.

`adversarial-probes.cjs` independently exercises 16 deterministic mixed-operation
traces of 60 commands in each of CommonJS and browser-global VM. An independent
text/history/persisted-content model checks every step across edits, no-ops,
undo/redo, branching, save snapshots, later edits, all outcomes, mismatches and
replays. Each environment also rejects 34 missing/changed metadata/unsupported
outcome variants, tests mutable public bytes and settled receipt objects,
foreign snapshots and target-incompatible preservation. These are finite probe
cases, not added repository tests or a test-count acceptance target.

A controlled delayed platform digest verifies the preparing slot, edits and
branching during hashing, retained submitted bytes/digest, unknown and
final reconciliation. Separate scratch generation checks cover deterministic
write/check, source-whitespace independence, CRLF, stale/missing/obsolete output,
source drift and no production writes. A fresh esbuild browser bundle has
**106,235 bytes**, SHA-256
`1866748f65caa1ca388859c5883e3b12e108d7635047e5eefc288c4d917ce4e2`;
its metafile has **zero external/Node imports**. Executing that actual generated
bundle in a VM with platform WebCrypto verifies exact snapshot bytes and SHA-256.
Its different global export name accounts for its different bytes from the
implementer's bundle. This is bundle/VM feasibility, not a live browser or host
secure-context/packaging observation.

The independent real-source simulation reads Rat from the pinned seed inventory:
commit `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`. Original **5,115 bytes** hash to
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`.
The exact one-token change and scratch Save As/reopen produce **5,124 bytes**,
`3d01405b143ac79f5bfa25bfe1743921c4a0356733838e244ccb1787612aeb54`.
The original seed stays unchanged; missing speech stays missing and canonical
structure stays blocked. Receipts in this simulation are synthetic filesystem
receipts, not evidence of a leased canonical backend write.

Run with explicit workdir `S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node 'S:\Projects\UCP\AI-Toolkit-DE\scripts\generate-de-lord-schema.mjs' --check
node --test --test-reporter=tap 'S:\Projects\UCP\AI-Toolkit-DE\tests\lossless-json.test.js' 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-lord-format.test.js' 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-document-session.test.js'
node 'S:\Projects\UCP\de-research\review-document-session-ds1-r1\adversarial-probes.cjs'
node 'S:\Projects\UCP\de-research\review-document-session-ds1-r1\receipt-status-probe.cjs'
node --expose-gc 'S:\Projects\UCP\de-research\review-document-session-ds1-r1\history-memory-probe.cjs'
```

For a second generator-probe invocation, its intentionally stale scratch output
must first be removed; the reproducible script is made idempotent by resetting
only its own `generation/pin.js` before the missing-output assertion. Production
paths are never deleted or made stale. The initial adversarial run stopped on a
review-harness mistake: supplying `undefined` to the helper invoked its default
`committed` parameter. Explicitly overriding the envelope property fixed only
the scratch harness; it was not a product defect.

Detailed outputs: `focused-tests.tap`, `adversarial-probes.log`,
`adversarial-results.json`, `before-fingerprints.json`,
`after-fingerprints.json`, `review-evidence-fingerprints.json`, the two finding
probes/results/logs above, `review.browser.js`, `generation/`, and
`Rat-synthetic-save-as.lordjson`. Source and evidence hashes are retained in the
scratch manifests so no report self-hash cycle is required.

## Exact reviewed fingerprints

All eight inputs match the implementer's `implementation-fingerprints.json` in
both byte length and SHA-256. All 14 reviewed/protected inputs still match at the
end. Shared HEAD advanced to `30215f2b567ca38b1b36d2e2907c0965a8503765`
during review without any reviewer commit; those source inputs did not change.
These are working-tree bytes:

```text
dd1babe0b4ceb08814d78811443d593370b0593bc8e5b2cc946d7901388af1ec  scripts/generate-de-lord-schema.mjs (3754)
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js (25468)
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js (12614)
685cff5f82ec0944616d2080ab01d85e52bb20b81943457c853e9ef87664489a  src/shared/de-document-session.js (6727)
8062a7c18d6f7b20c73753dc5272d3116e061d01652af6ee00139efae8f6a43b  tests/de-lord-format.test.js (27263)
52540e31ff41d7b44e3a7013baee74fad1aa308b94e6f2904b1543f2bb3f2d4d  tests/de-lord-schema-generation.test.js (4528)
17e0fdddfb61a3295ed0157781deb63858f2d99a21dcbb21e47e1626c7939300  tests/de-document-session.test.js (14704)
3fa917df25c6f2b9eeba8de698949571a7c35b0ae0c481b1cea4742fbb0000d5  docs/de-mode/research/26-document-session-handoff.md (22302)
```

Protected inputs remain unchanged:

```text
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js (20999)
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json (33352)
9f1defee7d7138f42de52aed44ae17863784cd6995993f778dcadc5cb423ccee  tests/lossless-json.test.js (17636)
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
401f4cab233d97eae54cc5feed8686ea8d92e72e1b74dbd1d4764b1fda2385df  docs/de-mode/research/10-lossless-document-handoff.md (16928)
41d71d5b645c457e806a9b0af1d74067ef4b965f3162a793b282a27ad413911f  docs/de-mode/research/18-lossless-document-review-r2.md (22250)
```

## Next owner actions and limits

DS1 owns the two corrections and focused evidence/handoff update. Do not edit
the schema JSON, parser, exact fixture, host/UI or another owner's package files
to address them. Re-review the changed session and its tests/handoff against
these findings; unchanged D1 grammar/UTF-8 sweeps and unrelated suites need not
be repeated. This review does not prescribe an additional architecture round.

After root resolves that review, the already identified cross-owner hooks remain:
build preparation/check must run generator write/check and include its generated
dependency; both hosts must bundle the shared session or load `lossless-json`,
`generated/de-lord-pin`, `de-lord-format`, `de-document-session` in that order.
The current desktop builder's shared-directory exclusion must be handled by the
real frontend entry/import or explicit packaging, before exposure.

Core/host must provide a discriminated raw-byte open result, immutable unique
owner/open IDs and an authenticated captured lease. Bypass the existing blanket
base64-to-AIV decode and Classic normalization paths. Correlate the exact snapshot
with the backend's accepted operation and return its real digest, byte length,
destination and outcome; reconcile unknown before replay or another save. A
session-local `saveId` does not replace backend operation/lease authority. UI owns
dialogs, unsaved prompts, edit freeze/drain/adopt and late-result presentation.
No Rust/Node copy of this session or codec is warranted.

Real host loading/WebCrypto availability, leased atomic writes and reconciliation,
fresh DE-owned window open/edit/Save As/reopen, parallel Classic regression and
desktop observations remain unverified. Structural editing, ordered AIV, durable
session recovery, media/packages, playable AI behavior and game acceptance remain
outside DS1. The full goal stays open.
