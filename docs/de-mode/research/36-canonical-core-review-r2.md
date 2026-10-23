# Independent canonical core/helper review â€” C1 round 2

2026-10-23. **NO-GO for the coherent additive C1 commit at these exact bytes.**
**C1-01/P1 is independently CLOSED. C1-02/P2 is PARTIALLY corrected and remains a
commit blocker at the packaged Node facade.** The lower-level CoreClient now
reserves before encoding and passes the former burst and lifecycle probes. Its
facade still copies byte payloads before admission and awaits the connection
before submitting ordinary objects, bypassing those guarantees. The bounded
reproduction and smallest corrective direction are below. Root owns acceptance,
integration, ownership reconciliation and commits.

Original Review11 R1/R2/R3 and Review17 R4 remain closed as established by
Review30. This finding does not reopen their raw JSON-domain, decoded duplicate,
CLR structural-recognition or rollback-authority obligations. No context, live
profile, raw-document, UI, renderer or full DE acceptance is granted here.

## Authority and exact review scope

Read the four mandatory files first: goal00, contract01, plan02 and standard05;
then original handoff09, Reviews11/17, adopted architecture23, complete handoff25
including its entire 2026-10-23 correction append, independent Review30,
`docs/iso-scrub-performance.md` and the relevant native-parity contracts. The
explicit user resume supersedes the historical pause. No goal flag was changed,
permission re-requested or child delegated.

Observed entry and final HEAD:
`61c2fa16524c7b06d1638eed9c1593afd689e469`, branch `de/separate-game-mode`.
C1 remains uncommitted. All **28** source/input hashes in the supplied correction
receipt matched independently at entry and final verification. Its recorded
`ebff3b1` HEAD predates the coordinator's PXL2 commit; that is context, not a C1
source mismatch. Concurrent central-document and other teammate edits were left
untouched. No worktree isolation is claimed.

Correction receipt:
`S:/Projects/UCP/de-research/fix-canonical-core-c1-r3/final-verification.json`,
SHA-256 `02da91a2030556ce9900e423ccfb7c590918810446dea91450368ea01fdb9ad0`.
The exact source pins are reproduced below; no remote permalink is invented for
uncommitted files.

Evidence labels: **observed** means independently executed here;
**source-confirmed** means inspected at these pinned bytes; **inherited** means
prior implementer/reviewer evidence at matching source/artifact identities,
without claiming to rerun it; **unverified** means no acceptance evidence here.

Only checkout output owned/written by this review is this report. Scratch
sources, copied helper resources, Cargo target, logs, metadata, measurements and
machine-readable receipts are outside Git under:

`S:/Projects/UCP/de-research/review-canonical-core-c1-r2` (**review/** below).

Every Toolkit `exec_command` used explicit cwd
`S:/Projects/UCP/AI-Toolkit-DE`. No implementation/test/generated/root-document
edit, restore, commit/push, CI/dispatch/PR/merge/release, dependency installation,
app/game/Steam launch, live/original settings/profile or Classic-checkout change
occurred. Only synthetic helper and test/probe executables ran. Retained original
research and directory packages were read, never rewritten.

## Remaining actionable finding

### C1-02 â€” P2 / commit blocker: facade preparation bypasses the corrected admission boundary

**Owner:** C1 Electron-main transport/facade owner. **Source locations:**
`src/node/game-profiles.js:8â€“13,31â€“33`. `client()` caches a connect promise;
`invoke()` executes `await client()` before `CoreClient.request`. `inspectPe` and
`parseMetadata` eagerly spread every caller byte buffer into a new number array
before calling invoke. Actual admission is later at
`src/node/core-client.js:178â€“201`.

**Observed through the actual client/facade extracted from the verified fresh
Windows directory package**, using its matching fresh helper, even with an
already warm connection:

1. Create one 262,144-byte Buffer and issue 64 synchronous `api.inspectPe(bytes)`
   calls, then await their results. A counting iterator delegates unchanged to
   the Buffer's native iterator, and a CoreClient.request wrapper counts entries.
2. Before the first microtask, the facade has made **64 full raw-array copies**
   (**16,777,216 number elements**) and entered CoreClient.request **zero times**.
   This finite sample observed **161,681,520 bytes** of heap growth,
   **262,250,496 bytes** RSS growth and **422.24 ms** synchronous work.
   These are instrumentation observations, not universal thresholds or a UI test.
3. Only afterward does admission accept **17** calls and reject **47** as
   queue-full. The rejected calls already paid the byte-copy cost. The same
   eager spread exists in parseMetadata; source confirms that path, without
   claiming a second large-copy run.
4. On the same warm facade, call validateStore with an ordinary valid store whose
   extension is `original`, immediately set the caller's extension to `changed`,
   then await. The returned extension is **changed**. The facade's pre-admission
   await means the immutable snapshot is taken after the caller's call has
   returned. Direct CoreClient.request preserves the original snapshot in the
   equivalent probe.

Exact reproduction:

```powershell
# cwd: S:/Projects/UCP/AI-Toolkit-DE
node --expose-gc 'S:/Projects/UCP/de-research/review-canonical-core-c1-r2/facade-boundary.cjs'
# review/facade-boundary.json
```

The driver's two wrappers count work/entries; they do not add a queue, mutate
operations or alter helper policy. The helper is the copied, hash-verified fresh
artifact, and the facade/client/generated contracts are extracted unchanged from
its ASAR. The original class-only 64 Ã— 1 MiB reproduction is now corrected; this
is a concrete bypass in the shipping private entrypoint, not a request for a new
renderer or generic scheduler. Although this facade file was unchanged in the
correction, its production path is within the original C1 boundary and prevents
claiming bounded preparation or preserved caller snapshots for that boundary.

**Smallest corrective direction:** route facade calls into the same synchronous
admission owner before any connection await, raw-byte expansion or snapshot work.
Keep one reservation lifecycle in CoreClient; perform the narrow byte-vector
adaptation within that reservation and capture ordinary operation data at call
submission. Caching a synchronously available client can remove the facade's
await gap, but alone does not fix the eager byte spreads. Do not add an independent
facade quota, duplicate metadata validation, weaken exotic-input rejection or
introduce a general scheduling framework. The implementation owner chooses the
small private transport API needed for admitted preparation.

Add focused actual-facade regressions for warm and pending hello: count overflow
must never iterate/copy its byte payload; invalid/cancelled/closing calls must
release exactly once; mutation after a valid call must not alter the submitted
snapshot. Retain all successful direct-client lifecycle/cancel/receipt behavior.
Rebuild matching identity resources and verify the affected actual packages after
the source correction. No DS1, UI, asset or Classic-provider edit is indicated.

## Independently closed C1-01 and supported size boundaries

**Source-confirmed:** toolkit-core owns the persisted 8,388,608-byte budget and
8,389,632-byte compact StoreResult budget. CAS preserves extensions, validates,
counts pretty UTF-8 plus newline, self-round-trips and counts the result before
entering persist (`profiles.rs:667â€“706,918â€“936`). Backup deletion and journal
creation remain inside persist afterward. Reads check actual file bytes and
result cost (`842â€“851`). Recovery checks existing canonical and every known
journal metadata file before cleanup (`1011â€“1042`), then validates restoration
schema/hash/domain and result budget before writes (`1088â€“1095`). Migration first
reads, returning an oversized-store diagnosis without reading/importing legacy.
The metadata limit is canonical Rust policy, not a second Node rule or a new
LORDJSON codec limit. Protocol1.1 exposes the limits through generated contracts.

**Observed independent direct-core and actual packaged-helper probes** in
`review/independent-size.cjs` / `.json`:

- Recreated the exact former 6 MiB+128 retained-extension seed with each host.
  Its canonical SHA-256 again equals
  `6af13bbd478560939e884622b2d23f10b150c73a71c4976bb64729c6f14177e7`.
  Both hosts refuse the omitted-extension merge with typed
  `metadata-too-large`, persisted actualBytes **12,583,316**, maximum **8,388,608**,
  and no store snapshot. Every canonical/backup inventory/hash stays exact;
  read remains ready/revision0. Neither request becomes response-too-large.
- A smaller escaped-string follow-up commits revision1, retaining all
  **6,291,584** original characters. Returned store equals subsequent direct and
  helper reads. Both independently seeded repositories produce SHA-256
  `fd1fde6a4d1fe91ac54feb09a6079d21e0accc73b642c0fe3e4b97303172b83c`
  at **6,296,340 bytes** for this review's own escaped follow-up fixture.
- Plain and escaped/Unicode proposals at **8,388,609 bytes** are refused by both
  hosts while the fresh repository remains empty. Exact **8,388,608-byte** writes
  commit, cross-read and agree with the receipt. Additional preserved-field
  growth is refused without changing the retained backup. Escapes include NUL,
  backspace, tab, newline, backslash/quote, umlaut, U+2028 and a supplementary scalar.
- Full reply envelopes using maximum request ID remain usable: both exact-write
  boundary cases are **8,388,686 bytes**. An independently seeded compact existing
  store of exactly **8,388,608 bytes** is ready through both hosts; an actual helper
  request at ID9007199254740991 returns a **8,388,708-byte** complete reply. The
  StoreResult fits its separate ceiling. Updating that compact store beyond its
  canonical pretty-write budget is refused with exact existing bytes retained.
- Copied the **exact former bad committed store**, canonical SHA-256
  `7a50e452302f047f17a9cd34beda2bd7d101fc014bf540ff63e2107496bdb9b9`,
  from the retained Review30 reproduction into owned scratch. Direct/helper
  read, CAS, recover and migration all return explicit metadata-too-large; every
  canonical and backup byte remains exact (**eight operations**).
- Seven independently constructed recovery conditions cover oversized pending
  before authority, committed after authority, unused after/before snapshots,
  restore sentinel, manifest and canonical-with-pending-journal. Both hosts refuse
  recovery before mutation and preserve full inventories, manifest/hash data and
  sentinels; subsequent reads remain recovery-required. Repeated attempts agree.
  This is synthetic legacy-journal evidence, alongside the still-passing actual
  current-writer process-exit regressions; it is not a hardware power-cut test.

The focused Rust tests additionally assert overflow never reaches a persistence
checkpoint. All **29** core tests pass independently, including process crashes,
32-revision direct/helper contention and raw-domain/recovery regressions. **C1-01
is CLOSED** for its requested truthful-commit/read/size obligation. Old oversized
metadata stays available for explicit offline maintenance; no shrink, truncation,
empty-state fallback or automatic destructive repair is introduced.

## Direct-client admission correction and its evidence limit

**Observed:** the actual archived CoreClient now passes the former class-only
64-call/1 MiB workload. One old/fresh process sample per variant, same Node,
CPU, payload and owned actual package resources, measured:

- Retained protocol1.0 client: **67,117,760** new ArrayBuffer bytes,
  **186,748,928** RSS growth, **232.35 ms** synchronous burst; pending0 before
  microtasks, then17 fulfilled/47 queue-full.
- Fresh protocol1.1 client: **17,828,877** new ArrayBuffer bytes,
  **24,338,432** RSS growth, **55.10 ms** synchronous burst;
  **17 admissions / 17,828,877 admitted bytes**, pending0 before microtasks,
  then17 fulfilled/47 queue-full. Admissions/admittedBytes/pending/pendingBytes
  are all zero after settling.

`measure-admission.cjs`, `admission-old.json` and `admission-fresh.json` retain the
exact archived source/helper identities and individual observations. These are
finite synthetic metadata/control measurements, not UI responsiveness, peak
allocation guarantees, raw-document I/O, game, renderer or app-startup evidence.
They establish the lower-level improvement, not closure of the facade bypass.

`independent-admission.cjs` / `.json` separately hold the actual helper's hello
before delivering it to the actual client, without substituting a fake backend.
Observed: a 64-call burst admits17, rejects47 invalid Map payloads as queue-full
before serialization, retains immutable waiting snapshots and releases all four
counters. Three7MiB requests reserve **22,020,639 bytes**; the next large request
is refused with **zero** large JSON.stringify copies, while a small control
request still completes. Separate invalid-wire, frame-overflow, pre-abort,
waiting-abort, request-ID exhaustion, close, EOF, handshake mismatch, timeout and
helper-exit probes release every reservation/buffer. The actual focused transport
suite also covers accepted write cancellation/EOF with real committed receipts,
queued cancellation, abort after close and unknown-outcome without replay.

The new Set/accounting and one framed snapshot are a focused transport mechanism,
not an unjustified scheduling framework. The whole-frame aggregate charge is a
reasonable conservative interpretation of the existing24MiB budget. The fix must
reach the facade entrypoint instead of adding a second mechanism there.

## Single ownership, packages and retained performance boundaries

**Source-confirmed:** toolkit-core remains the only production F1 parser,
detection and repository/journal policy. Tauri profiles.rs is a thin re-export;
its manifest links that core. Node's small facade forwards rather than validates
profiles. The correction changes size/result DTOs, protocol generation, bounded
client preparation and focused tests; raw duplicate-name/domain and PE/CLR code
retain the prior reviewed algorithms. No provider, lease, context or document
policy migrated into the host transport. Architecture23 remains appropriate.
The remaining facade preparation belongs to this C1 transport owner.

**Observed actual directory artifacts:** `inspect-artifacts.cjs` independently
opens both retained fresh Windows x64 packages, rehashes their three resources,
all21 current manifest inputs, five actual archived client/contract files, complete
app.asar and unlaunched application EXE. The helpers/notices are outside ASAR.
Both real helper hellos exactly equal their own manifests and current contract;
sourceId equals the hash of the ordered input inventory. All24 Windows registry
dependencies have notice entries; notices match the prior independently inspected
bytes. The unchanged lock graphs and previous filtered dependency audit are
inherited; this round did not rerun that unchanged graph audit.

Common hello: protocol1.1/schema1; architecture x86_64; target
x86_64-pc-windows-msvc; frame12582912/raw8388608/metadata8388608/
metadata-result8389632/queue16.

- Contract: `892d431c67ecfe6ce89e343fb6f8301db425264cea4fa976764a09a504487e1b`
- Source: `735d3e793784c5f9a6d5cddb6542e6fc43d1d61219439b9ccbfd98cfc72716ae`
- Build: `b18b66df3dc8e5ebd3ac1aa9d6848d567462f81eb59b79c2af158a0228ee4e82`
- Override helper,398848 bytes: `e2554c7762dfe0d5d464d5bf46fcd95ace1c494babb19cbfd5d6caba3ba0fbc4`
- Override manifest,8081 bytes: `bc24f147f12ec37cbf829b29684ba34a9800a9ecb6eb1f66772e3ed905508007`
- Default helper,398848 bytes: `2b791cc0e45d1d816e8298c774eab1505fcdd178080ffd1ad57d792d493e638c`
- Default manifest,8081 bytes: `3e196d36e8f94df2f8e8a06d5fe15d9174362739d62e76d014f6910521b23cad`
- Each notices file,243336 bytes: `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829`
- Both ASARs: `472194f53032e67290b1ead6fc710d4a7f8a5b7bf848c63a27a4ae458dc3d214`
- Both unlaunched app EXEs: `353e5d6c02c5fbf3336fdedcaee6dbf32e528d88d72405c1fcffa5e3c867cb04`

Directories are under
`S:/Projects/UCP/de-research/fix-canonical-core-c1-r3/artifacts/{default,override}-package`.
Independent EXE hashes may differ; reproducible executable bytes are not claimed.
Production package creation and Rust1.88/MSRV builds are inherited from correction
receipts at the matched source; this reviewer inspected and exercised their real
artifacts rather than claiming to rebuild/package them. No portable/installer or
other-target acceptance follows. A manifest is an integrity/compatibility check,
not an authenticity signature.

Renderer/workers/input/cache/deferred-analysis files and host consumers are
unchanged by C1. The retained scene/latest-only queues, batch/cache/dirty-region,
texture/geometry reuse and intentional Canvas/fire paths documented in the
performance/native-parity rationale are not displaced. No profile probe, large
hash/decode or per-frame IPC was added to those paths. The facade burst is a
concrete new control-plane boundary problem; its synthetic CPU/memory evidence
is not a UI smoothness claim. Owned before/after interactive workload acceptance
remains required when later context/document/host wiring changes those paths.

## Executed checks, inherited checks and exact replay

Observed Nodev26.7.0, rustc1.98.1 (48a229cea 2026-09-01),
cargo1.98.1 (797e8a9bc 2026-08-05), Windows x64/Ryzen5950X.
`run.cjs` logs executable/arguments/cwd/environment/timestamps/status separately.

```powershell
# cwd for every command: S:/Projects/UCP/AI-Toolkit-DE
$review = 'S:/Projects/UCP/de-research/review-canonical-core-c1-r2'
node "$review/run.cjs" core
# cargo test --offline --locked --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/toolkit-core/Cargo.toml --lib
node "$review/run.cjs" transport
# node --test --test-reporter=spec tests/game-profiles.test.js tests/core-client.test.js tests/core-helper.test.js
node "$review/run.cjs" adjacency
# node --test --test-reporter=spec tests/native-package.test.js tests/legacy-native-migration.test.js
node "$review/run.cjs" probe
# cargo build --offline --manifest-path S:/Projects/UCP/de-research/review-canonical-core-c1-r2/direct-probe/Cargo.toml
node "$review/run.cjs" generated
# node scripts/generate-core-contracts.mjs --check
node "$review/inspect-artifacts.cjs"
node "$review/independent-size.cjs"
node "$review/actual-wire-boundary.cjs"
node "$review/independent-admission.cjs"
node --expose-gc "$review/measure-admission.cjs" old
node --expose-gc "$review/measure-admission.cjs" fresh
node --expose-gc "$review/facade-boundary.cjs"
node "$review/finalize-evidence.cjs"
```

The runner sets TOOLKIT_CORE_OUTPUT to `review/fixture-output`, CARGO_TARGET_DIR
to `review/target`, and AI_TOOLKIT_PROFILE_TEST_ROOT to distinct
`review/tests-<command>` paths. fixture-output/resources contains copied,
independently verified fresh default-package core resources. Direct-probe links
the actual path dependency; it does not reimplement policy. Its initial scratch
package name required offline Cargo lock adjustment; the resulting scratch
Cargo.lock is retained and supports adding `--locked` on replay. No product lock
or dependency installation changed. Drivers use explicit Toolkit cwd, hidden
Windows execution and shell-free helper/probe children.

Observed results: **29/29 core**, **97/97 transport/profile**, **9/9 packaging/
legacy-migration adjacency**, no failure/cancellation/skip/ignore in those
selections. Core count includes the conditional no-op subprocess harness when
its action environment is absent. Core generated-output check passes; generated
bytes remain exact. Independent scripts pass the assertions described above and
also reproduce the reported facade defect. No failed review-driver attempt was
reclassified as green.

**Inherited, not rerun:** correction's29-on-Rust1.88/helper compile, both production
build/package commands, standalone strict generated TypeScript, formatting;
Review30's35 affected Classic and2 native inventory results at unchanged relevant
sources. Historical26/90 counts remain historical. No unchanged broad suite,
repeated MSRV matrix, native app launch or GUI workload treadmill was added.

Direct probe EXE SHA-256:
`39658741a40a94cf2b346789b07b5d4dcd63f9aba9d7c6daba85db5f1c22519d`.
Core test EXE SHA-256:
`d9724f46abaced6addd37fd5fbd9da72152c301ca747b111ab16cd5bb405aa02`.
`source-pins-entry.json`, `source-pins-final.json`, `artifact-pins.json` and
`review-evidence.json` retain all comparisons and exact driver/result/log hashes.

## Prior closure and next bounded handoff

Review30's original R1/R4 closure is preserved. This round's direct/core and
actual-helper regressions retain the strict64-container wrapper accounting,
raw decoded-name uniqueness, Unicode/BOM/safe-number domain, exact refusal
inventories and both rollback/restoration-source directions. R2 exotic/coercing
input and R3 declared CLR/metadata ranges remain closed; no ordinary JSON-domain
or CLR algorithm changed. The facade's delayed call snapshot is the C1 admission
boundary finding above, not a raw duplicate-collapse or exotic-input regression.

The accepted conservative suffix-junction false negative and offline abandoned-
lock maintenance remain explicit. No contention EPERM recurred; its original log
and unknown cause remain inherited, not diagnosed or remapped to busy. Partial
journals remain fail-closed for manual inspection. Process-crash/file-sync checks
do not establish hardware power-loss durability. Game-version support, full CLR
loading, live contexts/leases, authenticated host/raw-byte/document integration,
UI smoothness and the real DE editing/game workflow remain later slices.

Return this exact snapshot to the C1 owner for the single remaining facade
admission/snapshot correction, fresh resource identities and bounded independent
verification. Root can keep the proven size correction and prior F1 closures.
No optional style issue, new generic framework, unrelated Classic migration or
new feature acceptance gate is required by this review. **Current coherent C1
commit recommendation remains NO-GO solely for C1-02/P2.**

## Independently verified final 28 source/input hashes

- `crates/toolkit-core/build.rs`: `f0f94afc2f53729fe8d35cf29e4aeb1a899b963791178950d72e2a2d5c0492fe`
- `crates/toolkit-core/Cargo.lock`: `6e686665cd9ae0710253c344f230bb51301fc178ece38a338363908b0ada42ea`
- `crates/toolkit-core/Cargo.toml`: `dc68bbbf2fafe47ed3bce2490e189e2410ccce2f7e10a5cbf9725dc9f4334c49`
- `crates/toolkit-core/examples/export-contracts.rs`: `771d873081fc405e471ce90dd061ebfab71137ca7b93ba1aa42c0a80641a6b5c`
- `crates/toolkit-core/src/contracts.rs`: `e2730ffa73edba2217c3bbdc4b74977fabc63d94430678309c23aabbdc8e3296`
- `crates/toolkit-core/src/lib.rs`: `3fcd356dda6c04f1dfbf309d396205a6422003e480f62c79486a4fb3b6cfe061`
- `crates/toolkit-core/src/profiles.rs`: `cbdec53137e73ad4e1cd2186f7b7b1b1bcb199f5d93acec843f8765d1b74219c`
- `crates/toolkit-host-helper/Cargo.lock`: `c4b52d102491d5c2b058276ad18c8eda001dff250b4acca3be350643aa4e2c94`
- `crates/toolkit-host-helper/Cargo.toml`: `d0d921ff41358f21d0c032e089e42a49a16196a63c8733592351657ce64ba733`
- `crates/toolkit-host-helper/src/main.rs`: `71b46224272b233713add0630eda585a01e2d7bd2e6ebcd38c1dbbeddb442900`
- `src-tauri/Cargo.toml`: `5553d11f5bee7b838f9103dfec5ff2a1db2da4c17dd5649e35fc7d967ae19813`
- `src-tauri/Cargo.lock`: `a2c113a773b26077540f06ddd6a09de5fcd3e6a5378a44e7ccbe7fbb23c73eb2`
- `src-tauri/src/profiles.rs`: `cc0c0729d20d1c90044b400a0c64fef833f6878a8600857e6c54e5f36e5b50bb`
- `src-tauri/src/desktop/contracts.rs`: `4b60d58bd8760e00d91160c0de8300296b11098a5960d21b74e4d4f1f0250460`
- `src/node/core-build-paths.js`: `fec21e64793a36d0b706a7a058192ea97adbfca10615a0c9a2705ec82f78f707`
- `src/node/core-client.js`: `60563335b92190f8512d3af922911b67e3699ec0c3d2b962e5e6ed9c64c1335f`
- `src/node/game-profiles.js`: `12c147271666765c0631af78d8f65d19da7b16dd9cc7345a0effdfc2195218f0`
- `tests/game-profiles.test.js`: `3c2576cfb1a734e1a18b2aa813c672109b524694f1db90819b99cdd1847fa600`
- `tests/core-client.test.js`: `e945417123451d6597c77a8d102fc0770dd7c68969afa54dfe2375c48b255c8d`
- `tests/core-helper.test.js`: `d3faed0b0dca4822e17bc6855822735633511090d4a3e5df0bcc5a611a7ea718`
- `scripts/build-core.mjs`: `ca2e23b160f66afea3eedd2e298a8c8730a8f3231067c604908900151d256edc`
- `scripts/generate-core-contracts.mjs`: `4420d3bf78a83cdd55e0bcaaf49fbe9d2c843ecd24d7f9f0fdd1255d3126ddc7`
- `src/desktop/generated/core/types.ts`: `eda7427f8f26b7dda4c35a11e6714c6070fa3c42f29583af0671e773e1d59da4`
- `src/desktop/generated/core/contract.json`: `966f20fc663dfbd58e5cb15a8676d9404e73485a198c6febd8a5404663c75e5d`
- `package.json`: `403395711aee19fb2bbdc8e44ac5138aab470dce4ee4998a1cb9da86ff01cd8d`
- `src-tauri/src/lib.rs`: `ed081350c4b18552115275ad28e9983c9a719d974a7547d1b414719ee78387d5`
- `package-lock.json`: `95afb1d67a9525b78587a9a4845fbef873e75d81d012e2a9c810058251284704`
- `tests/fixtures/de-mode/foundation.json`: `464a6e35affc056eefc68c50e7e1dfbd1b7649f57d1c6d71c335e86c40cc61f1`
