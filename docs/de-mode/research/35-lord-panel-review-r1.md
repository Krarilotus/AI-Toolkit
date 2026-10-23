# Independent DE LORDJSON panel review — round 1

2026-10-23. **NO-GO for the additive slice at the exact hashes below until
LORD-PANEL-R1-01 is corrected.** One P2 draft-ownership defect is reproduced;
two P3 control/accessibility defects are also reproduced. No P0/P1 defect,
second document/save authority, unsafe text insertion or host/Classic change
was observed. The requested correction is local to the panel. Full F2, native
integration and game acceptance are not prerequisites for this slice's GO.
Root owns disposition, integration, acceptance and commits.

Read the exact goal00, contract01, plan02 and standard05 first, then
architecture23, the complete handoff26 including its correction, Review32 and
the complete handoff33. Also read iso-scrub-performance and native-parity,
inspected the relevant renderer history, the complete panel/CSS, their domain
call sites and the authored component evidence. The user's resume supersedes
the historical pause. This review does not reopen unchanged D1/DS1 findings.

Actual repository/workdir: `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`. Initial HEAD was
`ebff3b1e2c5bce415277394e3322099a20919f19`; final source capture observed the
coordinator's later texture-crop commit
`61c2fa16524c7b06d1638eed9c1593afd689e469`. All reviewed panel and protected
inputs remained identical. Shared checkout is not worktree isolation.

Only this report was written in Git. Review-owned scratch is
`S:\Projects\UCP\de-research\review-lord-panel-ui-r1`. No implementation/test,
other report or teammate file was edited/restored. No children, dependency
installation, commit/push, CI/dispatch/PR/merge/release, native app/game/Steam
launch, live/original profile/settings or Classic change occurred. Every Toolkit
exec command explicitly used the actual repository as workdir.

Evidence labels: **observed** means inspected/executed by this reviewer;
**inherited** means prior pinned evidence inspected but not rerun;
**inferred** means a consequence of the inspected implementation;
**unverified** marks an open integration or acceptance gate.

## Reproduced findings

### LORD-PANEL-R1-01 / P2 — refresh can discard a captured input draft

**Observed:** `src/js/de-lord-panel.js:197–204` rebuilds choices when a field's
numeric eligibility changes. If the selected field is no longer eligible,
line202 calls `updateEditor(true)`. Lines159–164 then replace the input with
another field's token, or the empty string. This happens during ordinary
`refresh()`, without Commit, Reset input or caller-authorized `setSession()`.
`hasDraft()` at line106 also depends on the *current* choices and lexeme rather
than the captured draft's identity/lifetime.

Fresh real-browser reproduction using the unchanged fixture and actual DS1:

1. `qa.remount(); qa.load('token')` opens the authored numeric
   `lord.opponent_type: 1e+03` fixture.
2. Enter `987654321` and dispatch the input event, without committing.
3. Obtain `s = qa.session()` and call
   `s.replaceScalar(s.read().revision, ['lord','opponent_type'], 'external type change')`.
4. Call `qa.panel.refresh()`.

The input becomes `''`; Commit, Reset and selection are disabled. The notice
says to Reset input, but the control is disabled. The entered `987654321` is
gone. **Inferred from the same branch:** with other eligible fields it selects
an alternative and overwrites the draft with that field's token. The session correctly retains
the externally changed bytes; the lost state is the panel's uncommitted draft.
External numeric-type changes are an explicitly supported refresh case in
handoff33 and its existing lifecycle trace, so this is not a hostile-session
or speculative framework requirement.

A second reproduced manifestation uses an external *numeric* edit. Type
`1002`, externally set the same field to token `1002`, then refresh. The visible
input now equals the new current token, so `hasDraft()` becomes false and Reset
is disabled, but `draftRevision` remains0 while the session revision is1.
Commit reports stale revision and asks for the disabled Reset. Typing `1003`
and committing still fails at revision1. Editing the input first to enable
Reset, resetting, then retyping permits revision2. This is a recoverable
stale-revision usability defect, rather than a wrong-revision write; DS1's
rejection is correct. It shares the draft-state ownership problem above.

**Narrow fix, panel owner:** retain a captured draft's field/path, base revision
and text independently of refreshed eligibility/current-token equality. A
refresh may mark that draft stale/unavailable and disable Commit; it must retain
the text and provide an enabled explicit Reset before switching fields or
discarding it. Keep draft transition guards active until that explicit
resolution. An unchanged clean editor can still track external updates.
Caller-authorized `setSession()` remains the documented adoption/reset boundary.
No DS1/parser/history change or generic draft framework is needed. A small
regression trace should cover both type loss and a new current token equal to
the draft, including enabled Reset and subsequent successful editing.

### LORD-PANEL-R1-02 / P3 — reconciliation is enabled but silently inert during a draft

**Observed:** `controls()` at line113 enables Check save result whenever a
settled callback leaves a pending/unknown slot. Its condition does not include
draft state. `invoke()` at line222 returns for *every* action when `hasDraft()`
is true, including reconciliation.

Fresh trace: create an unknown synthetic save, type `1235` without committing,
then click the enabled Check save result button. The reconciliation callback
count stays5 before/after; the save remains unknown; no notice explains the
ignored click. This neither replays the write nor fabricates success, and
Commit/Reset provides a workaround, so it does not independently block this
additive milestone.

**Narrow fix, panel owner:** make control enablement and invocation agree.
Prefer allowing reconciliation of the existing operation while retaining the
draft: DS1 acknowledgment of an older snapshot does not replace current
content. If the chosen product policy blocks reconciliation during a draft,
disable the button and explain the required resolution instead. Do not add a
save authority or new retry policy to the view.

### LORD-PANEL-R1-03 / P3 — translation refresh clears a retained validation error's ARIA state

**Observed:** enter `NaN` and Commit. The retained input has `aria-invalid=true`
and its error notice. Call `panel.refreshTranslations()`. Lines260–265 replay
`setMessage(messageKey, messageDetail)` without its third argument, whose
default at line96 is false. The unchanged `NaN` draft and error notice remain,
but `aria-invalid` changes to false. Native form labels/submission otherwise
work in the synthetic trace.

**Narrow fix, panel owner:** retain the message's invalid-input flag and replay
it when translating, clearing it on the existing input/reset/success actions.
No catalogue, language-policy or CSS redesign is requested. This accessibility
state defect is nonblocking for the unexposed additive commit.

## Ownership, preservation and resource assessment

**Observed:** the component consumes one injected DS1 session. It does not
construct sessions, parse/serialize JSON, maintain document history, hash saves,
acknowledge receipts, select roots or dispatch host IPC. Generated
`de-lord-pin.schema.fields` supplies the scalar inventory; D1/DS1 supplies
availability, diagnostics, exact token lookup and revision-checked changes.
`numberToken(input.value)` preserves exact numeric spelling/precision semantics.
Unknown, missing, ambiguous and nonnumeric content is retained; disabled
editing and canonical-target diagnostics do not prohibit preservation saves.
No defaults or guessed enum substitutions are inserted.

The four optional controller callbacks receive the captured session. Return
data is not adopted and does not establish a successful save. The fresh traces
cover failure before/after submission, mismatched receipts, unknown/repeated
unknown, reconciliation, older committed snapshots with later edits, and
success-shaped callback returns. Save authority remains DS1 plus the eventual
authenticated backend/controller. Rejected/unknown outcomes do not clear dirty
state or authorize a second save. Existing controller unsaved/draft/freeze/
drain/adopt gates remain integration-owner work; R1-01 concerns the panel's own
ordinary refresh, not a demand that this component take over those gates.

Async callback errors from a replaced session are suppressed by generation;
disposal prevents old settlement from republishing into a remount. A fresh
additional probe disposed during an unresolved Open callback, remounted, then
resolved the old callback with a success-shaped returned session. The current
session, bytes and root stayed identical, one root remained and busy was false.
Listeners are removed on disposal and automatic same-container remount.
Caller-owned backend writes are not cancelled by disposal. This is the correct
boundary; no host cancellation mechanism is requested here.

Filename/diagnostic/error content is written through textContent. Labels wrap
native form controls; explicit button types and form submission are present.
All CSS selectors use the panel/BEM namespace inside the existing components
layer; no Classic element/style hook or automatic mount was introduced.
Inspected inherited desktop/mobile/unknown/generic PNGs are legible and show
the stated honest preservation/game distinctions. Translation injection and
refresh work apart from R1-03. Actual screen-reader/native-keyboard/theme-pack
acceptance remains unverified, not a new blocker for this slice.

**Observed:** diagnostics render at most40 rows plus one truncation row;
existing rows and stable editor controls are reused. Scalar choices come from
the fixed generated inventory and rebuild only for eligibility or translation
changes. Sixty typing events freshly make zero session read/replace/undo/redo
calls. There is no timer, polling, animation loop, profile probe, hash, decode,
IPC or parser on typing/draw paths. Explicit Commit delegates to existing D1/DS1.
Retained worker scenes, latest-only queues, batching, caches, dirty invalidation
and deferred work are untouched; `iso-view.js` matches its pinned hash.

**Inherited, not rerun:** handoff33's owned three-node DS1 baseline versus panel
uses actual DOM handlers and16ms scheduled tasks, with matching bytes/history.
Small-fixture handler p95 is1.50ms for both; large-fixture p95 is21.60ms baseline
and20.60ms panel, with respective maxima26.30/23.90ms. These finite results and
their raw scope labels are consistent with the handoff. Heap samples are not
allocation attribution or leak bounds. They do not establish frame/paint,
native/Classic smoothness or default8MiB worst-case edit cost. No new runtime
path was changed by this review, so another performance run would not close a
new concern. Actual integration still needs its owned interactive comparison.

## Fresh reproduction and evidence

Node `v26.7.0`; real browser identifies
T3CodeBeta/0.1.2, Electron44.9.3, Chromium152.0.7977.167, Windows x64,
secure context, review viewport1280x800. No native Toolkit was launched.

All shell commands below use explicit
`exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r1\capture-inputs.cjs'
node --check 'S:\Projects\UCP\AI-Toolkit-DE\src\js\de-lord-panel.js'
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r1\build.cjs'
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r1\server.cjs'
# After the browser probes and server shutdown:
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r1\capture-inputs.cjs' after
```

The builder copies the existing fixture/controller/QA scripts into review-owned
scratch and bundles the actual source anew with existing esbuild. Result:
134,217 bytes, seven local inputs, zero external/Node imports. The20-byte size
difference from the original bundle reflects the longer scratch source path.
No original evidence was overwritten. No mirrored repository test suite or
new dependency was added.

Use T3 preview_status, then preview_open with reuseExistingTab:false, and
navigate that owned tab to `http://127.0.0.1:5192`. Read each of these scratch
scripts as exact UTF-8 and pass the complete trimmed text to preview_evaluate
with awaitPromise:true, in order:

1. `dom-qa.js`: the existing44-check finite DOM trace freshly passes.
2. `lifecycle-qa.js`: the existing nine-check finite lifecycle trace freshly
   passes, including the zero-call typing instrumentation.
3. `independent-probes.js`: captures both R1-01 manifestations, R1-02 and R1-03,
   stable controls and zero page errors. The type-loss observation is recorded
   as `unavailableDraft`; the coincidence trace includes recovery after Reset.
4. `dispose-settlement-probe.js`: fresh old-callback success/remount check passes.

These are browser component traces with synthetic DOM events and explicitly
synthetic controller receipts, not53 repository tests, native input or
authenticated writes. Results are `fresh-dom-results.json`,
`fresh-lifecycle-results.json`, `independent-results.json` and
`dispose-settlement-results.json`. Original evidence/fingerprint comparisons,
copied reviewed inputs, scripts and bundle metafile are alongside them.

Tool limits are recorded honestly. T3 snapshot returned
`Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`
Navigation/evaluation worked; no alternate automation system was needed.
Visual inspection reused the four exact pinned existing PNGs. An initial
Get-Content script read used PowerShell's non-UTF-8 default, corrupting the
ellipsis in a button-label lookup; that harness invocation failed with
`TypeError: Cannot read properties of undefined (reading 'disabled')`.
Reading via `[System.IO.File]::ReadAllText(path, [System.Text.Encoding]::UTF8)`
corrected only the transport of the same QA script; its complete rerun passed.
No product source changed. No paint/rAF measurement or broad D1/DS1 rerun is
claimed.

Owned preview tab `tab_2_422ff097-252a-494d-8cce-c7b46a326f38` was closed.
The review-only loopback server PID43516 / exec session36485 was stopped with
Ctrl-C; subsequent port5192 LISTEN and PID queries returned no entries. No
review service is intentionally left running.

## Exact reviewed fingerprints and inherited source pins

Both captures match every entry in
`S:\Projects\UCP\de-research\lord-panel-ui\final-manifest.json`:
three owned files, eleven source-input records and24 evidence files. Some source
records intentionally repeat the panel/CSS. Lengths and SHA-256 all match;
the coordinator's concurrent commit did not change them.

```text
f8461dbb8fea77ce07cd4c4aaf99e31d6427afa85bdf0401b92764b0e39573d6  src/js/de-lord-panel.js (16879)
72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339  src/css/de-lord-panel.css (3452)
747c48d0fb5fefcfa96f72f4d438ee67bd37c60ae4bb03519ab29c96314b85eb  docs/de-mode/research/33-lord-panel-handoff.md (17147)
88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a  src/shared/de-document-session.js (8203)
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js (20999)
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js (25468)
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js (12614)
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json (33352)
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
79cdb63a64ff68de5b36863472e2b4514ecd8b5f3af60f24953459ad66290ec7  docs/iso-scrub-performance.md (12676)
9705170f6d8bda74b9cbded12fedb1d81d633bb6a57324d7e9fe8aaeba249763  docs/native-parity.md (9575)
8aeae13a13e986663f978725c5173612109e2cfeb0d3f76d2bb94c681a9c4bb8  src/js/iso-view.js (101762)
```

Full source/evidence receipt hashes are in before/after-fingerprints.json;
review-evidence-fingerprints.json records this review's scripts/results/report
without embedding a self-hash in this report. D1/DS1/codegen source bytes remain
those accepted by Review18/Review32; their findings stay closed.

**Inherited primary pins, not re-decompiled or remotely reverified here:**
develop `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, declaration blob
`9cd4c4ad0a601aab1217bb786e741ef15a39f1be`, transfer blob
`97bf5fcabdd626a6e80c1e17e546f357fc2d4874`; managed SHA-256
`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`,
native SHA-256
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
Canonical JSON remains the sole maintained LORD inventory; generated guards
are not an independent source approval.

## Remaining integration gates and disposition

Correct R1-01 at the panel owner and obtain focused closure against the new
hashes. R1-02/R1-03 have narrow fixes and are not separate milestone blockers.
No new backend abstraction, source inventory, framework, parser or broad
research round is requested. CSS and the authority separation need no change
on the evidence reviewed here.

Build/controller/host owners still own actual DS1/panel bundling and CSS load,
generated-schema checks, authenticated fresh DE context binding before eager
Classic startup, raw-byte transport and owner identities, dialogs/unsaved/
freeze/drain/adopt gates, real leased writes and unknown reconciliation. They
must explicitly refresh intermediate transitions and gate session adoption.
Fresh DE open/edit/Save As/reopen beside unchanged Classic, both-host package/
WebCrypto loading, actual picker/keyboard/theme/accessibility behavior and
affected interactive before/after observations remain unverified. Those are
pre-exposure/integration gates, not additional reasons to refuse an otherwise
correct additive component commit. Playable export, assets/media/packages and
isolated game acceptance remain part of the full goal.
