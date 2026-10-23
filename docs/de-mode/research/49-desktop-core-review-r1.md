# F2W1 independent backend and native-adapter review — round 1

23 October 2026. **NO-GO for accepting this integrated additive slice at the
reviewed bytes. Four actionable findings remain below.** The shared-core/shared-
document ownership direction is sound; these are bounded preservation, resource
and authority corrections, not a request for a new architecture. Root owns
integration, correction sequencing, commits and actual desktop acceptance.

This review does not accept full DE mode, live desktop behavior, smoothness or
game compatibility. Review50 separately owns frontend/Electron lifecycle findings.
Its subsequent consumer correction54 may change consumer hashes after this
review's frozen captures; that is independent correction drift, not a reason to
rerun unchanged core probes or claim the new consumer reviewed here.

## Authority and exact scope

Read goal00, contract01, plan02 and standard05 first. Read all of handoffs44/45,
their source/artifact/recovery receipts, adopted23, Reviews05/21, relevant C1
handoff25/Review39, DS1 handoff26/Review32 and panel33/Review38/root43, plus
`docs/iso-scrub-performance.md` and `docs/native-parity.md`. The explicit resume
supersedes the historical pause. No goal state was changed and no child delegated.

Actual repository/workdir: `S:/Projects/UCP/AI-Toolkit-DE`, branch
`de/separate-game-mode`. Initial HEAD was
`a55ea99542763e9103b1db5d6b494bd6390870a6`. Root advanced docs/metadata/.gitignore
to `9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`; none of the reviewed production
bytes changed during the frozen captures. Shared checkout is not worktree
isolation. Every Toolkit shell invocation explicitly used that repository cwd.

Only this Markdown report was written inside Git. All scripts, compiled synthetic
probes, copied packaged resources, fixtures and receipts are under
`S:/Projects/UCP/de-research/review-first-desktop-core-f2w1-r1` (**review/** below).
No production/test/generated edit, restore, Cargo/app build, app/game/Steam/browser
launch, mounted OpenSHC/Ghidra call, dependency installation, commit/push,
CI/dispatch/PR/merge/release or live/original profile/settings change occurred.
Direct `rustc` compiled only two small research executables outside Git, linking
the retained final core rlib; it did not run Cargo or regenerate shared outputs.

Evidence labels: **observed** means executed/read here; **source-confirmed** means
the exact inspected source establishes the behavior; **inferred** identifies a
consequence without native-host execution; **inherited** means the pinned prior
receipt, not a fresh rerun; **unverified** remains an acceptance gate.

## Four findings and corrective owners

### F2-R1-01 / P1 — failed atomic writes delete bytes the call does not own

**Source-confirmed:** `crates/toolkit-core/src/files.rs:18–29` attempts
`create_new` and unconditionally removes `temporary` afterward, including when
creation failed. The temporary name is deterministic from PID/serial and is not
required to differ from the destination. Native Classic storage now delegates
to this same writer at `src-tauri/src/storage.rs:79`; its former cleanup already
had the collision issue. Extraction is the right owner move, but the new DE save
path inherits this preservation defect.

**Observed through the actual retained packaged helper:** after one raw Open
(registry write consumes serial0), precreate `.toolkit-<helperPID>-1.tmp` with
unrelated sentinel bytes. Save to a separate existing destination returns a
matching **failed** receipt and preserves that destination, but deletes the
unrelated sentinel. Next, make the selected destination itself the next generated
temporary, `.toolkit-<helperPID>-3.tmp`, with existing bytes. Save returns **failed**
and deletes the destination. Ordinary replacement separately succeeds with exact
BOM/CRLF/duplicate/large-number bytes. These controlled collision names are an
explicit negative witness, not a claim that ordinary Saves commonly collide.

Witness: `review/packaged-negative.cjs`, results
`review/packaged-negative-results.json`, checks `atomic-stage-collision` and
`atomic-collision-equals-destination`. The latter records the preexisting target
digest and `destinationExistsAfter:false`. This violates known-failure
preservation even though the receipt itself says failed.

**Owner: canonical files writer; native compatibility wrapper consumes the fix.**
Require a staging path distinct from the destination; acquire exclusive ownership
before cleanup; remove only a stage actually created by this call. A preexisting
collision must remain byte-identical. Cover destination-equals-generated-stage
with both existing and absent destinations: even the absent case must never let
stage cleanup act on the destination. The absent equality case was not newly
executed after root froze this review. Keep the single replacement primitive and
the prior target intact on known failures; do not restore the old move-target-away
window or add a second DE writer.

### F2-R1-02 / P2 — document registration has a lifetime cap without retirement

**Source-confirmed:** `context.rs:748–781` allocates a new document ID, persists a
`document-owners` file and inserts it on every successful raw read. The 128-entry
check counts every prior read for that owner. There is no retirement command.
`Close` at lines497–501 removes only in-memory registrations; durable owner files
remain. `save_raw` at lines795–805 deliberately accepts those files for explicit
original-session recovery, so simply deleting that recovery mechanism is unsafe.

**Observed packaged witness:** one owner opens the same invalid JSON file128
times; all128 raw reads register successfully, and read129 returns
`rejected/document-budget`. The core correctly does not parse game JSON, but the
real controller's later `createSession` rejection cannot release the candidate.
The witness ends with129 registry files: one separate owner's valid open and128
invalid candidates. Review50 independently confirmed ordinary replacement and
failed/stale/invalid Open have no release path through controller/wire/bridge.

**Owner: canonical document-registration lifecycle, with narrow host/controller
handshakes.** Preserve these distinct dispositions:

- A received invalid or stale candidate must be released without changing the
  prior adopted session.
- Successful replacement retires the previous adopted document only after the
  replacement is actually adopted and its pending/unknown writes are resolved.
- A lost raw-read reply cannot rely on a renderer knowing the lost document ID;
  the core/transport must have an owned way to clean an unadopted acquisition.
- Backend loss must retain recoverable authority for the still-adopted original
  session. Recovery must not revive every discarded candidate or choose a new
  startup default. Close must address persistent registrations as well as the map,
  while accepted writes/operation receipts still drain truthfully.

No new JSON model or generic lease framework is needed. Increasing128 postpones
the defect and does not define ownership. Correct the lifecycle at the core owner
and communicate the smallest generated command/result amendment to correction54.

### F2-R1-03 / P2 — rejected preparation still retains the full queued payload

**Source-confirmed:** `context.rs:280–310` counts serialized metadata and correctly
refuses frame/aggregate overflow, but returns `PreparedContext` containing the
original full command even when `reservation` is absent and `admission_error` is
set. Native `de_context.rs:95–101` unconditionally passes this object to
`spawn_blocking`; only later execution drops the rejected payload. The reservation
counter therefore does not bound queued payload retention at that shipping ingress.

**Observed in the actual linked final core:** hold12 prepared commands with5 MiB
path strings. Their60 MiB of path data retains **62,926,968 live allocator bytes**
against the **25,165,824-byte** preparation allowance. Eight commands are already
over budget, yet continue owning their payloads until executed; each then returns
`preparation-budget`. After those eight execute, the delta is20,981,752; after
dropping the four admitted commands it is0. `memory.log` records every value.
This is a finite allocator-retention witness using valid-size wire commands with
deliberately oversized OS path metadata, not a Tauri UI flood, RSS/peak bound,
allocation attribution for the entire app or interactive benchmark.

**Owner: core admission result and thin native scheduling.** On refusal, discard
the payload and produce the small truthful refusal before any host work queue.
Only admitted owned preparation should cross `spawn_blocking`. Retain the single
existing reservation/counting policy; do not add an independent JS/native quota.
Preserve save metadata correlation and distinguish known preacceptance failure
from unknown accepted writes. This does not reopen C1's correctly bounded and
synchronous Node CoreClient admission; it identifies the new native/core facade.

### F2-R1-04 / P2 — native queued legacy roots can redirect authenticated authority

**Source-confirmed:** `context.rs:371–375` canonicalizes a supplied root and checks
it against the authenticated profile. `desktop.rs:162–171` then queues the
original `Request` unchanged. Handler branches pass those original roots to
`library::scan` (line337), other library adapters and `OpenPath` (line401).
`library.rs:200,295,539` resolves `gameRoot` again inside the worker. Thus the
renderer-supplied alias remains a second root selector after authentication.
Electron's current lexical ingress check rejects such an alias.

**Observed source-bound witness:** the actual linked `CoreService::classic_context`
accepts an owned junction targeting synthetic Classic rootA. After that junction
is retargeted to synthetic rootB, the exact unmodified native
`storage::normalize_installation` function returnsB for the queued request's
original string, while the captured authenticated root remainsA. The extracted
function is byte-checked against production; its test error-type shim only
formats failures, and neither successful path uses it. `alias-r2.log` records
both absolute roots. The junction guard removed the owned alias.

This executed the canonical gate and actual native normalization body, **not** a
Tauri handler/app or a game-tree mutation. Wrong-root library reads/writes are the
source-confirmed downstream consequence of forwarding that field, not claimed
native observations.

**Owner: native ingress/request adaptation.** Use the captured canonical root as
the authority for every affected legacy root field after validation, or refuse
aliases that cannot safely be carried. A mutable request path must not independently
select the root later. Keep library/game algorithms and cache behavior at their
existing owners; do not add per-operation profile probes or modify hot paths.

## Boundaries that hold, and limits

**Source-confirmed:** both hosts inject actual window authority; the renderer
cannot choose host owner, bind/inherit, restore a supplied context or call store
CAS. Tauri binds before building its startup WebView; Electron loads a script-free
pending route before authenticated binding/routing. Native activation prepares,
reprobes and commits on a fresh window. Logical owner, transport epoch and window
generation are separate, and publication checks reject A→B→A reuse. Accepted
helper work drains on cancellation/EOF. No new DE JSON parser/session exists in
Rust or Node; raw Open bypasses Classic `documents.ts` decoding/normalization.

Activation updates default/selectedByEdition together via the existing strict
repository CAS and publishes the already-allocated context after commit. Startup,
inheritance and close do not change those preferences. Corrupt/future/missing/I/O
distinctions and unchanged-hash legacy migration remain explicit. Open registered
documents block same-window activation. Resource identity is honestly a provider
namespace, not a source-content stamp; `builtin-v1` is not evidence that editable
Classic config revisioning or DE assets are complete. Broader cache/config cutover
and full in-place switching remain later work.

**Fresh packaged observations:** ordinary raw no-op save/reopen preserves exact
bytes; all seven metadata identities match; another window cannot save that
document; replay of the same accepted operation returns its prior receipt; reuse
with differing metadata returns unknown without replay or byte changes;8 MiB+1
raw Open is rejected. Admission is recorded/synced before target commit, and final
receipt persistence failure preserves the truthful direct outcome or conservative
durable unknown. No target-byte inspection is treated as success evidence.

A deliberately corrupted owned operation record also showed that `reconcile`
returns a parsed Saved result without cross-checking its stored operation ID/owner
against the queried key. The actual controller and unchanged DS1 reject that
mismatch and retain unknown, so this is **not a fifth integrated acceptance
blocker**. Ledger-owner hardening should eventually reject such a record as
corrupt/unknown before publication. No destructive repair/replay is warranted.

**Inherited, not rerun:** handoff44's final38 core/profile tests and native
storage/contract/window selections; handoff45's final46 focused checks and older
103 transport/138 Classic selections; real-Rat and exact8 MiB packaged workflow;
archived-facade helper-loss recovery preserving the same DS1/history/unknown
snapshot and logical owner with changed transport. This review rehashed all19
parent source records, seven linked receipts and all45 packaged manifest inputs.
The canonical profile source still equals the Review39/C1 stage receipt. D1/DS1/
schema sources equal their accepted pins. Review32's bounded history and
single-read outcome protection remain intact; panel draft/clean-revision
acceptance is not silently broadened to controller acceptance.

Retained worker scenes/latest-only queues, batching, dirty invalidation and
deferred rendering were not edited. Explicit I/O/probe/hash work is outside draw/
typing paths. The earlier DOM comparison remains inherited task-handler evidence;
the fresh retention witness is not UI performance. Actual OS dialogs, mixed native
windows, desktop input/paint, equal-workload Classic comparison and playable game
behavior remain root-owned and unverified here.

## Artifact provenance and actual commands

Packaged witness source:
`S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/consumer/build/electron-package/win-unpacked/resources`.
The reviewer independently extracted CoreClient and both generated contract files
from actual ASAR into owned scratch and copied the external helper resource
triplet. Every extracted byte matches the captured source; all45 manifest inputs
match the frozen source. The app executable was never launched.

```text
app.asar      4f6e016d825147b4fdb0c130236798c0a42c4e38fb6497d16b631a5edb571940
helper        f524ac71745d47a3f4078eb152ad0deeabb74cfcc3b793eeb907a4c7a3fb0422
manifest      29ba3a85c0de89293051d20b9abb249c40b02799f73a3b8cf4137781fa150123
notices       6ef2302cc575d7043909fe0f5416c6d1d1e546b8ac39e40d0d5eca01f9c41df7
hello source  31ddc80a3d6a60729dbb56c72213f55143ac459818bf90db6d8d2e26a5caa685
hello build   7fefb08050ffb543ad7bcd1a4f232e552dd5492453e41d29edac99aacb83f4d9
contract      13cd869e001e380eed5734ffb8178d4f4af50b74a5b53cbb2bbeffcfe6541785
```

Direct probes link retained
`first-desktop-workflow-f2w1/target/debug/deps/libtoolkit_core-853f3043cd8330cf.rlib`,
SHA-256 `53e2fee9bef24c8475c2da1366c84004513d769b3e09ad8f22e75c603f1bedd2`.
Its hello sourceId is
`86180c3febb4030270e3a1af6b187386d1ca2c71a65a9cccacb6a00746518a2b`,
independently recomputed from the current build.rs source/input algorithm. This
linked-core identity differs intentionally from the wider packaged-helper source
inventory. The exact extracted native normalizer SHA-256 is
`044c9f4c551b45f870805871095f9217116f8f59f0b285bfe1a0ec5e36d08000`.

Actual executed probe commands, all with explicit Toolkit cwd, Nodev26.7.0 and
Rust1.98.1 on Windowsx64:

```powershell
$review = 'S:/Projects/UCP/de-research/review-first-desktop-core-f2w1-r1'
node "$review/packaged-negative.cjs"
node "$review/run-finite.cjs" compile
node "$review/run-finite.cjs" memory
node "$review/run-finite.cjs" compile-alias
node "$review/run-finite.cjs" compile-alias r2
node "$review/run-finite.cjs" alias
node "$review/run-finite.cjs" compile-alias r3
node "$review/run-finite.cjs" alias r2
node "$review/finalize.cjs"
```

`run-finite.cjs` receipts retain exact rustc/program arguments, rlib identity,
source hashes, cwd, UTC bounds, PID, exit and cleanup. Native normalizer extraction
used the unchanged `storage.rs` substring from `pub fn normalize_installation(`
to `pub fn within(`. Read-only inspection also used `git log -5`, `git status
--short`, `git diff f02d828 -- <owned paths>`, `rg` and absolute-path Get-Content.
No generated-contract build/check command was run by this reviewer.

Two research-driver mistakes are retained: first alias compilation had a Rust
declaration typo (exit1); first alias execution passed forward slashes to Windows
mklink (exit101). Corrected compile r3 and alias r2 exit0 and establish the witness.
The first finalize invocation rejected the handoff JSON's UTF-8 BOM; the research
reader was corrected and finalization passed. No product source was changed for
these driver failures, and failed runs are not described as passing evidence.

Process ownership: packaged helperPID50580 exited/reaped with no remaining CIM
process/child entries. Direct compiler wrappers tracked PIDs49892,3712,56024,47628
and their Rust compiler children; finite probes used50612,11320,47924. Each wrapper
closed with an empty post-close process/child query. Fast processes sometimes
ended before the initial CIM observation, which remains honestly empty; the spawn
handle and exit receipt identify them. The successful junction probe synchronously
waited for each owned cmd/mklink and its guard removed the alias. The helper has a
45s deadline; compiler/probe wrappers have60s deadlines and exact-owned process-tree
cleanup on timeout/signal. No timeout, persistent server or blanket process kill
occurred. Final path observation and alias-absence receipt are outside Git.

Inherited primary pins remain unchanged: reference source
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`; older Rat blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`, SHA-256
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`.
Its117 fields/missing speech and unverified playable semantics are retained.
This review used synthetic files only and did not re-decompile or re-approve
those external contracts.

## Frozen identities and next owner

`review/initial-source-pins.json` pins31 entry inputs. The timestamped supplemental
first-hash capture adds19 inspected inputs; it does not pretend those hashes were
captured at initial entry. `review/final-source-pins.json` verifies all50 at their
final frozen bytes, plus prior receipts/scripts/protected inputs, with zero source
drift. Retained `review/final-source/` copies match those hashes. Source/receipt
identities refer to this frozen review, before any correction54 consumer changes.

Root should serialize these four owner-specific corrections, preserve Review50's
independent lifecycle findings, and obtain bounded independent closure at the
corrected source/artifact hashes. Actual isolated desktop observation follows
correction/build integration. Neither the findings nor the successful synthetic
observations close the full goal. No further probe, watcher or approval round is
requested by this reviewer before returning the work to root.

The following SHA-256 values are explicitly both the initial recorded and final
frozen values for each reviewed source/input; the two timestamped manifests above
provide the separate captures and byte lengths.

| Reviewed source/input | Initial = final SHA-256 |
| --- | --- |
| `crates/toolkit-core/Cargo.toml` | `aaeefc86f5d53781da79cbdbf98d9e438968df9785e6fed6737914b45a284828` |
| `crates/toolkit-core/build.rs` | `ff94e8079a73e17781172175415fe8836ff6c76af15478851a6571b8c975528b` |
| `crates/toolkit-core/examples/export-contracts.rs` | `ff31717fa7a69adcfd7c8a33f1071eb04d6d912ddb75e1342147da1ffee4e439` |
| `crates/toolkit-core/src/lib.rs` | `e57e0cd07acc1fd02b6f0333c1321f4f523fc029c1d91551eaa6627a930e0238` |
| `crates/toolkit-core/src/contracts.rs` | `21ad6b5e841e57c1aecf82d70ba06b35f9cbb428e1a5faf5e1523f41367ef986` |
| `crates/toolkit-core/src/context.rs` | `564df00be0ad005455a4bc1444f1468dd474068934cb906638b6c454ff47b25e` |
| `crates/toolkit-core/src/context_tests.rs` | `3f0c233c5a8f45c867328ec8073c97ff1591a21eac448770a1270bb9d414104b` |
| `crates/toolkit-core/src/files.rs` | `006f293b0c69253897178c84211175176a77fa9bff4fd295742bbd36844e0f47` |
| `crates/toolkit-core/src/profiles.rs` | `cbdec53137e73ad4e1cd2186f7b7b1b1bcb199f5d93acec843f8765d1b74219c` |
| `crates/toolkit-host-helper/Cargo.toml` | `d0d921ff41358f21d0c032e089e42a49a16196a63c8733592351657ce64ba733` |
| `crates/toolkit-host-helper/Cargo.lock` | `286322ea3f1dcf9c920cdd756012264ebe59604a25fda7eee086e9cdfa101fe1` |
| `crates/toolkit-host-helper/src/main.rs` | `36003d8033c79c353187089469bc3293c40e3712fd41eeccb3ee26e5d1d34b30` |
| `src-tauri/src/de_context.rs` | `d60d0e1dabb96662c1a9d07f308b827ddb4410b93f361dc2d4deebbea060b05b` |
| `src-tauri/src/desktop.rs` | `6e47958d104c3e1ee93fa2e31e12b0e68d8085e3143f8347c360f7b66a52a793` |
| `src-tauri/src/desktop/contracts.rs` | `fb747d3801a25957c6894d7821538673ea9c08e16310d2d868e9f1fcf1d7e75a` |
| `src-tauri/src/desktop/responses.rs` | `ebea7cf969e1b1c5cf04dda91e99323ec4b1bc408dc92522cddef6a4f1527128` |
| `src-tauri/src/storage.rs` | `a16a722e97c7acc55c1b916301d0746c193c6f13a33d15d398882cd365f2712b` |
| `src-tauri/src/windows.rs` | `9ac3a35e2ab55e0feae28278205083fc879e5c8a7d29ce26332ed4ad5a9432e1` |
| `src-tauri/src/lib.rs` | `42b61d5f85336dc0c78fa267f2d7ed3d4c5f4c0d72db997815e14df7b17f30af` |
| `src-tauri/src/profiles.rs` | `cc0c0729d20d1c90044b400a0c64fef833f6878a8600857e6c54e5f36e5b50bb` |
| `src/node/core-client.js` | `e69c3d5afa37ade29743f2b0b54edd2f7eb654dd55330913da6493439260b235` |
| `src/node/desktop-context.js` | `2defd3d063e2633132ac6d1017e6aeeaadc7a91cc8ef70414a333ece5bc14720` |
| `src/node/game-profiles.js` | `d0ab094cc43c0c3842276079e6278eab32ce9307e1d047f8207574fe2b3caf55` |
| `main.js` | `e9a13891bf2356b9b80203ef9a0474b8b2170099d3f5fd87292af31bbebeb376` |
| `preload.js` | `0644fe170ec70e6cf49ec0a566854516db7fdb2b65db3941c801ec4c60419367` |
| `src/desktop/de-api.ts` | `e013156ec426fcee2e78886650bfec95c8bfc96b758272c29a0c56747a855d51` |
| `src/desktop/generated/core/types.ts` | `1b3cdd7fbd6d9f1d0f4add78f5d863b020f18c0ae4ff2ca3ce0ee81132c852a9` |
| `src/desktop/generated/core/contract.json` | `0a23a7bd3e84be70c72920cf24ed233fc4a455f8645aa0742ab8f7ad156196b9` |
| `src/shared/de-desktop-wire.js` | `e6776ff9f52f861342f94ef3ee3acb9cffc4fc559228b9b686ac353fb79027c7` |
| `src/shared/de-document-session.js` | `88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a` |
| `src/js/de-lord-controller.js` | `c5581da7ff2bc95b6b46d2610d7536a0acf6a98da0da75319fc28d557b4f9b9d` |
| `crates/toolkit-core/Cargo.lock` | `6e686665cd9ae0710253c344f230bb51301fc178ece38a338363908b0ada42ea` |
| `src-tauri/Cargo.toml` | `5553d11f5bee7b838f9103dfec5ff2a1db2da4c17dd5649e35fc7d967ae19813` |
| `src-tauri/Cargo.lock` | `c32c4705886b6bb4f7ca52c27626e62ec7399f389f4b4590577f85647557fbe5` |
| `src-tauri/src/library.rs` | `502c6e088bfc21f6278ce7d5210cf746d57595ddd9337123441ccd8d918283d3` |
| `src/desktop/api.ts` | `ede070188ae5ce8259e4f0defb0e715622ff40bc29d9c05bbc3e98c6a31cf0d1` |
| `src/desktop/runtime.ts` | `df5ad60ca72e2ac821738a5e5b432d2c95085983a0be1baad86f6771e4f56215` |
| `src/desktop/documents.ts` | `cc1d0d700dbe481280aecaef9684d36917fc51bd397d6e2cef3f649f2ef2700b` |
| `src/shared/lossless-json.js` | `9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1` |
| `src/js/de-lord-format.js` | `fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25` |
| `src/shared/generated/de-lord-pin.js` | `325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174` |
| `config/de-lord-schema.json` | `aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4` |
| `src/js/de-lord-panel.js` | `bc3b59e79e00ea5a2013ece1738438a40df25c9b4fe232c89eb7a5cd4fb26278` |
| `src/desktop/de-editor.js` | `63de59f46385f6ceddb14aeef428b7738fe5a77e0e5a3762f92ad0df286ebbf4` |
| `src/desktop/de-start.ts` | `6cc53ef8f3ecf55e2bafb26530fa35a4c197fca468f736dc730f929894078614` |
| `src/desktop/de-classic.ts` | `dee9e1f5924adfffa1dac73a8e346f2d6837db7cd423c0aae099b88c51ae8f20` |
| `src/de.html` | `1426098a386f8a87b5486b8a00e1f3e853862d27ab310cf8458299c17d2d8488` |
| `src/desktop-start.html` | `64d791f3f379faed2522b79d8da4b9eaffeb36045687a69f20806f0f47e515ea` |
| `src/desktop-pending.html` | `fda852e70d2e4fae0d5d487a04d717547f5b753b486b13373708f2165fc5f65c` |
| `src/index.html` | `ac2f95932cc6ca3514759bc08d8c4ddcb8189eea9f9b4616e5d8e26e392b28e3` |
