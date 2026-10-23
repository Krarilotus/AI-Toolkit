# Independent F2W1 desktop consumer review — round 1

23 October 2026. **NO-GO for accepting/exposing this integrated slice until
F2-CONSUMER-01 and -02 are corrected.** One additional P3 concerns a late
Classic new-window callback. Backend Review49 independently owns its three
findings, including the document-retirement handshake required of this consumer.
This verdict concerns the first desktop LORDJSON workflow, not the accepted
C1/DS1/panel components or the full DE/game objective. Root owns corrections,
integration, acceptance and commits.

Read goal00, contract01, plan02 and standard05 first; then reports44/45, adopted23,
Reviews05/21, C1 handoff25/Review39, DS1 handoff26/Review32, panel33/Review38/root43,
the performance rationale and native parity contracts. The new integration needs
its own review despite those earlier component approvals. Explicit resumption
supersedes the historical pause; no goal state was changed.

Actual workdir for every Toolkit shell command was
`S:/Projects/UCP/AI-Toolkit-DE`, branch `de/separate-game-mode`. Entry HEAD was
`a55ea99542763e9103b1db5d6b494bd6390870a6`. Final HEAD is
`9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`: root reports a coordinator-only
docs/metadata/.gitignore milestone; the reviewed dirty production bytes did not
change. Shared checkout is not worktree isolation. This review wrote only this
Markdown file inside Git. Scratch sources, copied archived modules, probes,
receipts and hashes are outside Git in
`S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r1` (**review/** below).
No delegation, implementation/test/generated-file edit, restore, build,
dependency installation, commit/push, CI/PR/release, browser/native app/game/Steam
launch or live/original profile/settings write occurred.

Evidence labels: **observed** means executed here; **source-confirmed** means
inspected at the recorded bytes; **inherited** means prior evidence, without a
fresh execution claim; **unverified** means an outstanding acceptance gate.

## Findings and smallest owner-specific corrections

### F2-CONSUMER-01 / P2 — Close authorization can discard an unresolved save

**Observed with the actual shipping bootstrap, panel, controller and DS1 in a
synthetic Node DOM.** Open a document, commit an edit, and click the header's
Close window button. While its unsaved confirmation is pending, the panel's Save
button remains enabled. Start Save, then resolve the original confirmation as
Discard. `desktop.close()` is called while DS1 still has a pending save;
`canUnload()` is true, so the actual bootstrap's `beforeunload` handler does not
block. Dispose the window and settle the write as unknown: the old session still
has the unknown snapshot, but its window has already authorized destruction.

Receipt: `review/bootstrap-race-results.json`. It records Save enabled during the
prompt, one close call, authorized unload with a pending save, and final unknown
at revision1. The probe uses the existing synthetic DOM helper, actual DOM event
handlers and actual domain code; only the transport/dialog/receipt is synthetic.
It does **not** establish which input an OS modal permits on Windows. The
controller boundary nevertheless accepts this interleaving, contrary to the
required pending-dialog/write ownership contract.

**Source-confirmed cause:** `src/js/de-lord-controller.js:65–79` checks `state.save`
before awaiting the prompt, then checks only session generation, content revision
and draft token. Starting a save changes none of those. External Save/Save As
entrypoints at lines21–58/140–141 do not participate in `transition`, and do not
reject `closing`. Close sets `closing=true` at line131 before awaiting the host.
The header enters the controller directly (`src/desktop/de-editor.js:14–15`),
outside the panel's separate callback-busy guard. The panel's shared action guard
therefore does not close this hole. Backend close is not a replacement for the
controller's document/snapshot preservation obligation.

**Controller owner:** make transition and save initiation use the same lifecycle
admission. Exclude new external saves during replacement/close authorization and
after closing begins, including a Save As picker that was already pending; keep
the gate's explicitly requested Save possible through an internal authorization.
Recheck the current pending save immediately before destructive adoption/close.
Keep typing, scalar edits, undo and the accepted draft token behavior intact;
changes during a dialog must invalidate authorization, not silently discard them.
No DS1 algorithm, panel document model, host save policy or generic lifecycle
framework is needed. A focused prompt→save→discard regression through the actual
bootstrap plus Save As completion during close is the appropriate correction
check.

The independent direct-controller probes also reproduce Open picker/prompt→Save
→replacement, leaving the old session unknown while the new one can close. Those
traces reproduce from the modules extracted from the actual ASAR too. However,
the **current panel's busy guard prevents that Open/Save sequence through its
toolbar**. It is supporting evidence of the controller boundary, not a second
claim of an observed shipping UI failure. The header Close trace above supplies
the concrete consumer path. Ordinary late disposal save settlement still properly
updates the captured DS1 and does not refresh/adopt another session.

### F2-CONSUMER-02 / P2 — a missing bound Classic root silently selects another game

**Observed through actual Electron main and actual retained game-map source,
with a synthetic filesystem and authenticated Classic window.** Bind the window
to `/synthetic/classic-a`, make that root absent, and make only the resolver's
legacy default installation present. `list-game-maps` returns
`C:\Program Files (x86)\Steam\steamapps\common\Stronghold Crusader Extreme` and
its synthetic `foreign.map`; the window is still bound to classic-a. No real game
directory was read or changed by this probe.

Receipt: `review/main-probe-results.json`, `authenticated-missing-bound-root`.
`main.js:824` passes the captured root into `listGameMaps`, but
`src/node/game-map.js:533–535` replaces a supplied root whenever it does not
exist. `load-game-map`/`load-map-tiles` at main lines826–838 use the same resolver
downstream. `boundGameRoot()` rejects null only; this does not prevent fallback
from a vanished nonempty root. Ingress authentication and AsyncLocalStorage keep
the original string, but cannot make the downstream fallback authoritative.

**Electron/Classic adapter owner, with root coordinating the small game-map
exception:** make the explicit bound-root path refuse an unavailable installation
instead of choosing a default. Preserve any deliberately optional fallback for
standalone tools behind its separate no-authority entrypoint. Put that distinction
at the existing root-resolution owner so map list/read/tile paths share it. A
host-only `existsSync` check followed by the unchanged fallback leaves a race.
Do not add repeated profile probes, hashes or resource extraction, or copy the
map algorithm into main. One synthetic missing-bound-root regression covering
the retained consumers is sufficient. This is a context-isolation regression
gate, independent of DE asset implementation.

### F2-CONSUMER-03 / P3 — late Classic picker completion creates an orphan window

**Observed actual main in the synthetic Electron fixture:** begin
`load-file-in-new-window`, close its authenticated parent, then finish the picker
with an owned synthetic JSON file. Main creates a second window before the outer
ingress publication check rejects with `Window context closed before publication.`
The synthetic service returns the real core's `parent-not-bound` refusal for the
new binding. The new window remains alive and loads pending→startup/unavailable;
it is not destroyed. Receipt: the second case in `main-probe-results.json`.
No native HWND was created; window creation/lifetime here is the fixture's model.

**Source-confirmed:** main lines1012–1029 have no post-picker/post-read liveness
check before `createWindow`. The generic guard at lines29–35 runs after the
handler's side effect. `createWindow`'s asynchronous catch at lines375–381 leaves
non-activation binding failures open. Activation's caller has explicit failure
cleanup; the retained Classic new-window caller does not.

**Electron window owner:** use the captured owner's publication/liveness check
before creating or delivering into a new window after an await, and clean up an
owned failed fresh binding. Do not reselect startup defaults or manufacture an
inheritance source to keep a failed child alive. Keep Add Window inheritance and
`restoreProject=0`. This is a bounded lifecycle correction, not a new switching
framework or an additional source of root policy.

## Backend49 follow-through and preserved ownership

**Source-confirmed consumer lifetime:** every successful `readRaw` registers a
document before renderer parsing. Controller Open creates its candidate before
`setSession`, correctly preserving the old session/draft on error, but it sends
no retirement when rejecting that candidate or successfully replacing the old
session. Neither narrow bridge exposes a per-document release operation. Window
close is the sole release path; it cannot make repeated Open in a live window
bounded. Invalid/stale/foreign candidate results can likewise strand backend
registrations. Backend49 owns the reproduced 128-registration/129th-Open failure
and the persistent registry policy. Its correction must include an authenticated
retire/adopt handshake here: release an unadopted candidate and retire a replaced
document only after safe adoption and with no accepted/unknown save still owning
it. Do not free a registration merely because an OS dialog opened or a prompt
authorized discard; failed/cancelled Open must retain the original owner.

Root was notified of this source trace and the consumer findings during review.
Backend49 separately owns its reproduced temporary-file collision/deletion and
rejected-payload native-queue retention findings; those are not independently
reproduced or counted as fresh results here. Their correction must preserve exact
destination bytes, truthful unknown outcomes and one canonical admission owner.

The structural choices otherwise fit the original intent. Rust remains the
context/opaque-file policy owner; Node does not duplicate profile detection or
document serialization. Generated `writeOperations`/`resultKinds` from Rust are
consumed by CoreClient, rather than introducing another JS write list. Its
synchronous admission/call-time encoded snapshot is retained. DS1 alone owns
bytes/history/revisions/snapshots; seven-field receipt comparison remains there.
The private facade correlates transport noncommit/unknown receipts and never
manufactures committed outcomes. Missing/rejected/mismatched save replies remain
unknown and block a new save in the ordinary lifecycle.

Both DE entries bypass Classic `documents.ts` and its all-base64-is-AIV decoder.
Raw decoding feeds the one DS1/D1. Successful save replies do not recreate a
session. Recovery retains the same session/history/draft/snapshot and requires
the original logical owner; Electron's private adapter restores its retained
original context, not a changed default. Resource identity is explicitly a
provider namespace (`<profile>:provider-v1`), not an asset-content fingerprint;
`builtin-v1` is not evidence of versioned external DE configuration. No DE asset
or warm-cache acceptance is inferred from these placeholders.

Electron's early owned userData resolution precedes storage imports. Pending
pages are script-free, binding/activation completes before the startup route,
and eager Classic renderer scripts stay in index. Default/inherited routes keep
their documented restoreProject1/0 distinction. The central retained-IPC facade
authenticates actual sender/main frame, denies DE and captures the Classic
context before asynchronous scheduling. Root argument matching and ordinary
late result checks exist; findings02/03 identify remaining downstream/side-effect
exceptions. Tauri's command/entry sources use the same generated context types;
its backend behavior belongs to Review49. No second backend review is claimed.

The panel diff adds only `hasDraft()` and a monotonic view token. Prior captured
draft/error/stale-revision handling and root43's clean-revision correction are
retained. The fresh13 tests include cancelled/invalid/foreign/stale Open,
late typing, failed/unknown/mismatched saves, original recovery and disposal.
The new findings belong at lifecycle/root boundaries, not in the accepted parser,
session, LORD schema or panel algorithms.

## Actual artifact verification and evidence scope

**Observed read-only artifact inspection:** `artifact-inspection.json` independently
hashes both directory packages from report45, opens their actual ASARs and extracts
the runtime modules into review-owned scratch. All declared manifest inputs match
current source. Source/runtime bytes match in both archives, including main,
preload, private facade/context/wire, controller/panel, DS1/D1, canonical schema,
generated LORD pin/core contracts, actual bundled desktop entries, pages and CSS.
Electron-builder intentionally reduces packaged package.json to runtime metadata;
its name/version/main/dependencies match. It is not incorrectly required to equal
the development manifest byte-for-byte. Native desktop-dist entries match the
implementation's recorded hashes; minification/CSP treatment explains their
different bytes from Electron source. No shared build output was regenerated.

Actual Windows x64 artifacts, freshly hashed here:

- Both `app.asar`: 17,130,625 bytes,
  `4f6e016d825147b4fdb0c130236798c0a42c4e38fb6497d16b631a5edb571940`.
- Override helper: 578,048 bytes,
  `f524ac71745d47a3f4078eb152ad0deeabb74cfcc3b793eeb907a4c7a3fb0422`.
- Default helper: 578,048 bytes,
  `52a8dea51e61f1731e54669d5310ce51508f9691d86ec0ab6643fbfd15868421`.
- Electron application EXE, both packages: 246,150,144 bytes,
  `3c355958e098cf668f9de09e04f2fcbbe1341babb285c03c306ea866ea4d9ee4`.

Both manifests agree on contract hash
`13cd869e001e380eed5734ffb8178d4f4af50b74a5b53cbb2bbeffcfe6541785`, sourceId
`31ddc80a3d6a60729dbb56c72213f55143ac459818bf90db6d8d2e26a5caa685`, buildId
`7fefb08050ffb543ad7bcd1a4f232e552dd5492453e41d29edac99aacb83f4d9`.
The promoted base64 0.22.1 dependency is present in the manifest/notices. This
review did not execute either helper/EXE or rebuild either host. Real helper
hellos, Rat/8MiB saves, recovery, native executable/ZIP and browser performance
traces in44/45 remain **inherited**; inspecting their receipts/packages does not
relabel them fresh authenticated native/OS/game evidence.

**Observed checks:** 13/13 focused controller/host/preload tests pass with test
isolation disabled, so no test subprocess pool was spawned. Schema `--check`
and strict desktop TypeScript `--noEmit` pass. Independent probes expose the
three findings despite that green selection. There was no full-suite rerun,
expensive build or native UI launch.

Exact executed substantive commands (all with the explicit actual Toolkit cwd):

```powershell
$review = 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r1'
node "$review/capture.cjs"
node "$review/controller-probes.cjs"
node "$review/main-probes.cjs"
node "$review/artifact-inspect.cjs"
node "$review/bootstrap-race.cjs"
node --test --test-isolation=none --test-reporter=tap 'S:/Projects/UCP/AI-Toolkit-DE/tests/de-desktop-controller.test.js' 'S:/Projects/UCP/AI-Toolkit-DE/tests/de-desktop-host.test.js'
node 'S:/Projects/UCP/AI-Toolkit-DE/scripts/generate-de-lord-schema.mjs' --check
node 'S:/Projects/UCP/AI-Toolkit-DE/node_modules/typescript/bin/tsc' --project 'S:/Projects/UCP/AI-Toolkit-DE/tsconfig.desktop.json' --noEmit
node "$review/capture.cjs" additional
node "$review/controller-probes.cjs" "$review/archived"
node "$review/capture.cjs" final
```

Initial scratch driver mistakes are preserved in
`initial-probe-driver-errors.md`: the host fixture lacked screen.getDisplayMatching
after persisted bounds appeared, and the first archive extraction list wrongly
expected development build scripts to ship. Only scratch drivers were corrected.
The subsequent package.json difference was inspected and correctly classified as
electron-builder runtime metadata; production was not changed to satisfy probes.

Probe processes are finite Node jobs, with their own PIDs/times recorded in the
JSON results. No helper, server, Python process or browser tab was spawned by
this review. Tests used `--test-isolation=none`; synthetic fixtures clean their
owned temporary directories in finally/t.after. No long-running session or
service remains. Final process query matched only the currently executing
PowerShell query, with no review Node descendants. No broad executable-name kill
or old research-directory sweep was attempted.

**Performance:** protected renderer/worker/editor hashes match the earlier pins.
Retained scenes, latest-only queues, batching, terrain indexes, texture/geometry
reuse, dirty invalidation and deferred analysis are unchanged. The new input
hook increments a scalar; IPC/hash/raw decoding stays on explicit lifecycle/I/O
actions. This source review and synthetic DOM trace supply no new handler timing,
paint/FPS or native smoothness result. Report45's owned DOM baseline comparison
is inherited and honestly scoped; root still owns equal-workload native Classic
and DE interactive observations after corrections.

Remaining acceptance includes actual first-run/default/cancel routing, owned
fresh Classic/DE window pairs, OS pickers/modal ownership/close behavior, raw
open/edit/Save As/reopen through both native transports, failure/recovery and
native input/paint/accessibility/theme checks. No parser/package/test result
establishes playable export or game acceptance. Root should serialize the small
controller and explicit-root corrections plus backend49's authoritative fixes,
then obtain a fresh bounded review of the changed boundaries.

## Exact initial/final reviewed identities

`initial-pins.json` records the first51 files; `additional-pins.json` supplements
the11 later-inspected legacy/protected files before final capture. “changes” in
the supplement identifies newly added records, not changed bytes. Final capture
contains62 files, **zero source drift and zero report45 source-hash mismatch**.
The following SHA-256 values are identical at each file's first hash capture and
the final capture; this is physical working-file identity, not Git-normalized
game-document evidence. Full paths, byte counts, timestamps and artifact
provenance remain in the JSON receipts. No remote permalink is invented for
uncommitted production sources.

<!-- fingerprint appendix generated from review/final-pins.json -->

```text
e9a13891bf2356b9b80203ef9a0474b8b2170099d3f5fd87292af31bbebeb376  main.js (52263)
0644fe170ec70e6cf49ec0a566854516db7fdb2b65db3941c801ec4c60419367  preload.js (7141)
e69c3d5afa37ade29743f2b0b54edd2f7eb654dd55330913da6493439260b235  src/node/core-client.js (16837)
d0ab094cc43c0c3842276079e6278eab32ce9307e1d047f8207574fe2b3caf55  src/node/game-profiles.js (3090)
2defd3d063e2633132ac6d1017e6aeeaadc7a91cc8ef70414a333ece5bc14720  src/node/desktop-context.js (3211)
e6776ff9f52f861342f94ef3ee3acb9cffc4fc559228b9b686ac353fb79027c7  src/shared/de-desktop-wire.js (964)
c5581da7ff2bc95b6b46d2610d7536a0acf6a98da0da75319fc28d557b4f9b9d  src/js/de-lord-controller.js (8111)
bc3b59e79e00ea5a2013ece1738438a40df25c9b4fe232c89eb7a5cd4fb26278  src/js/de-lord-panel.js (18512)
e013156ec426fcee2e78886650bfec95c8bfc96b758272c29a0c56747a855d51  src/desktop/de-api.ts (2937)
6cc53ef8f3ecf55e2bafb26530fa35a4c197fca468f736dc730f929894078614  src/desktop/de-start.ts (1475)
63de59f46385f6ceddb14aeef428b7738fe5a77e0e5a3762f92ad0df286ebbf4  src/desktop/de-editor.js (1908)
dee9e1f5924adfffa1dac73a8e346f2d6837db7cd423c0aae099b88c51ae8f20  src/desktop/de-classic.ts (265)
ac2f95932cc6ca3514759bc08d8c4ddcb8189eea9f9b4616e5d8e26e392b28e3  src/index.html (58357)
64d791f3f379faed2522b79d8da4b9eaffeb36045687a69f20806f0f47e515ea  src/desktop-start.html (1103)
fda852e70d2e4fae0d5d487a04d717547f5b753b486b13373708f2165fc5f65c  src/desktop-pending.html (186)
1426098a386f8a87b5486b8a00e1f3e853862d27ab310cf8458299c17d2d8488  src/de.html (989)
7e2b0bf061a04cd5549719f96d0ba0f7ef6118e5826667eff38ae8958e8f1e56  src/css/de-desktop.css (1523)
c3179cee04788a5565b6554d58580cd28d1001f305b3ca676744b1fb8349b9b0  scripts/build-core.mjs (10212)
29e1dcda3196de28c6891a2ee320fa749376be60a73ae466c2bf9144636a6f66  scripts/build-desktop.mjs (3906)
6b2fe8fc9821de48d4148cc67ded1a5f39bfa125e8d76b1ff48f171452a5ecef  package.json (3155)
57363d0f4848708c6e3c604792fda105fa7f595c3a3e781a6b20be3a18f998a0  tests/de-desktop-controller.test.js (10351)
ddc2a802aba0232bca2a2021042c8b872367a585d157592aaea8f90d3f5bbbfc  tests/de-desktop-host.test.js (11557)
124efd9b7020d374db4798faea3c437ee64324413c66f5bddef8ba540292406b  tests/desktop-bridge.test.js (16616)
88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a  src/shared/de-document-session.js (8203)
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js (20999)
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js (25468)
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js (12614)
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json (33352)
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
8aeae13a13e986663f978725c5173612109e2cfeb0d3f76d2bb94c681a9c4bb8  src/js/iso-view.js (101762)
1b5457e38087825401dde194b4f8e3df5634568f3deb1f72f0cdd923830a144e  src/js/castle-editor.js (216693)
f0ebb1afe4a0ab3e4cf54058822376371f546642131650712868870191f6b5e7  src/js/character-editor.js (39737)
14c15102adc46be639e5778598f8f11d7d38c80ed016060f540cbbebe3ba377b  src/js/castle-gpu-worker.js (7381)
34b5c89f123073d66277bbfa7b24384980ba1e3647644b66f332a16bf6f73c20  src/js/castle-canvas-worker.js (2972)
c4c002329084e4e9f8152b4071c79675918faa66d21a6497bcb99147501a5171  src/js/castle-analysis-worker.js (509)
72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339  src/css/de-lord-panel.css (3452)
fec21e64793a36d0b706a7a058192ea97adbfca10615a0c9a2705ec82f78f707  src/node/core-build-paths.js (1812)
4420d3bf78a83cdd55e0bcaaf49fbe9d2c843ecd24d7f9f0fdd1255d3126ddc7  scripts/generate-core-contracts.mjs (2356)
dd1babe0b4ceb08814d78811443d593370b0593bc8e5b2cc946d7901388af1ec  scripts/generate-de-lord-schema.mjs (3754)
95afb1d67a9525b78587a9a4845fbef873e75d81d012e2a9c810058251284704  package-lock.json (233000)
0a23a7bd3e84be70c72920cf24ed233fc4a455f8645aa0742ab8f7ad156196b9  src/desktop/generated/core/contract.json (1321)
1b3cdd7fbd6d9f1d0f4add78f5d863b020f18c0ae4ff2ca3ce0ee81132c852a9  src/desktop/generated/core/types.ts (4567)
cc1d0d700dbe481280aecaef9684d36917fc51bd397d6e2cef3f649f2ef2700b  src/desktop/documents.ts (5106)
df5ad60ca72e2ac821738a5e5b432d2c95085983a0be1baad86f6771e4f56215  src/desktop/runtime.ts (2850)
ede070188ae5ce8259e4f0defb0e715622ff40bc29d9c05bbc3e98c6a31cf0d1  src/desktop/api.ts (14269)
95bdc5158db1bef7f14373de6ddfcced8a8edc4f0307a15159591522819c3754  src/desktop/types.ts (1471)
21ad6b5e841e57c1aecf82d70ba06b35f9cbb428e1a5faf5e1523f41367ef986  crates/toolkit-core/src/contracts.rs (5400)
564df00be0ad005455a4bc1444f1468dd474068934cb906638b6c454ff47b25e  crates/toolkit-core/src/context.rs (34848)
006f293b0c69253897178c84211175176a77fa9bff4fd295742bbd36844e0f47  crates/toolkit-core/src/files.rs (1153)
36003d8033c79c353187089469bc3293c40e3712fd41eeccb3ee26e5d1d34b30  crates/toolkit-host-helper/src/main.rs (7325)
d60d0e1dabb96662c1a9d07f308b827ddb4410b93f361dc2d4deebbea060b05b  src-tauri/src/de_context.rs (8574)
9ac3a35e2ab55e0feae28278205083fc879e5c8a7d29ce26332ed4ad5a9432e1  src-tauri/src/windows.rs (11971)
6e47958d104c3e1ee93fa2e31e12b0e68d8085e3143f8347c360f7b66a52a793  src-tauri/src/desktop.rs (24039)
fb747d3801a25957c6894d7821538673ea9c08e16310d2d868e9f1fcf1d7e75a  src-tauri/src/desktop/contracts.rs (15416)
42b61d5f85336dc0c78fa267f2d7ed3d4c5f4c0d72db997815e14df7b17f30af  src-tauri/src/lib.rs (5406)
a16a722e97c7acc55c1b916301d0746c193c6f13a33d15d398882cd365f2712b  src-tauri/src/storage.rs (10196)
58342ef1d75c11e07eb791e8a109110bb952456aed906b64234e2e9a58ef3f92  src/node/game-map.js (50154)
72ec79d5bb1d635e4729da829e97be72f5cc367e71f15b74ed06733f08412c1d  src/node/game-building-assets.js (7078)
70de4a1d287891b30c079c3645a4bd0eb1be250c40faf57228f1d12e811d030b  src/node/resource-icons.js (1318)
eabca1dc03e246c5ec1725e87c7efd41aa76d1a5a55400f9826fc87cf7336ce2  src/node/castle-balance.js (3909)
0221c20d101e6e19a542909dd04e85002d6fba01414164fbf40c1884cb9e02ec  src/desktop/viewports.ts (610)
0963060df870d748bce343aec9752a22fbc0541332a3f6afd1cfc84d509ffd1b  src-tauri/tauri.conf.json (2512)
```
