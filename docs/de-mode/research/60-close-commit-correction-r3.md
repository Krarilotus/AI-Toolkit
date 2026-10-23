# Final Close commit correction — round 3

23 October 2026. **F2-CONSUMER-04 is corrected in the narrowly owned source and
frozen for independent Review62.** This is implementation plus synthetic
host/main and real Chromium component evidence. It is not physical Electron,
Tauri/WebView, game, smoothness or full-goal acceptance. Root owns review,
integration, artifacts61, acceptance and commits.

Read goal00, contract01, plan02 and standard05 first, then complete frozen
Review58 and handoff54; Review50, original44/45, adopted23, C1 Review39,
DS1 Review32, panel Review38/root43, performance rationale and native-parity
contracts supplied the relevant obligations. The user's resume supersedes the
historical pause. No persistent goal state was changed and no child was spawned.

Every Toolkit shell command explicitly used `S:/Projects/UCP/AI-Toolkit-DE`.
Entry and source-freeze HEAD are
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, branch `de/separate-game-mode`.
Shared checkout is not worktree isolation. Only the three production/test files
listed below and this new report were edited. No host/bootstrap/core/native,
protocol/DTO, DS1/D1/schema, panel CSS, Classic editor/worker, build/package or
other-owner change was made. No commit/push, CI/PR/release, dependency install,
shared build/generation, native app/game/Steam launch, live/original profile or
settings change, OpenSHC/Ghidra call or blocked cleanup retry occurred.

All source copies, bundles, probes, logs, receipts and timings are outside Git at
`S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3` (**evidence/** below).
**Observed** means executed here; **source-confirmed** means inspected at the
recorded bytes; **inherited** means prior pinned evidence without a fresh rerun;
**unverified** means an open gate.

## Finding response and boundary ownership

**Observed before correction:** the copied Review58 Node witness executes the
actual bootstrap, controller, panel, DS1 and Electron main against its existing
modeled service/window fixture. It submits a clean Close and gates the host
service reply. Actual input and form handlers then create revision1/dirty=true.
Modeled Core Closed removes the context; main calls `win.close()`, but actual
bootstrap `beforeunload` prevents destruction. The modeled window remains alive
without authority; public Save, Close and Restore all return false. Receipt:
`node-before-results.json`, Node PID31064. The exact reviewed64 inputs matched
before correction, including all nine54 consumer pins and both frozen reports.

**Observed real Chromium corroboration before correction:** the retained58
component witness produces the same revision1/dirty=true, enabled input,
revoked unload permission and removed modeled authority. It does not execute
native IPC or OS destruction. Receipt: `browser-before-results.json`.

**Implemented:** existing controller `closing` now denotes the final Close
commit phase and supplies one `editAdmission` predicate. After authorization,
Close sets that phase and synchronously calls required
`panel.setEditAdmission(editAdmission)`, then rechecks the existing permit.
There is no await between this freeze and `desktop.close()`. A missing hook or
failed freeze cannot quietly submit destructive Close. No new document model,
DS1 policy, host API, retirement ledger or recovery framework was introduced.

The minimal new API belongs to the existing panel/view owner: it stores the
controller's predicate and synchronously updates the real DOM controls. The
same predicate guards typing, form Commit, Reset, field selection, undo/redo
and toolbar action handlers. The view has no independent closing flag. Frozen
synthetic input/change events restore the displayed draft/token/field rather
than creating an unseen draft or selecting a different field. One small
`renderedField` cache joins the existing adoption rollback snapshot. This does
not replace or redesign that approved transaction. No bootstrap hook is needed:
the actual bootstrap already passes its mounted panel directly to the controller.

The earlier unsaved prompt remains editable. Typing, Commit, Reset, selection
and undo still revoke the prompt's revision/draft-token authorization. Pending
Open/Save is not made into a document-wide edit lock. The prior public-save,
Save As picker, pending/unknown write and exact-pair adoption gates are retained.

Known `rejected` Close returns restore editing with the same session, draft,
invalid state, selection, token, document and history. Prompt failures and
freeze failures before host submission also restore admission and submit no
Close. If restoring a broken view itself throws, an AggregateError retains
both errors; `closing` has already been cleared and no host call occurred.
Recovery from an externally destroyed/unusable DOM is not promised.

**Uncertain outcome remains explicit:** a transport exception, missing reply or
unrelated result cannot prove that authority survived. These keep the final
edit barrier and surface an explicit unknown-Close error, including through
the actual bootstrap's existing error display. Open/Save/Close/Restore cannot
silently resume. There is no canonical Close-status/recovery API in protocol1.3;
this correction deliberately does not invent one. In-memory session/draft stay
retained, but recovery after an uncertain host/destruction outcome is unverified.
Such a product recovery requirement would need a separately owned host/core
contract. The ordinary stable-content Close witness does not require that move.

## Fresh behavioral checks and preservation

**Observed after correction:** the same Node/main sequence now keeps revision0,
dirty=false, no new draft and unchanged input token while service Close is gated.
Actual controls are disabled; forced actual handlers cannot mutate DS1 or the
draft. Modeled authority then retires, actual main closes its modeled window,
and actual bootstrap `beforeunload` permits it. No new pending content is left
behind. Receipt: `node-after-results.json`, bounded witness Node PID3940.
This closes the source interleaving; physical Windows destruction remains
unverified.

The authored source selection passes **70/70**, zero failures/skips/cancellations,
exit0 (`allFocused-1792781437362.log`). It includes Review58's32 controller/host
checks plus five new focused cases and the same relevant bridge/security/save/
config/titlebar adjacency as54. The earlier37-case targeted run is a subset,
not an additional unique total. New cases cover:

- Actual bootstrap/header/panel/DS1/main with gated service Close, effective
  DOM state, forced handlers, no new revision/draft and normal modeled destruction.
- Clean and invalid-draft refusal with usable undo/redo history, retained exact
  draft/token/selection/ARIA/document, explicit Reset, Commit and subsequent Save.
- Real-panel prompt typing/Commit/Reset/selection/undo remaining available and
  invalidating Discard with zero host Close calls.
- Missing/failing synchronous freeze and prompt exceptions making zero Close
  submissions, then permitting editing/Save/Close normally.
- Lost/missing/unrelated host replies retaining the barrier and blocking public
  lifecycle actions rather than reauthorizing potentially retired authority.

Existing cancellation, pending Save As, unknown/mismatched save, exact-pair
adoption/recovery, rollback, stale draft, clean revision and disposal checks pass
within that selection. Strict desktop TypeScript `--noEmit` passes once at final
source (`types-1792781439020.log`). All three changed JS files pass syntax and
scoped whitespace checks (`checks-results.json`). No unchanged broad suite,
Rust/compiler/generator/package pipeline or separate DS1 suite was rerun.

**Observed real Chromium after correction:** exact58 component Close now yields
revision0/dirty=false, disabled input and retained unload permission while the
synthetic transport retires authority. Additional browser traces confirm all
panel controls and handlers respect the final phase, clean/invalid-draft
refusal restores usability, prompt editing/Commit/undo revokes Discard with
zero Close submissions, and a lost reply keeps editing disabled with its
explicit error. Four58 adoption failures still retain DOM node/text identities,
invalid draft/token, non-first selection, ARIA invalid, focus and backward range
2–7; stale Commit is refused, explicit Reset recovers, clean revision follows
undo/redo and disposed listeners cannot edit. Receipt: `browser-after-results.json`.
These browser events do not claim native input, screen-reader or physical
accessibility/paint behavior.

`close-source-freeze.json` records all64 before/final physical inputs: exactly
three changed and **61 protected inputs unchanged**. That includes main/preload,
bootstrap/native consumers, corrected resolver/window cleanup, core/native,
generated protocol1.3, D1/DS1/schema/pin, panel CSS, Classic editors, retained
workers and frozen54/58. The canonical interface remains inherited unchanged:
`d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191`.
The primary source/binary pins in the prior reports remain intact; no new game
extraction or version-compatibility claim is made.

## Affected input workload

**Observed finite real-browser component comparison:** same browser/tab/fixture,
baseline → candidate → candidate → baseline; each run dispatches180 input events
and180 actual form Commits (120 small,60 approximately1MiB documents with two
524288-character extension strings), with the same numeric fields and explicit
task yields. Source copies are owned; real panel/DS1 handlers execute. All four
runs make **zero host calls during typing/Commit**.

Typing p95/max milliseconds: baseline0.100/0.300 and0.100/0.400;
candidate0.100/0.400 and0.100/0.300. Mixed Commit p95/max:
baseline16.500/18.800 and16.000/21.000;
candidate17.800/22.100 and15.500/17.800. Exact floating-point values and timestamps
are in the four browser result receipts. These non-exclusive finite handler
samples do not establish causal speedup, zero overhead, worst-case8MiB behavior,
frame intervals/FPS, paint latency or native/Classic smoothness. No draw, retained
scene/latest-only queue, batching/cache/dirty invalidation or deferred work changed.
The new input cost is a local admission predicate; no per-input IPC/probe/hash,
decoding, full refresh or additional document parsing was added while typing.

## Commands, failure records and process cleanup

Substantive commands, each with explicit actual Toolkit workdir:

```powershell
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/capture.cjs' before
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/node-before.cjs'
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/build-browser.cjs' baseline
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/browser-server.cjs'
# preview_status -> preview_open(profileId=incognito, owned background tab)
# /baseline/: qa.rollback(), await qa.closeRace(), await qa.workload()
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/run.cjs' focused
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/run.cjs' witness
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/build-browser.cjs' candidate
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/run.cjs' allFocused
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/run.cjs' types
# /candidate/: qa.rollback(), await qa.closeRace(), await qa.admission(), await qa.workload()
# repeat candidate workload, navigate baseline and repeat equal workload
# t3_preview_close(tabId); GET http://127.0.0.1:5201/shutdown; reap exec session
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/checks.cjs'
node 'S:/Projects/UCP/de-research/fix-desktop-close-f2w1-r3/freeze.cjs'
```

Replay into a fresh evidence destination; initial capture is provenance and must
not overwrite this owned baseline. The copied original58 Node/browser drivers
retain their old expected failure; the after driver changes expected outcomes,
not runtime policy. Scripts, source copies and bundle input metafiles are retained.
`failed-probes.md` preserves initial scratch path escaping, absent-bundle server
failure, background rAF timeout, oversized-token fixture and no-index diff exit
handling. No failed run is relabeled passing or used in successful timings.

Final focused/compiler/witness wrappers use60s deadlines, PID/start/exit/log
receipts, identity-checked descendant cleanup and final empty remaining lists.
No test process pool is used. Existing bridge/native-frontend checks do spawn
finite compiler/esbuild children; these are not called zero-process tests.
Initial direct finite esbuild invocations did not print each transient helper
PID; their lifecycle stop ran, they completed, and final inventory is empty.
That initial identity-recording limit is retained rather than reconstructed.

Owned server PID51296, exec session52596, listened only on127.0.0.1:5201 with a
600s maximum. Its explicit shutdown route completed and the exact session reaped
exit0. Earlier failed server PID46564/session66249 was reaped exit1; it is a
driver failure, not a passed server run. Owned tab
`tab_9_422ff097-252a-494d-8cce-c7b46a326f38` closed through `t3_preview_close`;
subsequent `preview_status` reported no tab. `shutdown.json` records empty exact
PID/descendant, attributed Node-command and port5201 queries. No service remains;
no Python/user process or unrelated helper was killed.

## Source freeze and next owner

Production/tests froze at2026-10-23T18:53:09.003Z **before writing this report**.
Root received the exact pins and permission for artifacts61 to refresh through
the coordinator thread, delivery `steered`. Root/core53's older artifact bytes
are superseded for these consumer inputs; none is claimed to execute this fix.

```text
src/js/de-lord-controller.js
  before 12752  5d9ad4e44fe5c4a3918956ad2c6dee95bcfe48ce3dee6d6f5163cfd0569daf4d
  final  14251  9ffabab1ddf7273f62ae7013b3972de62d6e6f276cae1235ec90452b1816fde0
src/js/de-lord-panel.js
  before 21176  32f7817b6493a5048f75933d491a57f4d51b39b544b7f2fb94911738b5f634c0
  final  21936  5812bb193cd2908291c0ce42f07c55fbd794953e0037063a20e444f27dde3491
tests/de-desktop-controller.test.js
  before 31176  b07e6d5ad4b512765ccfa8c378bc85da48c35f7140dad152bbbf19f7f4b1ec6e
  final  42377  fc15101036f59e1fe946d1f6cc31ac81abb24f4f35b24b713689cb1a82563713
```

Full physical file and evidence/report hashes are in the external freeze/final
receipts, avoiding a report self-hash cycle. Frozen54/58 reports and receipts
were preserved. Review62 must independently assess this exact correction;
artifacts61 must match it before runtime observations. Native physical Close,
real dialogs/recovery and both-host isolated open/edit/Save As/reopen beside
Classic, accessibility/paint/smoothness, playable export and the full goal remain
open. This handoff completes only the assigned single-finding correction.
