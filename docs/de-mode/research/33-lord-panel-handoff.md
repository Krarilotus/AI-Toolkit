# DE LORDJSON panel — implementation handoff 33

2026-10-23. Additive, **unexposed component**, ready for root's review and later
serialized bootstrap/controller integration. This is browser component QA, not
native Toolkit/window/profile, Classic, backend-write or game acceptance.

Read goal00, contract01, plan02, standard05, the complete handoff26 including its
correction, Review32 GO, architecture23, critique21, iso-scrub-performance and
native-parity before choosing the boundary. The resumed authorization supersedes
the historical pause. Actual repository/workdir is
`S:\Projects\UCP\AI-Toolkit-DE`, branch `de/separate-game-mode`.
Observed HEAD is `30215f2b567ca38b1b36d2e2907c0965a8503765`; the assignment's
773f80b is an earlier checkpoint. Shared checkout is not worktree isolation.

Only three Git files are owned/written here:

- `src/js/de-lord-panel.js` (new).
- `src/css/de-lord-panel.css` (new).
- This report (new).

No children, dependencies, commit/push, CI/dispatch/PR/merge/release, native
Toolkit/game/Steam launch, live/original settings/profile or Classic change.
No app-shell/index/bootstrap, host IPC/main/preload/desktop, shared/generated
module, package/build, renderer, worker or backend file was edited or restored.
An owned loopback component fixture server was used and stopped; see below.

## Concrete view and authority boundary

The opt-in view displays current path, exact-byte dirty state, uncommitted input,
save preparation/pending/unknown/outcome state, unique numeric schema scalar
selection, exact current number token, explicit commit/reset, undo/redo,
Open/Save/Save As and Check save result. Native labels, form submission, disabled
controls, focus-visible outlines, bidi-isolated paths and a one-column narrow
layout provide basic keyboard/responsive semantics. There are no global shortcuts.

Scalar inventory comes from `de-lord-pin.schema.fields`, generated from the
canonical JSON. Availability comes from DS1's assessment, including missing,
ambiguous and nonnumeric fields. D1 `find` reads the exact selected token;
`numberToken` constructs the explicit replacement. There is no field-name list,
second validator, JSON.parse/stringify, Classic template, default insertion,
number conversion, root selection, serializer or save/receipt implementation.
Array editing is intentionally omitted from this first scalar view. Disabled
options explain unavailable scalar fields; array/type/shape issues remain in the
canonical diagnostics. A generic input stays preservable with editing unavailable.

Preservation and canonical game-export diagnostics are separate. Even complete
pinned structural checks retain the explicit unverified game/runtime message.
The first 40 canonical diagnostics are shown with an honest truncation notice;
the complete assessment remains in the caller's session. Paths/messages use
textContent, never HTML. Unknown extension bytes are never projected or rewritten.

Uncommitted input blocks field switching, Open, Save, Save As and history actions
until Commit or Reset input, preventing accidental draft loss. Save preparation,
pending and unknown block new saves and Open. Edits/history remain usable during
a save when there is no input draft. Once the controller callback settles with
an unresolved pending/unknown slot, Check save result invokes reconciliation of
the existing operation. There is no replay, fabricated acknowledgment, inferred
commit or timeout success. A rejected/mismatched receipt keeps the pending slot.
An older acknowledged commit leaves later edits dirty as DS1 specifies.

## Exact public API and callback contract

CommonJS/bundled import:

```js
const { mount } = require('./de-lord-panel');
const panel = mount(deOwnedContainer, { session, controller, t });
panel.setSession(nextSessionOrNull);
panel.refresh();
panel.refreshTranslations();
panel.dispose();
```

Browser global export is `globalThis.deLordPanel.mount`. Browser script order:
lossless-json, generated/de-lord-pin, de-lord-format, de-document-session, then
de-lord-panel. Alternatively bundle its CommonJS entry and the DS1 controller
consumer with existing esbuild. Include the scoped CSS separately. The panel
module imports only D1 number/path access and the generated schema; it receives
the **existing** DS1 session and never creates a second session. No automatic
mount or global editor mutation occurs.

`mount(container, options?) -> {setSession,refresh,refreshTranslations,dispose}`:

- `container`: an owned DOM element; the panel appends one section. Mounting
  again on that same container disposes its prior panel automatically. Existing
  unrelated container children are not removed.
- `session`: DS1 session or null, default null. Its read/replaceScalar/undo/redo
  contract is handoff26/Review32. Every content command uses the displayed
  session revision. A draft's revision stays captured across external edits;
  stale commit is refused and asks for Reset input/review. Refresh also updates
  numeric eligibility after an external scalar type change.
- `controller`: optional object with `open`, `save`, `saveAs`, `reconcile`.
  Each optional function is called once as `controller[name]({session})`, where
  session is the exact captured session at invocation (`open` may receive null).
  Missing callbacks disable their controls. Functions may return void or a
  Promise. **Returned data is ignored** and cannot mark bytes saved or adopt a
  session. Rejection displays a safe-text failure while retaining domain state.
- `t(key,{defaultValue}) -> string`: optional translation function. It can be
  `(key, options) => toolkitI18n.t(key, options)`. Keys are under
  `deLordPanel.*`, canonical messages under `deLordPanel.diagnostic.<code>`;
  English defaultValue strings keep this isolated component usable without a
  catalogue edit. Schema names and exact tokens remain literal. A future
  bootstrap can call refreshTranslations on its existing language-change hook;
  the panel installs no global language listener or new catalogue policy.
- `setSession(nextOrNull)`: caller-authorized adoption/reset, including input
  reset. This is **not** an unsaved/pending gate. The controller must resolve its
  current document/draft transition and operation ownership before calling it.
- `refresh()`: explicit pull after external session transitions; no polling or
  subscription. Reads state and updates relevant text/controls. Diagnostics
  reuse bounded rows; selection options rebuild only when eligibility changes.
- `dispose()`: idempotently removes owned listeners/root and drops session/
  document references. Refresh/setSession/translation refresh after disposal
  do nothing. It does not cancel an accepted backend write. Dispose/release the
  handle when its owner closes; caller-held DS1 snapshots remain caller-owned.

Callback action buttons share one in-flight guard. Scalar commands can continue
during asynchronous saves. Late callback errors from a prior setSession are
suppressed; disposed callbacks never republish into a remount. Callback settlement
refreshes the current mounted view but never adopts a returned session. The
controller must independently handle late backend/session results and explicitly
refresh a replacement panel when appropriate.

Controller/build/host owner next steps (no edits to those owners here):

1. Bind an authenticated fresh DE context **before eager Classic startup**;
   import/bundle DS1 plus this panel, include CSS and mount in that owned view.
   The existing desktop builder's shared-source exclusion/load-order gate still
   applies. Leave Classic's route unchanged.
2. Open: own unsaved/dialog/adoption policy, obtain discriminated raw bytes and
   unique immutable document/owner identities, construct one DS1 session, then
   call panel.setSession only when the result still belongs to that context.
3. Save/Save As: own dialog cancellation and explicit authorized destination,
   call capturedSession.snapshotForSave(currentRevision,destination), call
   panel.refresh after intermediate preparing/pending transitions, submit the
   exact snapshot bytes under the captured authenticated lease, correlate the
   actual backend operation, and acknowledge only its matching real receipt.
   Refresh after every result. Cancellation before snapshot needs no receipt.
4. Reconcile: query the existing backend operation associated with the retained
   snapshot; acknowledge its matching known/unknown result, then refresh. An
   exception after write acceptance cannot release the slot or authorize replay.
   Freeze/drain/adopt, dialogs, context freshness and both-host packaging remain
   controller/host ownership, not this view's implementation.

Premise challenge: a frontend-owned snapshot/receipt service or second document
model would duplicate DS1 and blur backend byte authority. Four injected action
callbacks and explicit session adoption/refresh are the smaller boundary. No
generic form framework, guessed IPC schema or extra abstraction is needed.

## Executed browser/component verification

All evidence/scripts/bundles/PNGs/logs stay outside Git at
`S:\Projects\UCP\de-research\lord-panel-ui`.

**Observed:** node syntax check and real esbuild browser bundle pass. Final
unminified fixture bundle is 134,197 bytes, seven local inputs and zero external
or Node imports (metafile retained). It includes the real DS1, D1, generated pin,
schema and panel; the fixture/controller is self-authored. The 5,079-byte Git
fixture was copied exactly; additional generic/duplicate/token/large cases are
authored outside Git. Every receipt generated by that controller is explicitly
synthetic; no actual host write or authenticated receipt is claimed.

T3 preview_status/open created the owned tab
`tab_1_422ff097-252a-494d-8cce-c7b46a326f38`, loopback 127.0.0.1:5189.
DOM execution was in T3CodeBeta/0.1.2 / Electron44.9.3 / Chromium152.0.7977.167,
Windows x64, secure context, viewport1100x1000. Real input/click/submit DOM events
ran through preview_evaluate; preview_type also filled the actual input. These
are synthetic automation events, not native keyboard/pointer acceptance.

`dom-qa.js` records 44 assertions (including controller-settlement assertions),
and `lifecycle-qa.js` records nine additional assertions; these are **two finite
component QA traces, not 53 repository unit tests**. They exercise exact exponent
no-op, token-only edit/extension/large-number preservation, undo/redo, invalid
number/stale draft, save pending/edit-during-save/unknown/repeated unknown/older
commit, mismatch, known failure/cancel, thrown callback before/after submission,
safe filename text, remount/dispose and pending remount, empty/generic/wrong/
ambiguous/missing states, external numeric type eligibility changes, ignored
success-shaped returns, late errors, form submit, stable DOM node identity and
injected translation refresh. Uncaught errors/unhandled rejections: **zero**.
Sixty typing events made **zero** session reads/replace/undo/redo calls.

Visual evidence uses T3 **html_preview** running the same self-contained real
bundle, not a hand-drawn mock. Inspected PNGs:

- `desktop.png`:1100x1031, complete synthetic fixture.
- `mobile.png`:390x1346, one-column controls, no horizontal overflow.
- `unknown.png`:900x1050, blocked saves and enabled Check save result.
- `generic.png`:650x1195, preservation allowed, scalar editing unavailable,
  canonical export blocked and diagnostics expanded.

All four render consoles have no warning/error/exception; authored QA logs report
errors=[] and applicable layouts have no horizontal overflow. Dark fallback
tokens were inspected; actual installed default/UCP theme packs, translation
catalogues, screen reader and native keyboard interaction remain unverified.

Tool limits are explicit in tool-limitations.json. Three collaborative snapshot
attempts returned **"Preview automation snapshot timed out after 15000ms."**
The focused click tool also timed out; evaluate's actual DOM .click worked.
The documented CUA fallback had empty apps/browsers and returned
**"Browser is not available: iab"**. T3 html_preview provided working visual
capture. requestAnimationFrame did not fire during the observed collaborative
preview interval; an initial rAF-paced run timed out at revision0 and was removed
by navigation before subsequent workloads. No paint/frame latency is claimed.
The first large scratch input exceeded D1's string-token cap; only that fixture
was corrected to two 512KiB extension strings. No production limit changed.

## Interactive workload scope and performance limits

Owned baseline: a three-node DOM form driving the same real DS1 commands and
identical authored bytes. Candidate: this mounted panel. Same1100x1000 browser,
16ms scheduled task pacing, input event plus explicit Commit click per step.
Complete fixture:90 steps, first equivalent no-op, final revision89/token90.
Large fixture:60 steps, final revision60/token60; 1,048,636 bytes initially,
two512KiB extension strings. No map/camera/worker/cache path is involved.

| Workload | Handler mean / p95 / max ms | Input-task interval p95 / max ms |
| --- | --- | --- |
| 5KiB DS1 baseline | 0.94 / 1.50 / 3.70 | 19.10 / 20.20 |
| 5KiB panel | 0.93 / 1.50 / 1.70 | 18.80 / 19.10 |
| 1MiB DS1 baseline | 15.79 / 21.60 / 26.30 | 38.60 / 42.40 |
| 1MiB panel | 16.67 / 20.60 / 23.90 | 37.50 / 41.30 |

No observed >=50ms long task in these finite runs. Source-cost history matches
the baseline exactly:32 entries/162,560 bytes small;15 entries/15,729,555 bytes
large. Ending unforced-GC usedJSHeap samples are9,967,591/11,601,907 small and
23,872,343/28,423,220 large (baseline/panel). These process samples include prior
work/GC state; they are not allocation attribution, retained-memory bounds or a
proof of a leak/delta. Raw records retain all percentiles and scope labels.

These actual DOM task measurements plus interaction and visual evidence bound
this component's observed overhead. They are not requestAnimationFrame/pixel
presentation, native-window or Classic smoothness evidence. The large-file
explicit commit is still synchronous D1 work, and default8MiB worst-case edit
cost is unmeasured. There is no performance guarantee from these finite runs.

The panel never touches retained worker scenes, latest-only queues, sprite/
texture caches, terrain indexes, dirty invalidation, batching or deferred
analysis. It installs no timer, animation loop, IPC, hashing, profile probe,
decode or parser on typing/draw paths. Explicit content commits use existing
DS1/D1; diagnostic DOM is capped and reused. Further owned before/after native
interactive comparisons belong to actual bootstrap/controller integration.

## Reproduce, fingerprints and shutdown

Every Toolkit shell command used explicit workdir
`S:\Projects\UCP\AI-Toolkit-DE`. Node v26.7.0; no package install.

```powershell
node --check 'S:\Projects\UCP\AI-Toolkit-DE\src\js\de-lord-panel.js'
node 'S:\Projects\UCP\de-research\lord-panel-ui\build.cjs'
node 'S:\Projects\UCP\de-research\lord-panel-ui\server.cjs'
node 'S:\Projects\UCP\de-research\lord-panel-ui\self-contained.cjs'
```

Open a fresh owned T3 preview at http://127.0.0.1:5189. Evaluate the exact text of
dom-qa.js and lifecycle-qa.js with awaitPromise:true (trim only surrounding
whitespace). For performance evaluate qa.workload('baseline','complete',90),
qa.workload('panel','complete',90), then baseline/panel with ('large',60).
The workload uses16ms tasks, explicitly not paint frames. self-contained.html
inlines the real bundle/CSS and exact fixture for html_preview; render-results
records widths/console observations. DOM/performance/lifecycle/render JSON,
bundle metafile, tool limitations, source fingerprints and final evidence
manifest remain beside the scripts and PNGs. No mirrored DOM test was added
to the repository. No unrelated/full/native/game suite is relabelled as fresh.

Owned server: node PID53528 / exec session55318, bound only127.0.0.1:5189;
stopped with Ctrl-C at handoff and the port checked closed. Owned collaborative
tab closed. No service is intentionally left running.

Final working-tree code SHA-256:

```text
f8461dbb8fea77ce07cd4c4aaf99e31d6427afa85bdf0401b92764b0e39573d6  src/js/de-lord-panel.js (16879)
72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339  src/css/de-lord-panel.css (3452)
```

The six protected DS1/schema/fixture hashes match Review32 exactly in the
captured source manifest: session 88a33650..., overlay fc9b6d33...,
D1 9c3aefc9..., generated pin 325d33b8..., schema aa641b70...,
fixture a521106b.... Primary pins are **inherited**, not re-decompiled here:
develop 7e199e6f0818173794bdeeb0c4c32d74500b0eec, declaration blob
9cd4c4ad0a601aab1217bb786e741ef15a39f1be, transfer blob
97bf5fcabdd626a6e80c1e17e546f357fc2d4874; managed SHA-256
bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789,
native fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2.
The full source/evidence/report hashes are in the outside-Git final manifest,
avoiding a report self-hash cycle. Root owns acceptance, integration and commits.


## Panel correction round 2 — Review35 responses (2026-10-23)

Bounded implementation response, **ready for fresh independent review**, not
root acceptance or an integrated desktop/game workflow. Read the mandatory
goal00/contract01/plan02/standard05, complete Review35 and handoff33, complete
handoff26 including its correction, Review32, iso-scrub-performance and native
parity/cache contracts before changing this slice. The explicit resume remains
the implementation authority; the historical paused native flag is not a stop.
Actual repository/workdir is `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`; HEAD at initial and pre-append source checks was
`61c2fa16524c7b06d1638eed9c1593afd689e469`. The coordinator concurrently advanced
HEAD to `e3d891cb815a9758542b897065141e71da4a7ca2` before final fingerprint
capture; all protected bytes and the tested panel source stayed identical.
Shared checkout is not isolation.

Only `src/js/de-lord-panel.js` and this **appendix** were changed in Git.
CSS remains byte-identical to Review35. The original 17,147-byte report prefix
remains byte-exact, SHA-256
`747c48d0fb5fefcfa96f72f4d438ee67bd37c60ae4bb03519ab29c96314b85eb`.
All scripts, bundles, baseline source and results are outside Git under
`S:\Projects\UCP\de-research\fix-lord-panel-ui-r2`. No children, dependency
installation, commits/pushes, CI/dispatch/PR/merge/release, native app/game/Steam
launch, live/original profile/settings or Classic change occurred. Teammate
changes were not restored, staged or edited. Root owns acceptance/integration.

Evidence labels here: **observed** means executed/inspected in this correction;
**inherited** means a prior pinned result not rerun; **unverified** means an open
integration/acceptance gate. These are synthetic browser events/controller
receipts over real D1/DS1, not authenticated backend writes.

### Finding responses and state ownership

**LORD-PANEL-R1-01 / P2 — corrected locally.** The fresh unchanged baseline
reproduced both authoritative manifestations. A type change with no other
eligible numeric field erased `987654321` to an empty input and disabled Reset.
With 103 other eligible fields, it selected `opponent_type_for_speech` and
overwrote the same draft with `29`. An external numeric change equal to draft
`1002` disabled Reset while leaving the captured revision stale; subsequent
editing could not commit until the documented workaround.

The panel now keeps one transient draft record: captured field, generated path,
base session revision and entered text. Its lifetime no longer depends on the
new token or current choices. Refresh keeps even an unavailable field selected,
retains the text, marks the draft stale, disables an ineligible Commit and keeps
Reset enabled. Open/new saves/history/field switching remain guarded until draft
resolution. Explicit Reset adopts a current eligible field, or the honest empty
unavailable editor; later clean external corrections are followed normally.
An external token equal to the draft still retains its captured revision and
usable Reset. Numeric stale commits continue through DS1's exact revision check
and are rejected without mutation. There is no rebase or domain relaxation.

Successful Commit/no-op resolves the draft before refreshing its result, so a
successful local command does not briefly publish an external-change notice.
Intentional typing back to the displayed token can release a *current* draft;
it cannot release/rebase a stale one. Caller-authorized `setSession` remains
the explicit adoption/reset boundary. This small view record owns no document,
history, schema rule or saved bytes; DS1 remains their sole authority.

**LORD-PANEL-R1-02 / P3 — corrected locally.** The fresh baseline reproduced an
enabled Check save result click with no callback during a draft. Invocation now
allows reconciliation while retaining that draft, consistent with enablement;
preparing/no-operation/in-flight guards still refuse it. The callback receives
the same captured session and can reconcile only the existing domain operation.
New-save/Open guards remain, returned data stays ignored, and the view creates
no receipt, retry, replay or save authority. Fresh pending and unknown traces
reconcile an older snapshot while a later current document and input draft both
exist; acknowledgment changes neither current content/history/revision nor
the draft. Repeated unknown retains the exact snapshot. A following Commit
succeeds against the draft's still-current revision.

**LORD-PANEL-R1-03 / P3 — corrected locally.** The fresh baseline reproduced
`NaN` retaining its error while translation changed `aria-invalid` from true
to false. The message now retains its invalid-input flag and replays it during
translation. Reset/input/success and authorized adoption clear it explicitly.
Reconciliation preserves an unresolved invalid draft's notice/flag; it does not
silently clear validation on action start. Translation changes no input text,
draft revision, domain state or DOM control identity.

Public mount/session/controller API is unchanged. Generation/disposal handling,
captured callback ownership and ignored success-shaped returns remain intact.
No DS1/parser/schema/history/backend/Classic/central-tracking edit was needed.
The existing authority boundary is appropriate; a second document model or
generic draft/DOM framework would be unnecessary. A future host-switch draft
query hook, if needed by its concrete unsaved gate, belongs to a separately
agreed integration change; no speculative hook was added here.

### Fresh browser verification and reproducibility

Node `v26.7.0`; T3CodeBeta0.1.2 / Electron44.9.3 / Chromium152.0.7977.167,
Windows x64, secure loopback context, viewport1280x800. The preserved real
fixture/controller/QA scripts were copied into owned scratch. The baseline is
the byte-exact original panel before-image, with only its two relative module
imports redirected by a scratch bundle shim to the unchanged real shared
modules. Candidate bundles the actual owned source. No mirrored production
validator, fake generic DOM framework or new dependency was introduced.

Observed final syntax check passes. Actual final esbuild browser bundle is
135,117 bytes, seven local inputs, zero external/Node imports, SHA-256
`d3c2f82be236c6c9d6682713e70059f2278d79eb3e15da49f4ad2a79651dbf08`.
The unchanged baseline bundle is134,303 bytes; scratch path/import spelling
contributes to the size difference. Bundle feasibility is also exercised in
the actual browser with real DS1, rather than only an isolated VM.

The existing **44-check DOM trace and nine-check lifecycle trace pass** on the
baseline and final candidate. Their coverage includes async replacement errors,
remount/dispose during pending actions, ignored controller returns, stale
revision protection, all save outcomes and exact-byte preservation. The copied
dispose-settlement probe also passes: old success-shaped returned data cannot
change the current session, bytes/root or busy state after remount.

The new **36-check finite correction trace passes**, covering zero/103 remaining
eligible fields, repeated refresh/translation and ineligible form submission,
retained field/text/transition guards, enabled Reset and successful subsequent
editing, equal-token external updates and stale-revision rejection, clean
external tracking, current-input revert, pending/unknown/repeated-unknown
reconciliation with current content plus a draft, validation translation/input/
Reset/success, reconciliation retaining invalid input, and explicit setSession.
These are three finite component traces, not89 repository unit tests. Page
errors/unhandled rejections are zero. Sixty existing instrumented typing events
and each120-event timing run perform zero session read/replace/undo/redo calls.
The unchanged180 D1 tests were not rerun; protected source equality and actual
shared-domain component traces are the relevant evidence for this local fix.

Every Toolkit exec used explicit workdir `S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
# Initial before capture; retained, do not overwrite it when reproducing later.
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\capture.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\build.cjs' baseline
node --check 'S:\Projects\UCP\AI-Toolkit-DE\src\js\de-lord-panel.js'
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\build.cjs' candidate
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\server.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\verify-inherited-evidence.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-ui-r2\capture.cjs' after
```

Use T3 preview_status, then preview_open with reuseExistingTab:false. Navigate
the owned tab to `http://127.0.0.1:5193/baseline/` or `/candidate/`. Read each
script using `[System.IO.File]::ReadAllText(path,[System.Text.Encoding]::UTF8)`
and evaluate its complete trimmed text with awaitPromise:true, passing the
returned tabId on every call. Run dom-qa.js, lifecycle-qa.js and
dispose-settlement-probe.js on either version; independent-probes.js is the
preserved **baseline reproduction** and intentionally expects the old defects.
Run regression-qa.js on the candidate. type-loss-observation.js records both
versions without imposing the old behavior. JSON results, both bundle metafiles
and original/source/protected/evidence fingerprints are alongside the scripts.

Two scratch assertions were corrected without changing product requirements:
the initial regression compared `read().history` wrapper identity, whereas DS1
returns fresh frozen wrappers. It now checks retained entries/source-byte cost
alongside document identity/revision. The original failure is retained in
regression-initial-harness-failure.json. A selector-based eligibility count
also inherited a disabled select's CSS state; the corrected observation counts
each option's own disabled flag and value. Initial observations are retained
separately. Neither was a product defect or a reason to change DS1.

### Affected interactive handler comparison

Owned before/after comparison uses the original/final mounted panel over the
same real DS1, fixtures and browser, at1280x800. Each fresh page runs120 typing
events, then the original qa.workload('panel','complete',90) and
qa.workload('panel','large',60), with16ms scheduled tasks. Final order is
baseline/candidate/candidate/baseline. Evaluate typing-workload.js followed by
performance-run-expression.js in each page; performance-final-results.json
retains all returned values. Earlier initial/intermediate measurements are
retained as diagnostic observations, not relabelled as final-source results.

| Workload | Baseline handler p95 / max ms, two runs | Final handler p95 / max ms, two runs |
| --- | --- | --- |
| Typing only,120 events | 0.20 / 0.20; 0.10 / 0.20 | 0.10 / 0.20; 0.10 / 0.30 |
| 5,079-byte fixture,90 input+Commit steps | 1.90 / 3.40; 2.10 / 2.50 | 2.30 / 3.10; 2.30 / 4.00 |
| 1,048,636-byte fixture,60 input+Commit steps | 19.50 / 24.40; 20.70 / 24.90 | 19.20 / 24.50; 21.20 / 23.20 |

Small-workload means are1.05/1.07ms baseline and1.05/1.07ms final. Large means
are15.86/15.91ms baseline and15.69/16.08ms final. Small input-task interval
p95/max is19.00/20.40 and19.10/19.70ms baseline,19.50/20.90 and19.00/20.60ms
final; large is36.50/40.70 and37.90/41.70ms baseline,37.00/41.20 and37.60/39.50ms
final. These finite samples show a small upper-tail increase in the small
handler trace and overlapping large-handler/task ranges; they do not establish
zero overhead or a causal regression from these sub-millisecond differences.
There are no observed >=50ms long tasks. Final revisions/tokens and retained
history match:89/90 with32 entries/162,560 bytes, and60/60 with15 entries/
15,729,555 bytes. The underlying synchronous large Commit remains D1 work.

Heap samples in the raw records are unforced-GC process samples, not allocation
attribution, retained-memory bounds or leak evidence. No frame/paint/rAF,
native-window, Classic smoothness, native input,8MiB worst-case or game claim
is made. This is an actual DOM task comparison, not FPS. The code preserves
bounded reused diagnostic rows and eligibility-triggered choice rebuilding.
Its typing path adds only a tiny view record/update and cached state checks;
no parsing/session read/profile probe/hash/decode/IPC or full refresh occurs.
Retained worker scenes/latest-only queues/batching/caches/dirty invalidation/
deferred analysis are untouched. Source history and the performance rationale
were read; no existing renderer optimization was removed.

### Exact protected bytes, shutdown and next owner

Final owned source SHA-256:

```text
8fd2cf08ea814d2e86abe06f029a712c437162b74e962180f4547c85ffc2f663  src/js/de-lord-panel.js (18117)
72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339  src/css/de-lord-panel.css (3452; unchanged)
```

Before capture matched all inherited original records. Final44-file capture
changes only the owned panel and appended report. The33 records in Review35's
own evidence receipt also freshly match, including that report's bytes. Original
evidence/PNGs and reviewer files were not rewritten. Protected DS1/schema/fixture
hashes remain exactly Review32/Review35:

```text
88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a  src/shared/de-document-session.js
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
```

Additional Classic/renderer source pins remain byte-identical to this owned
baseline (source preservation evidence, not a Classic runtime test):

```text
8aeae13a13e986663f978725c5173612109e2cfeb0d3f76d2bb94c681a9c4bb8  src/js/iso-view.js
1b5457e38087825401dde194b4f8e3df5634568f3deb1f72f0cdd923830a144e  src/js/castle-editor.js
f0ebb1afe4a0ab3e4cf54058822376371f546642131650712868870191f6b5e7  src/js/character-editor.js
14c15102adc46be639e5778598f8f11d7d38c80ed016060f540cbbebe3ba377b  src/js/castle-gpu-worker.js
34b5c89f123073d66277bbfa7b24384980ba1e3647644b66f332a16bf6f73c20  src/js/castle-canvas-worker.js
c4c002329084e4e9f8152b4071c79675918faa66d21a6497bcb99147501a5171  src/js/castle-analysis-worker.js
```

Inherited primary pins, not re-decompiled or remotely reverified here: develop
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, declaration blob
`9cd4c4ad0a601aab1217bb786e741ef15a39f1be`, transfer blob
`97bf5fcabdd626a6e80c1e17e546f357fc2d4874`; managed/native SHA-256
`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` /
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
The report's final self-hash and all correction evidence hashes are in the
outside-Git final-manifest.json, avoiding a report self-hash cycle.

Owned T3 tab `tab_3_422ff097-252a-494d-8cce-c7b46a326f38` was closed. The
owned server PID54996 / exec session66398 was stopped with Ctrl-C; shutdown
checks confirm no PID or5193 LISTEN entry. No service is intentionally running.

Next owner: fresh independent reviewer should close the three Review35 findings
against these exact bytes; root owns final acceptance/integration/staging and
commits. Existing controller/build/host gates above remain: authenticated fresh
DE contexts, raw-byte transport, dialogs/unsaved/freeze/drain/adopt, explicit
intermediate refreshes, real leased writes/receipts/reconciliation, both-host
packaging/WebCrypto and fresh DE open/edit/Save As/reopen beside unchanged
Classic. Native keyboard/accessibility/theme and affected native interactive
acceptance remain unverified. No new blocker or broad cleanup gate is proposed
for this bounded unexposed correction; full feature/game acceptance stays open.


## Review38 clean-revision correction r3 — 23 October 2026

**Implementation complete for root's direct review of LORD-PANEL-R2-01/P3.**
Review35's three findings remain CLOSED at their reviewed source baseline;
this correction preserves their draft, reconciliation and validation ownership.
No new review report or broad review cycle was started. This is finite browser
component evidence, not native Toolkit, authenticated-save, Classic or game
acceptance. Root owns disposition, acceptance, integration, staging and commits.

Read the exact goal00, contract01, plan02 and standard05 first; then full
Review38, corrected panel, prior handoff, iso-scrub-performance, native-parity,
real DS1 and relevant history. The active resumed objective supersedes the
historical pause. No goal mutation or child delegation occurred. Actual explicit
Toolkit workdir throughout: `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`; shared checkout is not worktree isolation. Initial HEAD
was `e3d891cb815a9758542b897065141e71da4a7ca2`; a concurrent coordinator commit
advanced it to `d2b2c2a22c6153afa52d08735158293b38919a8f` before final verification.
This assignment made no commit, push, CI/dispatch/PR/merge/release, native app,
game or Steam launch, live/original profile/settings or Classic change.

Only `src/js/de-lord-panel.js` and this appended handoff were written in Git.
All owned scripts, baseline copies, bundles, JSON and logs are outside Git in
`S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3`.

### Invariant and exact implementation diff

**Observed:** DS1 revision is monotonic across external replace/undo, even when
undo restores the identical immutable D1 document object. Document identity
therefore remains a valid token/eligibility cache key but cannot be the editor's
revision key. Refresh now synchronizes clean editor metadata on every accepted
state read and checks a captured draft's staleness independently of that cache.
It never changes a captured draft's revision, path or text. No new parser,
session, history, subscription, timer, framework, API or CSS change is needed.

Exact hunk in outside-Git `source.diff` (four added lines, one removed):

```diff
@@ -210,8 +210,11 @@
           buildChoices(reasons);
         }
         updateEditor(); renderedDocument = state?.document || null;
-        if (draft && draft.revision !== state?.revision) setMessage('stale');
       }
+      // Undo can restore the same document object at a newer session revision.
+      // Only a clean editor follows it; a captured draft keeps its base revision.
+      if (!draft) editorRevision = state?.revision || 0;
+      else if (draft.revision !== state?.revision) setMessage('stale');
       if (state?.assessment !== renderedAssessment) { diagnostics(); renderedAssessment = state?.assessment || null; }
       controls();
     }
```

Panel source SHA-256, baseline → corrected (LF endings retained):

```text
8fd2cf08ea814d2e86abe06f029a712c437162b74e962180f4547c85ffc2f663  baseline (18117 bytes)
90d7efee5ad7b6ad552b855f081ebd6754698bb01a1d9343e714ad6db6e71cc3  corrected (18331 bytes)
```

### Fresh exact reproduction and preserved draft behavior

**Observed baseline:** mount the real DS1 token fixture (`1e+03`), retain D1
identity, externally replace opponent_type at revision0 with1001, externally
undo at revision1, then refresh. D1 identity is unchanged and session revision
is2. The unchanged form submit raises stale revision with aria-invalid=true
and disabled Reset; ordinary typing1003 also rejects at revision2. Reset then
typing recovers at revision3. A second baseline trace without the unchanged
submit independently reproduces the failed next ordinary Commit.

**Observed correction:** the same round trip leaves the editor clean, keeps
the exact token/caret, and retains input/select/option/token/diagnostic DOM
identities. Unchanged submit is an exact-byte no-op at revision2. The next
ordinary typed1003 commits immediately at revision3. Typing directly after
refresh without that no-op likewise commits at revision3.

**Observed active draft on both versions:** typing1003 before the round trip
captures revision0. Refresh retains the exact text and selected field, enabled
Reset and guarded transitions. The correction immediately displays the stale
notice despite unchanged document identity. Instrumented Commit passes
revision0 to real DS1 and is refused at revision2 without changing document,
bytes or draft. Typing back to1e+03, refresh and translation cannot rebase it;
retyping1004 still passes revision0 and rejects. Explicit Reset adopts the
current token/revision; the following Commit passes revision2 and succeeds at3.
No captured draft is silently discarded or rebased.

The focused roundtrip-qa.js passes18 baseline expectation checks and17 corrected
checks (baseline includes a separate recovery check). These are finite traces,
not repository test counts. Existing dom-qa.js **44 checks**, lifecycle-qa.js
**nine checks**, regression-qa.js **36 checks**, and dispose-settlement-probe.js
all freshly pass on the corrected source. Disposal settlement retains current
session/bytes/root, one mounted panel and busy=false. All returned browser
error/unhandled-rejection arrays are empty. The existing60-event typing trace
makes zero DS1 read/replace/undo/redo calls. Unchanged D1/domain tests and broad
native suites were not rerun.

### Reproduction commands and artifacts

Every exec_command below explicitly uses the actual Toolkit workdir above.
Node v26.7.0; existing esbuild only, no dependencies installed. Initial setup
and before capture are retained observations; do not overwrite them to rerun.

```powershell
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\setup.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\capture.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\build.cjs' baseline
node --check 'S:\Projects\UCP\AI-Toolkit-DE\src\js\de-lord-panel.js'
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\build.cjs' candidate
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\server.cjs'
# Run browser traces as described below, then stop the owned server with Ctrl-C.
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\verify.cjs'
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\capture.cjs' after
node 'S:\Projects\UCP\de-research\fix-lord-panel-clean-revision-r3\finalize.cjs'
```

T3 preview_status then preview_open(reuseExistingTab:false,open:false) provided
an owned tab. Navigate to `http://127.0.0.1:5195/baseline/`, read each script's
complete text with `[System.IO.File]::ReadAllText(path,[System.Text.Encoding]::UTF8)`,
and evaluate its trimmed text with awaitPromise:true, passing the owned tabId
on every call. Baseline runs roundtrip-qa.js; corrected `/candidate/` runs that
same script, then dom-qa.js, lifecycle-qa.js, regression-qa.js and
dispose-settlement-probe.js. The real DS1 and exact5079-byte synthetic fixture
are reused. Controller receipts remain explicitly synthetic. Corresponding
baseline/candidate-*-results.json files retain every check and observation.

Fresh syntax passes; both real browser bundles have seven local inputs and
zero external/Node imports. Baseline uses its byte-exact source copy with only
scratch import redirects to unchanged shared modules; candidate bundles actual
owned source. Scratch path spelling contributes to bundle-length differences:

```text
449a21ef4685b190e891a1cbb13e6397935700a33f04089fac9ac674c7f400db  baseline/fixture.bundle.js (135237)
4252a0c3d8d62c0b761b4cff61020b93e4d4c2941da6e66a53cdda4559e3e347  candidate/fixture.bundle.js (135198)
```

### Affected interactive comparison and limits

**Observed fresh DOM tasks:** baseline/candidate/candidate/baseline, fresh page
per run, identical real DS1,5079-byte fixture,1280x800 viewport and16ms scheduled
task pacing. Each page runs preserved typing-workload.js (120 events), followed
by interactive-workload.js (90 ordinary input+Commit steps). Browser identifies
T3CodeBeta0.1.2 / Electron44.9.3 / Chromium152.0.7977.167, Windows x64, secure
loopback context. interactive-run-1 through4 JSON retain raw summaries/samples.

- Typing handler p95 is0.10ms in all four runs. Baseline max0.30/0.20ms;
  corrected max0.30/0.20ms. All four make zero DS1 calls and retain revision0.
- Input+Commit handler p95/max milliseconds: baseline2.40/3.70 and2.20/3.80;
  corrected2.20/3.30 and2.10/2.60. Mean1.196/1.056 baseline and1.060/1.027 corrected.
- Input-task interval p95/max milliseconds: baseline19.70/21.50 and19.00/20.90;
  corrected19.00/20.10 and18.90/19.50. No >=50ms long task was observed.
- All final outputs match revision89/token90,32 history entries/162560 source
  bytes and153 DOM nodes. Heap observations are unforced-GC process samples,
  not allocation attribution, retained-memory bounds or leak evidence.

These finite overlapping observations establish no causal performance claim
or universal latency threshold. They are actual DOM handler/task observations,
not helper microbenchmarks, paint/frame/rAF, physical presentation, native input,
native/Classic smoothness,8MiB worst-case or game evidence. No renderer/repaint
benchmark or unchanged large D1 workload was rerun for this scalar metadata
correction. Existing bounded diagnostic rows, document/eligibility/assessment
caches and zero-call typing path remain intact; retained worker scenes,
latest-only queues, batching, caches, dirty invalidation and deferred work are
untouched. No profile probe, large hash, decode or IPC was added to input/draw.

T3 snapshot returned exactly `Preview snapshot failed: Preview automation
snapshot timed out after 15000ms.` Navigation/evaluation worked, so no alternate
browser was used. No new screenshot or screen-reader observation is claimed.
Owned tab `tab_5_422ff097-252a-494d-8cce-c7b46a326f38` was closed. Owned server
PID26152 / exec session22554 was stopped with Ctrl-C; subsequent PID/5195 LISTEN
checks find no entries. shutdown-results.json records cleanup.

### Protected bytes and remaining owner

**Observed:** all45 captured baseline records are unchanged except this panel
and appended handoff. The full33277-byte prior handoff prefix retains SHA-256
`b1da483fd5de8902e988c607348cad131734b9000092d092546796696f6ab23b`;
the original17147-byte prefix also retains
`747c48d0fb5fefcfa96f72f4d438ee67bd37c60ae4bb03519ab29c96314b85eb`.
All97 correction-r2 manifest records and68 Review38 evidence records match
except the two expressly owned current files in the correction manifest.
There are zero unexpected changes. Before/after-fingerprints.json,
verification.json and final-manifest.json contain exact paths/lengths/hashes,
the final handoff hash and all new evidence hashes outside Git.

CSS remains3452 bytes, SHA-256
`72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339`.
All six domain/schema/fixture and Classic renderer/editor/worker hashes printed
above remain byte-identical; Review35, Review38, DS1 handoff/review and all prior
evidence are preserved. This is source preservation, not a Classic runtime test.
Inherited primary develop/blob and managed/native binary pins above are unchanged;
they were not re-decompiled or remotely reverified for this correction.

No cross-owner source edit is required. Root can review this narrow correction
against Review38 and these browser results directly. Existing controller/build/
host, authenticated Save As/reopen, actual native keyboard/accessibility/theme,
interactive native comparison and full game acceptance remain open as recorded
above; this local revision fix does not expand those gates or reopen D1/DS1.
