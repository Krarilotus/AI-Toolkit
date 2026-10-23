# Independent first-run desktop correction review — R4

23 October 2026. **NO-GO for accepting frozen correction69 as complete. Two P2
findings remain at opening completion, retirement and deadline handling.** The
canonical staging and presentation changes otherwise fit the original intent.
This verdict is source-only. It neither diagnoses the cause of root's native61
observation nor accepts artifacts, physical windows, smoothness or game behavior.
Root owns corrections, interface decisions, integration, artifacts and acceptance.

Every Toolkit command used explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`, branch
`de/separate-game-mode`, HEAD `9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a` at entry
and final verification. This is shared report ownership, not worktree isolation.
No children were used. Only this report was written in the repository. All new
programs, fixtures, binaries, source copies, differences and receipts are in
`S:/Projects/UCP/de-research/review-first-run-desktop-r4` (**review/** below).
No application/Electron/game/Steam/browser/ComputerUse launch, app build/package,
original profile/settings/registry/game/ACL write, dependency installation,
CI/PR/release/commit, evidence deletion or old build-cache write occurred.
Fresh core library/test compilation and small research executables are CLI
probes, not native application builds. Existing test-owned temporary fixture
cleanup is distinct from deleting retained evidence or user data.

Read complete goal00, contract01, plan02 and engineering05 first, complete69 and
its report correction, original44/45, relevant49/50/53/54/58/59/60/61/62/67/68,
performance/native-parity rationale, actual first-run/Classic configuration code
and relevant native/runtime history. The task retained Sol6.1 ultra/default and
the explicit no-children constraint. No goal state was changed.

Evidence labels below distinguish **observed CLI execution**, **source-confirmed**
shipping behavior, **modeled host behavior**, **inherited evidence** and
**unverified OS behavior**. An in-memory BrowserWindow is not an HWND. Extracted
Rust host functions with shims are not execution of registered Tauri handlers.

## 1. FIRST-R4-01 / P2 — completion can publish an opened, retired destination

**Observed through the complete actual `main.js` and actual private
`createDesktopContext`, with a separately authored Electron/request fixture:**
hold an accepted commit's reply, destroy the destination while the opening is
still pending, allow its Close to settle, then deliver the captured Bound reply.
The chooser returns `kind:'opened'`, although only the parent survives. The
private cache, absent immediately before that reply, again contains the destroyed
child's committed context. Its modeled canonical context is already absent.
`main-negative-r3.json`, case `closed-child-delayed-committed-reply`, records one
commit, no replay, `alive:[1]`, backend only `electron:1`, and cache entry2 changing
from absent to `committed`. The earlier ten-case receipt is retained separately;
these are not added as unique test counts.

**Source-confirmed cause:** `main.js:423–438` awaits commit/status and then clears
`__activationOpening` and returns Bound without rechecking destination identity,
route, destruction or opening cancellation. The ready promise was already
resolved; rejecting it from `__activationCancel` no longer cancels that commit
continuation. `chooseEditionWindow` at `:477–478` then unconditionally publishes
Opened. `src/node/desktop-context.js:29` accepts any late Bound into its map,
including after a Closed reply deleted that owner. Promise.race does not cancel
the underlying continuation. The deadline case independently shows the same
cache resurrection after the caller has already received Unknown.

**Fresh real-core ordering witness, without assuming reordered helper replies:**
prepare Close while the child is tentative, execute its accepted commit, then
execute that prepared Close. Actual `CoreService::execute` returns
`rejected/stale-context`, retains the committed child context and leaves the new
default persisted. `core-close-order.log` records that result. Close's second
check at `context.rs:832` compares the entire captured snapshot, including
`storeStatus`; stage→commit preserves logical owner/generation but changes that
status. The original stale-Close protection is valuable and must remain. This
witness identifies a newly reachable cleanup ordering, not a reason to remove
that protection. Electron's `closed` callback at `main.js:382–386` ignores the
canonical result, so its one cleanup request does not prove retirement. The
single-worker helper can capture Close before executing the earlier queued
commit; no hostile transport or OS-window claim is required for this ordering.
A fresh post-commit Close in the same probe successfully retires the context
without changing the persisted default.

**Native source corroboration, explicitly modeled windows:** unchanged extracted
`windows::create_activated` and native bind/prepare/commit adapters link the fresh
actual core. A scheduling shim delivers modeled Destroyed immediately after
the real canonical commit returns and before its result reaches the host
function. The exact extracted function returns Opened with no child and no
canonical context, while the actual owned repository contains the committed
default. `native-negative.log`, `destroy-after-persist`, records it. Native
`windows.rs:380–391` similarly has no completion check after commit. This does
not establish that this interleaving occurred on the user's desktop. The shim
does not execute Tauri callbacks, WebView2 navigation, visibility or permissions.

**Owner and smallest correction:** the existing host/window opening owner must
own completion and retirement through the submitted commit's settlement. After
an opening has retired, a late reply must neither publish Opened nor restore its
host cache. Use the existing per-window identity and `forget`/Close mechanisms;
settle or reissue cleanup against the same actual committed logical owner when
the previously queued Close was refused. Do not replay the installation commit,
restore an old default, change DS1/adoption/Close policy, or introduce a second
profile writer. Preserve the stale-owner/A→B→A Close guard.

Keep persistence truth separate from current window truth. If persistence is
known committed but the destination closed before completion publication, it
cannot be reported as a precommit Failed or as an uncertain persistence outcome.
Root should freeze the smallest truthful result/presentation amendment if the
four existing selection variants cannot express that case. Generated Rust DTOs
remain the owner. A blanket post-await throw routed through the present catch
would create the second finding's false Failed result.

Required regression: close the destination during commit submission/await and
deliver late success/status/Close replies in both relevant orders. Require
truthful outcome, zero surviving child/core/cache entries, one commit and no
default compensation. Retain the independently reproduced canonical queued-Close
ordering, not just a fake Close that always removes the backend immediately.

## 2. FIRST-R4-02 / P2 — deadline cleanup is unbounded and can relabel a committed selection Failed

**Observed actual-main/private-facade witness:** use the existing 15,000ms timer
with only its fixture delay scaled to35ms. Hold a submitted commit reply and the
cleanup Close reply. At103.88ms the child is destroyed but the choose promise is
still unresolved. Release commit successfully, then Close. The final result is
`failed/installation-window-failed`, diagnostics `installation-window-timeout`,
although the remembered installation is the new DE profile. There was exactly
one commit and no replay. `main-negative-r3.json`,
`expired-opening-awaits-unbounded-close`, records the intermediate and final
states. The finite research fixture releases both gates in cleanup; it does not
leave a hanging process or pretend to have waited indefinitely.

**Source-confirmed:** the opening race at `main.js:443` has a timer, but its catch
at `:482` awaits `desktopContexts.command(close)` outside that budget. The actual
CoreClient has a hello timeout, not a per-submitted-request completion deadline.
An alive single-worker helper occupied by the accepted operation can delay
Close too. No finite bound follows from `.catch(() => {})` around a promise that
has not settled. The disabled picker remains waiting on that selection promise.

Worse, `:483` computes Unknown only **after** the cleanup await. The underlying
commit continuation can set `__activationOutcomeKnown=true` at `:435` during
that wait. The timeout Error has no `activation-outcome-unknown` code, so the
catch now chooses Failed. Failure classification therefore depends on cleanup
reply timing. The simpler timeout fixture whose Close replies immediately
correctly returns Unknown; that passing case does not close this ordering.

**Owner and smallest correction:** main's existing opening/deadline owner.
Freeze the opening disposition at the deadline/cancellation boundary before
awaiting cleanup, and keep cleanup completion out of the user-result deadline.
Retain explicit ownership of any eventually draining cleanup and prevent its
late replies from granting authority as in finding1. A submitted but unresolved
commit remains Unknown, with no unchanged-default claim and no replay. A later
known committed outcome must retain that truth; it cannot be collapsed into a
known-precommit failure. Do not kill the shared helper to force a result or
abandon an accepted persistence operation. No global request-timer framework or
new unsaved protocol is required.

Required regression: hold both commit and cleanup beyond the opening deadline;
the selection result must become bounded and honest without waiting for the
cleanup reply. Then drain success/refusal/lost replies and verify cleanup and
classification remain stable. Root still needs an actual equal-workload native
opening measurement; the35ms fixture is an ordering test, not a real15s latency
or OS hang observation.

## Boundaries supported by this review

The original outcome is a usable separated Classic/DE editor, including assets,
castles, media and eventual game acceptance. Correction69 improves its first
workflow without replacing that objective. The old Classic library already
displayed the selected path; the rejected startup screen was branch-introduced.
Root's mixed-input native61 observation does not establish a particular picker
order or the cause of its persisted-default/no-visible-child state. The supplied
about:blank URL witness remains a source hazard, not a proven native diagnosis.

**Canonical source plus fresh execution:** stage is host-only and reuses prepared
evidence without persistence or a third game hash. Current can expose tentative
context, while raw acquisition/adoption/save, further preparation, inherited
binding and original-context recovery are refused. Commit alone reprobes and
uses the existing strict repository transaction. Direct prepare→commit-only
callers still work. The staged logical identity is retained at successful commit;
exact status/idempotent commit returns it without another write. Successful
children become independent of the former parent. Precommit parent loss, Close,
store-lock refusal and changed executable bytes preserve the exact prior store.
One final independent probe created a queued Close before commit and exposed the
cleanup exception in finding1. Canonical preservation is not a claim that host
cleanup always completed.

**Shipping host trace:** Electron injects actual sender/main-frame authority;
native de_request rejects renderer stage/prepare/commit/restore/bind requests
before scheduling. Legacy mutation ingress is gated while tentative. The
explicit Classic startup read allowlists remain available. No raw document is
admitted while staged, no second document/adoption protocol was added, and the
existing final Close barrier is retained. Native pending-route construction
uses the known final App URL rather than joining against a newly built hidden
WebView's current URL. `visible:false` comes from the existing native config;
the de_request/Classic Ready show paths are suppressed while opening. Failed
activated builds and known show/commit refusals reach owned context destruction
and `desktop::forget_window`, which removes protection/approval/delivery labels.

The native readiness design requires both matching Finished and bootstrap-ready
with the actual window, pending activation/owner, exact route/query and parent
liveness. The Windows injection guard precedes closure/listener installation.
Tauri's initialization-script documentation has a Windows subframe exception;
this report does not repeat a general main-frame-only guarantee. Wry Finished
alone is not navigation success. The private arguments correlate readiness;
same-origin parent-DOM tampering is not excluded, and feature health is not
proved by either signal. No new hostile-frame framework is requested.

**Fresh frontend/adapter VM:** retained path is written through textContent,
including a literal `<img ...>` spelling; failure/reselection/cancellation keeps
usable controls and the appropriate path. Structured rejected NativeError
details become readable text, Unknown warns the remembered folder may have
changed, empty diagnostics fall back to a nonempty code/message, and reselection
clears old errors. The actual Classic runtime supplies its existing translator
with the same argument object and message-before-details ordering. DE imports
the pure helper, not eager Classic startup. Source pages contain no profile-store
debug flow. Semantic tokens and scoped CSS preserve the existing Classic screen.
No layout/paint, accessibility or physical interaction was executed here.

**Generated/build inventory:** fresh generator --check and strict desktop
TypeScript pass. Rust's14 write-operation names equal generated metadata;
stageActivation is mutating and Current/activationStatus remain read-only.
Protocol1.4 types, metadata and combined hashes match the requested pins. The
existing package input owner includes `desktop-errors.js`, `installation.ts`
and the Classic runtime consumer. There is one error extractor and one Rust
activation/profile authority, not duplicate front-end detection/persistence.

**Preservation and cost:** all1,101 protected non-document inputs match entry69
and this review's start/end captures, including D1/DS1/schema, panel, byte writer,
profile policy and optimized editors/workers/caches. The27 controller regressions
pass with their real domain/panel/bootstrap code and modeled transport. Retained
scenes, latest-only queues, terrain indexes, texture/geometry reuse, batching,
dirty regions and deferred work are unchanged. Two game probes remain per
selection, plus one small stage command and bootstrap signal. No draw/typing
IPC/hash/probe, background watcher or new shipping dependency appeared. Pending
host metadata and explicit native blocking-pool waiting have real costs; the two
findings mean bounded lifetime cannot yet be claimed for every opening. This
review establishes no app RSS bound, speedup, FPS, paint or native smoothness.

## Fresh execution and provenance

Fresh observations, not an inflated sum of producer totals:

- 17/17 freshly compiled canonical context tests passed. The initial wrapper
reported failure because its cleanup census still saw compiler telemetry; the
test executable itself exited0. That wrapper failure is retained, not called a
passing cleanup result.
- 11 independent actual-main/private-facade scenarios reproduce the two P2s and
exercise cancel, load/show/canonical refusal, lost commit/status, one-commit
recovery, unknown timeout, foreign readiness and tentative document refusals.
The first ten-case run is a predecessor/subset, not ten additional cases.
- The independent linked-core program covers stage admission, recovery denial,
old commit-only semantics, stable identity, parent independence, exact store
preservation, final reprobe and Close. A separate linked-core program executes
the queued tentative-Close→commit ordering and a successful fresh cleanup.
- Six source-derived native host cases execute real core/repository operations
with modeled builder/window/load/readiness behavior. Build/show/cancel/store
failure cleanup passes; Destroyed-after-persistence exposes finding1. The actual
native de_request/de_choose/de_window_ready handlers were inspected, not launched
or newly compiled as a Tauri application. Producer69's compiled native tests
remain inherited evidence at verified source pins.
- Eleven focused frontend presentation/error/readiness checks, 27 retained
controller regressions, strict TypeScript and generated-core --check pass.
No unrelated998-test replay, asset corpus or application/package pipeline ran.

Source `main.js` executes unmodified in the VM. Node's default dynamic import
loader loads the actual unused AIV codec; it emits an experimental-loader warning.
Electron and request/window timing are synthetic. The native source extraction
retains exact `create_activated` and Readiness bytes and exact bind/prepare/error
adapters. Only the commit function identifier is renamed so a documented wrapper
can deliver the modeled Destroyed event after the actual canonical call.
`native-extraction.json` and `native-bind-extraction.json` retain exact ranges,
hashes and shim limits. Native route/load/frame identity itself is shimmed there;
the separate actual JS adapter/injector VM covers its top-frame correlation.

`source-start.json` and `source-final.json` hash all1,244 frozen paths. All27
affected files match69 throughout; all1,101 protected non-document paths match
their before69 values. Coordinator documents are separate: three differed at
start, and plan02/acceptance/sources/task-ownership differ at final. Their exact
values are retained; none was restored. New reports owned by other agents are
not source drift in this review. Retained69 source copies remain read-only.

Report69 is21,781B,
`2e8a3b8ef803153697f1d33c7b8cd62e3c3e83fa95099a84530d9468f8f3c879`.
Its prior final-verification is
`2ee3d93701ee3890f61720f9d86b2ebbec68e18a022a3771f7c9d410327ebbcd`;
the separately hashed report-correction-verification preserves that relationship.
The current combined1.4 contract is
`76b826c0b1c54fe37103a05f1ff600d8d2f0364338dc0d846b5df96966e26975`.
Types/metadata remain respectively
`33af5531791dcc9b0b14e75026122f1b3fe6ea0b652bccf5fdda5ce2cebb5de0` and
`6397b9df9150906f25b90c0659269f2001adf0b018e1f7846e1839598ed1d796`.

`correction69-exact.patch` records all27 before69→frozen differences, including
complete new files. It is137,514B, SHA-256
`375d6b04934ea1aa1a53e5c0426d3b7eb5d51f407e7fe5855005285433daff5a`.
Every available before copy was independently hashed before diffing. The review
changes none of those source bytes. `inspection.json` pins54 binaries/tool inputs
and records exact diff commands; final census adds the later Close-order probe.
This includes every linked dependency rlib/proc-macro library, compiler/tool
executable and the actual freshly executed test/probe binaries. No retained1.3
helper, old native test binary or mutable producer cache was used as a1.4 witness.
Key actual binary identities are:

```text
toolkit_core-6e7a99a4f093f196.exe  3247616
  27a215912589666a79069b28ace99e76ba1198a7591b286daafba89883df2e7d
libtoolkit_core-853f3043cd8330cf.rlib  20235456
  169f81a4d0cd4ba450d0c78cbfb49d7ec4d77c6d1eb1215fb59900c6769b9931
core-negative.exe  1856000
  fd60cf5d01352624ef86355e219fac8bea0d3ddd078dd36de197ef36f630d875
native-harness.exe  1871360
  427feb60ad4826c154dc6f876ec22383b52850d7b4746947abfaeff38532c10e
core-close-order.exe  1782272
  183dac657f8673395e851ce23ef5dceb70c6f2e757428c0545e29ae6b3fa4ffa
```

The freshly compiled core build output records sourceId
`c44b35002219629dd360ad866df0a7a1c148f7f0886f3c0bfae4beeb58dad208`,
the combined contract above and Windows x64 target. This is inspected compile
provenance, not a native application hello. Full physical input/output hashes,
actual commands, deadlines, PID/creation/executable identities and exits are
retained in the external receipts and final hash index.

## Reproduction, failed probes and final ownership

Use a fresh external directory and adapt script constants/output labels. Do not
run these exclusive-write drivers over existing receipts/fixtures. Every command
below originally ran with the explicit Toolkit cwd. `run.cjs` supplies the own
external CARGO_TARGET_DIR/TOOLKIT_CORE_OUTPUT and a120s overall deadline; it
launches hidden children, records exits and checks only owned identities.

```powershell
$r = 'S:/Projects/UCP/de-research/review-first-run-desktop-r4'
node "$r/capture.cjs" start
node "$r/run.cjs" core-test cargo test --offline --locked --manifest-path crates/toolkit-core/Cargo.toml --lib context::tests -- --test-threads=1
node "$r/run.cjs" core-lib cargo build --offline --locked --manifest-path crates/toolkit-core/Cargo.toml --lib
node "$r/prepare-core.cjs"
# core-negative-compile-r2.receipt.json: exact rustc --extern/-L/-o arguments.
node "$r/run.cjs" core-negative "$r/core-negative.exe" "$r/core-fixtures"
node "$r/extract-native.cjs"
node "$r/extract-native-bind.cjs"
# native-compile-r2.receipt.json: exact rustc arguments and linked serde/core paths.
node "$r/run.cjs" native-negative "$r/native-harness.exe" "$r/native-fixtures"
node "$r/run.cjs" main-negative-r3 node "$r/main-negative.cjs"
node "$r/run.cjs" frontend-negative-r2 node "$r/frontend-negative.cjs"
node "$r/run.cjs" controller-adjacency node --test --test-isolation=none tests/de-desktop-controller.test.js
node "$r/run.cjs" desktop-types node node_modules/typescript/bin/tsc --project tsconfig.desktop.json --noEmit
node "$r/run.cjs" generated-check node scripts/generate-core-contracts.mjs --check
node "$r/prepare-close-order.cjs"
# close-order-compile.receipt.json: exact rustc arguments against the same core rlib.
node "$r/run.cjs" close-order "$r/core-close-order.exe" "$r/core-close-order-fixture"
node "$r/run.cjs" inspection node "$r/inspect.cjs"
node "$r/capture.cjs" final
node "$r/final-census.cjs" final
```

The final driver versions have new explicit output labels; replay requires fresh
paths. The actual chronological commands and predecessor labels remain in19
immutable wrapper receipts. The inspection occurred before the last Close-order
probe; its separate executable hash is therefore in the final census as well.

Failed research preparation is preserved: initial capture matched a slash-only
report path on Windows; the first Rust probe used an invalid comma declaration;
the initial frontend probe assumed TypeScript7 exposed the former transpile API;
and the initial native harness omitted the bind extract/serde_json link and used
include! with an inner module comment. Only scratch programs changed. The first
extended deadline assertion expected Unknown and instead discovered the actual
false Failed result; the failed receipt/source remain beside its corrected
observational witness. No product expectation or implementation was weakened.
Some ancillary rg reads used guessed nonexistent paths or returned no match;
their shell exit1 is not a failed compiled witness. The initial extended VM run
reused its own synthetic profile folders before the fresh fixtures-r3 correction;
it produced no successful replacement receipt and overwrote no retained evidence.

The initial process wrapper compared JSON-formatted CIM dates with DateTime
ToString and admitted potential descendants through stale parent PIDs. Its
cleanup comparison terminated no process. A compiler VCTIP child55536 was still
present at that failed wrapper's census; subsequent exact-identity observation
found it absent. The later wrapper verifies live parent/creation/executable/
command identities and reaps its owned compiler telemetry where still present.
All successful later wrapper remaining arrays are empty. Fast subprocesses can
exit between CIM samples; direct spawn/close handles and exact finite commands
are retained instead of invented creation identities. No broad executable kill
or unrelated user-process termination occurred.

Final census checks all recorded identities, review-command survivors and owned
TCP listeners: **zero live matching owned processes and zero owned listeners**.
No server, browser, UI, Python or optional decompiler state was created. Pure
final hashing/report commands exit normally. This is an observed finite cleanup,
not a promise about an externally terminated harness. All evidence, fixtures and
compiler outputs remain in this review's own external directory.

Root should resolve the two owner-specific P2s, obtain a fresh bounded review,
then refresh actual1.4 helper/frontend/native/ZIP artifacts under new immutable
labels. Artifact67 accepts the old61 identities only; none is relabeled as69.
Actual folder pickers, selected-path/edition display, visible DE/Classic pairing,
restart/default truth, Close/recovery, authentic editing/assets, accessibility,
equal-workload smoothness and eventual game acceptance remain root-owned gates.


## Complete binary pin inventory

These55 entries include the tools, freshly linked dependencies/test executables
and generated-check outputs. Pinning an entry does not assert that every library
was linked into every probe. The exact --extern/-L arguments identify each use.
The following paths are absolute; no1.3 application/helper is an input.

```text
874071e7fc2ac2ec0031600598c1a508ecc5e21798c8fad2fc3507d41b28a9bf  857218  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libbase64-9f61f411316ebb98.rlib
b8f54f3091220a0d783bd2b680dd356783b7f24593f465502a57ae3fc99bd6f6  58118  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libblock_buffer-a9bafd7c46d247b6.rlib
2973b0f6a0e05e6555cce7cc6ec5f6074378dc9863d9689b61949792d4eb3b04  7604  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libcfg_if-9e0e1ebe0465657b.rlib
9ffe8cd308bc8b27f184f6eb40fb537d6f1ab16f696dddb874b4a6b94cc5fe51  41132  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libcpufeatures-9efc4bb3f3475f4e.rlib
3517b9245044a213847a196b1ad696527ec775dda97e6bf0bebb4a68c65ed69c  35028  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libcrypto_common-da4a00e77e4f7974.rlib
e9dc94f5c99b1968a0c25f0b30076c81fb59fbf88bf3ed7fdb30b2c52638b764  181304  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libdigest-f6f29a293d7d48bc.rlib
08208f331c15b63bf3ebc097e035c1118f30327c74e19102b67213417276232a  377630  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libdunce-364c964ad7af664a.rlib
b1d7c4e17a97c85219130d92cc514f5bb3dda8c4cf0da6672aca89bda5940859  9998  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libequivalent-24fa4381730418e2.rlib
fa4a417e7599ae7949cbc24519cc5573705f4c1881e0240305bd3698ef879cb3  827910  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libgeneric_array-b203c82676866d82.rlib
70749d508d3a786d30e83460fc6e21744da273b24fa93c70164e6af3707d7340  1334256  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libhashbrown-4b343d33a7d04847.rlib
912111f3f1240efef6bebb8a0861ae53f85c3c823ea70b08a53683d1c780a82c  1305896  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libindexmap-0a98852e733ff264.rlib
c9c610fa667814a2ce347a92888a210f97b32074471e1b2204f71e406108e4e0  194266  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libitoa-dbb0a97f4f35ec31.rlib
436e6f855cf4401bdd65e0c1325a024b7570c7409236ca6e6919e57941093458  2502950  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libmemchr-f6876d3a6312264c.rlib
61a8b7d6a1cb32411183221915d727435fd3b2d5fc36ca566e23c76f719432da  1381662  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libproc_macro2-cad2caee7bab420b.rlib
e2b644636f6472d961ea8756fda1b2d05413771acd7d9f4e33505da7c9eae522  1376116  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libproc_macro2-f8e9f8416074e9fb.rlib
c9aaa22c47c48539d3ea10ed8acac1dd23ec4765a6b3cddc7fbebe451d532090  571944  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libquote-2a856c6986c9eca1.rlib
9f7eb3e10bb6d9b0cb64999c4fb0141b74ae80eab5f0a2cb82680784f5917636  571944  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libquote-f4c6ca5e9c77e17a.rlib
2f34c9aa469675cd3fbcdf887fc4bfb6fc2678a9dd4d42720d271b2f85b67323  1311392  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libserde-7b4b383599c04997.rlib
1e830f70d12bdc02be58e7cca87ff1d59222f9a538fa623f7e6e9e11c9d5a8c0  1311384  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libserde-de934705728442e5.rlib
f52bae54a1d27ed6b690b4d5e060a86b6c29d9da1a30eab65bb8eb3ce44e8a9b  5329526  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libserde_core-43031e3fd02da4ba.rlib
e77be3dcdd7fbf9aa4afa018ae3aa89a98d15990133c659286f9683f4e760efa  5992880  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libserde_json-5a2cda1e90fbd99f.rlib
ab080ef37f00ab34e3550abbe52f664ae97d5d7ab0a915283a7413d8d6643938  1218912  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libsha2-65bd35a9accddf97.rlib
4786f6ebe8fe7d27e4032641683dcb501af999b0e11182f7f0041b35cd0802ea  7122582  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libsyn-785856929d2b7cec.rlib
4914843ecd5126a4b1fdfbfdaf036c97db27bd6182d48fa0ad3566fe5ceb2225  7120832  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libsyn-b079d56dabef85fe.rlib
391864e21e73502895a7b6089e5eb4f70e3a2bc4f28c487ba8744b0955fff198  12654772  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libsyn-bc8babcaf20130ed.rlib
e9142cc82d53f2bc287277255f2a0744b1456300a79f448a20e9bdcf3a4fc3e0  642426  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libtermcolor-8ffb3eff523e8e2c.rlib
cc64c368222ff466be40d32e46bffaf1741f0704baa2583c1029ed6cf864f585  32274  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libthiserror-c786d6bf15a7018a.rlib
80c347a54ec1507baa94bdcf97afe8bf99e1a7daef3cc141a9b9d8b5cd2628de  20839388  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libtoolkit_core-283d2e485c3d3841.rlib
169f81a4d0cd4ba450d0c78cbfb49d7ec4d77c6d1eb1215fb59900c6769b9931  20235456  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libtoolkit_core-853f3043cd8330cf.rlib
87662eced7d0492a346924f119f494ed8317e49999a448e5c2616c14e677a40f  4513274  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libts_rs-354df695de182295.rlib
d339e65311f88e31e43a0acdcb1f3147e3bd9896d952da691f794e69a78c23fe  2759000  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libtypenum-5110f8eb8199350f.rlib
b37b4fcd257ce91d4177d3e83d76f34dfc1c192dbd343ed082d2588ecd90b51c  55338  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libunicode_ident-79b6d2d98a308359.rlib
fdf11948925b06716c45705d32bad893ee9c8f0190351f575a541933e4b55ac7  538282  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libversion_check-c64d78c70f9b2092.rlib
1cbb18145ecbb7d78bed19045ca60d6f7ccdbf4bb7cc8ce96bfa079fac0bff4c  238970  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libwinapi_util-04994355d8d6e1d2.rlib
c4b69156c0828772b7cbe09959fb257864890423d3d8a9e650bea01bae6a2338  5206  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libwindows_link-89e8c5376254c1a0.rlib
6766140fa7ba814d58a876f732cf4d26312999c1957fe299690d3feb330774f4  4781100  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libwindows_sys-6654790c8a100b72.rlib
aa83b808324cd4534f95403325b8dbbdeb783ff3552cf468a34bd9d7cd665a64  636562  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/libzmij-d03a7e6b8d728323.rlib
043e6afcb7b18ebd68b64a51f31db27faaf75cdb9ece031f7b4acb39de6f2941  2272256  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/serde_derive-a5721c263a488705.dll
1989433af74aafac304de4697b94c1390d5f3d3bee4e88f77c20a0219be08e9d  2272768  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/serde_derive-b6f160420220ea09.dll
ca26e4cf03be146bbc5e1269f40241ccfaf7770b880c3e0f7fc87da249574e7e  1618432  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/thiserror_impl-422856c708c8137e.dll
8e693b07efc8570e42183cfe8c057339f8804058938375ac3f2aa820e7acfe9c  2526720  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/ts_rs_macros-6acf47c73d0bbd04.dll
27a215912589666a79069b28ace99e76ba1198a7591b286daafba89883df2e7d  3247616  S:/Projects/UCP/de-research/review-first-run-desktop-r4/target/debug/deps/toolkit_core-6e7a99a4f093f196.exe
fd60cf5d01352624ef86355e219fac8bea0d3ddd078dd36de197ef36f630d875  1856000  S:/Projects/UCP/de-research/review-first-run-desktop-r4/core-negative.exe
427feb60ad4826c154dc6f876ec22383b52850d7b4746947abfaeff38532c10e  1871360  S:/Projects/UCP/de-research/review-first-run-desktop-r4/native-harness.exe
e921fe5307e29bf6fd00000dd594356affd3a7b044e52720c7f10decbdc305b9  103173960  C:/Program Files/nodejs/node.exe
6f4bef66261261fcb43131be8720bab817d403a09edec7455c371974b90bdb7e  12721664  C:/Users/Krarilotus/.cargo/bin/cargo.exe
6f4bef66261261fcb43131be8720bab817d403a09edec7455c371974b90bdb7e  12721664  C:/Users/Krarilotus/.cargo/bin/rustc.exe
c37545ec61d48d31bdefce53280ecab61c4ea54eaace372fac6a0316c6e165d9  31435776  C:/Users/Krarilotus/.rustup/toolchains/stable-x86_64-pc-windows-msvc/bin/cargo.exe
ca9988af88b1463f6857fdfe909299fee50a63260b3e5f7dbcb5b4d3318b27bc  110592  C:/Users/Krarilotus/.rustup/toolchains/stable-x86_64-pc-windows-msvc/bin/rustc.exe
60c9b29843624dd8af6b6a7b26147753be6aeef65098b9a503cc50850afe410f  495616  C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe
c7bee37877d0aa6a046e52783fa0a2cf1a9ce5579d68bb3083bda99d4bff18ef  11694592  S:/Projects/UCP/AI-Toolkit-DE/node_modules/@esbuild/win32-x64/esbuild.exe
f9ecfbdc93753d2c972d66a8d0d75f5bd737fd4a5f88b422d9091ea282bcb2c7  24520544  S:/Projects/UCP/AI-Toolkit-DE/node_modules/@typescript/typescript-win32-x64/lib/tsc.exe
a364af801a8539e4324d9489313dbf001d959128451fc99a27b24676bbac058f  3252616  C:/Program Files (x86)/Microsoft Visual Studio/2022/BuildTools/VC/Tools/MSVC/14.44.35207/bin/HostX64/x64/link.exe
d591358c6aee4b673562ca3b3a15c250e612708394fe3b44a7a7eda2470570a5  335288  C:/Program Files (x86)/Microsoft Visual Studio/2022/BuildTools/VC/Tools/MSVC/14.44.35207/bin/HostX64/x64/VCTIP.EXE
183dac657f8673395e851ce23ef5dceb70c6f2e757428c0545e29ae6b3fa4ffa  1782272  S:/Projects/UCP/de-research/review-first-run-desktop-r4/core-close-order.exe
```
