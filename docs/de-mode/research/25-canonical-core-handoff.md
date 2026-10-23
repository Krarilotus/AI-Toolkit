# C1 resume checkpoint ? paused at user request

2026-10-23. Implementation is uncommitted on `de/separate-game-mode`. Root owns
resume, independent review, acceptance and commits. No further build/test/package
was started after the pause instruction; the already-running tool finished safely.
No children, commits/push, CI, app/game/Steam launch or installed-data writes.
DS1/A1 and other teammate edits are preserved.

## Current files and boundary

- `crates/toolkit-core/{Cargo.toml,Cargo.lock,build.rs,src/lib.rs,src/profiles.rs,src/contracts.rs,examples/export-contracts.rs}`:
  canonical corrected F1 plus its 26 moved tests; host-independent API and Rust DTOs.
- `crates/toolkit-host-helper/{Cargo.toml,Cargo.lock,src/main.rs}`: thin private stdio executable.
- `src-tauri/Cargo.toml`, `Cargo.lock`: local core dependency; no new registry package in
  the Tauri lock. `src-tauri/src/profiles.rs` is only a re-export. Existing `lib.rs`
  F1 declaration is unchanged by C1.
- `src/node/{core-client.js,game-profiles.js,core-build-paths.js}`: async private
  transport/facade and the newly authorized portable per-checkout path resolver.
- `scripts/{build-core.mjs,generate-core-contracts.mjs}`; generated
  `src/desktop/generated/core/{types.ts,contract.json}`; `package.json` hooks/resources.
- `tests/{game-profiles.test.js,core-client.test.js,core-helper.test.js}`:
  real-helper boundaries, preservation and failure tests. Foundation fixture and
  package-lock bytes are unchanged. No DS1 package hooks were added.
- Authorized cross-owner exception: only the generated inventory in
  `src-tauri/src/desktop/contracts.rs`. It excludes exactly the first-level **directory**
  `core`; every other unknown file/subtree still participates in obsolete-output
  detection. Core generation has its own stale/obsolete-output check.

Core `execute(Operation)` accepts only probe, repository read/recover/CAS/migration,
PE inspection and metadata parse/validation. F1's direct Rust API remains available.
Node facade methods now return promises (generated empty-store data stays sync).
CAS stays private to backend code; no preload/renderer/window/context consumer exists.
No document session, raw document I/O, A1 payload, activation or Classic-provider migration.

Wire: little-endian u32 length + UTF-8 JSON; 12 MiB frames, reserved 8 MiB raw limit,
monotonic safe-integer IDs; 16 queued + one running request. A separate reader
handles cancellation; a bounded writer queue keeps stdout backpressure out of that
reader. Queued cancellation/EOF cancels; accepted operations finish. Lost writes
report `unknown-outcome`; there is no replay, fallback policy, kill-on-cancel or
online stale-lock stealing. Core busy/corrupt/future/IO results remain distinct.
Generic JS serialization rejects exotic/proxy/accessor/sparse/cyclic/non-JSON values
without invoking getters/toJSON. Wire wrappers do not reduce F1's 64-container budget.

Helper hello requires exact packaged protocol/schema/contract/source/build/target/
architecture/limits equality plus executable hash. Dirty source/config/build inputs
are stamped; the native in-process build also receives a dirty-core identity.
`export-types` is a real optional ts-rs feature. Build emits helper, manifest and
actual dependency license/notice texts outside ASAR. No project license was invented.

## Completed evidence versus pending checks

All evidence below is under `S:\Projects\UCP\de-research\canonical-core-c1`.

- Corrected F1 pre-move bytes matched round3's manifest. Exact original Rust/Node/
  tests/fixture copies and before hashes are retained in `before/`,
  `before-hashes.json`, `extraction-receipt.json`; `extraction-move.diff` records the
  current adaptation. There is no second production parser/journal. Old comparisons
  now compare in-process core with the real helper. Fault injection remains Rust-only.
- Core: **26 passed** (`core-tests.log`), including malformed before/after rollback
  refusal, exact journal/legacy retention, real crash checkpoints and 32-revision
  mixed in-process/helper contention. This precedes the last portability/lint edits.
- Transport/profile Node: **89 passed** (`transport-tests.log`), including malformed
  frames, all handshake identities, bounded queues/backpressure, accepted/queued
  cancellation/EOF, actual helper termination, independent helper writers and raw
  duplicate/Unicode/depth cases. The new resolver test was added afterward: final
  portability state / expected 90-test selection has **not** been run.
- Rust 1.88: **26 core tests passed**, helper compiled (zero Rust helper unit tests),
  in `msrv-core.log`/`msrv-helper.log`. These predate the new core build stamp and
  portability edits; final-state MSRV rerun is pending. Rust 1.98 was the ordinary toolchain.
- Affected Classic JS: **63 passed**, `classic-regression.log` (desktop bridge,
  native packaging/migration/install, security, save/AIV, library/graphics/startup).
  No broad combined JS suite ran against moving DS1 files; root runs it once settled.
- Full Tauri regression initially **76 passed, 1 failed, 1 existing ignore**:
  `tauri-regression.log`. Sole failure was the new core directory in the legacy
  DTO inventory. After root's explicit ownership expansion, the exact failed check
  **passed 1/1** (`tauri-inventory-recheck.log`). Full suite was not redundantly rerun.
- Generated check and standalone strict TS check passed. Latest build reran the
  canonical generation check. Final clippy checks of both crates passed with `-D warnings`
  (`core-clippy.log`, `helper-clippy.log`); ts-rs still prints its informational
  inability to represent `deny_unknown_fields`, which Rust enforces. Initial lint
  findings and small, behavior-neutral fixes are visible in the source/diff.
- Current tool completed the post-portability helper rebuild: **390,656 bytes**,
  `build.log`, `resources/core/`. No benchmarks were completed.
- A Windows x64 Electron **directory package** was built without launching it.
  Real resources outside ASAR were verified byte-for-byte. An initial Windows env
  macro path-prefix defect was corrected by supplying the builder a checkout-relative
  resource path; build-tool package verification now fails if resources are absent.
  **That package predates current identity/portability edits and is stale.** Rebuild/
  repackage/verify before using it as current evidence. No portable artifact,
  publication or packaged-app acceptance. README promises Windows x64; native CI
  also lists Linux/macOS compilation. No target-support claim was removed; non-Windows
  and other architectures remain unverified, with Windows x64 the first artifact gate.

## Resume actions and fingerprints

The single `coreBuildPaths()` resolver now uses platform temp storage keyed by canonical
checkout identity; aliases share it and separate checkouts do not collide. It rejects
output inside the checkout, including aliases. `TOOLKIT_CORE_OUTPUT` remains an
absolute external override. Scripts, all three Node test files and the eventual dev
facade use it. Rust tests default to portable temp storage and retain
`AI_TOOLKIT_PROFILE_TEST_ROOT`. These last changes await their focused verification.

For this session, explicitly set `TOOLKIT_CORE_OUTPUT` to the C1 evidence directory
and `AI_TOOLKIT_PROFILE_TEST_ROOT` to its selected test subdirectory. Cargo targets
remain outside Git. Start with resolver/transport and core/MSRV verification, check
both generators' stale/obsolete boundaries, then rebuild/package fresh resources.
Measure packaged helper hello/probe/repository latency and size. Context/raw-8-MiB
benchmarks await the next API; do not invent them. Do not rerun broad tests without
coordinating with settled DS1 sources.

`resume-fingerprints.json` contains exact current source and helper/manifest/notice
fingerprints plus current HEAD; hashes/config contents are not printed in tool output.
`resume-git-status.txt` records the shared dirty tree. Report25 is intentionally outside
its own fingerprint set. Prior C2 EPERM evidence remains at the original review path;
no recurrence was seen in completed contention runs and arbitrary IO is never busy.
R1/R4 independent closure, conservative suffix-junction gap, offline abandoned-lock
maintenance and power-loss limitations remain explicit; C1 grants no self-approval.

No running executable under the C1 scratch/output directory was present at checkpoint.
No C1 build/test/package command remains active; the last tool session (35630)
completed with exit 0. Other returned execution handles were finite completed jobs,
not launched background services. `resume-processes.json` records the checkpoint
inventory. Root pauses the persistent goal; this implementer changes no goal state.

Next consumer is host-authenticated context capture/leases and opaque raw-byte I/O
feeding DS1/D1's shared document owner, followed by narrow DE LORDJSON open/edit/
Save As beside Classic. Main/preload/desktop consumers and frontend build hooks are
still unmodified and require their owning integration slice. DS1's schema/session
hooks remain for its owner/root; no unfinished hooks were added to package.json.

## Resumed final-source verification — 2026-10-23

The explicit resume instruction supersedes the historical pause above. This
bounded C1 implementation is ready for independent review, **not self-approved**.
HEAD remains `773f80b8a31d9337cd83342957bd8b76d969515c`. Before editing, all
25 source hashes plus the three unchanged inputs matched `resume-fingerprints.json`.
The new receipt, exact pre-change source copies and this historical report are in
`S:\Projects\UCP\de-research\canonical-core-c1\resume-validation-20261023\before`;
`pre-change-verification.json` records all 28 comparisons. Original evidence logs
and pause receipts were not overwritten. Build caches/resources and the old
scratch directory package were refreshed; their historical hashes remain in the
pause receipt. Final directory artifacts are separately retained below.

### Final changes, ownership and API/build contract

Only four implementation/test files changed since the pause:

- `scripts/build-core.mjs`: owns the Electron resource configuration and passes
  the resolver's absolute directory directly to electron-builder's programmatic
  API, before any path resolution. No environment macro or cross-drive
  `path.relative()` workaround remains. `packageElectron('dir'|'portable')`
  explicitly uses `publish: 'never'`; normal npm packaging still performs its
  existing `check` gate before calling it. Verification compares all three
  external resources, every manifest input hash, and the five actual archived
  client/contract files against current bytes. The manifest retains a hash of
  build environment settings instead of copying their contents into the artifact.
- `package.json`: removes the obsolete env-macro `extraResources` entry. The
  build owner supplies this dynamic configuration once. Existing dev/build/
  package hooks, Tauri support and target declarations remain.
- `tests/core-client.test.js`: makes standalone resolver-test scratch creation
  independent of a preceding build, and extends the existing one test to cover
  canonical external-output aliases, nonexistent descendants, actual platform
  temp output and checkout aliases. The existing resolver itself needed no fix.
- `src-tauri/src/desktop/contracts.rs`, **inventory/test scope only**: extracts
  the existing inventory walk so a synthetic test proves that only a top-level
  directory named `core` is excluded. A file named `core`, an unknown top-level
  file and an unknown nested `other/core` file remain in obsolete-output detection.

`coreBuildPaths()` remains the sole build/dev/test resolver: real checkout identity
keys the default `os.tmpdir()/toolkit-core-builds/<key>` output; aliases converge,
separate checkouts differ, and inside-checkout output through an alias is refused.
`TOOLKIT_CORE_OUTPUT` is an optional absolute external override. Rust tests use
portable platform temp storage unless `AI_TOOLKIT_PROFILE_TEST_ROOT` is supplied.
There is no S: requirement in production or test defaults. Actual default output
was on **C:** while this checkout is on **S:**; both builds and packages succeeded.

The canonical Rust source, direct in-process F1 API, private framed-helper API,
async Node facade and generated DTO bytes are unchanged by this resume. Tauri
links the same core through its path dependency and profiles re-export. No second
Node profile policy, fallback, automatic replay, kill-on-cancel or lock takeover
was introduced. Raw decoded-name uniqueness, Unicode/64-depth/safe-integer domain,
unknown extensions, before/after recovery refusal, exact journal/legacy retention,
revision CAS and actual crash tests remain in the current 26-test core selection.
No context, document raw-byte API, UI or A1 dependency was added.

The production manifest contains **21 input fingerprints**, including both crate
source/build/lock sets, both core scripts, all three Node modules, both generated
core files, package/lock and Tauri manifest/lock. Existing Cargo configuration is
hashed when present; contents are not printed. The build checks the helper's
locked registry graph against Tauri's graph and ships notices for its 24 resolved
registry packages. The two fresh builds report identical protocol/schema/contract/
source/build/target identities. Their executable hashes differ; byte-reproducible
independent builds are not claimed. Each artifact is pinned to its own hash.

### Executed final-boundary checks

Evidence is under `resume-validation-20261023` within the C1 research directory.
`run-check.cjs` uses an explicit Toolkit cwd, hidden shell-free processes, UTF-8
logs and per-command `*.receipt.json` arguments/timestamps/exit codes.

| Check | Observed result / retained log |
| --- | --- |
| Core, Rust 1.98.1, default Windows temp test directories | **26 passed**, zero failed/ignored; `core-current-default-temp.log` |
| Same current core, Rust 1.88.0 | **26 passed**, zero failed/ignored; `core-msrv.log`; helper compiles in `helper-msrv.log` |
| Current transport/profile selection, S: override | **90 passed**, zero failed/cancelled/skipped; `transport-current.log` |
| Final freshly rebuilt helper, default C: output | **90 passed**, zero failed/cancelled/skipped; `transport-final-default.log` |
| Core generator `--check` and adversarial output boundary | Current output passes; stale content, obsolete file and obsolete subtree each refused, exact generated bytes restored; `generator-boundaries.log` |
| Tauri generated inventory / existing failed boundary | **2 passed**, 77 unrelated filtered; includes actual generated DTO comparison and new narrow inventory test; `tauri-inventory-current.log` |
| Strict standalone generated TypeScript | Pass; `core-types-strict.log` |
| Affected Classic packaging/migration, desktop transport, security, Save/AIV | **35 passed**, zero failed/skipped; `classic-affected.log` |
| Rust formatting, owned build/path JS syntax | Pass; no broad formatter or unrelated source changes |
| Production package verifier negative probes | Altered external notices and a same-length corrupted archived client are refused; `package-negative-boundaries.log`; real artifact bytes untouched |

The 35 Classic checks are the six exact files in the command below: they cover
the changed packaging/contract adjacency and preservation of current save/native
AIV transport. Classic game/provider implementation was not changed. The prior
76-pass/one-inventory-failure/one-existing-ignore full Tauri run remains historical;
only its affected inventory boundary was rerun, with the added negative-scope test.
No broad JS/native suite or full npm `check` was gratuitously rerun while other
owners had active sources. Current core source hashes below match the just-tested
Rust/MSRV source; later final edits affect only build/package verification.

Representative exact commands (all use cwd `S:\Projects\UCP\AI-Toolkit-DE`):

```powershell
$run = 'S:\Projects\UCP\de-research\canonical-core-c1\resume-validation-20261023'
$env:TOOLKIT_CORE_OUTPUT = 'S:\Projects\UCP\de-research\canonical-core-c1'
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\canonical-core-c1\target'
Remove-Item Env:AI_TOOLKIT_PROFILE_TEST_ROOT -ErrorAction SilentlyContinue
cargo test --offline --locked --manifest-path 'S:\Projects\UCP\AI-Toolkit-DE\crates\toolkit-core\Cargo.toml' --lib
$env:RUSTC = 'S:\Projects\UCP\de-research\assets-core-a1\rustup\toolchains\1.88.0-x86_64-pc-windows-msvc\bin\rustc.exe'
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\canonical-core-c1\target-1.88'
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = "$run\native-msrv-tests"
& 'S:\Projects\UCP\de-research\assets-core-a1\rustup\toolchains\1.88.0-x86_64-pc-windows-msvc\bin\cargo.exe' test --offline --locked --manifest-path 'S:\Projects\UCP\AI-Toolkit-DE\crates\toolkit-core\Cargo.toml' --lib
& 'S:\Projects\UCP\de-research\assets-core-a1\rustup\toolchains\1.88.0-x86_64-pc-windows-msvc\bin\cargo.exe' build --offline --locked --manifest-path 'S:\Projects\UCP\AI-Toolkit-DE\crates\toolkit-host-helper\Cargo.toml'
Remove-Item Env:RUSTC,Env:CARGO_TARGET_DIR -ErrorAction SilentlyContinue
node --test --test-reporter=spec tests/game-profiles.test.js tests/core-client.test.js tests/core-helper.test.js
node "$run\generator-boundaries.mjs"
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\toolkit-native-target'
cargo test --offline --locked --manifest-path 'S:\Projects\UCP\AI-Toolkit-DE\src-tauri\Cargo.toml' --lib desktop::contracts::tests::generated_
Remove-Item Env:CARGO_TARGET_DIR -ErrorAction SilentlyContinue
node node_modules/typescript/bin/tsc --strict --noEmit --skipLibCheck --target ES2022 --module NodeNext --moduleResolution NodeNext src/desktop/generated/core/types.ts
node --test --test-reporter=spec tests/native-package.test.js tests/legacy-native-migration.test.js tests/desktop-bridge.test.js tests/security.test.js tests/save-flow.test.js tests/aiv-native-codec.test.js
node scripts/build-core.mjs
node "$run\package-run.mjs"
Remove-Item Env:TOOLKIT_CORE_OUTPUT -ErrorAction SilentlyContinue
node scripts/build-core.mjs
node "$run\package-run.mjs"
node "$run\inspect-packages.cjs"
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = "$run\node-final-default"
node --test --test-reporter=spec tests/game-profiles.test.js tests/core-client.test.js tests/core-helper.test.js
node "$run\measure-packaged.cjs"
```

`package-run.mjs` calls the **production** `packageElectron('dir')` function,
using the separately executed focused checks above. It does not claim that the
full npm packaging/check pipeline passed. Only Windows x64 directory artifacts
were requested or built here; no portable release was needed. README's Windows
x64 promise and existing Linux/macOS native compilation declarations were not
removed. Other targets remain unverified. No packaged application was launched.

Retained failed validation attempts are explicit: initial standalone resolver
setup hit `mkdtemp` ENOENT and was corrected; an inline PowerShell/Node import
lost quotes and was replaced by the research driver; the ASAR inspection initially
used nonnative separators. A deliberate generator-staleness probe overlapped the
first default package and its archive byte check detected shifted content. The
probe and packaging were then serialized, both final packages rebuilt, and the
production verifier now checks archived client/contract bytes. An overstrict
research assertion requiring identical independent executable hashes was removed;
the correct per-artifact hashes and identical hello identities are recorded. These
failed-attempt logs are retained, not reported as passing evidence. There was no
new contention EPERM; Review17 C2's original failure and unknown cause remain.

### Fresh artifact identity and actual packaged-helper measurements

Both actual packages have `resources/core/toolkit-host-helper.exe`, `manifest.json`
and `THIRD-PARTY-NOTICES.txt` **outside ASAR**, matching their own fresh build bytes.
The five archived client/core-contract sources match final source exactly; package
name/version/main match. All 21 manifest inputs are freshly rehashed. Both complete
directory artifacts are retained under
`resume-validation-20261023/artifacts/{override-package,default-package}`.
`package-inspection.json` records original output paths, every artifact hash and
the current identities; `final-verification.json` records retained directories.

- Contract: `73f6fa9758bb58bcfd4a01ffb74947db053768b6033df1a87410c406cedf5121`
- Source: `c2af3cc31e91ae87d8003089126486d265417535b41be32d2476c2ed6d570c46`
- Build: `134edd552e7697aac6f44445e17ce93d5b7de8011926bc5d68ba6c6674988c22`
- Target: `x86_64-pc-windows-msvc`, architecture `x86_64`, protocol `1.0`, metadata
  schema `1`, frame limit `12582912`, reserved raw limit `8388608`, queue capacity `16`.

| Final artifact | SHA-256 |
| --- | --- |
| S: override packaged helper, **390,656 bytes** | `766e4744ed19e9e280bf28ac7e6c9aea7b9d30d3c16bf643b7c08eb58e165243` |
| S: override manifest, 8,009 bytes | `0c64096eb544ce2094f4496cec27c255d75241a07d9dda7898724086697379f4` |
| C: default packaged helper, **390,656 bytes** | `a7184e5781260ec95ddaf448f2ea5a0a60f37a961cfa730d992f93331ef2793c` |
| C: default manifest, 8,009 bytes | `913f545b25296ad19aea4f447d01eb21e409d1e5d6ee33fddb17a78d26984b17` |
| Dependency notices in each, 243,336 bytes | `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829` |
| Final app.asar in each | `3779328bc6b7734002cd463822e60428f2ec9d5049f25507d837c62f950530ff` |
| Final packaged application executable in each, **not launched** | `31d43489073029efcc6c0f9ed74b4bd20b43f9c90c67fa3c2d14283347cbe6b1` |

Measured the **actual C: default packaged helper**, using the actual client and
contracts extracted from its verified ASAR. `packaged-measurements.json` retains
all individual samples, CPU/OS/Node version, exact helper/build hashes and owned
synthetic directories. Each of 12 samples starts a fresh helper process; filesystem
caches were **not flushed**. Probe uses only the synthetic Classic PE/layout
fixture. Repository timings use a fresh owned directory, empty-store CAS and read.

| Operation | Samples | Median ms | Observed max ms |
| --- | ---: | ---: | ---: |
| Process-cold connect/hash/spawn/hello | 12 | 15.84 | 54.08 |
| Synthetic recognized Classic probe | 12 | 0.69 | 11.64 |
| Hello plus first probe | 12 | 16.55 | 65.72 |
| Missing repository read | 12 | 0.44 | 0.91 |
| Initial repository CAS including its real receipt | 12 | 3.38 | 4.03 |
| Ready repository read | 12 | 0.46 | 0.63 |
| Queued cancellation receipt behind accepted 4 MiB metadata CAS | 5 | 34.02 | 34.89 |
| Accepted write's real committed receipt after abort signal | 5 | 33.95 | 34.78 |

All five queued writes cancel; accepted writes commit revision zero, preserve
their full 4 MiB metadata extension, and the helper remains usable. Accepted
writes are never killed or falsely reported cancelled. These are finite local
measurements with **no invented performance acceptance threshold**; metadata
extension traffic is not a raw-document benchmark. Context/cold-bind and raw
8 MiB document open/save benchmarks remain deferred because C1 exposes no such
API. No pixels, installed-game behavior or application startup was measured.

### Exact final source snapshot and residual review gates

SHA-256 values below pin all 25 C1 source inputs plus the three unchanged inputs.
`final-verification.json` additionally pins this appended report, logs, reproduction
drivers, measurements and retained artifact locations. No commit permalink is
claimed for these uncommitted files.

| Toolkit-relative file | SHA-256 |
| --- | --- |
| `crates/toolkit-core/build.rs` | `f0f94afc2f53729fe8d35cf29e4aeb1a899b963791178950d72e2a2d5c0492fe` |
| `crates/toolkit-core/Cargo.lock` | `6e686665cd9ae0710253c344f230bb51301fc178ece38a338363908b0ada42ea` |
| `crates/toolkit-core/Cargo.toml` | `dc68bbbf2fafe47ed3bce2490e189e2410ccce2f7e10a5cbf9725dc9f4334c49` |
| `crates/toolkit-core/examples/export-contracts.rs` | `753eb79b5c64bc35a81055847230bae303142442a4ae1e3a05dfacb0a85e91e9` |
| `crates/toolkit-core/src/contracts.rs` | `c96efaff7e36aaa51e52ee1b9b1d907e003d09aaf1a0985e831625b855dccd39` |
| `crates/toolkit-core/src/lib.rs` | `695a946bba074e07775e129e774afeced96c34f3308e2095ba51c5c451965dc5` |
| `crates/toolkit-core/src/profiles.rs` | `25a5556dfa4245d6cb38c2cf91815fdd8ac17aac3d91088b202132425cbf072c` |
| `crates/toolkit-host-helper/Cargo.lock` | `c4b52d102491d5c2b058276ad18c8eda001dff250b4acca3be350643aa4e2c94` |
| `crates/toolkit-host-helper/Cargo.toml` | `d0d921ff41358f21d0c032e089e42a49a16196a63c8733592351657ce64ba733` |
| `crates/toolkit-host-helper/src/main.rs` | `71b46224272b233713add0630eda585a01e2d7bd2e6ebcd38c1dbbeddb442900` |
| `src-tauri/Cargo.toml` | `5553d11f5bee7b838f9103dfec5ff2a1db2da4c17dd5649e35fc7d967ae19813` |
| `src-tauri/Cargo.lock` | `a2c113a773b26077540f06ddd6a09de5fcd3e6a5378a44e7ccbe7fbb23c73eb2` |
| `src-tauri/src/profiles.rs` | `cc0c0729d20d1c90044b400a0c64fef833f6878a8600857e6c54e5f36e5b50bb` |
| `src-tauri/src/desktop/contracts.rs` | `4b60d58bd8760e00d91160c0de8300296b11098a5960d21b74e4d4f1f0250460` |
| `src/node/core-build-paths.js` | `fec21e64793a36d0b706a7a058192ea97adbfca10615a0c9a2705ec82f78f707` |
| `src/node/core-client.js` | `3a8f2c522c089b17d869dec97e4ac25a0c5237e589295b176ae6fe4cad42b805` |
| `src/node/game-profiles.js` | `12c147271666765c0631af78d8f65d19da7b16dd9cc7345a0effdfc2195218f0` |
| `tests/game-profiles.test.js` | `4beb3228b886062e6d4ca0ee7cbbf00c55b4dcff6557455ad21af2d91b2c15d9` |
| `tests/core-client.test.js` | `fe41ef32d32ad3758956ed3bca025e728c6d58495cd04a880e1658184753ed87` |
| `tests/core-helper.test.js` | `cdef3d878a9fbf6ee73f90e13e1b7ac6d68128cd24a1ab5b70b09d80f9e5c0e8` |
| `scripts/build-core.mjs` | `ca2e23b160f66afea3eedd2e298a8c8730a8f3231067c604908900151d256edc` |
| `scripts/generate-core-contracts.mjs` | `4420d3bf78a83cdd55e0bcaaf49fbe9d2c843ecd24d7f9f0fdd1255d3126ddc7` |
| `src/desktop/generated/core/types.ts` | `dcbfd196d2d83e8c4e587c08491013ba7403fe36f8dd9f31397bb84827fbd0cc` |
| `src/desktop/generated/core/contract.json` | `8532d595222af25920c38f015b31e78e48b24d027e3f86b5ae8088d849a45cf9` |
| `package.json` | `403395711aee19fb2bbdc8e44ac5138aab470dce4ee4998a1cb9da86ff01cd8d` |
| `src-tauri/src/lib.rs` | `ed081350c4b18552115275ad28e9983c9a719d974a7547d1b414719ee78387d5` |
| `package-lock.json` | `95afb1d67a9525b78587a9a4845fbef873e75d81d012e2a9c810058251284704` |
| `tests/fixtures/de-mode/foundation.json` | `464a6e35affc056eefc68c50e7e1dfbd1b7649f57d1c6d71c335e86c40cc61f1` |

Independent C1 review still must decide Review17 R4 and remaining Review11 R1
closure in the extracted canonical code; passing implementer tests do not grant
that closure. Existing offline abandoned-lock maintenance, partial-artifact manual
inspection, unverified hardware power-loss durability, conservative suffix-junction
recognition and unknown game-version support remain explicit. The old isolated
EPERM is not mapped to busy and its cause remains unverified.

Root owns acceptance/integration/commits. DS1 modules/schema/generator/tests,
A1 sources/reports, root tracking documents, main/preload/frontend consumers and
build-desktop were not edited here. There were no children, commits/push, CI,
dispatches, PR/merge/release, app/game/Steam launch or original/profile/settings
writes. No source-scope extension is required for these corrections. The next
context/lease/raw-byte/document integration is deliberately left to its owner.


## Review30 C1-01/C1-02 correction and fresh source handoff — 2026-10-23

This is an implementation response for **fresh independent re-review**, not C1
acceptance or self-approval. Review30 independently closed original Review11 R1
and Review17 R4 and preserved R2/R3; this correction does not reopen those findings.
Its new transport/resource findings are handled below. Root owns acceptance,
integration and commits. The historical pause and its receipts remain unchanged.

**Source identity correction:** the old resumed heading's 773f80b was stale.
Review30 and this assignment's entry observed
`30215f2b567ca38b1b36d2e2907c0965a8503765`. The shared checkout subsequently advanced through the
coordinator's DS1 commit; final observed HEAD is `ebff3b1e2c5bce415277394e3322099a20919f19`
(`Add reviewed shared DE document sessions [skip ci]`). This C1 implementer
created no commit. HEAD is context, not an identity substitute for these uncommitted
C1 files. All 28 supplied entry hashes matched before mutation. The exact fresh
28-source receipt, source copies, changed-source patches, command arguments,
logs and artifact hashes are in:

`S:/Projects/UCP/de-research/fix-canonical-core-c1-r3` (**fix/** below).
`before/` preserves the 28 source inputs, original report25/Review30, original
final receipt and **both complete original directory packages**. Original research
and review receipts were not edited. `final-verification.json` pins this new
source; `final-source/` contains its copies. No commit permalink is invented.

### C1-01 response: one canonical persisted/result budget before mutation

**Observed baseline reproduction:** `baseline-oversized-initial.json` reproduces
Review30 with the preserved original helper: two helper-only CAS proposals each
retain 6 MiB+128 characters; the second proposal omits the first extension. Disk
commits revision1 at **12,583,316 bytes**, while helper CAS/read report
rejected/response-too-large; the prior direct Rust probe reads ready. The original
before/after SHA-256 values match Review30 exactly. This is retained failed
behavior, not a passing product result.

**Implemented in toolkit-core/profiles.rs:** persisted repository metadata is at
most **8,388,608 bytes**, inclusive of pretty serialization plus its final newline
for new writes. Existing source files are checked by their actual byte length.
The final serialized **StoreResult** has a separate **8,389,632-byte** ceiling;
serialization counting includes escaping and the snapshot/result fields. The
private Reply/Store wrapper has a conservative further 1 KiB allowance, leaving
ample room below the unchanged **12,582,912-byte** helper frame cap. Exact maximum
request-ID envelopes and escaped strings are exercised in boundary tests. There
is no second Node metadata policy and no new general game-JSON/parser byte limit.

CAS validates after extension preservation, checks both representations, and
self-round-trips before entering persist: no retained-backup deletion, journal
creation, checkpoint or canonical mutation occurs on a size rejection. The ready
read result uses the same canonical budget. Rejection is the bounded store status
`metadata-too-large` with generated typed
`sizeLimit:{representation:'persisted'|'result',maxBytes,actualBytes}` and no
snapshot. ValidateStore uses the same canonical metadata policy and returns the
existing Rejected envelope with code `metadata-too-large` when outside it.

Existing oversized canonical metadata blocks read/CAS/migration/recovery with an
explicit diagnostic and exact retained bytes. Recovery also checks known journal
metadata sizes, including unused snapshots/restore files, **before cleanup**, so
an old oversized journal is retained in full for offline maintenance. The existing
raw duplicate-name/domain preflight, hash/schema authority checks, restore
algorithm and transaction commit point remain intact. No truncation, empty-store
fallback or automatic destructive repair is added. Old large metadata needs an
explicit later maintenance decision; this library does not silently shrink it.

**Observed corrected reproduction:** `final-omitted.json` runs the actual fresh
packaged helper/client. The same second proposal returns metadata-too-large with
actualBytes **12,583,316**. Every canonical/backup inventory/hash is unchanged;
read stays ready at revision0. A smaller accepted proposal returns committed at
revision1 with all **6,291,584** retained characters and its escaped new extension;
returned store equals the next read. Its canonical SHA-256 is
`a659da7fd8804ad929d0d947ade3e392ee41c254637a1e6f87b27514f3c3d846`.
Its full maximum-ID result frame is **6,297,950 bytes**. The original bad baseline
store remains exact under fresh helper read/CAS/recover/migration diagnostics.
Direct/core tests additionally commit exact **8 MiB** boundary stores (plain and
escaped/Unicode), reject **8 MiB+1** before persistence, and cross-read/update those
accepted snapshots through the actual helper and direct Rust API. Both recovery
directions and oversized unused snapshots keep exact inventories and sentinels.

Protocol is now **1.1**, metadata schema remains1. Hello/generated contract expose
`maxMetadataBytes` and `maxMetadataResultBytes`; old helper/client resources
fail the existing exact identity gate and need rebuilding together. The helper's
framing fallback is unchanged; canonical prevention, rather than that fallback,
owns the repository guarantee. Process-crash/file-sync evidence is retained;
hardware power-loss durability remains unverified.

### C1-02 response: admission owns preparation and one immutable encoded snapshot

CoreClient reserves a slot synchronously **before operation inspection/encoding**,
including while hello is pending. All preparing, waiting and submitted requests
share **17 slots** (16 queued + one running) and **25,165,824 encoded bytes**.
The byte sink reserves exact UTF-8/JSON-escape cost before copying each string.
Count overflow never enters serialization; byte overflow is rejected before the
large payload stringify/allocation. Partial reservations release on invalid input,
frame/byte overflow, cancellation, close, handshake failure/timeout, EOF and process
failure. Submitted receipts release the same reservation exactly once.

The one framed buffer is the immutable submitted snapshot. The old full JSON
parse and second request serialization are removed. Waiting requests live in the
bounded admissions set without per-request ready reactions retaining cancelled
buffers. The generic serializer still rejects exotic/proxy/accessor/sparse/cyclic
and non-JSON data without calling getters/toJSON. Rust remains metadata owner.

Tradeoff: the unchanged aggregate 24 MiB now counts the **whole frame**, including
request envelope and length prefix, rather than only operation bytes. Near the
limit a call can conservatively get queue-full slightly sooner. No lower count
limit or unbounded waiting queue is introduced. Small control requests still fit
beside three 7 MiB requests in the deterministic test; cancellation frames remain
independent of payload admission. Preparing cancellation reports cancelled;
never-submitted writes fail as unavailable on connection loss; submitted writes
retain the prior unknown-outcome/no-replay rule. Queued cancellation/EOF cancels;
accepted writes finish with their real result. Abort after close does not send
into an ended pipe or lose the draining accepted receipt. No kill-on-cancel.

**Observed finite control-plane measurements**, same 64-call/1 MiB-extension
burst, Node v26.7.0, Windows x64, Ryzen5950X, owned original versus
fresh packaged resources (individual observations, no invented numeric threshold):

- Preserved original client: **317.82 ms** synchronous
  burst, **67,117,760 bytes** of
  new ArrayBuffers, **190,513,152 bytes** RSS
  growth; pending remained0 before microtasks. `baseline-admission.json`.
- Fresh actual packaged client: **71.93 ms**,
  **17,828,877 bytes** of new
  ArrayBuffers, **25,411,584 bytes** RSS
  growth. Before microtasks: **17 reservations / 17,828,877 admitted bytes**,
  pending0. **17 fulfilled / 47 queue-full**, all four counters zero after settling.
  `final-admission.json`; original first observations are retained separately.

These corroborate bounded allocation on this metadata/control workload. They are
not peak-allocation guarantees, renderer/FPS, UI latency, context/raw-document I/O,
game or application-startup evidence. Renderer/input/worker/cache/deferred paths
were untouched; no unrelated interactive benchmark was rerun or per-frame work
added. The mandatory performance/native-parity rationale was read before editing.

### Focused executed checks and reproducible commands

`run.cjs` records actual executable/arguments, explicit Toolkit cwd, selected
external environment, timestamps/exit status and UTF-8 logs. Final checks:

- Current Rust1.98.1 core: **29 passed**, zero failed/ignored; `core.log`.
- Rust1.88.0/MSRV same final Rust source: **29 passed**, zero failed/ignored;
  `msrv.log`; helper compiles in `helperMsrv.log`.
- Actual fresh S: override helper: **97 passed**, zero failed/cancelled/skipped;
  `transport.log`. Fresh default C: helper: **97 passed**, same zero outcomes;
  `transport-default.log`. Includes all existing raw-domain/CLR/crash-adjacent
  transport tests and the new byte/admission lifecycle regressions.
- Core generated output check passes (also enforced by each production build);
  standalone strict generated TypeScript passes; `generated.log`, `types.log`.
- Narrow changed packaging/migration adjacency: **9 passed**, zero failed/skipped;
  `packagingTests.log`. No unrelated full suite or new renderer gate.
- Owned Rust formatting check and Node client syntax pass. No unrelated formatter.
- Production helper builds and **directory** packaging pass for both S: override
  and portable default C: output. `package*.log` runs production
  `packageElectron('dir')`, with publish never. This does not claim a full npm
  check pipeline, portable/installer artifact, other target or app launch.

All commands use cwd `S:/Projects/UCP/AI-Toolkit-DE`. Representative exact replay:

```powershell
$fix = 'S:/Projects/UCP/de-research/fix-canonical-core-c1-r3'
node --expose-gc "$fix/baseline-admission.cjs" # uses preserved old client/resources
node "$fix/baseline-oversized.cjs"           # old failed behavior, owned fixtures
node "$fix/run.cjs" build
node "$fix/run.cjs" core
node "$fix/run.cjs" msrv
node "$fix/run.cjs" helperMsrv
node "$fix/run.cjs" transport
node "$fix/run.cjs" generated
node "$fix/run.cjs" types
node "$fix/run.cjs" packagingTests
node "$fix/run.cjs" package
node "$fix/run.cjs" build-default
node "$fix/run.cjs" package-default
node "$fix/run.cjs" transport-default
node --expose-gc "$fix/measure-admission.cjs"
node "$fix/final-omitted.cjs"
```

The baseline oversized driver calls the original retained review direct-probe
binary; it does not claim that binary is the corrected core. The permanent tests
exercise current direct/helper code. `inspect-packages.cjs` verifies and retains
new artifacts; it intentionally refuses replacing an existing retained artifact
directory. Replaying it needs a fresh evidence destination, not deleting history.
The final receipt pins its successful retained outputs.

Failed/intermediate attempts are preserved: the first transport run had96 pass
and one stale assertion expecting helper response-too-large; the test now expects
the canonical typed diagnostic. An initial copied inspection driver still pointed
to the original override artifact, correctly failed its current-input check, and
was corrected to this fix's output; its dependent measurement had no receipt then.
No mismatched artifact was accepted or relabeled. Earlier successful source and
package iterations, including the final close guard's predecessor, retain separate
logs/receipts and `artifacts-before-close-guard/`; they are not final artifacts.

### Actual fresh artifacts and final source pins

`package-inspection.json` rehashes all21 manifest inputs and all five actual
archived client/core-contract files. Both resource triplets match their own fresh
builds outside ASAR; dependencies/notices remain24 resolved registry packages.
Complete current directories are `fix/artifacts/{default,override}-package`.

- Contract: `892d431c67ecfe6ce89e343fb6f8301db425264cea4fa976764a09a504487e1b`
- Source: `735d3e793784c5f9a6d5cddb6542e6fc43d1d61219439b9ccbfd98cfc72716ae`
- Build: `b18b66df3dc8e5ebd3ac1aa9d6848d567462f81eb59b79c2af158a0228ee4e82`
- Both hellos agree: protocol1.1/schema1, x86_64-pc-windows-msvc, frame12582912,
  raw8388608, metadata8388608/result8389632, queue16. Independent executable
  hashes can differ; byte-reproducible binaries are not claimed.

| Fresh artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| override / `toolkit-host-helper.exe` | 398848 | `e2554c7762dfe0d5d464d5bf46fcd95ace1c494babb19cbfd5d6caba3ba0fbc4` |
| override / `manifest.json` | 8081 | `bc24f147f12ec37cbf829b29684ba34a9800a9ecb6eb1f66772e3ed905508007` |
| override / `THIRD-PARTY-NOTICES.txt` | 243336 | `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829` |
| default / `toolkit-host-helper.exe` | 398848 | `2b791cc0e45d1d816e8298c774eab1505fcdd178080ffd1ad57d792d493e638c` |
| default / `manifest.json` | 8081 | `3e196d36e8f94df2f8e8a06d5fe15d9174362739d62e76d014f6910521b23cad` |
| default / `THIRD-PARTY-NOTICES.txt` | 243336 | `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829` |

Full ASAR/application hashes are retained in the package inspection/receipt;
neither application executable was launched. These are current artifacts, not
the preserved original packages. Changed source hashes since the verified entry:

| Toolkit-relative source | SHA-256 |
| --- | --- |
| `crates/toolkit-core/examples/export-contracts.rs` | `771d873081fc405e471ce90dd061ebfab71137ca7b93ba1aa42c0a80641a6b5c` |
| `crates/toolkit-core/src/contracts.rs` | `e2730ffa73edba2217c3bbdc4b74977fabc63d94430678309c23aabbdc8e3296` |
| `crates/toolkit-core/src/lib.rs` | `3fcd356dda6c04f1dfbf309d396205a6422003e480f62c79486a4fb3b6cfe061` |
| `crates/toolkit-core/src/profiles.rs` | `cbdec53137e73ad4e1cd2186f7b7b1b1bcb199f5d93acec843f8765d1b74219c` |
| `src/node/core-client.js` | `60563335b92190f8512d3af922911b67e3699ec0c3d2b962e5e6ed9c64c1335f` |
| `tests/game-profiles.test.js` | `3c2576cfb1a734e1a18b2aa813c672109b524694f1db90819b99cdd1847fa600` |
| `tests/core-client.test.js` | `e945417123451d6597c77a8d102fc0770dd7c68969afa54dfe2375c48b255c8d` |
| `tests/core-helper.test.js` | `d3faed0b0dca4822e17bc6855822735633511090d4a3e5df0bcc5a611a7ea718` |
| `src/desktop/generated/core/types.ts` | `eda7427f8f26b7dda4c35a11e6714c6070fa3c42f29583af0671e773e1d59da4` |
| `src/desktop/generated/core/contract.json` | `966f20fc663dfbd58e5cb15a8676d9404e73485a198c6febd8a5404663c75e5d` |

The other18 supplied source/input hashes remain exact; all28 are pinned again in
`final-verification.json`. Generated bytes and fresh artifact inputs match this
source. No C1 Cargo/package/desktop wiring change was necessary in this correction;
core helper source, facade, build resolver/scripts and narrow desktop inventory
are unchanged. No DS1/session/parser/UI/A1/PXL2/root tracking/prior-review file was
edited here; only this report received an append. No children, C1 commit/push,
CI/dispatch/PR/merge/release, app/game/Steam launch, live/original profile/settings
or Classic writes occurred. Original unresolved EPERM cause, conservative suffix
alias limits, offline maintenance and broader DE acceptance remain as documented.

Return these exact bytes to fresh independent review for C1-01/C1-02; no new
cross-owner implementation or acceptance gate is requested by this handoff.


## Review36 C1-02 packaged-facade correction r4 — 2026-10-23

This bounded implementation response is **ready for a NEW independent review
round**, not self-approval. Review36's C1-01 closure and all original F1 R1–R4
closures are preserved. No Rust algorithm, DTO, generated contract, helper source,
build policy, DS1, panel, asset, Classic or host consumer was changed. Root owns
acceptance, integration and commits. Coordinator now reports native get_goal
ACTIVE again, and current plan02 records that resolved state; the earlier pause
sections remain historical. This implementer made no goal mutation.

First observed HEAD was `61c2fa16524c7b06d1638eed9c1593afd689e469`.
Before mutation, the entry receipt pinned coordinator commit
`e3d891cb815a9758542b897065141e71da4a7ca2`; final observed HEAD is `e3d891cb815a9758542b897065141e71da4a7ca2`.
Branch is `de/separate-game-mode`. All28 source/input hashes matched the prior
R3/Review36 receipt before mutation. HEAD advancement is shared-checkout context,
not a substitute for exact C1 source identity. No worktree isolation is claimed.

All new scratch, preserved sources, copied actual packaged baseline, drivers,
patches, logs, receipts and complete directory packages live outside Git in:

`S:/Projects/UCP/de-research/fix-canonical-core-c1-r4` (**r4/** below).

The four mandatory goal/contract/plan/standard files were read first, followed by
full Reviews36/30 and appended handoff25, performance/native-parity rationale,
actual facade/client/build/package paths and relevant history. Only four owned
code/test files changed; tests/core-helper.test.js is unchanged but freshly run.
This report receives only an append, whose original prefix is byte-checked.

### Finding response and single admission owner

The facade now caches a synchronously available CoreClient. Ordinary calls enter
request immediately; byte calls enter the narrow requestBytes(op,bytes,options)
entrypoint immediately. invoke only unwraps the already-admitted promise. There
is no await or raw-byte spread before admission, separate facade quota or queue.
Optional AbortSignal forwarding on the two byte methods and validateStore uses
the same existing transport lifecycle.

CoreClient.request and requestBytes both enter the same private #request owner.
The existing reservation Set, count/aggregate byte budget, ID allocation,
submission, settlement and accepted-write cancellation/receipt behavior stay in
that owner. The byte adapter only identifies the one operation byte vector for
serialization. Ordinary metadata still goes through the existing generic JSON
serializer; no second profile validator or metadata policy was added.

Admitted ordinary Buffer/Uint8Array views use intrinsic length/backing-buffer
access and u8 indexing, avoiding iterator/toJSON/getter execution and an expanded
number array. Minimum JSON vector cost is reserved before scanning, remaining
exact decimal cost before allocation, and digits are written directly into the
single final framed snapshot. No caller byte vector is stored on a waiting or
submitted request. Dense ordinary arrays keep all generic wire checks. Proxies, custom typed-array subclasses,
shared backing buffers, sparse/accessor/exotic values are rejected without their
hooks. Generic direct requests still reject typed arrays and all prior exotics.
Rust continues to own operation/schema/domain validation.

No contract changed or generation rewrite was needed. Both fresh production
builds run the canonical generation check, and both generated files retain exact
Review36 hashes. No Rust/build-policy scope expansion was required.

### Actual packaged baseline and corrected finite reproductions

r4/facade-boundary-before.cjs is the independent Review36 driver copied with
**only its base path adapted**. Owned archived facade/client/generated sources
and helper resources match the prior exact source/artifact pins;
r4/baseline-input-verification.json records those comparisons. Prior research
was read/copied, never rewritten. The original failed behavior is preserved.

The final comparison runs separate baseline, corrected-warm and corrected-pending
processes sequentially after the coordinator reported its 6.7GB physical-copy/hash
preparation finished. Actual UTC command bounds are in timing-receipts.json:

- baseline: 2026-10-23T16:17:54.284Z to 2026-10-23T16:17:56.542Z.
- corrected-warm: 2026-10-23T16:17:56.543Z to 2026-10-23T16:17:56.967Z.
- corrected-pending: 2026-10-23T16:17:56.968Z to 2026-10-23T16:17:57.376Z.

Same finite64 ×262,144-byte Buffer workload, Nodev26.7.0/Windowsx64. Measurements
are before the first await and are observed process-memory deltas, not peak
allocation or universal thresholds. Both implementations fulfill17/reject47.
Core entry counts include requestBytes in the corrected transport.

| Sample | Raw array copies / elements | Sync core entries | Sync ms | Heap delta bytes | ArrayBuffer delta bytes | RSS delta bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 64 / 16777216 | 0 | 396.75 | 162245416 | 0 | 263569408 |
| corrected-warm | 0 / 0 | 64 | 22.14 | 477368 | 8914095 | 14299136 |
| corrected-pending | 0 / 0 | 64 | 31.42 | 751936 | 9312942 | 14802944 |

Corrected warm admission reserves17 frames /8,914,095 bytes before returning;
pending hello reserves17 /8,914,094 bytes. Pending stays0 before microtasks.
The pending sample also includes cold hash/spawn preparation, so it is not a warm
latency comparison. After completion all four counters are0. Count overflow never
observes/iterates/copies its payload. The original warm metadata mutation returns
changed; the corrected actual packaged facade returns original and also retains
raw metadata bytes mutated immediately after call submission.

The corrected driver uses the five unchanged sources extracted from the actual
fresh default ASAR and its matching retained helper, rather than a hypothetical
facade or a fake backend. Its wrappers only count entries/hold hello; they add no
queue or policy. Actual source-facade tests additionally capture metadata, CAS,
PE and parse bytes during pending hello and after warm hello.

Earlier individual samples remain in *-initial.json. Their driver did not record
command timestamps; possible overlap with coordinator disk pressure is unquantified
and no overlap cost is attributed. They are excluded from the final comparison.
An initial pending measurement driver attached handlers only after awaiting held
hello, so Node terminated on an expected queue-full rejection without a handler.
The corrected driver attaches Promise.allSettled before waiting; the initial
script and failure note remain. No product source changed for that driver fix.

These are transport preparation measurements, **not UI/FPS or interactive-window
evidence**. The facade has no main/preload/renderer consumer wired yet. No worker,
retained scene/latest-only queue, cache/dirty invalidation, batching, texture,
deferred analysis or draw/input path changed; no per-frame IPC/probe/hash/decode
was added. Later interactive integration still requires its own owned baseline.

### Fresh checks and exact replay commands

All Toolkit processes used explicit cwd S:/Projects/UCP/AI-Toolkit-DE. run.cjs
retains executable/arguments/environment/start/end/status and UTF-8 logs. Observed:

- S: override fresh helper/transport selection: **103 passed**,0 failed,
  cancelled or skipped; transport.log. Default C: helper: **103 passed**, same
  zero outcomes; transport-default.log.
- Six new focused tests include actual-facade warm/pending snapshots and overflow,
  aggregate byte charge/control room, invalid/pre-aborted/waiting-cancel/closing
  cleanup, EOF/mismatch/timeout cleanup and byte encoding for all256 u8 values,
  subviews/empty/dense vectors. Existing direct immutable snapshots, generic
  exotics, byte/count limits, accepted write receipts, queued cancellation,
  EOF/closing drain and unknown-outcome/no-replay regressions remain green.
- Both fresh production helper builds and Windowsx64 **directory** packages pass;
  build*.log/package*.log. Both canonical generated-output checks pass in those
  builds. No generated source changed. Owned JS syntax checks pass.
- Packaging/migration adjacency: **9 passed**,0 failed/skipped;
  packagingTests.log.
- inspect-packages.cjs rehashes every21 manifest input, all five actual archived
  client/core-contract sources, outside-ASAR resource triplets, ASAR and unlaunched
  app EXE. verify-artifact-hellos.cjs runs both real helpers at EOF, checks exact
  hello/manifest equality and all24 resolved registry dependency notices.

The unchanged canonical **29-test Rust domain/MSRV results are INHERITED** from
Review36/R3 at exact hashes, not relabeled fresh. No unchanged Rust domain suite,
MSRV matrix, broad JS/native suite or interactive workload was gratuitously
rerun. Fresh builds compile the same canonical code with new source identities.

```powershell
# cwd: S:/Projects/UCP/AI-Toolkit-DE
$fix = 'S:/Projects/UCP/de-research/fix-canonical-core-c1-r4'
node --expose-gc "$fix/facade-boundary-before.cjs"
node "$fix/run.cjs" build
node "$fix/run.cjs" transport
node "$fix/run.cjs" package
node "$fix/run.cjs" build-default
node "$fix/run.cjs" package-default
node "$fix/inspect-packages.cjs"
node "$fix/run.cjs" transport-default
node "$fix/verify-artifact-hellos.cjs"
node "$fix/run.cjs" packagingTests
node "$fix/verify-baseline.cjs"
node "$fix/measure-sequential.cjs"
node --check src/node/core-client.js
node --check src/node/game-profiles.js
node --check tests/game-profiles.test.js
node --check tests/core-client.test.js
```

package.mjs calls production packageElectron('dir'), publish never, after the
separate focused checks; it does not claim the full npm check/package pipeline.
Inspection/measurement scripts preserve existing retained rounds; replay requires
a fresh evidence destination. Outputs are not installer/portable/other-target
acceptance. No application executable was launched.

### Actual fresh package manifests and source pins

Complete retained directories: r4/artifacts/{default,override}-package.
Default output is `C:\Users\Krarilotus\AppData\Local\Temp\toolkit-core-builds\951527c00ae0fdb4c27c2daf`; explicit S: output is
`S:\Projects\UCP\de-research\fix-canonical-core-c1-r4\build`. package-inspection.json and
artifact-hellos.json contain actual full21-entry source manifests, resource and
archived-file checks. Both real hellos agree:

- Protocol1.1/schema1, x86_64-pc-windows-msvc/x86_64; frame12582912,
  raw8388608, metadata8388608/result8389632, queue16.
- Contract `892d431c67ecfe6ce89e343fb6f8301db425264cea4fa976764a09a504487e1b`.
- Source `f17e05dd5ec16e4f6338d3b601de14327a79311ca8bdad07fd7d4b7a281d4ce7`.
- Build `ace1b3c0693f53e4ad30f9d41e0cf943cbaa6586dbddae0b31fcb34a92e18cea`.

| Fresh retained artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| override / `toolkit-host-helper.exe` | 398848 | `d8543259311a26424ecd5ce1655c7c47ba974d4c2faa1ecdf638aed3f2e9f597` |
| override / `manifest.json` | 8081 | `b285dafbf348954687fc72325fdf5dad153d4194852d4def3b740b53f240142a` |
| override / `THIRD-PARTY-NOTICES.txt` | 243336 | `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829` |
| default / `toolkit-host-helper.exe` | 398848 | `d16c17fc2a8a289f089ef5c8b7a2bdb7eb183aff1ed9d643ace9c1c0afd5903e` |
| default / `manifest.json` | 8081 | `39bd1199dcb46e78e69fcfbacfd871314ee2d7d3943658e04453921754c0dbd1` |
| default / `THIRD-PARTY-NOTICES.txt` | 243336 | `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829` |

Both actual ASARs hash `1d4f6a1fa23e5fcdb3cd97cc82d86e47691d39e0db9369189e96e02cbca8c2b7`;
both unlaunched application EXEs hash
`207b3f4ad9ae05cd21079d86d5006a5351c94760b8f50091036503410a21a4f0`. Independent helper executable
hashes differ; reproducible executable bytes are not claimed. A manifest checks
integrity/compatibility, not authenticity.

All five owned code/test source pins and protected canonical core/helper pins:

| Toolkit-relative source | SHA-256 |
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
| `src/node/core-client.js` | `2079c05768efc74ea5230cec2d1819b6cb0734f6e5d808fe9d99bc8f29ec163d` |
| `src/node/game-profiles.js` | `ad185439fc9d88c248245e3a4f3549ada3a78e54e5a31c83ef93ed6e127ee7be` |
| `tests/game-profiles.test.js` | `9ba210f12d16ab22cd97f98f779eb36e1058d203262c455a23091306665ec795` |
| `tests/core-client.test.js` | `3b303c9ecf02b651578febf93e3c7e7f22651787450f255d7ce3a499a3ad07f2` |
| `tests/core-helper.test.js` | `d3faed0b0dca4822e17bc6855822735633511090d4a3e5df0bcc5a611a7ea718` |

The remaining24 of28 source/input hashes are unchanged; all28 are pinned in
source-pins-final.json and final-verification.json, with exact before/final copies
and four changed-source patches. Generated types.ts remains
`eda7427f8f26b7dda4c35a11e6714c6070fa3c42f29583af0671e773e1d59da4`;
contract.json remains `966f20fc663dfbd58e5cb15a8676d9404e73485a198c6febd8a5404663c75e5d`.
final-verification.json also pins this appended report and its exact old prefix,
command receipts, drivers, logs, measurements, manifests and artifact locations.

No children, commit/push, CI/dispatch/PR/merge/release, app/game/Steam launch,
original/live profile/settings or Classic writes occurred. Concurrent coordinator
and teammate edits remain untouched. Offline lock maintenance, conservative
suffix-alias recognition, original unknown EPERM cause, partial-journal manual
inspection, hardware power-loss limits and later context/document/UI/game
acceptance remain as previously documented. No extra cross-owner implementation
is required for this correction. Return these exact bytes for NEW independent
C1-02 review; root decides closure and commit readiness.
