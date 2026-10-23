# F2W1 canonical core/native correction — round 2

23 October 2026. **Implementation handoff for fresh independent core Review59;
not self-acceptance, final packaging or desktop/game acceptance.** All four
backend Review49 findings have owner-specific corrections and focused evidence.
Root split the remaining build work into refresh61 after the consumer Close
correction. Review58's subsequent consumer Close-inflight finding supersedes the
consumer54 packages below; it does not become a claimed passing Close witness.
The full separated Classic/DE goal remains open.

## Authority, ownership and frozen sources

Read goal00, contract01, plan02 and standard05 first; then full frozen Review49,
Review50, handoffs44/45, adopted23, C1/DS1/panel contracts and Reviews39/32/38/43,
plus iso-scrub-performance/native-parity and relevant native history. Review49
SHA-256 is `702b6cfdb96a07551cba99e3874e8a2363fb3f4a3718b91a0cf269e9f6d7fb64`.
The explicit resume supersedes the historical pause; this task changed no goal.

Every Toolkit shell command used explicit cwd
`S:/Projects/UCP/AI-Toolkit-DE`, branch `de/separate-game-mode`. Entry HEAD was
`9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`; coordinator-only milestones advanced
it to frozen **`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`**. Shared checkout is
not worktree isolation. No children, commits/push, CI/dispatch/PR/merge/release,
native app/game/Steam/browser UI launch, mounted OpenSHC/Ghidra access or
live/original profile/settings/Classic checkout change occurred.

Only the 13 source/generated paths in the fingerprint appendix and this new
report were authored in this correction. Native `storage.rs` remains the reviewed
thin Classic wrapper consuming the single writer. Cargo manifests/locks, build
scripts, core/native `profiles.rs`, D1/DS1/schema and optimized Classic renderers
were not changed by this round. Consumer54 separately owns main/preload/controller/
panel/Node adapters and tests. No teammate change was restored.

All scratch, fixtures, binaries, logs, driver sources and receipts are outside Git
under `S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2` (**evidence/**).
`entry-pins.json`, `entry-owned.diff`, `prebuild-source-pins.json`,
`handoff-source-pins.json` and their source copies distinguish entry, reviewed
baseline and final bytes. The final capture has75 inputs, zero core/native drift,
zero consumer54 freeze drift and zero protected drift; final verification also
checks native's unchanged profile re-export. Core59 may observe later authorized
consumerR3 drift; use these retained sources/artifacts for this core-only review.

Evidence labels: **observed** means executed/read here; **source-confirmed** means
the inspected shipping source establishes it; **inherited** retains earlier pins
without claiming execution; **unverified** remains an acceptance gate.

## Four finding responses

**F2-R1-01 / P1 — exclusive ownership of the canonical stage.** `files.rs` now
creates its stage exclusively before constructing cleanup ownership. A small
owned-stage guard closes the file before cleanup on write/sync/rename failure;
successful rename consumes that ownership. A preexisting collision is never
cleaned. Generated stage/destination filename equality, case-insensitive on
Windows, is refused before acquisition, including an absent destination. There
is still one `fs::rename` replacement primitive and no move-target-away interval.

Observed tests exercise partial write failure, rename failure, existing stage
collision, existing and absent destination equality, successful replacement and
owned-stage cleanup. The actual packaged helper independently preserves the
unowned sentinel, both existing targets and the absent equality target while
returning exact failed receipts. Ordinary BOM/CRLF/duplicate/large-number bytes
still save exactly. Native Classic's4 storage tests consume this writer and pass.

**F2-R1-02 / P2 — acquisition, adoption and retirement at the core owner.** Raw
read now keeps one transient candidate per logical owner; it persists no document
registration. The next read supersedes even a lost acquisition, Close removes it,
and backend loss drops it. The lifetime128 document count is removed rather than
increased. Received invalid/stale candidates have an explicit release handshake.

One small persistent owner record holds the adopted ID, at most one ready
transition and its last receipt, with no JSON projection or document bytes.
`adoptRaw` persists the exact candidate/previous pair as ready while preserving
old authority. `finishAdoption`, called after actual synchronous frontend adoption,
atomically makes the candidate authoritative and retires the previous ID.
Candidate saves are refused before finish. `releaseRaw` aborts a ready candidate
without retiring the old document; released IDs cannot be reacquired by replay.

The exact-pair `adoptionStatus` resolves acknowledgement loss. Explicit original
context recovery loads only that owner's durable record and cannot substitute a
startup default. Missing transient candidates are not recreated. A proven absent
transition returns `document-adoption-not-found` only when prior authority still
equals the supplied previous ID and there is no competing ready transition;
conflict/transport failure grants no such fallback. This prevents a pre-persistence
backend loss from permanently wedging an otherwise usable old session.

Save admission holds the same state lock through durable unknown-ledger creation;
retirement/Close cannot pass between authority validation and accepted submission.
Accepted writes finish and unknown receipts protect their document. Finish checks
again because the prior document stays save-capable during a ready transition.
Close refuses unresolved writes/adoption, removes its persistent authority plus
transient/adopted memory on success, and retains operation receipts for truthful
drain/reconciliation. Native `de_close` returns that refusal before approving OS
destruction. A second context check under Close's lock prevents a stale Close from
removing a replacement context.

Observed:160 invalid/lost raw reads pass through the actual packaged helper with
no durable candidates or lifetime cap. A focused132 successful-replacement trace
keeps exactly one durable owner record. Tests cover lost acquisition, exact absent
and conflicting status, ready/finish acknowledgement recovery, idempotent absent
release, released-replay refusal, old authority before finish, retired authority
after finish, unknown-save protection at adoption/finish/release/Close, persistent
Close cleanup and explicit recovery without document revival. Operation receipts
also now check queried operation/owner identities before publication.

**F2-R1-03 / P2 — refusal consumes the unadmitted payload before scheduling.**
`prepare` now returns owning `Result<PreparedContext, ContextResult>`; only Ok
contains the command and the existing reservation. Refusal consumes/drops the
command immediately, retaining only its small refusal or correlated seven-field
save metadata. `prepare_operation` carries the same ownership result. Native
`de_request` and the helper reader consume Err immediately; only Ok crosses
`spawn_blocking` or the helper work queue. No second quota/counting policy exists.
Known preacceptance save refusal stays failed; submitted-write loss remains
unknown, with the existing seven-identity receipt correlation.

The final finite allocator witness links the actual final native-test core rlib
and holds12 preparations with5MiB paths: **4 queueable admitted,8 nonqueueable
refusals,20,972,680 retained allocator bytes**, below the25,165,824-byte allowance;
after drop the delta is0. The original Review49 observation was62,926,968 bytes
at its frozen source. This is linked-core allocation/held-queue evidence, not RSS,
peak app memory, an executed Tauri UI flood or UI performance. Native scheduling
is source-confirmed and compiled: rejected commands have no queueable object.

**F2-R1-04 / P2 — canonical legacy root carried across native scheduling.**
`Request::capture_classic` borrows the typed legacy root once, asks the canonical
core to authenticate it, then replaces that field with the captured canonical
profile root before the request enters `spawn_blocking`. One mutable root visitor
covers all14 legacy request variants, avoiding JSON serialization/copying of their
opaque media/document payloads. Existing library/map/cache algorithms are unchanged.

Observed actual typed-ingress regression: capture all14 requests through an owned
junction pointing at synthetic Classic/UCP A; retarget it to B; the actual native
normalizer sees B for the original alias but A for every carried request. This
executes canonical authentication, the real typed request adaptation and real
native normalization. It does **not** execute a Tauri handler/WebView or game tree.
No new per-input/hash/probe/cache policy was added.

## Frozen generated lifecycle amendment

The contract was frozen before coupled consumer edits in
`evidence/interface-r2.txt`, then materialized by the existing Rust exporter.
Root received/relayed the complete contract and its explicitly appended
not-found/conflict/release clarification; no interface change was hidden.

```text
adoptRaw       {ownerId, documentId, previousDocumentId: string|null}
adoptionStatus {ownerId, documentId, previousDocumentId: string|null}
finishAdoption {ownerId, documentId, previousDocumentId: string|null}
releaseRaw     {ownerId, documentId}

documentAdoption {ownerId, documentId, previousDocumentId,
                  status: ready|committed|released}
documentReleased {ownerId, documentId}
```

Host owner injection remains separate from logical owner validation. Caller must
serialize save/transition admission, parse through DS1 before adoption, retain the
previous DS1/draft until exact ready is known and synchronous installation succeeds,
then finish the exact pair. Lost ready ack retains the old session; lost finish
ack retains the installed session and transition and blocks new Open/Save/Close
until exact status. Release of an absent candidate is an idempotent exact-ID no-op,
grants no authority and cannot release a different candidate. Pending/unknown saves
are never retired or retried blindly. Root's later consumer Close-inflight finding
still requires its view/commit-phase correction independently of these obligations.

```text
interface-r2.txt d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191
types.ts         5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96
contract.json    509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace
combined contract ee8d4f79e03878d26468eb12322e4f70fb4cf958f482ef0584f1c3443fee9685
```

Protocol is1.3. Rust's existing generated write inventory includes the three new
mutating commands; status is read-only. No hand-maintained frontend inventory,
second JSON/session model, generic lease framework or JS garbage collector exists.

## Executed checks and current evidence limits

- **43/43 core/profile tests on Rust1.98.1 and43/43 on Rust1.88.0**, with the
  matching protocol1.3 helper. Includes14 context/writer tests and29 retained
  profile/parity/recovery tests. MSRV helper compilation also succeeds.
- Native typed contracts **6/6**, storage **4/4**, window/dependency **3/3** and
  desktop delivery **1/1** pass. New junction test covers all14 affected variants.
- Existing actual-client/helper transport selection **19/19** passes. No full
  unchanged JS/game suite or native application was rerun.
- `packaged-negative-results.json` records actual packaged-helper collision,
  equality, exact-byte/foreign/replay/reuse/reconcile,160 invalid/lost reads,
  boundary+1, rename failure, stage cleanup and persistent Close behavior.
- `packaged-workflow-results.json` uses actual ASAR-extracted facade/client,
  controller/DS1 and matching packaged helper with a **synthetic panel/dialog
  adapter**. It passes real-Rat no-op/edit/Save As/reopen/reconcile and exact8MiB
  raw Open/save/pre-abort. Real DE folder probe/reprobe is read-only; only owned
  copies and owned profiles are written. This is neither native UI nor playable
  export evidence.
- That actual facade/helper trace kills only its own helpers before adoption
  submission, after persisted ready and committed replies but before delivering
  those acknowledgements, and at Save Started. Explicit recovery retains the
  appropriate exact DS1/history/transition. The pre-adoption-loss old session
  remains save-capable; lost finish retains the installed object. Save loss ends
  **unknown**, preserving the exact snapshot/revision1/undo with one submission
  and no replay. No target-byte inference supplies a commit.

Inherited Rat pins remain: source commit
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`. Observed original/no-op5115-byte hash
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`; single-token
edited hash `068529b36228490acfe0c730e4b797ad2109b4b1e4b0feb70ea7fd170ba61935`.
Its117 fields/missing speech and unverified playable semantics are preserved.

Finite I/O samples are retained, not statistical UI comparisons: initialization+
fresh bind13.95ms, DE prepare20.59ms/reprobe+activation23.26ms, Rat controller
Open/parse/adoption7.92ms, no-op Save As4.35ms, edited Save As3.38ms,8MiB raw
Open42.88ms/Save164.59ms. These are explicit I/O/control-plane tasks on a shared
host, not input-to-paint/FPS/native smoothness. Protected retained workers,
latest-only queues, batching, terrain indexes, cache/dirty invalidation and deferred
work match their entry pins. No draw/input probe/hash/decode/IPC was introduced.
Actual equal-workload desktop comparison remains root-owned and unverified.

## Reproducible commands and process ownership

All commands use explicit Toolkit cwd. `evidence/run.cjs` records exact programs,
arguments, times, PIDs/observed creation/command identities, deadline, exit and
post-close descendants; its timeout/signal/finally cleanup targets only its owned
tree. Build/test deadline600s. Actual helper clients are closed/reaped in finally;
faults terminate only the exact ChildProcess handle and retain unknown outcomes.

```powershell
$e = 'S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2'
node "$e/run.cjs" generate-r2b node scripts/generate-core-contracts.mjs
node "$e/run.cjs" final-helper-override node scripts/build-core.mjs
node "$e/run.cjs" final-core-current cargo test --offline --locked --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/toolkit-core/Cargo.toml --lib
# final-core-msrv receipt supplies exact1.88 cargo/RUSTC/RUSTDOC and target-msrv.
# native-contracts-r2c/storage-r2/windows-r2/desktop-r2 receipts supply exact filters.
node "$e/run.cjs" transport-r2 node --test --test-isolation=none --test-reporter=tap tests/core-client.test.js tests/core-helper.test.js
node "$e/run.cjs" packaged-negative-r2 node "$e/packaged-negative.cjs"
node "$e/run.cjs" packaged-workflow-r2 node "$e/packaged-workflow.cjs"
# memory-final-compile links the final native debug rlib; exact rustc/-L/-o in receipt.
node "$e/run.cjs" memory-final "$e/preparation-memory-final.exe" "$e/memory-final-fixture"
node "$e/pins.cjs" handoff
node "$e/finalize.cjs"
```

Use fresh run labels/fixture destinations when replaying; receipts are retained,
not overwritten to hide failures. Meaningful preparation failures remain: initial
generation hit a Rust borrow-pattern compilation error; the first native junction
test passed forward slashes to `cmd /mklink`, then used a plain Classic fixture
where the retained library normalizer correctly requires UCP. Both were corrected
in their proper owner/test. The initial MSRV unit tests passed but doctest invoked
the1.98 rustdoc against1.88 libraries; the exact toolchain lib rerun passes. No
product policy was weakened to satisfy these failures.

Final wrapper receipts show no live owned descendants. The explicit recovery
trace reaps helper PIDs46764/55068/25016/2424 after intentional SIGTERM and41220
with exit0. No helper/server, browser tab or watcher is intentionally left alive.
Final verification rechecks tracked PID/creation identities. No Python process,
unrelated user process, stale database-directory sweep or broad executable kill
was used. No eager decompiler state was acquired.

## Superseded artifacts and remaining refresh61

Override helper/ASAR and native release build completed before root's subsequent
packaging hold. **They contain the superseded consumer54 bytes.** Their successful
builds/helper observations do not close Review58, final package parity or UI gates.
`artifacts-r2-superseded.json` records45 exact manifest inputs and25 dependency
notice entries, actual archived resources, native EXE and both memory-probe rlibs.
Helper/notices are outside ASAR. No default-C build/package or native ZIP was made
in this correction, and no app EXE was launched.

```text
helper630784 bytes 4d22f5d669eb8ea076c5779f432f46a67b648bfe09e60d00b0c581d7717f09a1
ASAR17147926      63b7b9ed4903d3afc8de1465fba765545dff477e7a46902e4e3acabd5adf8fee
native10950144    a4bdae8b3ac85b36e1a9138b477a126c04354a81354219d9ac51077bd11ea9df
helper sourceId   0d11a7bdc13999397e83626c985c070d6ddbdb01f9528b4c590460e8cac49342
helper buildId    760e8bd0e0b86603f675b7c9655314b7b003d7abbcf2a4ebfe95611314d86215
final native rlib 2426e7996a78f82dd3f1adf6c9a6d6f1f31665ed5990991d7c116a22d15c46d5
```

Final allocator rlib hello uses the in-process source/build inventory:
source`7c2583f95afc56182ceb3750125621909dc5dbcbef1c2525d34235f6a90c2349`,
build`a47cb601a4e3e239feecc6c7281191293167408146d687a6098436c1869eb579`.
It shares the exact contract hash above. The wider helper's inventory intentionally
includes consumer/build inputs and has a different source/build identity. Earlier
`memory-r2` used the predecessor core before Close's second context check; the
fresh `memory-final` links the frozen final native rlib and yields the same20.97MiB.

Root retains acceptance/commits and will assign refresh61 **after consumerR3
freeze**: final generation/check, matching helper/protocol/manifest, default-C and
override-S Electron directory packages, native release plus portable ZIP<8MB and
123 unchanged permitted images, notices/ASAR adjacency, final source/payload hashes
and changed-boundary packaged probes. Do not rebuild from these superseded
consumer artifacts or call old-helper mismatch a product bug. Then fresh combined
review, actual isolated both-host dialogs/windows/input/paint/performance, broader
Classic checks and full DE/game acceptance remain open. This sequencing split
retains all build/acceptance requirements; it does not declare F2 complete.

## Exact correction source fingerprints

Physical working-byte SHA-256, identical at prebuild and core/native handoff;
complete inherited/unchanged inputs and report/evidence hashes are in
`handoff-source-pins.json`/`final-verification.json` (no self-hash cycle).

```text
cce8550df94992d4b6d7d9d8079d5ce3fc051fd8fe0ba3a35c16d75595f531fe crates/toolkit-core/src/lib.rs
879ffa815319a165254a0d81286c32c12a479952ff6f51e735719c5f9ecbb392 crates/toolkit-core/src/contracts.rs
fb7a1ef962c0674eadc498b730d9ceae46865bfdd4cc3ae0e8f2ea88f53c6739 crates/toolkit-core/src/context.rs
f483be25cf6f44523c6c08965ea875240f4e1396a2c6efcd6a1eb15dab8a2a20 crates/toolkit-core/src/context_tests.rs
e54a26f8ed16259ff2070df09f8e8d07a6b38f4a21666da47697dc4f9b27de0c crates/toolkit-core/src/files.rs
e988a44e0460a448ee1b91b430193361615e3c221201e01477714abb68ce5249 crates/toolkit-core/examples/export-contracts.rs
b9b4a4473a4933e7466a61b074db874bf3ad957f3bf9ea769b72106f7882dbc8 crates/toolkit-host-helper/src/main.rs
37fe3badcd9b9ca96dccde255af417adbd466ddd73a7edf336cf7903504cdc52 src-tauri/src/de_context.rs
8e2a0384ade9f37a793fbb12ff8749ae8bbf20ebf636246830c7056665a9747d src-tauri/src/desktop.rs
fa4f246157f4e6faea999eb79133b491675e92501f47c33853a33665d84d1e3e src-tauri/src/desktop/contracts.rs
66fc551c82731aae4f162aa8c55d5621c404b76d82cee3ef400472a2f4b65914 src-tauri/src/windows.rs
5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96 src/desktop/generated/core/types.ts
509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace src/desktop/generated/core/contract.json
```
