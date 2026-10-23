# Independent canonical core/helper review — C1 round 1

2026-10-23. **NO-GO for the additive C1 commit at this exact snapshot.** Two newly
observed transport defects remain: a committed CAS can be reported as rejected and
make Electron unable to read the resulting store (C1-01), and client admission does
not bound serialization/allocation before its first await (C1-02). Both have finite
reproductions below. The extraction, single policy ownership and portable packaging
are otherwise supported by the inspected source and actual retained artifacts.
Root owns reconciliation, integration, acceptance and commits. No contexts, UI,
renderer changes, live mode switching or full DE acceptance are approved here.

**Prior Review11 R1 and Review17 R4 are independently closed for their original
JSON-domain/recovery obligations.** R2/R3 corrections survive extraction. The new
C1-01 is a separate transport-size/commit-outcome problem; closing the old findings
does not certify that every canonical result fits the helper boundary.

## Authority, source identity and review limits

Read in full, beginning with the four mandatory files: goal00, contract01, plan02,
standard05; architecture23, complete handoff25 including resumed verification,
F1 handoff09, Reviews11/17, critique21, `docs/iso-scrub-performance.md`, and
`docs/native-parity.md`. The explicit resume supersedes the historical pause.
This reviewer did not alter a native goal flag or infer a new approval requirement.
No children were spawned, as requested by this assignment.

Observed branch `de/separate-game-mode`, HEAD
`30215f2b567ca38b1b36d2e2907c0965a8503765`. All **25 C1 source hashes plus three
protected input hashes** match the supplied `final-verification.json` exactly,
both at entry and final verification. Those files remain uncommitted. The `773f80b`
HEAD in handoff25's resumed section and in that JSON is stale metadata, not the
review identity. The opening paused heading is historical too. Preserve the old
receipt; the implementation owner/root should append a current-state correction
and a fresh receipt after resolving these findings. This is a report correction,
not a third implementation blocker.

Evidence labels: **observed** means independently executed in this review;
**source-confirmed** means inspected at the pinned bytes; **inherited** means an
implementer/prior-review result whose source/artifact identity was checked, without
claiming to have rerun it. No remote commit permalink is invented for new files.

Owned checkout output is only this report. All probes, logs, dedicated Cargo target,
synthetic files and copied helper resources are under
`S:\Projects\UCP\de-research\review-canonical-core-c1-r1` (abbreviated **review/**
below). Every Toolkit shell invocation used the explicit actual Toolkit cwd.
Negative generator probes modify an owned scratch checkout copy. Neither production
generated output nor the retained original packages/evidence was changed. No source
or test fixes, commits/push, CI/dispatch, PR/merge/release, installation/global
package changes, app/game/Steam launch, live settings/profile writes or original
Classic checkout changes occurred. Only synthetic helpers/test executables ran.

## Severity-ranked actionable findings

### C1-01 — P1 / commit blocker: extension preservation can commit a result the helper calls rejected

**Owner:** C1 canonical repository/transport owner; root reconciles the common byte
contract. **Locations:** `crates/toolkit-core/src/profiles.rs:789–810` preserves and
serializes final metadata without a byte/result budget, then `persist` commits it;
`crates/toolkit-host-helper/src/main.rs:28–40` replaces an oversized already-produced
result with `{kind:"rejected",code:"response-too-large"}`. The backend facade at
`src/node/game-profiles.js:12–15` throws that code without a committed receipt.

**Observed, using only helper CAS to create the initial state:**

1. Fresh owned repository, `n = 6*1024*1024 + 128`.
2. CAS missing state to `{...emptyStore, retained: 'a'.repeat(n)}`. Reply is
   `committed`; helper read is `ready`.
3. CAS revision 0 with `{...emptyStore, revision:1, added:'b'.repeat(n)}`, omitting
   `retained` as supported by F1's extension preservation. Proposal JSON is
   **6,291,845 bytes**, comfortably below the **12,582,912-byte** frame limit.
4. Helper reply is **rejected / response-too-large**, but canonical revision is
   **1**, both 6,291,584-character values are retained, and the committed `.backup`
   manifest's after hash matches the **12,583,316-byte** canonical file.
5. Subsequent helper read is also rejected / response-too-large. The direct
   canonical Rust API reads the identical bytes as **ready, revision 1**.

The canonical file before SHA-256 is
`6af13bbd478560939e884622b2d23f10b150c73a71c4976bb64729c6f14177e7`;
after SHA-256 is
`7a50e452302f047f17a9cd34beda2bd7d101fc014bf540ff63e2107496bdb9b9`.
No crash, corrupt input, exotic JavaScript, oversized request or external writer is
needed. No data disappearance was observed, but the caller loses the true commit
receipt and the hosts disagree on whether a normal committed store is readable.
A bounded rejection frame alone does not satisfy transaction-result preservation.

Exact finite reproduction and retained result:

```powershell
node 'S:\Projects\UCP\de-research\review-canonical-core-c1-r1\oversized-helper-only.cjs'
# review/oversized-helper-only.json and .log
```

**Smallest corrective direction:** define/check the final post-preservation
metadata/result byte budget in the canonical backend **before backup deletion,
journal creation or canonical mutation**, so both hosts enforce the same rule.
Account for the serialized result envelope/escaping, and retain pre-existing
oversized data unchanged with an explicit diagnostic. Do not truncate extensions.
Alternatively, preserve a truthful committed receipt plus a bounded means to read
the full supported snapshot; merely relabeling this as unknown-outcome leaves the
newly unreadable state unresolved. Root chooses the byte-contract detail; it must
not become a second Node policy. Add the omitted-extension reproduction and
boundary cases, asserting rejected writes leave all canonical/backup bytes exact
and accepted writes return a usable durable snapshot through both transports.

### C1-02 — P2 / commit blocker: the queue limit is enforced after unbounded pre-admission copies

**Owner:** C1 Node transport owner. **Location:** `src/node/core-client.js:143–151`.
Every request synchronously serializes and JSON-parses its complete operation at
line 144, then awaits `ready`. The count/byte admission checks run only at line
149. Even a resolved `ready` yields to a microtask, so a burst can retain arbitrarily
many encoded Buffers and parsed snapshots before any request occupies `pending`.
The advertised 17 in-flight / 24 MiB admission limits therefore do not bound this
part of the client. The reader and helper's own bounded queue do not fix it.

**Observed finite probe:** connect normally, then synchronously create 64 calls to
`client.request({op:'validateStore',store:{...emptyStore,extension:'x'.repeat(1MiB)}})`
before awaiting their results. Before microtasks run, `pending.size` and
`pendingBytes` are both zero, while array buffers have grown by **67,117,760 bytes**,
RSS by **194,564,096 bytes** (about 186 MiB), and the synchronous burst takes
**315.29 ms**. Only afterward do 17 requests fulfill and 47 reject as queue-full.
These are one local synthetic Node control-plane observation, not game/frame or
application-startup performance, and not a universal numeric threshold.

```powershell
node --expose-gc 'S:\Projects\UCP\de-research\review-canonical-core-c1-r1\client-admission.cjs'
# review/client-admission.json and .log
```

**Smallest fix:** synchronously reserve a bounded admission slot before large
serialization/snapshot work and before the first await; include preparing/waiting
requests in that accounting, enforce the byte budget while encoding, and release
reservations on every rejection/cancellation/failure path. Reject overflow before
copying its payload. Preserve immutable submitted snapshots and existing queued
versus accepted cancellation semantics. A deterministic burst test should show
that overflow never enters serialization and reservations cannot leak, including
while the hello is pending. No renderer rewrite or unrelated benchmark rerun is
requested.

## Explicit disposition of prior findings

- **Review11 R1 (common 64-container/Unicode/BOM/safe-number/serialized snapshot
  domain): CLOSED for the original obligation.** Independently ran all 26 current
  direct/core tests and the 90 real-helper transport/profile tests. The 64-container
  bound includes store/profile wrappers; an added direct/helper profile-extension
  probe accepts 61 child arrays plus three wrappers and rejects the 65-container
  counterpart before creating a store. Unknown extensions and returned/durable
  equality survive omitted-field CAS. UTF-8/BOM, unpaired surrogates, safe-number
  lexemes and serialization-after-preservation cases remain checked. The new
  transport-byte failure C1-01 is separately open.
- **Review17 R4 (raw duplicate decoded names, hidden invalid branches and rollback
  authority): CLOSED.** Source inspection confirms the raw token preflight runs
  before serde collapse, keeps a decoded-name set per object, validates every
  raw string and counts raw containers. The 23 rejected/4 valid shared raw stores
  run in both focused selections. Added 11 independently generated malformed
  sources include the exact original hidden high-surrogate case, escaped NUL,
  quote/backslash and non-BMP duplicate keys, array-contained/profile-extension
  duplicates, hidden unsafe/-0 numbers and 65/130-container branches. Each is
  rejected by direct Rust parse and the actual helper. Read/CAS/migration, with
  and without an existing retained backup, leave exact inventories/hashes intact
  (**132 additional repository checks**). External pending-before and committed-
  after journals for all 11 inputs fail closed through both transports, retaining
  snapshots, manifest, displaced bytes and a pre-existing restore sentinel
  (**22 directions, 176 operation checks**). Repeated attempts agree. Valid
  separate scopes, normalization-distinct names, member-like string text and
  safe integer endpoints still commit, preserve and cross-read. Current-writer
  actual valid-metadata process exits still pass; constructed bad legacy journals
  do not replace that crash evidence.
- **Review11 R2 (JS exotic/coercing input): remains CLOSED.** The second production
  validator is removed; generic wire serialization rejects proxies, accessors,
  sparse/extended arrays, cycles, custom prototypes and other non-JSON values.
  Supplied coverage plus six added cases (including revoked proxy/null-prototype
  accessor/array subclass) execute zero user getters/coercion hooks. The generic
  serializer's admission timing is the distinct open C1-02.
- **Review11 R3 (declared CLI/cb/metadata-root ranges): remains CLOSED within
  structural recognition scope.** The extraction diff leaves the range algorithm
  intact apart from a lint annotation; shared PE/CLR cases and all 22 declared
  mutations pass through the same source directly and through the helper. Binary
  versions, complete CLR loading and game compatibility remain unverified. This
  review did not reread or launch installed game binaries.
- **Review11 C1 suffix-junction false negative:** accepted nonblocking gap retained.
  Lexical suffix/root aliases retain their tests; unrelated-basename junctions to
  the UCP suffix are not claimed supported.
- **Review17 C2 contention EPERM:** no recurrence in this review's mixed 32-revision
  test or independent-helper contention. The original log/hash and unknown cause
  remain as recorded in handoff09/Review17; this is not a diagnosed Windows cause.
  Source maps only `AlreadyExists` to busy, never arbitrary permission failures.

## Ownership, actual artifacts and unaffected performance paths

**Source-confirmed:** `toolkit-core` is the sole production F1 detection/metadata/
journal implementation. `src-tauri/src/profiles.rs` is a re-export and the Tauri
manifest links that crate; Node's 38-line facade forwards requests. The independent
old Rust source retained outside Git hashes to
`d5e82966ce93d819bb5a96cb8d9d5e404fcf707f7c6f6807792df4a583f7363f`.
An independently retained extraction diff shows DTO derives, raw/wire depth
parameterization, borrow-only persistence cleanup and moved/adapted tests; no
second parser/journal or policy fallback was introduced. Cross-transport tests
now correctly exercise one source over two call paths, not independent algorithms.

Rust owns DTOs/envelopes; real `export-types` enables cross-crate generation.
The independent generator scratch-copy probe passes current/restored outputs and
rejects stale content, an obsolete file and an obsolete subtree. The desktop
inventory source excludes only a top-level **directory** named `core`; a file
named `core`, unrelated files and nested `other/core` remain checked. Its two
passing native inventory tests are inherited, not rerun here.

The helper uses an absolute hash-checked resource path, shell-free private pipes,
`windowsHide:true`, no PATH/socket launch, bounded frames/worker/output queues and
a cancellation reader separate from the blocking worker. Supplied and new probes
cover malformed UTF-8/BOM/duplicate/extra-field/ID frames. Queued cancellation and
EOF cancel queued work; accepted writes finish with their real results within the
normal size domain. Deliberate helper death reports unknown-outcome without blind
write replay. No kill-on-cancel, fallback policy or stale-lock stealing was found.
The facade caches one connection for an eventual main process; no app consumer is
wired yet. C1-01/C1-02 are the concrete remaining boundary exceptions.

The shared resolver is used by build, generation, facade and tests; its focused
alias/per-checkout/external-output cases pass. Windows default output is on C:
for this S: checkout; explicit external S: override remains supported. No real S:
default is embedded in these production/test resolvers. Programmatic packaging
passes absolute resources before builder resolution and explicitly sets
`publish:'never'` for dir/portable. The two actual retained **directory artifacts**
were independently opened and rehashed: all three external resources, 21 manifest
inputs, helper hello, actual archived five client/contract files, app.asar and app
executable match the receipts. The helper/notices are outside ASAR. The 24 registry packages resolved for Windows have notice entries; the helper
lock also retains non-Windows libc (25 registry entries total). Independent
filtered Cargo metadata matches the manifest and Tauri lock; the build validates
the resolved graph against
Tauri and captures dirty inputs/config hashes without shipping config contents.
A manifest is an integrity/compatibility check, not an authenticity signature.

No new target-support objection: Windows x64 is the existing first artifact gate;
Linux/macOS native compilation declarations remain. Neither another target nor a
portable/installer artifact was exercised here. Package creation/MSRV/build results
in handoff25 remain inherited; this review verifies retained artifacts rather than
claiming to have rebuilt/repackaged them. No packaged application was launched.

Renderer/workers/caches and main/preload consumer paths are unchanged by C1. The
history explains retained worker scenes, latest-only pending frames, terrain/GPU
texture reuse, settled analysis/fire work and camera reuse; none is displaced by
this backend extraction. Future integration must retain those paths and avoid
per-frame RPC, scene/atlas copies or decode. The inherited 12-sample packaged-helper
medians (hello 15.84 ms, synthetic probe 0.69 ms, empty-store CAS 3.38 ms) and maximum
queued cancellation 34.89 ms are honest finite metadata/control-plane observations.
They are not game probes, frames, context binds, raw 8 MiB document open/save or app
startup measurements. Context/raw APIs do not exist in C1, so those benchmarks stay
deferred. C1-02's measured burst concerns this new control plane only.

Offline abandoned-lock maintenance still requires every writer stopped/verified;
partial journal cleanup remains fail-closed for manual inspection. Process tests
do not establish hardware power-loss durability. No raw document/UI/context/asset
integration, renderer whole-store CAS or active DE capability was added. Those
later gates and the full user workflow remain root-owned, not new prerequisites
invented by this bounded review.

## Independently executed checks and reproduction commands

Node `v26.7.0`, rustc `1.98.1 (48a229cea 2026-09-01)`, cargo `1.98.1
(797e8a9bc 2026-08-05)`. Exact retained drivers live in review/; each child process
uses explicit Toolkit cwd, no shell and hidden Windows execution. Normal helper
launches come from the inspected client. The direct scratch Rust probe calls the
actual path dependency; it does not reimplement policy and installs nothing.

```powershell
# cwd for all commands: S:\Projects\UCP\AI-Toolkit-DE
$review = 'S:\Projects\UCP\de-research\review-canonical-core-c1-r1'
# fixture-output/resources contains copied, independently hashed default-package resources.
$env:TOOLKIT_CORE_OUTPUT = "$review\fixture-output"
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = "$review\focused-node"
node --test --test-reporter=spec tests/game-profiles.test.js tests/core-client.test.js tests/core-helper.test.js
# observed: 90 passed, 0 failed/cancelled/skipped; review/focused-node.log
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = "$review\focused-rust"
$env:CARGO_TARGET_DIR = "$review\target"
cargo test --offline --locked --manifest-path 'S:\Projects\UCP\AI-Toolkit-DE\crates\toolkit-core\Cargo.toml' --lib
# observed: 26 passed, 0 failed/ignored; review/focused-rust.log
cargo build --offline --locked --manifest-path "$review\direct-probe\Cargo.toml"
node "$review\independent-boundaries.cjs"
node "$review\inspect-artifacts.cjs"
node "$review\dependency-audit.cjs"
node "$review\generator-boundaries.mjs"
node "$review\oversized-helper-only.cjs"
node --expose-gc "$review\client-admission.cjs"
```

The original scratch-probe lockfile was generated offline from existing cached
packages on its first build; the recorded locked command reproduces it thereafter.
An initial scratch audit incorrectly compared the full cross-platform lock (25)
with the Windows dependency manifest (24); its failed assertion/log are retained
as `dependency-audit-initial-full-lock.*`. Correcting the audit to use actual
Windows-filtered Cargo metadata passes; libc is the legitimate non-Windows-only
entry. This was a review-probe assumption, not a product defect.
Generator negatives return expected nonzero exits in the scratch copy. Probe
observations are not represented as passing new product tests. Full broad JS/native
regressions, native inventory build, MSRV, affected Classic checks and package builds
were not repeated here: handoff25 supplies inherited 26-on-1.88/helper build,
35 Classic and 2 inventory results at the matched bytes. Root coordinates a stable
combined regression after the bounded corrections and DS1 settle. No historical
renderer benchmark rerun is required for this source scope.

## Exact reviewed source and artifact pins

The following are independent SHA-256 comparisons, not Git HEAD proxies.
`review/source-pins.json`, `artifact-pins.json` and `review-evidence.json` retain
machine-readable comparisons and hashes of review drivers/logs/results.

| Toolkit-relative source/input | SHA-256 |
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

Actual retained package identities (each helper is 390,656 bytes):

- S: override helper: `766e4744ed19e9e280bf28ac7e6c9aea7b9d30d3c16bf643b7c08eb58e165243`.
- S: override manifest (8,009 bytes): `0c64096eb544ce2094f4496cec27c255d75241a07d9dda7898724086697379f4`.
- C: default helper: `a7184e5781260ec95ddaf448f2ea5a0a60f37a961cfa730d992f93331ef2793c`.
- C: default manifest (8,009 bytes): `913f545b25296ad19aea4f447d01eb21e409d1e5d6ee33fddb17a78d26984b17`.
- Notices, each 243,336 bytes: `974deefc4404f206920e0b19ee2b02a32790703464c76483aaff86429c6a2829`.
- app.asar in both: `3779328bc6b7734002cd463822e60428f2ec9d5049f25507d837c62f950530ff`.
- Unlaunched application EXE in both: `31d43489073029efcc6c0f9ed74b4bd20b43f9c90c67fa3c2d14283347cbe6b1`.

The retained directories are
`S:\Projects\UCP\de-research\canonical-core-c1\resume-validation-20261023\artifacts\default-package`
and its sibling `override-package`. Both actual hellos agree exactly with their own
manifest: protocol1.0, schema1, x86_64 / x86_64-pc-windows-msvc, frame12582912,
reserved raw8388608, queue16; contract
`73f6fa9758bb58bcfd4a01ffb74947db053768b6033df1a87410c406cedf5121`, source
`c2af3cc31e91ae87d8003089126486d265417535b41be32d2476c2ed6d570c46`, build
`134edd552e7697aac6f44445e17ce93d5b7de8011926bc5d68ba6c6674988c22`.
Different executable hashes across independent builds are recorded honestly;
byte-reproducible builds are not claimed.

Return this bounded review to the C1 owner for C1-01/C1-02 and a fresh exact
handoff. Preserve the now-closed raw-domain/recovery behavior and all original
receipts. No source fixes or additional feature scope were taken by this reviewer.