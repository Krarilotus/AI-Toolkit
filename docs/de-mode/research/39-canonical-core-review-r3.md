# Independent canonical core/helper review — C1 round 3

2026-10-23. **GO for the coherent additive C1 commit at the exact source hashes below. C1-02/P2 is independently CLOSED.** The actual packaged facade now enters the one synchronous CoreClient reservation before any connection await or payload adaptation. Call-time ordinary metadata and byte contents survive caller mutation. Count/byte overflow and invalid, cancelled, closing or failed connections release their reservations; accepted writes retain truthful receipts. No new actionable correctness or ownership finding remains in this bounded review. Root owns final acceptance, integration, staging and commits.

Review36's **C1-01/P1 closure** and Review30's original **F1 R1–R4 closures** remain intact. This approves an unexposed canonical profile/detection/persistence core plus its private helper/client/facade and build boundary. It does not approve full DE support, a live context, raw-document session, desktop workflow, smoothness or game behavior.

## Authority, snapshot and scope

Read the four mandatory files first: goal00, contract01, plan02 and standard05. Then read adopted architecture23; complete F1 handoff09 and Reviews11/17; all of handoff25, including the r4 append beginning at line626; independent Reviews30/36; `docs/iso-scrub-performance.md` and `docs/native-parity.md`. The explicit resume supersedes the historical pause. No goal state was changed and no child was delegated.

First shell observation was `e3d891cb815a9758542b897065141e71da4a7ca2`. The coordinator advanced the shared checkout to **`d2b2c2a22c6153afa52d08735158293b38919a8f`** (`Record active goal and verified game-test preparation [skip ci]`) before the entry receipt; this is also the final observed HEAD. Branch: `de/separate-game-mode`. These commits are context; the still-uncommitted C1 files are identified by their bytes. Concurrent coordinator/panel/asset work was left untouched. No worktree isolation is claimed.

The supplied r4 receipt was independently hashed:

`S:/Projects/UCP/de-research/fix-canonical-core-c1-r4/final-verification.json`

SHA-256 **`5cedd3ebb1ef25b036c47bde0d0c211c7482b8051a137c423cbe2c1f1f361d62`**.

All **28 source/input hashes** match it and its retained `final-source` copies at entry and final verification. Only four code/test inputs changed relative to Review36: client, facade and their two test files. The other24 inputs, including canonical Rust, helper, generated DTOs/contracts, build/package wiring and protected fixtures, remain exact. Their prior closures are not reopened or relabeled fresh.

Evidence labels: **observed** = independently executed here; **source-confirmed** = inspected at the pinned bytes; **inherited** = prior evidence at verified matching source/artifact identities, without claiming a rerun; **unverified** = no acceptance established here. No remote permalink is invented for uncommitted sources.

The only checkout file written by this review is this report. Scratch sources, extracted actual packaged client files, copied verified helpers, synthetic metadata, logs, measurements and receipts are outside Git under:

`S:/Projects/UCP/de-research/review-canonical-core-c1-r3` (**review/** below).

Every Toolkit `exec_command` explicitly used cwd `S:/Projects/UCP/AI-Toolkit-DE`. No implementation/test/generated/root-document edit, restore, dependency installation, commit/push, CI/dispatch/PR/merge/release, app/game/Steam launch, live/original profile/settings or Classic-checkout change occurred. Only finite helper/test/probe execution used owned synthetic paths. Prior evidence and retained artifacts were read or copied, never overwritten.

## C1-02 closure through the actual facade

**Source-confirmed:** `src/node/game-profiles.js:8–19,27–36` caches a synchronously available client and invokes its request immediately. `invoke` awaits an already-admitted promise. Neither byte method spreads the payload. `src/node/core-client.js:211–246` routes both `request` and `requestBytes` through the same private owner: the existing admissions Set,17-slot limit,24MiB encoded-frame allowance, IDs, charge/release and submission lifecycle. There is no second facade quota, queue, metadata validator or scheduler.

The narrow byte branch (`core-client.js:43–62,88–106`) uses intrinsic Uint8Array length/backing-buffer access and indexed u8 reads. It charges minimum vector cost before scanning and the exact remaining decimal cost before allocating the final frame. It neither expands a number array nor runs iterator/toJSON/getters. The caller view is only referenced within synchronous preparation; waiting/submitted requests hold the completed immutable frame. Ordinary metadata and dense arrays retain the existing generic serializer and its rejection rules. Typed-array support is specific to the explicit byte entrypoint; direct generic requests still reject typed arrays.

**Observed:** `independent-facade.cjs` loads the five source files extracted unchanged from the actual default ASAR and uses its hash-verified real helper copied to owned scratch. Its observer only gates hello delivery/counts entries; it does not replace serialization, admission, pipes or Rust policy. Twelve recorded probe groups establish:

- Warm and pending-hello calls snapshot nested ordinary `validateStore` metadata, raw `parseMetadata` bytes, synthetic managed-PE bytes and CAS proposals before the facade call returns. Immediate object mutation/buffer zeroing changes neither the already-framed payload nor the returned result. Real CAS returns committed; receipt, disk and subsequent read all equal the call-time proposal.
- Warm and held-hello64-call bursts make64 synchronous core entries, reserve17 requests and reject47 as queue-full. Overflow payloads include ordinary proxies and revoked proxies; no get/ownKeys/prototype/iterator hook runs and no additional byte charge appears. Accepted Buffers with throwing iterator/toJSON/length/buffer decorators use intrinsic contents without executing those decorators. All four counters become zero after settling.
- Three2MiB-minus256-byte vectors filled with255 reserve **25,162,962 encoded bytes**, below the **25,165,824-byte** aggregate limit. A fourth fails queue-full before final-buffer allocation; existing reservations remain exact. A small control request still succeeds. This is the same core allowance, including frame envelopes/prefixes.
- Invalid byte proxies, revoked proxies, accessor/sparse/extended arrays, unsupported containers, Uint16Array, custom Uint8Array subclasses and shared backing buffers reject without hooks. Invalid ordinary metadata and a frame overflow release partial charges. Pre-abort avoids payload inspection; waiting-abort clears the prepared frame. Close, failed hello equality, EOF, timeout and deliberate synthetic process exit clear every reservation. Late settlement does not double-release. No waiting write is reported unknown-outcome when it was never submitted.
- All256 u8 values, Buffer/Uint8Array views, an offset subview, empty vectors and a dense array match an independent JSON vector oracle exactly, including charged frame length. Direct ordinary metadata still snapshots at call time; direct generic typed/exotic inputs remain rejected without getters.
- Through the **packaged facade**, aborting an accepted4MiB metadata CAS or closing its pipe returns **committed** with a receipt equal to durable state. The queued second write returns **cancelled**. The full focused selection additionally retains deliberate accepted-helper-death unknown-outcome/no-replay, direct-client cancellation/EOF and closing-drain coverage.

The ordinary object/byte capture and resource lifecycle now reach the shipping entrypoint that Review36 found missing. **C1-02 is closed**, with no further implementation fix requested.

## Fresh baseline reproduction and transport preparation sample

The original independent Review36 `facade-boundary.cjs` was copied with **only its base path changed** into fresh scratch. Its original SHA-256 is `499939f21bd04fe472f2b575beffd94d0345f8f9657b89844115831ac47e4fac`; the adapted driver is `6744a6d58f21cd02f26f099c72625e01ba3d2f3d853844e6faa3a41574e965a8`. `baseline-pins.json` verifies its five archived inputs and matching prior helper against the original r3 receipt (SHA-256 `02da91a2030556ce9900e423ccfb7c590918810446dea91450368ea01fdb9ad0`). The baseline is deliberately old failed behavior, not current evidence relabeled.

Observed separate processes ran sequentially, Nodev26.7.0, same64×262,144-byte zero-filled Buffer workload. UTC process bounds are retained in the three command receipts: baseline16:29:19.388–16:29:22.588; corrected-warm16:29:22.649–16:29:23.304; corrected-pending16:29:23.360–16:29:23.934. No exclusive-host or causal disk-contention claim is made.

| Fresh sample | Raw array copies / elements | Synchronous core entries | Sync ms | Heap delta bytes | ArrayBuffer delta bytes | RSS delta bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Prior packaged facade |64 /16777216|0|622.21|161773384|0|262483968|
| Corrected packaged facade, warm |0 /0|64|40.84|456560|8914095|13676544|
| Corrected packaged facade, pending hello |0 /0|64|56.34|736440|9312942|14565376|

All three fulfill17/reject47. Before the first await, corrected warm reserves17 frames/**8,914,095 bytes** and pending reserves17/**8,914,094 bytes**, with pending-map size0. Corrected counters all drain to0. The old warm ordinary mutation returns `changed`; both corrected object/raw-byte samples preserve the original. The pending measurement includes cold hash/spawn preparation and is not a warm latency comparison.

These are finite transport-preparation observations and process-memory deltas, **not peak-allocation guarantees, UI/FPS, native-window, raw-document I/O, application-startup or game evidence**. The r4 implementer's post-copy396.75ms/22.14ms observations remain inherited, with their own timestamps; this independent sample is reported separately, without averaging or choosing the fastest result.

## Canonical ownership, actual packages and preserved gates

**Source-confirmed:** toolkit-core remains the one production detection, metadata-domain, migration, CAS and journal implementation. Tauri links it by path and its profiles module is a re-export. Electron forwards through the private helper; neither facade nor byte adapter duplicates profile policy. Rust owns operation/result DTOs and generated contracts. The r4 delta is a narrow correction at the existing transport boundary, consistent with architecture23 and the user's DRY/ownership intent.

**Observed actual artifacts:** both retained r4 Windows x64 directory packages were opened independently, not accepted from handoff text. `artifact-pins.json` records all resource hashes, every21 current manifest input, the five actual archived source files, ASAR/app EXE hashes and real helper hellos. The external resource triplets match their pins; helper/notices are outside ASAR. Every one of24 resolved registry dependencies has a notice entry. SourceId equals the hash of the ordered input inventory; contractHash equals the normalized generated bytes. Both real helpers at EOF return exactly their own manifest hello.

Retained source directories:

- `S:/Projects/UCP/de-research/fix-canonical-core-c1-r4/artifacts/default-package`
- `S:/Projects/UCP/de-research/fix-canonical-core-c1-r4/artifacts/override-package`

| Actual artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Default helper |398848|`d16c17fc2a8a289f089ef5c8b7a2bdb7eb183aff1ed9d643ace9c1c0afd5903e`|
| Default manifest |8081|`39bd1199dcb46e78e69fcfbacfd871314ee2d7d3943658e04453921754c0dbd1`|
| Override helper |398848|`d8543259311a26424ecd5ce1655c7c47ba974d4c2faa1ecdf638aed3f2e9f597`|
| Override manifest |8081|`b285dafbf348954687fc72325fdf5dad153d4194852d4def3b740b53f240142a`|
| Notices in each |243336|`974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829`|
| ASAR in each |—|`1d4f6a1fa23e5fcdb3cd97cc82d86e47691d39e0db9369189e96e02cbca8c2b7`|
| Unlaunched app EXE in each |—|`207b3f4ad9ae05cd21079d86d5006a5351c94760b8f50091036503410a21a4f0`|

Common hello: protocol1.1/schema1, x86_64/x86_64-pc-windows-msvc, frame12582912/raw8388608/metadata8388608/metadata-result8389632/queue16. Contract `892d431c67ecfe6ce89e343fb6f8301db425264cea4fa976764a09a504487e1b`; source `f17e05dd5ec16e4f6338d3b601de14327a79311ca8bdad07fd7d4b7a281d4ce7`; build `ace1b3c0693f53e4ad30f9d41e0cf943cbaa6586dbddae0b31fcb34a92e18cea`.

Production builds/packages and default-C:/override-S:103-test runs are **inherited** from matched r4 receipts. This reviewer independently rechecked their actual retained artifact identities and exercised the packaged path; it did not rebuild/package or claim deterministic executable bytes. The manifest checks integrity/compatibility, not authenticity. Installer/portable/other-target support remains unverified here.

C1-01 remains closed at exact canonical/generated hashes: the pre-persistence persisted/result budgets, post-preservation refusal, unchanged artifact inventories and usable committed/read snapshots are Review36's independent evidence. The29-test Rust1.98 selection and Rust1.88/MSRV evidence are inherited at those unchanged bytes. No gratuitous full Rust/core/MSRV rerun was performed. Original F1 strict raw duplicate/Unicode/depth, exotic metadata, CLR recognition and recovery-authority closures likewise retain their exact reviewed owner and evidence.

No host main/preload/renderer consumer was added. Retained worker scenes/latest-only queues, batching, caches/dirty invalidation, texture/geometry reuse and deferred analysis/fire work remain outside this delta. No probe/large hash/decode/per-frame IPC entered draw/input paths. The facade is still unexposed; these control-plane samples do not satisfy the later owned before/after interactive workload requirement.

Offline abandoned-lock maintenance, partial-journal manual inspection, conservative suffix-junction recognition and the original isolated EPERM's unknown cause remain explicit. Hardware power-loss durability and game versions remain unverified. Authenticated Windows contexts/leases, opaque raw-byte document I/O and sessions, actual desktop Classic/DE behavior, interactive performance and isolated game acceptance are future gates; they are not new blockers for this additive commit. No new framework/API or repeated broad design approval is requested.

## Executed checks and reproducibility

Observed **103/103 transport/profile tests**, **9/9 packaging/migration adjacency**, zero failure/cancellation/skip in those selections. Tests use current source and owned copies of the verified default packaged helper. The separate independent boundary driver uses the actual extracted packaged client/facade/contracts. All fresh drivers and artifact/measurement assertions pass. Syntax checks of client/facade pass. No failed attempt was relabeled green.

Exact replay (every process uses cwd `S:/Projects/UCP/AI-Toolkit-DE`):

```powershell
$review = 'S:/Projects/UCP/de-research/review-canonical-core-c1-r3'
node "$review/init.cjs"
node "$review/run.cjs" artifacts
node "$review/run.cjs" transport
# node --test --test-reporter=spec tests/game-profiles.test.js tests/core-client.test.js tests/core-helper.test.js
node "$review/run.cjs" adjacency
# node --test --test-reporter=spec tests/native-package.test.js tests/legacy-native-migration.test.js
node "$review/run.cjs" boundary
# node "$review/independent-facade.cjs"
node "$review/prepare-samples.cjs"
node "$review/run.cjs" baseline
# node --expose-gc "$review/facade-boundary-before.cjs"
node "$review/run.cjs" measure-warm
# node --expose-gc "$review/facade-boundary.cjs" warm
node "$review/run.cjs" measure-pending
# node --expose-gc "$review/facade-boundary.cjs" pending
node --check 'S:/Projects/UCP/AI-Toolkit-DE/src/node/core-client.js'
node --check 'S:/Projects/UCP/AI-Toolkit-DE/src/node/game-profiles.js'
node "$review/finalize-evidence.cjs"
```

`run.cjs` records exact executable/args/cwd/selected external environment/start/end/exit in separate receipts and UTF-8 logs. It sets TOOLKIT_CORE_OUTPUT to `review/fixture-default` and AI_TOOLKIT_PROFILE_TEST_ROOT to distinct `review/tests-<check>` paths. Artifact inspection first copies the verified triplets and extracts the unchanged archived sources. The independent probe sets process.resourcesPath to that owned copy, exactly exercising the packaged resolution branch. No Cargo build is required by this round.

Evidence creation refuses overwriting existing outputs. A replay needs a fresh scratch destination plus adapted base constants, preserving prior receipts. `source-pins-entry.json`, `source-pins-final.json`, `artifact-pins.json`, `baseline-pins.json`, `independent-facade.json`, command receipts and `review-evidence.json` pin exact inputs, drivers, logs and results. Inherited35 Classic/2 native inventory checks and lock-graph audit are not reported as freshly rerun.

Root may accept/stage the coherent additive C1 files after comparing these exact hashes with its staged bytes. **No remaining C1 corrective action is requested.** Full DE acceptance remains open.

## Exact independently verified28 source/input hashes

| Toolkit-relative source/input | SHA-256 |
| --- | --- |
| `crates/toolkit-core/build.rs` | `f0f94afc2f53729fe8d35cf29e4aeb1a899b963791178950d72e2a2d5c0492fe` |
| `crates/toolkit-core/Cargo.lock` | `6e686665cd9ae0710253c344f230bb51301fc178ece38a338363908b0ada42ea` |
| `crates/toolkit-core/Cargo.toml` | `dc68bbbf2fafe47ed3bce2490e189e2410ccce2f7e10a5cbf9725dc9f4334c49` |
| `crates/toolkit-core/examples/export-contracts.rs` | `771d873081fc405e471ce90dd061ebfab71137ca7b93ba1aa42c0a80641a6b5c` |
| `crates/toolkit-core/src/contracts.rs` | `e2730ffa73edba2217c3bbdc4b74977fabc63d94430678309c23aabbdc8e3296` |
| `crates/toolkit-core/src/lib.rs` | `3fcd356dda6c04f1dfbf309d396205a6422003e480f62c79486a4fb3b6cfe061` |
| `crates/toolkit-core/src/profiles.rs` | `cbdec53137e73ad4e1cd2186f7b7b1b1bcb199f5d93acec843f8765d1b74219c` |
| `crates/toolkit-host-helper/Cargo.lock` | `c4b52d102491d5c2b058276ad18c8eda001dff250b4acca3be350643aa4e2c94` |
| `crates/toolkit-host-helper/Cargo.toml` | `d0d921ff41358f21d0c032e089e42a49a16196a63c8733592351657ce64ba733` |
| `crates/toolkit-host-helper/src/main.rs` | `71b46224272b233713add0630eda585a01e2d7bd2e6ebcd38c1dbbeddb442900` |
| `src-tauri/Cargo.toml` | `5553d11f5bee7b838f9103dfec5ff2a1db2da4c17dd5649e35fc7d967ae19813` |
| `src-tauri/Cargo.lock` | `a2c113a773b26077540f06ddd6a09de5fcd3e6a5378a44e7ccbe7fbb23c73eb2` |
| `src-tauri/src/profiles.rs` | `cc0c0729d20d1c90044b400a0c64fef833f6878a8600857e6c54e5f36e5b50bb` |
| `src-tauri/src/desktop/contracts.rs` | `4b60d58bd8760e00d91160c0de8300296b11098a5960d21b74e4d4f1f0250460` |
| `src/node/core-build-paths.js` | `fec21e64793a36d0b706a7a058192ea97adbfca10615a0c9a2705ec82f78f707` |
| `src/node/core-client.js` | `2079c05768efc74ea5230cec2d1819b6cb0734f6e5d808fe9d99bc8f29ec163d` |
| `src/node/game-profiles.js` | `ad185439fc9d88c248245e3a4f3549ada3a78e54e5a31c83ef93ed6e127ee7be` |
| `tests/game-profiles.test.js` | `9ba210f12d16ab22cd97f98f779eb36e1058d203262c455a23091306665ec795` |
| `tests/core-client.test.js` | `3b303c9ecf02b651578febf93e3c7e7f22651787450f255d7ce3a499a3ad07f2` |
| `tests/core-helper.test.js` | `d3faed0b0dca4822e17bc6855822735633511090d4a3e5df0bcc5a611a7ea718` |
| `scripts/build-core.mjs` | `ca2e23b160f66afea3eedd2e298a8c8730a8f3231067c604908900151d256edc` |
| `scripts/generate-core-contracts.mjs` | `4420d3bf78a83cdd55e0bcaaf49fbe9d2c843ecd24d7f9f0fdd1255d3126ddc7` |
| `src/desktop/generated/core/types.ts` | `eda7427f8f26b7dda4c35a11e6714c6070fa3c42f29583af0671e773e1d59da4` |
| `src/desktop/generated/core/contract.json` | `966f20fc663dfbd58e5cb15a8676d9404e73485a198c6febd8a5404663c75e5d` |
| `package.json` | `403395711aee19fb2bbdc8e44ac5138aab470dce4ee4998a1cb9da86ff01cd8d` |
| `src-tauri/src/lib.rs` | `ed081350c4b18552115275ad28e9983c9a719d974a7547d1b414719ee78387d5` |
| `package-lock.json` | `95afb1d67a9525b78587a9a4845fbef873e75d81d012e2a9c810058251284704` |
| `tests/fixtures/de-mode/foundation.json` | `464a6e35affc056eefc68c50e7e1dfbd1b7649f57d1c6d71c335e86c40cc61f1` |
