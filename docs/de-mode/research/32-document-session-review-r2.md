# Independent DS1 document-session correction review — round 2

2026-10-23. **GO for the additive, unexposed DS1 commit at the exact hashes
below. Both Review28 P2 findings are closed. No new P0/P1/P2/P3 actionable
defect was observed in this bounded review.** No source fix, further abstraction
round or formatting cleanup is requested. Root owns acceptance, integration,
staging and commits. This recommendation does not accept a desktop workflow or
game behavior.

Read goal00, contract01, plan02 and standard05 first; then the full handoff26,
including its appended correction at lines379–569, full Review28 and relevant
Reviews07/12/18 and architecture21/23. Read iso-scrub-performance and the native
parity/cache contracts. The explicit user resumption supersedes the historical
pause. The actual Git checkout is `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`. HEAD at both fingerprint captures was
`30215f2b567ca38b1b36d2e2907c0965a8503765`; the assignment's `773f80b` is an
earlier checkpoint. Shared-checkout concurrency is not worktree isolation.

This reviewer wrote **only this report** in Git. Scratch scripts, source
snapshots, bundles, logs and receipts are under
`S:\Projects\UCP\de-research\review-document-session-ds1-r2`. Every Toolkit
shell command supplied the actual repository as its explicit workdir. No source,
test, other document or teammate change was edited/restored; no children,
commit/push, dependency install, CI/dispatch/PR/merge/release, app/game/Steam
launch, installed/live profile/settings or Classic change occurred.

Evidence labels: **observed** means read/executed here; **inherited** means a
prior pinned result not reproduced here; **inferred** means the consequence of
the inspected implementation; **unverified** means an open evidence gate.

## Prior finding dispositions

### DS1-R1-01 / P2 — unbounded full-document history: CLOSED

**Observed:** `src/shared/de-document-session.js:18–27,32–45,55–94` implements a
finite session-owned history policy. The exported frozen defaults are
`{maxEntries:32,maxBytes:16777216}`. The optional third argument is
`createSession(raw, ownerId, {historyLimits:{maxEntries?,maxBytes?}})`.
`read().history` is a frozen `{limits,entries,byteLength}` record; its copied
primitive limits are also frozen. Supported overrides may only tighten the
defaults: safe integer entries in [1,32], bytes in [0,16777216]. Invalid values
and unknown enumerable string keys fail before document creation. The independent
probes reject 33 invalid limit cases per environment, including widening,
nonfinite/fractional/unsafe numbers, strings, boxed numbers, null/undefined
values, symbols/BigInts as values and misspelled/prototype-like keys. Mutable
accessor limits are captured once; later option replacement cannot widen them.

Entries count undo, current and redo together, **including current**. Cost is the
sum of each retained D1 document's source `byteLength`, once per history entry;
undo/redo does not duplicate that document or increase the cost. A real edit
discards redo and evicts oldest undo until both caps hold. Current remains
mandatory: if it alone exceeds a tightened byte cap, it stays alone, reports its
actual over-cap byte cost and exposes no undo/redo. The default byte cap exceeds
D1's 8 MiB default per-document cap. An independent over-cap → smaller-current
→ exact two-document boundary trace verifies recovery to ordinary retention.

An independent text/history/saved-content model runs 30 traces of 96 selected
steps in **each** of CommonJS and browser-global VM, across five policies:
defaults, four entries, byte-pressure retention, one entry/zero bytes and a
below-document byte cap. It checks exact BOM/CRLF/duplicate/large-number bytes,
variable token lengths, byte sums, oldest retention, undo/redo/branching,
monotonic session revision, no-op identity, byte-based dirty state, destination,
saved revision and pending/last outcome at every step. These are finite scratch
state traces, not additional Node test cases.

Independent oversized-token and invalid-Unicode candidate failures preserve the
complete prior state and redo branch. Failed/stale edits do not publish partial
evictions. No-ops leave revision, bytes, history and redo intact. Saves do not
insert history. A deliberately delayed platform digest verifies eviction while
preparing, then pending/unknown preservation through later edits. Reconciliation
of the exact older snapshot preserves its submitted document and saved revision;
current content independently edited back to those bytes becomes clean.

**Retention boundary:** original, saved and active preparing/pending/unknown D1
documents remain pinned separately when evicted from history, at most three
additional distinct document references. D1's per-document byte/token/node/depth
limits remain unchanged. Saved-comparison bytes, active save bytes and the latest
receipt snapshot have separately finite per-document cost; some buffers alias.
Current is already counted in history. A source-byte allowance is **not a JS
heap/RSS bound**. Public records/documents/snapshots retained by callers are
outside this component's control. The implementation and appended handoff state
that limit honestly; no generic history manager or host resource policy is needed.

**Fresh representative replay:** the same valid 1,048,618-byte JSON shape as
Review28, with two 524,288-character extension strings, undergoes 64 scalar
edits. At edits32 and64 it retains **15 entries / 15,729,285 source bytes**.
Exactly **14 undos** remain, reaching value50; original/saved value0 remains
available. Branching leaves two entries and no redo. GC process samples at
32/64 edits are heapUsed 22,425,192/22,628,960, ArrayBuffers
23,213,226/25,310,464 and RSS 91,271,168/92,565,504 bytes. Source-cost retention
plateaus as asserted; allocation/finalizer samples need not be identical. This
finite replay is neither an OOM proof nor an interactive performance benchmark.

### DS1-R1-02 / P2 — receipt status checked and read again: CLOSED

**Observed:** `src/shared/de-document-session.js:122–139` captures `receipt.status`
once, validates that captured value against the four primitive outcomes and
applies only that value. Exact pending snapshot identity and all seven metadata
comparisons remain: `saveId,documentId,ownerId,revision,destination,sha256,
byteLength`.

Fresh independent accessor traces in both environments cover failed→committed,
cancelled→committed, unknown→committed, unknown→unsupported and
committed→failed. Every accessor is read exactly once. Failed/cancelled do not
adopt a destination or saved content; committed applies the first validated
value. Unknown retains the exact pending snapshot and blocks a second save.
Nine invalid first outcomes followed by committed are rejected without changing
unknown state. Each of the seven missing and seven changed metadata fields is
also rejected while unknown, in both unknown-accessor traces. Snapshot clones
and settled replays remain rejected. A matching explicit failed reconciliation
releases unknown without claiming a commit or clearing dirty state.

These are synthetic correlation receipts. The domain is not required to
authenticate backend truth from a fully matching fabricated envelope; host/core
still owns real write acceptance, destination/digest truth and reconciliation.
That ownership boundary is preserved rather than duplicated in this correction.

### Generator-test portability observation: CLOSED

**Observed:** `tests/de-lord-schema-generation.test.js:15–22` allocates a unique
per-test `mkdtempSync` directory under `os.tmpdir()` by default, or the optional
`AI_TOOLKIT_TEST_SCRATCH` parent. Cleanup is registered with `t.after`. No S:
default remains. All missing/stale/source-drift writes stay in the test's own
directory. The second test loads browser globals without scratch allocation.

Both authored tests now run freshly with the environment override absent, and
also with an owned override containing spaces. The override parent is empty
after cleanup. Production schema/pin bytes are checked unchanged by the authored
test and by this review's before/after fingerprints. No production output is
made stale to test check mode. This resolves Review28's inability to rerun the
two authored cases within its assigned scratch ownership.

## Preservation, architecture and smoothness

**Observed:** all ten unowned reviewed/protected files are byte-identical to
Review28. The parser, canonical schema, generated pin, generator, LORD overlay,
independent D1 tests and exact fixture are unchanged by the correction. The
original 22,302-byte handoff prefix hashes exactly to its Review28 receipt; only
the correction appendix follows it. Review28 itself and the original eight-file
receipt are intact. The stored before-images independently match all fourteen
prior length/hash records. Fresh before/after snapshots match all fourteen
current correction records; only the four declared correction files differ
from Review28. This excludes concurrent C1/PXL/root work from the recommendation.

All four prior Review12 protections remain **closed**: private immutable schema
snapshots; exact pinned-contract rejection; valid no-op recognition before
unused emission limits; and the real Unicode fixture. This conclusion uses the
unchanged protected hashes, source diff and freshly executed original 180 D1
cases, not new decompilation or a repeated broad grammar/UTF-8 sweep. The fixture
remains 5,079 bytes with exact reviewed SHA-256 below. Schema JSON remains the
only maintained runtime inventory; generated guard data is shared, and the
independent 118-field/14-array/279-word oracle remains a separate approval gate.
Regeneration still does not approve a source-contract change.

The session remains one host/DOM-independent JS owner over D1, serving raw
open → one existing scalar edit → explicit Save As/reopen. Parsing, patching and
serialization stay in D1. No UI, backend policy, filesystem authority, second
serializer, fallback converter or general session framework was added.
`read`, revision-checked `replaceScalar/undo/redo`,
`snapshotForSave(expectedRevision,destination)` and
`acknowledgeSave(exactSnapshot,receipt)` retain their handoff26 contract.

**Performance assessment:** accounting reads immutable `byteLength` scalars;
it does not serialize every historical document. The list is capped at32, with
at most33 candidate references. The temporary prefix/branch arrays copy those
bounded references, not source buffers or syntax trees. The two short reductions
and oldest-entry shifts cannot grow with lifetime edit count. Instrumenting
delegated real D1 documents over 256 edits observes exactly one current-document
serialization per real edit, at most66 length reads, and zero accounting reads
or serializations on a no-op. Undo serializes its selected current document once.
No historical document is serialized just to count retained cost. Rewriting
these bounded reference operations is not a correctness or smoothness gate.

No renderer, retained worker scene, latest-only queue, batching, texture/geometry
cache, dirty invalidation or deferred-analysis path changed. There is no draw/input
path consumer of this unexposed module, and no per-frame probe/hash/decode/IPC was
introduced. The scratch replay/instrumentation establishes domain retention
behavior only. Owned before/after interactive measurements belong to the later
actual UI integration; no frame benchmark is invented or waived for that work.

## Fresh commands, results and evidence

Node **v26.7.0**. Every command below runs with explicit
`exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE`.

```powershell
node 'S:\Projects\UCP\de-research\review-document-session-ds1-r2\capture-inputs.cjs'
# node --check passed separately for all seven DS1 JS/MJS code/test files.
node 'S:\Projects\UCP\AI-Toolkit-DE\scripts\generate-de-lord-schema.mjs' --check
$env:AI_TOOLKIT_TEST_SCRATCH = 'S:\Projects\UCP\de-research\review-document-session-ds1-r2\test-scratch'
node --test --test-reporter=tap 'S:\Projects\UCP\AI-Toolkit-DE\tests\lossless-json.test.js' 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-lord-format.test.js' 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-document-session.test.js' 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-lord-schema-generation.test.js'
Remove-Item Env:AI_TOOLKIT_TEST_SCRATCH -ErrorAction SilentlyContinue
node --test --test-reporter=tap 'S:\Projects\UCP\AI-Toolkit-DE\tests\de-lord-schema-generation.test.js'
node 'S:\Projects\UCP\de-research\review-document-session-ds1-r2\independent-probes.cjs'
node --expose-gc 'S:\Projects\UCP\de-research\review-document-session-ds1-r2\large-replay-and-bundle.cjs'
node 'S:\Projects\UCP\de-research\review-document-session-ds1-r2\capture-inputs.cjs' after
```

**Observed:** seven syntax checks and generated `--check` pass. Focused suite:
**205 passed, 0 failed/skipped/cancelled**, comprising 180 D1 + 23 session + 2
generator cases. The separate default-temp generator run passes2/2; the override
with spaces also passes2/2 and cleans its allocations. Those repeated generator
runs are not added to the unique focused-test total. Independent probes pass;
their finite state steps/assertions are not advertised as extra Node tests.

The new actual esbuild `platform:'browser',format:'iife',target:'es2022'` bundle
is **107,575 bytes**, SHA-256
`2692a6720c51d31dd5aa603afe621a1ef2c96c49f75cd4fe0e19d2985096eaf2`.
Its metafile contains five local inputs and **zero external/Node imports**.
Execution in a fresh VM with platform WebCrypto verifies an exact BOM/CRLF,
duplicate/large-number-preserving scalar patch, snapshot digest, capped history,
single-read unknown outcome, older committed saved bytes and reopen. This is
actual bundle/VM feasibility, not a real browser secure-context, desktop package
or host loading observation. No unrelated native/C1, broad Classic, package
build or game suite was run.

Evidence includes `before-fingerprints.json`, `after-fingerprints.json`, copied
`reviewed/` inputs, `focused-tests.tap`, `generator-default-temp.tap`,
`generator-override.tap`, `independent-probes.cjs/.log`,
`independent-results.json`, `large-replay-and-bundle.cjs/.log`,
`large-bundle-tooling-results.json`, `review-r2.browser.js` and
`review-r2.metafile.json`. `review-evidence-fingerprints.json` records their
hashes and this report's hash outside Git, avoiding a report self-hash cycle.
An added negative probe initially expected the oversized-token error's category
to be `limit`; D1 correctly reports `edit/max-token-bytes`. Only that scratch
predicate was corrected to the documented code, then the complete probe passed.
The initial harness log is preserved as `candidate-error-harness-failure.log`.
PowerShell-redirected TAP/log files retain their original UTF-16LE BOM spelling;
the final evidence reader decodes that BOM rather than rewriting the logs.

**Inherited, not rerun here:** Review28's195 (180 D1 + 15 earlier session),
original handoff26's197 and correction owner's205 are earlier executed snapshots.
The real pinned Rat filesystem simulation, primary-source extraction and actual
installed-binary correspondence remain inherited from reports26/28 and
Reviews07/18. This review neither sums those results nor relabels them fresh.

## Exact reviewed fingerprints

Working-tree bytes, equal to the correction manifest and stable through the
fresh after-capture. Original eight DS1 files:

```text
dd1babe0b4ceb08814d78811443d593370b0593bc8e5b2cc946d7901388af1ec  scripts/generate-de-lord-schema.mjs (3754)
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js (25468)
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js (12614)
88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a  src/shared/de-document-session.js (8203)
8062a7c18d6f7b20c73753dc5272d3116e061d01652af6ee00139efae8f6a43b  tests/de-lord-format.test.js (27263)
5e510ab842a006b663ad41f97b9b6fd36ba8d2d84a7f7af6a11899009575312c  tests/de-lord-schema-generation.test.js (4760)
9944697185fc3cf4015818cd8742c92158f774c05fc06b37ab7de1a4f923d575  tests/de-document-session.test.js (24119)
af2f4be8041756e8c27a0a90e4e2bf28fce6fc15aab2b295e0f8c8a367a5d371  docs/de-mode/research/26-document-session-handoff.md (33978)
```

Six additional protected inputs:

```text
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js (20999)
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json (33352)
9f1defee7d7138f42de52aed44ae17863784cd6995993f778dcadc5cb423ccee  tests/lossless-json.test.js (17636)
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
401f4cab233d97eae54cc5feed8686ea8d92e72e1b74dbd1d4764b1fda2385df  docs/de-mode/research/10-lossless-document-handoff.md (16928)
41d71d5b645c457e806a9b0af1d74067ef4b965f3162a793b282a27ad413911f  docs/de-mode/research/18-lossless-document-review-r2.md (22250)
```

Review28 remains20,089 bytes,
`6853664e30d1a1c152badf4c72aed8da3ad5e6e62551cb1093bb89f75e81a9a6`.
The historical handoff prefix remains22,302 bytes,
`3fa917df25c6f2b9eeba8de698949571a7c35b0ae0c481b1cea4742fbb0000d5`.

Inherited primary pins remain develop
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, declaration blob
`9cd4c4ad0a601aab1217bb786e741ef15a39f1be`, transfer blob
`97bf5fcabdd626a6e80c1e17e546f357fc2d4874`; managed/native SHA-256
`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` /
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
Rat remains pinned to blob `a2018a0166ff60a5d4b9330c8ab06be795157e20` at
that develop commit; missing speech remains missing, with runtime unverified.

## Remaining owners and gates

Root can accept the reviewed additive DS1 milestone after checking the actual
staged diff and hashes. No correction is requested from DS1. Concurrent core,
pixel and central-document work needs its own acceptance; this GO includes none
of it. Do not add another session/schema policy to either backend.

Build/host owners still need generator write/check hooks and actual shared-module
bundling or four-script load order. The desktop builder excludes shared source
copies, so an actual frontend entry/import or explicit packaging must close that
gate before exposure. Core/host must carry discriminated raw bytes, unique
immutable owner/open identities and an authenticated captured lease; bypass the
blanket AIV/base64 and Classic normalization paths. Submit exact snapshot bytes
to the canonical leased atomic writer, correlate the actual backend operation,
return matching digest/length/destination/outcome and reconcile unknown before
replay or another save. A session saveId is not backend authority.

UI owns dialogs, unsaved prompts, freeze/drain/adopt and late-result presentation.
Fresh DE-owned window select/open/edit/Save As/reopen beside an unchanged Classic
window, both-host loading/WebCrypto, real write failure/reconciliation, Classic
regression and affected interactive before/after observations remain unverified.
Structural editing, ordered AIV, durable recovery, media/packages, playable AI
and isolated game acceptance remain outside DS1. The full user goal stays open.
