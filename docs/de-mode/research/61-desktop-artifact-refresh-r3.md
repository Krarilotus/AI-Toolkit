# Final desktop artifact refresh — R3

23 October 2026. **Fresh R3 artifacts and packaged workflows are ready for root review.**
One old-cache preservation deviation is recorded below.
This handoff supplies fresh Windows x64 Electron directory packages, a native
release EXE/portable ZIP and finite actual packaged-helper workflows. It does
not accept the source reviews, physical desktop Close, native dialogs/paint,
smoothness, playable export or the full DE goal. Root owns those gates,
integration and commits.

## Authority and ownership

Read goal00, contract01, plan02 and standard05 first; then full53/54/58/60,
relevant44/45/25/39, native-parity, iso-scrub-performance and the existing
build/packaging policy. The resumed full goal supersedes the historical pause.
No persistent goal change or child delegation occurred.

Every Toolkit exec used explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`, branch
`de/separate-game-mode`. HEAD stayed
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`. Shared mode is not worktree isolation.
Only this report was handwritten inside Git. Product/core/consumer sources were
read-only; existing generators/build owners produced their normal outputs.
No teammate file was restored. No commits/push, CI/dispatch/PR/merge/release,
installer publication, Toolkit/game/Steam UI launch, live/original profile or
settings write, Classic checkout change, OpenSHC/Ghidra mount, Python helper,
blocked legacy-directory sweep or name-based process kill occurred.

All new binary payloads, source copies, test files, logs, receipts and research
drivers are outside Git at:

`S:/Projects/UCP/de-research/desktop-artifact-refresh-r3` (**evidence/** below).

Evidence labels: **observed** means executed/read in this refresh;
**source-confirmed** means pinned source/build inspection; **inherited** means
prior evidence at its own pins without a rerun; **unverified** means an open gate.
Reports59/62/63 and central acceptance records remain other owners' work.

## Independent review update and final payload check

Root subsequently confirmed core59 GO (all four findings closed) and narrow
Close62 GO (six independently authored Chromium component cases). Both reports
were read and pinned in `post-root-go-payload-verification.json`. These are
independent source/component verdicts, not native-window or full-goal acceptance.
The empty-diagnostics/blank Error presentation observation remains a nonblocking
P3 for adjacent presentation work; no fix or artifact hold was requested.

A final read-only check after those GO reports again finds75 frozen input hashes
unchanged,62 current archived source matches,90 current helper-manifest input
matches, all recorded raw retained payloads unchanged,25 ZIP entries exact and
11 embedded native assets exact. No generator/build/source edit was required.
The final bounded check exits0 and reaps all its own descendants.

## Frozen inputs and expected output differences

Observed entry, after-frontend, after-Electron, after-native and final captures
all retain the75 captured input hashes with **zero drift**. This includes the
canonical core/native correction, final consumerR3, D1/DS1/schema/pin and
protected optimized Classic workers/editors. The75-file inventory and physical
source copies are in `entry-source-pins.json`, `final-source-pins.json` and
`source/`; final verification additionally checks four frozen review/handoff
reports from the original53/60 receipts. The43 native source/build/resource
inputs are separately inventoried in `final-verification.json`. No HEAD-only
identity replaces working-byte hashes.

Pinned authorities verified:

- Report53: `ca57ad8bd49acee30aa09667212b16476335b50336f46b8e81ed0c2b5325f808`.
- Core53 `handoff-source-pins.json`: `8ab4bc656799398b50e3d162e5ba814bc3e0e751e94a911b9f77de0d3cba4627`.
- Report54: `236f0a6384775b6e45d00cbb2c662088d304d6eb8451129c4818c11011ff9e97`.
- Review58: `e5b61775556a1a1d1b45873ff434737bf174eb500fe75cde3d88628d4dbd8dbf`.
- Report60: `6550cd9a9b9590d3f9ba9c32fadea49132e261a224e26a792fb55e3e44942d38`.
- Close freeze receipt: `73190613b4c6f713578930af2180fcd4e4a80bc905dbf8fd089725d0631c1df3`.

Final three60 source hashes are unchanged:

```text
9ffabab1ddf7273f62ae7013b3972de62d6e6f276cae1235ec90452b1816fde0  src/js/de-lord-controller.js (14251B)
5812bb193cd2908291c0ce42f07c55fbd794953e0037063a20e444f27dde3491  src/js/de-lord-panel.js (21936B)
fc15101036f59e1fe946d1f6cc31ac81abb24f4f35b24b713689cb1a82563713  tests/de-desktop-controller.test.js (42377B)
```

The Rust DTO check and real frontend build pass. The sole generated entry bundle
that changes from entry is the expected final-R3 `src/js/de-editor.js`:
109832B, `dfb5b52e4d8aeca95b0b9cf22ae5d017da8cd7baa8d6c262240f69afec15e8aa`.
The other generated DE entries are stable and all three remain ignored.
`desktop-dist` applies the existing additional minification pass; its corresponding
editor is `187bf8944d1e60099970637859add754706ce8b1b624e48e2b3bf949b1a1d962`.
Those transformed bytes are expected, separately hashed, and verified in the
native EXE. A source bundle is not incorrectly compared with transformed output.

Existing theme/locale generators and native notice preparation produce no semantic
Git diff. `normal-generator-side-effects.json` records exact HEAD/working hashes
and newline-normalized equality for those six outputs. `THIRD_PARTY_NOTICES.txt`
now appears physically modified after normal generation, with no semantic diff;
its shipped SHA is `aff883396a983df8d4a6ecc93929b292c6149a795199fd8888d75ed267361c99`.
No generated output was hand-fixed or restored.

## Actual Electron artifacts and resource identity

Observed both directory packages were built by the existing
`build()` / `packageElectron('dir')` owners with publish `never`. The existing
package verifier passes against current frozen sources, not53's old ASAR.
The exported existing package function was used as in45; no full unchanged
`npm check`, portable Electron installer or new packager is claimed.

- Explicit S: override: `evidence/build/electron-package/win-unpacked`.
- Actual default C: output:
  `C:/Users/Krarilotus/AppData/Local/Temp/toolkit-core-builds/951527c00ae0fdb4c27c2daf/electron-package/win-unpacked`.
- Byte-verified retained default package:
  `evidence/default-retained/electron-package/win-unpacked`.

The C: default is the existing portable per-checkout resolver, not an override
masquerading as a default. C: output to S: checkout cross-volume packaging passed.
Only the existing tool-owned default cache was reused; nothing ambiguous was
deleted or moved. The fresh default package is retained independently of that
mutable cache.

`electron-artifacts.json` records every manifest input, all25 resolved dependency
notice entries, actual resource sizes/hashes, raw actual helper hellos, runtime
metadata and31 extracted archived files per package. All45 manifest input hashes
match current sources. Actual archived main/preload, private facade/client,
bootstrap/entries, controller/panel, DS1/D1/schema/pin, generated protocol and
routes match current source bytes. The helper executable/manifest/notices triplet
is adjacent to and outside the actual ASAR; no triplet is hidden inside it.
Development package.json is3155B while the builder-pruned runtime metadata is420B;
main/name/version match. This expected builder pruning is recorded instead of
requiring the wrong byte equality.

Both actual executable EOF hellos exactly match their own manifests and each
other, including protocol/schema/limits/source/build/contract/architecture/target:

```text
protocol 1.3, metadata schema1, x86_64-pc-windows-msvc / x86_64
interface  d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191
types      5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96
contract   509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace
combined   ee8d4f79e03878d26468eb12322e4f70fb4cf958f482ef0584f1c3443fee9685
sourceId   7761711553934d8949e78ccb067040ccfbb50f6f7cb1a70b8ce421a79ad149b6
buildId    c9ffabcdc24359ce3a6abf82f0c4bb0de871a036cdc48c1afcef37b0707257c3
frame12582912, raw8388608, metadata8388608/result8389632, queue16
```

Different default/override helper executable hashes are retained honestly; their
full source/build/hello identities agree. Exact payload hashes are in the table
below and complete receipts.

## Final native EXE and portable ZIP

Observed release compilation completed exit0 in2m06s, reusing53's existing
`native-target` Cargo cache. Final outputs were then copied to fresh owned paths;
the superseded53 payload was not reused as a current artifact. Reusing that target
**did replace53's cached release EXE before a separate old-binary snapshot was
taken**. This is a preservation deviation: the old10950144B EXE with SHA
`a4bdae8b3ac85b36e1a9138b477a126c04354a81354219d9ac51077bd11ea9df`
is no longer at its old cache path. Its immutable hash/build receipt remains,
but that is not preservation of the binary. A bounded named-EXE search found no
second copy of that size. `superseded-preservation-check.json` verifies the other
nine receipted53 payloads (ASAR, Electron EXE/helper/manifest/notices, debug rlibs
and allocator witnesses) are unchanged. The fresh final R3 outputs have independent
retained paths. No old payload was relabeled R3, and no old receipt was rewritten.
The native build command explicitly recompiles final core/application and embeds
the rebuilt frontend. `native-core-build-output.txt` records its in-process
source stamp `7c2583f95afc56182ceb3750125621909dc5dbcbef1c2525d34235f6a90c2349`,
release build stamp `772713fdf5c10243c09012891cfa51e7ff798fbb619aca6b6e5e13ccb180684b`
and the same combined contract/Windows target. This is inspected compile output,
not an executed native-window hello. The narrower native source inventory and
release profile need not equal the wider helper's inventory or53's debug rlib.

Existing `archivePortable`, `auditFrontend` and `validatePackagePolicy` produced
the actual ZIP: **7,611,069B <8,000,000B**,25 entries, **123 permitted images with
exact source bytes**, zero resizing/re-encoding. Every ZIP entry was extracted,
verified and retained under `native-observation/`; EXE is also at
`native/AI Toolkit.exe`. The existing supplemental migration ASAR and its
executable binding are created and verified by the canonical archive owner.
Actual NSIS build/installer behavior is outside this assignment.

`native-artifact-receipt.json` records all images, entries and extracted payload
hashes. `native-embedded-proof.json` independently decodes build-generated assets
and finds the same encoded bytes in the final EXE for11 key frontend/CSS/retained
worker assets. That includes the final R3 editor and startup/Classic entries.
Copied encoded evidence is retained outside the reused build cache. These are
artifact/source checks, not proof that an OS window painted those bytes.

`AI_TOOLKIT_USER_DATA` resolution, native WebView data-directory routing and
fresh DE/Classic startup bindings retain their frozen source pins. Actual
compiled route selection and directory use remain root's native observation.

## Fresh finite actual packaged workflows

Observed both override and retained-default packages execute the actual archived
private facade/client/context/wire adapter, real DS1/controller and their own
matching packaged helper. Only dialogs and the small panel adapter are synthetic.
The actual archived panel/bootstrap/main bytes are verified, but that is not
execution of Electron, Tauri/WebView, OS input, paint or physical Close.

Fresh receipts:
`packaged-workflow-results.json`,
`default-smoke/packaged-workflow-results.json` and
`packaged-negative-results.json` all report success.

The53 drivers were copied into this fresh output, never run over old receipts.
Their original hashes and scratch-only changes are retained in provenance files.
The old fake panel was updated to faithfully store the required synchronous
`setEditAdmission(predicate)` hook. Actual final Close records admission=false
before the helper command. Production's required barrier was not weakened.
An additional scratch observer drops an actual release acknowledgement; it does
not edit archived runtime modules or invent service outcomes.

Both package workflows establish:

- Read-only real-DE installation probe/reprobe, owned profile activation and
  raw Rat Open; no-op bytes; exactly one scalar token1→2; Save As/reopen; same
  operation reconciliation. All writes use fresh owned fixtures/profiles.
- Exact8MiB raw Open/save/digest and pre-aborted submission, with no accepted
  write for that pre-abort.
- Loss before adoption submission retains the original session; exact status
  after original-context recovery clears the absent transition and old authority
  remains save-capable. Lost persisted-ready acknowledgement retains old DS1
  until exact status resolves; lost committed-finish acknowledgement retains
  the installed DS1 and blocks Open/Save/Close until resolved.
- Lost release acknowledgement for an invalid candidate retains the original
  DS1 and owner; explicit original recovery allows Save As. Transient cleanup
  remains core-owned, not a second frontend retirement policy.
- Killing only the owned helper at Save Started leaves exact session/document,
  revision1, undo and unknown snapshot retained. Reconcile remains **unknown**,
  with exactly one save submission and no replay or target-byte success inference.

The actual packaged negative run additionally establishes exclusive stage
collision/equal/absent-equal refusal without deleting unowned sentinel/target
bytes; exact BOM/CRLF/duplicate/large-number writes; seven-identity receipts;
foreign-owner refusal; replay/reused-metadata behavior;160 invalid/lost reads
without durable candidate accumulation; boundary+1 refusal; rename failure,
owned-stage cleanup and persistent Close cleanup. The original53 raw-core
allocator/43 current+43 MSRV/native6/4/3/1/transport19 evidence is **inherited**;
these unchanged full selections were not repeated.

Rat remains source commit `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`, path
`Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/VanillaAIC/Rat.lordjson`.
Original/no-op5115B SHA:
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`;
edited5115B SHA:
`068529b36228490acfe0c730e4b797ad2109b4b1e4b0feb70ea7fd170ba61935`.
The raw8MiB saved SHA is
`efacfd678fa6be3aec3d836fae461a11f6cd30c14a98a377a8bd8072a9882838`.
The original source is rehashed unchanged at finalization. Its117 fields,
missing speech field, diagnostics/uncertified shape and unverified playable
semantics stay explicit. Nothing auto-fills missing game values.

## Validation, performance scope and reproduction

Fresh: canonical DTO `--check`, schema checks through real frontend builds,
both helper builds/packages and actual EOF hellos, native notice preparation,
native release/portable/embedded verification, both packaged workflows/negative
probes, and strict desktop TypeScript `--noEmit` pass. Report60's70 focused checks,
syntax and Chromium results are **inherited at verified final hashes**; no broad
unchanged unit/package suites were gratuitously rerun. No failed substantive
command is relabeled passing: all16 bounded command receipts exit0 and retain
logs. One initial direct post-GO scratch process check failed because it treated
PID reuse as a leak. The corrected check uses the retained PID/creation/executable
identities, records unrelated reuse and passes; no process was killed.
`failed-probes.md` and the original scratch script preserve that failure.
Scratch driver changes/provenance are explicit.

Finite explicit I/O/controller samples (override; retained-default), milliseconds:
initialization+bind14.11;13.87, DE preparation20.13;21.37,
reprobe/activation28.36;28.57, Rat Open/parse/adoption17.05;8.65,
no-op Save As5.30;5.83, edited Save As3.77;4.32,
8MiB raw Open41.16;48.96, save/digest/commit96.63;98.81.
Receipts hold exact decimals. These shared-host single samples are not a
statistical comparison, speedup, input-to-paint latency, frame/FPS or native
smoothness evidence. This refresh changed no hot-path source and adds no typing/
draw probe, hash/decode/IPC, queue/cache/invalidation or retained-scene policy.
Root still owns equal-workload native/Classic interaction observations.

Reproduce with fresh labels/output paths and explicit Toolkit cwd. Actual commands,
environment/tool versions, output parameters, PID identities, deadlines and exits
are in `final-verification.json` and each `.receipt.json`:

```powershell
$e = 'S:/Projects/UCP/de-research/desktop-artifact-refresh-r3'
node "$e/pins.cjs" <fresh-label>
node "$e/run.cjs" <fresh-label> node scripts/generate-core-contracts.mjs --check
node "$e/run.cjs" <fresh-label> node scripts/build-desktop.mjs
node "$e/run.cjs" <fresh-label> node scripts/build-core.mjs
node "$e/run.cjs" <fresh-label> node "$e/package.mjs"
# Default build/package: F2_DEFAULT_OUTPUT=1; remove it afterwards.
node "$e/run.cjs" <fresh-label> node scripts/package-native.mjs --prepare
node "$e/run.cjs" <fresh-label> cargo build --release --offline --locked --manifest-path S:/Projects/UCP/AI-Toolkit-DE/src-tauri/Cargo.toml --target-dir S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2/native-target
node "$e/run.cjs" <fresh-label> node "$e/package-native-owned.mjs"
node "$e/run.cjs" <fresh-label> node "$e/inspect-electron.cjs"
node "$e/run.cjs" <fresh-label> node "$e/packaged-negative.cjs"
node "$e/run.cjs" <fresh-label> node "$e/packaged-workflow.cjs"
node "$e/run.cjs" <fresh-label> node "$e/default-smoke/packaged-workflow.cjs"
node "$e/run.cjs" <fresh-label> node node_modules/typescript/bin/tsc --project tsconfig.desktop.json --noEmit
```

The retained scripts use immutable fresh receipts for provenance. A replay must
copy/adapt the evidence base first rather than overwrite this run. The original
53 receipts and nine other receipted payloads remain preserved; the native-cache
EXE exception above must not be read as preserved old binary evidence.53's consumer54 ASAR/native artifacts,
and44/45's protocol1.2 packages, are **superseded for current consumer acceptance**;
this61 is the fresh source-matched R3 artifact layer.

## Process shutdown and next native observations

All16 bounded wrappers report no live owned descendants. `process-cleanup.json`
checks72 captured PID/creation/executable identities and84 known execution PIDs,
including two actual EOF hello helpers, the negative helper and both workflows'
helpers. All matching processes and owned listeners are absent. The initial
inventory had no reused PID; the later post-GO check records unrelated reused
PIDs and compares exact creation/executable identities. None is mistaken for
ownership or terminated. Each workflow's five intentional fault helpers exits
by its exact ChildProcess handle/SIGTERM and its final helper exits0; the negative
helper exits0. Final finite helper close/reap runs in finally. No server/port,
browser or optional heavy tool state was created or left running.

Wrappers retain exact program/args/cwd/start/end/PID, creation/command identities,
600s deadlines, timeout/signal/exit cleanup over only their positively attributed
trees, and final empty remaining lists. Very short compiler/helper subprocesses
can finish between the periodic process censuses; direct helper handles and
exit receipts are additionally recorded rather than inventing their creation
metadata. No unrelated process is killed. This observed shutdown does not
promise recovery from an external forced termination of the whole harness.

Root can now use `native-observation/AI Toolkit.exe` and either fresh Electron
directory with **different fresh absolute** `AI_TOOLKIT_USER_DATA` paths. Verify
exact EXE identities and owned window/profile/WebView handles before observing
first-run cancellation, fresh DE binding, actual dialogs, real Rat edit/Save As/
reopen, pending/unknown and final Close behavior beside an unchanged Classic
window. Actual native input/paint/accessibility, physical Close destruction,
startup/default restart, recovery and Classic smoothness remain unverified here.
Core59 and Close62 are GO at their exact source/component scopes; root still
owns review63 reconciliation and integrated native acceptance.
The complete DE/castle/assets/media/package/game goal remains open.

## Exact final raw artifact fingerprints

Paths below are relative to evidence except the actual default C: origin noted
above. Full inventories include every extracted ZIP and retained default file.


| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| override / toolkit-host-helper.exe | 630784 | `408e2f5028588822dbae8a6699999e380bc564136466cc0079b5c0e588ed7eee` |
| override / manifest.json | 11588 | `add3d57d00a4d9007d563cf6a16b66e86cff9186dbc7583b58583e8d42002869` |
| override / THIRD-PARTY-NOTICES.txt | 255394 | `6ef2302cc575d7043909fe0f5416c6d1d1e546b8ac39e40d0d5eca01f9c41df7` |
| override / app.asar | 17150996 | `7e9a8e6cfb3b6a235f1c041d702926ffaa1c385caeca71310f83c806d28922a2` |
| override / AI Toolkit.exe | 246150144 | `81550421cb83cd8c46d0367c4b630fb8c2abe24dab4d4964f901b24563d80b08` |
| default / toolkit-host-helper.exe | 630784 | `d0409116d512dcb8f995bd20221e3dc69f54dd5b9ad3d6b09a3d825492615160` |
| default / manifest.json | 11588 | `36f78b4197f071090655640bafe0e7a0934b683ebeb18a3f2061798392d723a1` |
| default / THIRD-PARTY-NOTICES.txt | 255394 | `6ef2302cc575d7043909fe0f5416c6d1d1e546b8ac39e40d0d5eca01f9c41df7` |
| default / app.asar | 17150996 | `7e9a8e6cfb3b6a235f1c041d702926ffaa1c385caeca71310f83c806d28922a2` |
| default / AI Toolkit.exe | 246150144 | `81550421cb83cd8c46d0367c4b630fb8c2abe24dab4d4964f901b24563d80b08` |
| native / AI Toolkit.exe | 10950656 | `dc1125fa970b530436a128ff594458e28203ae74a70bb4825583f43c59e23d9c` |
| native / AI-Toolkit-F2W1-R3-native-owned.zip | 7611069 | `173cd90f55c3e722b24b08c8d251d8836d0036dc73709af837f179acc1c399dd` |
