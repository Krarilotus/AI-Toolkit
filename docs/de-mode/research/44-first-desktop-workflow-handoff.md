# F2W1 first separated desktop LORDJSON workflow

2026-10-23. Implementation handoff for root review; **not desktop/game acceptance
or completion of DE mode**. Actual checkout `S:/Projects/UCP/AI-Toolkit-DE`,
branch `de/separate-game-mode`; initial HEAD `f02d828`, coordinator advanced it
to `a55ea99542763e9103b1db5d6b494bd6390870a6` during this shared-checkout work.
No worktree isolation, commits, push, CI, PR, release, native Toolkit/game/Steam
launch, installed/original profile write or original Classic checkout change.

Read goal00/contract01/plan02/standard05 first, then adopted23, Reviews05/21,
complete25/39, DS1 handoff26/Review32, panel33/Review38/root43,
`docs/iso-scrub-performance.md` and `docs/native-parity.md`. C1's existing strict
profile/domain/recovery implementation, D1 and DS1 are unchanged. Their earlier
acceptance remains inherited; this report adds integrated consumer evidence.
`git diff --quiet f02d828 -- crates/toolkit-core/src/profiles.rs
src/shared/de-document-session.js src/shared/lossless-json.js
src/js/de-lord-format.js` returned zero.

## Outcome and ownership

Both hosts now bind the actual window before their lightweight startup route.
A recognized DE default routes directly to `src/de.html`; fresh folder selection
creates/binds a separate pending window, prepares/revalidates and commits there,
then loads the matching route. Existing windows retain their own root. Standalone
startup remains usable after cancellation. Classic keeps its separate original
editor and optimized renderer. This slice supplies raw LORDJSON Open, the one
accepted DS1 and panel, scalar edit, Save/Save As, exact-byte reopen and explicit
same-operation checking/recovery. Full in-place switching, DE castles, assets,
packages/media/loaders and playable export remain later gates.

Parent owns these production groups:

- `crates/toolkit-core/src/{context.rs,files.rs}` plus `context_tests.rs`,
  `lib.rs`, `contracts.rs`, `build.rs`, Cargo manifest and Rust DTO exporter.
- `crates/toolkit-host-helper/src/main.rs` and its lockfile.
- `src-tauri/src/{de_context.rs,desktop.rs,desktop/contracts.rs,lib.rs,storage.rs,windows.rs}`
  and `src-tauri/Cargo.lock`.
- Generated `src/desktop/generated/core/{types.ts,contract.json}` and this report.

The **one** child owns Electron/main/preload/private Node adaptations, shared
frontend/controller/wire adapter, new pages/scoped CSS, minimal Classic entry,
frontend/helper build integration, focused tests and [report45](45-desktop-host-consumer-handoff.md).
Its exact T3 taskId is
`node:delegated-task:command%3Amcp%3A542f4da2-47c2-4a8c-a32f-565878d5e80e%3Adelegate-task%3Af2w1-consumer-20261023-r1`.
Catalog and delegate result confirmed `codex/gpt-6.1-sol`, ultra/default; shared
checkout, no grandchildren. The initial frozen interface is outside Git at
`S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/interface-v1.txt`;
explicit amendments materialized in generated Rust contracts, not a parallel API.
No `de-assets-core` or central plan/acceptance/ownership record was edited.

## Canonical service and shipping paths

`toolkit-core::context::CoreService` lives for the host process. Tauri manages one
linked instance; Electron owns one private helper through the reviewed CoreClient.
The helper reader calls `prepare_operation` before its worker queue. Tauri calls
`prepare` before `spawn_blocking`. Captured contexts survive awaits; stale read
successes/errors fail publication, and A -> B -> A gets a different logical owner.

Private transport operations add `initialize`, `context` and `restoreContext`.
The host supplies `owner`; renderer APIs cannot choose owner/root, bind/inherit,
activate a profile, restore a supplied snapshot or submit repository CAS.
`ContextCommand`/`ContextResult` are canonical Rust enums, generated for JS/TS.
Context commands cover startup/current, activation prepare/commit/status, raw
read, raw save, same-operation reconciliation and close. Private `restoreContext`
uses the exact host-held original snapshot, revalidates its original profile and
fingerprint and changes the transport epoch while retaining logical owner identity.
It never reads a new startup default to recover an existing JS session.

A context separately carries logical `ownerId`, `transportEpoch`, window
`generation`, profile, detection fingerprint, resource/provider namespace and
configuration identity. Resource identity is a stable provider namespace; it is
**not** a claim that DE texture/resource content has been inventoried. DS1 alone
owns JSON bytes, history, document revision, dirty state and save snapshots.

Only explicit successful activation transactionally changes `defaultProfileId`
and `selectedByEdition`; startup, inheritance, focus and close do not. Existing
strict repository CAS/journal/legacy-byte recovery policy remains the authority.
Startup revalidates a default or unchanged-hash Classic migration candidate;
corrupt/future/missing/I/O states stay distinct. Failed revalidation leaves a
standalone context with diagnostics. Open documents reject same-window activation;
this feature uses a fresh window instead of exposing incomplete in-place switching.

Raw Open returns a discriminated `rawBytes` result with opaque document identity,
owner, path, filename hint and base64. The hint is not certification. It bypasses
Classic `documents.ts` AIV decoding and Character/template normalization. Raw
files cap at 8 MiB, frames at 12 MiB. Client synchronous immutable admission is
retained. Core preparation uses the same bounded reservation for the canonical
serialized command, including escaped paths/metadata, through an allocation-free
serde counting writer; aggregate allowance is 24 MiB, with no second payload copy.

`files::atomic_write` stages/syncs beside the destination and replaces it via
`std::fs::rename`; the original is never moved away first. Tauri Classic storage
calls that one writer through a thin compatibility wrapper. Existing Electron
Classic/library algorithms remain incremental migration work; no second DE save
policy was introduced.

Save operation identity is generated contract data:
`saveOperationPrefix + ownerId + '/' + documentId + '/' + saveId` (`save1/`).
IDs generated by the service contain no slash. The core validates opaque document
ownership, byte count and SHA-256, then records durable admission before commit in
owned user-data `document-operations`. Its receipt contains all seven DS1 snapshot
metadata fields and committed/failed/cancelled/unknown status. Same operation IDs
never replay writes. Opaque document registrations support explicit original-owner
recovery. A final-result persistence failure cannot turn a completed write into a
false failed receipt; subsequent disk reconciliation can remain conservatively
unknown. The core never parses a LORD projection.

Native public commands are `de_request`, `de_choose_installation`, `de_pick_path`,
`de_confirm`, `de_close`; Tauri injects `WebviewWindow`. `de_request` permits only
current/raw/read/save/reconcile/status; lifecycle/profile commands stay host-only.
Retained Classic desktop/game/library requests authenticate and capture the bound
root before worker scheduling. Supplied legacy roots can validate that binding,
never redirect it. DE is centrally refused by incompatible Classic services.
Existing Classic game/cache algorithms and cache directories are retained.

Two source-confirmed startup mistakes were corrected at their owners: main's
Classic directory preparation now waits for a final Classic context, and native
browser migration preparation is skipped for an actual DE target/default. Native
prepares the target profile before constructing its pending window, then commits
that same preparation after construction. Only the Classic index executes the
legacy browser migration script. Main starts with `restoreProject=1`; fresh or
inherited Classic windows preserve `restoreProject=0`. Native DE/standalone windows
have conventional decorations; Classic preserves its existing chrome. Every native
editor/detached WebView uses the owned `WebView` data directory. Electron resolves
`AI_TOOLKIT_USER_DATA` before storage imports; default is appData/AI Toolkit, matching
native. Actual tests used explicitly owned directories.

## Consumer integration and preservation

Report45 owns the full consumer API/file inventory. `window.deDesktop` is a narrow
bridge; the real controller explicitly adopts sessions only after complete parsing
and matching owner/generation. Save replies never recreate sessions. Intermediate
refreshes, pending writes, unsaved prompts, draft resolution, failed/cancelled Open,
late callbacks, unknown saves and original-context recovery keep DS1 authoritative.
The only panel additions are `hasDraft()` and a monotonic view-only `draftToken()`;
they expose no document projection or save authority. The token catches typing
while dialogs are pending; authorized discard takes effect only on successful
replacement. A mismatched/rejected/missing save response retains unknown state.

Both hosts build actual controller/DS1/lossless implementation, generated LORD pin,
schema and panel into `de-editor.js`, with scoped CSS and separate startup/Classic
entry bundles. `desktop-dist` does not depend on excluded shared source at runtime.
Generation checks use the existing owner once. No dependency framework or decoder
was added; `base64 0.22.1` moved from core test-only to production and is included
in actual helper notices and both lock graphs. Native notices already cover it.

## Evidence, costs and reproducible commands

All receipts, logs, source/artifact hashes, proprietary candidate copies and build
outputs are outside Git under
`S:/Projects/UCP/de-research/first-desktop-workflow-f2w1` (called **evidence** below).
`source-identity.json` pins parent sources; `consumer/final-artifacts.json` pins
consumer sources, manifests, dependencies, hellos and packages. Working-file hashes
are physical bytes; Git CRLF normalization is not game-document normalization.
The C1 source28 receipt remains `S:/Projects/UCP/de-research/c1-stage-receipt.json`.

Fresh in-process/adapter checks: nine new core context/opaque-I/O/admission tests;
full core/profile selection with a matching real helper; native storage4,
desktop/contracts7 and window/dependency3. The native suites check existing Classic
byte replacement, envelopes/config, generated bindings, readiness delivery and
window cleanup. Consumer report45 records focused controller/main/preload checks,
103 real transport/profile tests and 138 affected Classic checks. Browser evidence
uses the real controller, accepted panel and DS1, with synthetic dialogs/receipts;
it is not authenticated native-IPC or game evidence. Actual file receipts are
established separately below. An initial full core run failed11 helper-parity tests
because the old protocol1.1 manifest was deliberately still present after the
contract moved to1.2; matching-resource reruns pass. Initial offline helper build
required its promoted base64 lock entry. All failed preparation/driver receipts
are retained rather than relabeled successful.

Fresh final packaged observation loads the exact CoreClient, DS1, lossless module,
LORD pin/schema and wire adapter extracted from actual override `app.asar`, then
uses its actual packaged helper. `archived-probe-source-pins.json` pins those bytes;
`packaged-workflow-receipt.json` records the helper hello and exact files. It probes
`D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition` read-only,
activates an owned profile, opens a copied real Rat, saves exact no-op bytes, edits
only `lord.opponent_type` 1 -> 2, Save As/reopens exact bytes and checks the same save
operation. The original game/candidate files are unchanged.

Rat provenance: candidate inventory `acceptance-seeds/inventory.json`, source commit
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`; original/no-op SHA-256
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`, 5,115 bytes.
Single-token edited output is 5,115 bytes, SHA-256
`068529b36228490acfe0c730e4b797ad2109b4b1e4b0feb70ea7fd170ba61935`.
Its 117 fields/missing `opponent_type_for_speech` remain unchanged. The assessment
retains missing-field diagnostics, blocked canonical structure, uncertified typed
shape and unverified runtime semantics. Neither filename, preservation save nor
this edit proves a playable lord.

The same packaged probe passes 8 MiB raw Open/save/digest/reopen. Its pre-aborted
save cancels before admission. Intentional loss of an owned helper at Started,
followed by explicit original recovery, retains the exact DS1 object/document,
revision1, undo and logical owner, while transport epoch changes. If loss precedes
a durable core operation record, reconciliation remains unresolved/unknown; no
success is inferred from target bytes and no write is replayed. This is a known
honest limit, not a successful recovery of an uncertain commit. Report45 adds an
actual archived host/controller recovery trace. Disk-ledger interruption can also
remain unknown; the UI blocks replacement/close/new saves while unresolved.

Performance evidence keeps its scopes separate. Existing worker scenes, latest-only
queues, batching, dirty regions, terrain indexes, deferred work and cache policies
were not altered. Relevant native history includes d1bfed9/3b17169 and the retained
performance rationale. Profile hashing, byte decoding and IPC occur on explicit
Open/Save/selection, not typing/draw. Report45 compares the accepted panel baseline
with the real controller/panel in owned browser DOM tasks, including 1 MiB content;
120 input events per run perform zero IPC/hash/probe. Handler/task intervals are
not paint latency, FPS or native-window evidence. The packaged I/O timings are
finite single runs on a non-exclusive host; exact final numbers are in the receipt.
Root still owns equal-workload native Classic before/after observation.

Reproduce from explicit Toolkit workdir (no app launch):

```powershell
node 'S:/Projects/UCP/AI-Toolkit-DE/scripts/generate-core-contracts.mjs' --check
node 'S:/Projects/UCP/AI-Toolkit-DE/scripts/build-desktop.mjs'
# Bounded cargo drivers retain exact args, time, PID, exit and cleanup receipts:
node 'S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/run-final-native.cjs' core
node 'S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/run-final-native.cjs' build
node 'S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/extract-packed-probe.cjs'
node 'S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/packaged-workflow.cjs'
node 'S:/Projects/UCP/de-research/first-desktop-workflow-f2w1/package-native-owned.mjs'
```

The native owned ZIP uses the existing `archivePortable`/`auditFrontend` policy,
verifies every extracted entry, preserves123 source image bytes and stays below
8,000,000 bytes. This is an actual portable archive, not an NSIS installer check.
Electron default/override directory artifacts and exact input/ASAR checks are in45.
No app runtime was launched to obtain any build/package receipt.

## Root review and next isolated-app observations

Root alone accepts/integrates/commits this slice and updates central records. Add
these generated outputs to root-owned `.gitignore` before staging:
`src/js/de-start.js`, `src/js/de-editor.js`, `src/js/de-classic.js`; they are generated
by the real build, not source files to hand-maintain. Review the exact owned diff
and receipts, including the narrow panel hooks and admission boundaries.

Once the user is idle, root can observe the exact extracted native executable at
`evidence/native-observation/AI Toolkit.exe`, setting `AI_TOOLKIT_USER_DATA` to a
fresh absolute `evidence/observation-profiles/native-<run>` **before launching**.
Use the final Electron directory artifact from45 with a different owned profile.
Never launch the installed `S:/Projects/UCP/Tools/AI Toolkit` or original profile.

Observe first-run cancel/standalone; choose the real DE folder into its fresh
owned window; verify Classic scripts/preferences do not initialize there; open an
owned Rat copy; edit an existing scalar; Save As through the real modal picker;
reopen and hash exact bytes. Keep a separately bound Classic window and check its
root/assets/document, inherited-window restoreProject behavior, cancelled dialogs,
draft/dirty/pending-close gates, startup/default restart and actual desktop input
smoothness against an owned Classic baseline. Verify all relevant WebView/browser
profile paths remain owned. OS dialogs/native caption/paint/IPC, physical input and
mixed-window behavior remain **unverified** until these observations occur.

Full in-place switching needs its later freeze/drain/unsaved/adopt/recovery gate.
DE castle/assets/package/loader/game acceptance and broader Classic service/config
namespace cutovers remain open. Activation results are retained by the live service;
a lost backend can leave an activation reply unresolved, and must never cause an
old document to recover through a new startup preference. No unsupported feature
or missing field was filled in to make the first byte workflow appear complete.

## Process hygiene

During the root audit, parent had no live Python jobs; its earlier source-edit
Python one-shots exited. Child launched zero Python interpreters. The36 observed
Python processes ran `openshc-mcp/launch.py` ultimately under Codex app-server
PID42044; they were not launched/terminated by this implementation. Exact inventory
is `python-process-inventory.json`; idle/stale status was not guessed.

The child fixture was NodePID44008/parent42404, loopback5197; child stopped/reaped
its owned session19555 and verified PID/listener absent. Research wrappers now
bound tests/builds/packages and clean only their exact spawned descendants in
finally paths. Parent final Cargo wrappers have600s deadlines and PID/exit receipts.
All intentional helper-loss tests kill only their own synthetic helper and retain
unknown outcomes. No unrelated process was killed.

## Final r3 identities and disposition

Final core/profile run: **38 passed**, zero failures (29 retained C1 tests plus9
context/file/admission tests), matched to the final r3 helper; log
`final-core.log`, bounded exit0 receipt,10.09s test time. Native storage4 +
desktop/contracts7 + window/dependency3 passed; final release build exit0,
17:24:30.300-17:26:34.121 UTC. The frontend/controller source was frozen before
this build. Consumer final focused selection is46/46. Report45 distinguishes its
103 transport/138 Classic earlier source snapshots from fresh final package and
actual archived-facade recovery observations.

Final actual override/default helpers are578,048 bytes, contract hash
`13cd869e001e380eed5734ffb8178d4f4af50b74a5b53cbb2bbeffcfe6541785`, sourceId
`31ddc80a3d6a60729dbb56c72213f55143ac459818bf90db6d8d2e26a5caa685`, buildId
`7fefb08050ffb543ad7bcd1a4f232e552dd5492453e41d29edac99aacb83f4d9`.
There are45 exact manifest inputs and25 registry dependency notice entries.

| Final artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Native `AI Toolkit.exe` |10895360|`79ae01dd049b4236000e5888cf7749d84056fede1a9e3c240239b69f7e732cab`|
| Native owned ZIP |7590728|`848772a71f3b1eae7631c620b1c892475caa540bd6c5af5fa3ae44367493f41c`|
| Override helper |578048|`f524ac71745d47a3f4078eb152ad0deeabb74cfcc3b793eeb907a4c7a3fb0422`|
| Default helper |578048|`52a8dea51e61f1731e54669d5310ce51508f9691d86ec0ab6643fbfd15868421`|
| Electron actual ASAR (both) |17130625|`4f6e016d825147b4fdb0c130236798c0a42c4e38fb6497d16b631a5edb571940`|

Fresh r3 packaged workflow observations at17:28:20 UTC succeeded with the exact
sourceId above. Helper hash/spawn/hello21.42ms; fresh bind0.59ms; real DE
prepare19.95ms and reprobe/activation24.44ms; Rat Open2.53ms, no-op Save4.14ms, scalar Save3.37ms; 8 MiB Open42.39ms,
Save/digest/commit161.68ms; pre-aborted Save1.85ms including caller base64 conversion.
The receipt is authoritative for decimals (no averaged/threshold/FPS claim).
The prior packaged r2 raw I/O receipt is retained as
`packaged-workflow-r2-receipt.json`; its8MiB Open42.22ms/Save159.69ms are a finite
same-workload reference before the allocation-free metadata counting correction,
not a statistical native/UI performance comparison.

Final parent sources and receipt hashes are refreshed in `source-identity.json`;
consumer/dependency/artifact hashes are in45 and its final JSON receipts. Root can
now independently review this complete connected slice. The child completed with
no grandchildren; all owned fixture/helper jobs were reaped. Fresh
`final-process-cleanup.json` records zero owned Node/Python/helper processes and no
5197 listener. The old fixture PID44008 was subsequently reused by an unrelated
conhost; it was deliberately left alone. Root's completed OpenSHC audit and the
new binding lifecycle passages were passed to the child and read here. No mounted
OpenSHC/Ghidra service was needed for this implementation.


