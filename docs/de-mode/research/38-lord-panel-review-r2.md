# Independent DE LORDJSON panel review — round 2

2026-10-23. **GO for the additive, unexposed component at the exact reviewed
hashes below. All three Review35 findings are CLOSED.** No P0/P1/P2 defect was
observed. One additional **P3**, already present in the original panel, is
reproduced below with a small panel-local fix. It does not lose content, weaken
revision checks or independently block this additive milestone. Root owns its
disposition, acceptance, integration, staging and commits. This GO does not
accept native UI, authenticated saves, Classic behavior or the full DE goal.

Read goal00, contract01, plan02 and standard05 first, then architecture23,
complete handoff26 and Review32, original plus appended handoff33 and full
Review35. Read iso-scrub-performance and native-parity, inspected renderer
history, corrected source diff, full panel/CSS and real session call paths.
The user's resume supersedes the historical pause; the assignment reports that
root has verified the native goal ACTIVE. No goal-status mutation was attempted.
Unchanged D1/DS1 findings remain closed. Full F2/native integration is not a
prerequisite for this bounded component review.

Actual repository/workdir: `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`. Initial and final source captures both pin HEAD
`e3d891cb815a9758542b897065141e71da4a7ca2`. The UCP parent is not Git; shared
checkout is not worktree isolation. Only this report was written in Git.
Review-owned scripts, source copies, bundles, logs and JSON results are under
`S:\Projects\UCP\de-research\review-lord-panel-ui-r2`. No implementation/test,
other report or teammate file was edited/restored. No children, dependency
installation, commits/pushes, CI/dispatch/PR/merge/release, native Toolkit/game/
Steam launch, live/original profile/settings or Classic change occurred.
Every Toolkit exec explicitly supplied the actual repository as workdir.

Evidence labels: **observed** means inspected/executed here; **inherited** means
prior pinned evidence inspected but not rerun; **inferred** means a consequence
of the inspected source; **unverified** identifies an open acceptance gate.

## Review35 closure

### LORD-PANEL-R1-01 / P2 — CLOSED

**Observed baseline reproduction:** the original 16,879-byte panel loses draft
`987654321` when `opponent_type` changes externally to a string. With zero
remaining numeric fields it clears the input and disables Reset; with 103
remaining numeric fields it selects `opponent_type_for_speech` and replaces the
draft with `29`. Independently rerunning the preserved Review35 probe also
reproduces the equal-token manifestation: an external numeric `1002` equals
draft `1002`, Reset disables, and subsequent `1003` cannot commit at revision1.

**Observed corrected behavior:** the panel retains one transient draft record
containing captured field/path, base session revision and text. Both zero-field
and 103-field traces keep `opponent_type` selected, retain `987654321`, show the
stale notice, disable the unavailable Commit and keep Reset enabled. Open, new
saves, selection and history remain guarded. Repeated refresh/translation and an
ineligible form submission neither discard/reselect the draft nor mutate DS1.

Explicit Reset releases the draft. With no fields it leaves an honest disabled
empty editor; an external numeric restoration then follows normally and the
next edit succeeds at revision3. With other fields Reset explicitly selects an
eligible field; the next edit succeeds at revision2 while the external string
remains intact. Equal-token external changes retain the draft and its old
revision; both initial and subsequently typed stale commits reject without
mutation. Reset adopts the current revision and the following edit succeeds.
Clean ordinary numeric updates and intentional typing back to a current token
also behave correctly in these traces.

An additional reviewer-authored sequence changes the drafted field to a string,
then restores it to a numeric value equal to the draft. Refresh plus translation
still retains its captured old revision, transition guards and Reset. Stale
Commit rejects; explicit Reset permits the next edit. This confirms that restored
eligibility cannot silently rebase the captured draft. Caller-authorized
`setSession` remains the explicit adoption/reset boundary.

### LORD-PANEL-R1-02 / P3 — CLOSED

**Observed baseline:** Check save result is enabled during an unknown save and
draft, but clicking it leaves callback count unchanged and the slot unknown.

**Observed correction:** the enabled control now invokes reconciliation during
a draft. Both pending and unknown traces retain the exact existing snapshot;
repeated unknown retains its slot. A matching synthetic older commit preserves
current document identity, revision, history entry/source-byte cost and draft,
and keeps later differing content dirty. The subsequent draft Commit succeeds.
No new snapshot, retry, replay or panel-owned acknowledgment is introduced.

The independent async trace invokes reconciliation once despite a repeated
click, then makes the drafted field unavailable while the callback is pending.
Settling the older save retains the invalid/stale draft, field selection,
validation flag, enabled Reset, current bytes and revision. A success-shaped
callback return without acknowledgment retains the exact unknown operation and
draft. Callback data establishes neither save success nor adoption.

### LORD-PANEL-R1-03 / P3 — CLOSED

**Observed baseline:** `NaN` plus Commit sets `aria-invalid=true`; translation
refresh leaves its notice/draft but changes the flag to false.

**Observed correction:** repeated translation retains the error text, draft,
document and true flag. Input, successful Commit, explicit Reset and authorized
adoption clear the flag through their existing explicit actions. Reconciliation
plus translation preserves validation on an unresolved invalid draft. The
message's invalid flag is now retained with its key/detail; no second validator
or language policy was added.

## Additional actionable finding

### LORD-PANEL-R2-01 / P3 — clean editor revision remains stale after an external edit/undo round trip

**Observed in both baseline and corrected panel.** In
`src/js/de-lord-panel.js:207`, editor refresh is keyed only by D1 document object
identity. DS1's monotonic session revision can advance while undo restores the
same immutable D1 document object. `editorRevision` is updated only by
`updateEditor` at line173; it consequently stays0 while `state.revision` is2.

Exact real-browser reproduction on either owned page:

```js
qa.remount(); qa.load('token');
const s = qa.session(), displayed = s.read().document;
s.replaceScalar(0, ['lord', 'opponent_type'], 1001);
s.undo(1);
qa.panel.refresh();
// s.read().document === displayed; s.read().revision === 2
document.querySelector('.deLordPanel form').dispatchEvent(
  new Event('submit', {bubbles: true, cancelable: true}));
```

The unchanged input `1e+03` reports “The document changed. Reset input and review
the current token before committing.” with `aria-invalid=true`, but Reset is
disabled because there is no draft. Typing `1003` captures the stale revision0
and still fails at revision2. Once that creates a draft, Reset becomes usable;
Reset followed by retyping commits at revision3. The original bytes/revision
remain intact on all failed attempts. This is a recoverable view synchronization
defect, not a DS1 failure or wrong-revision write.

**Smallest fix, panel owner:** synchronize a clean editor's `editorRevision`
with the just-read session revision independently of document identity. Keep
captured draft revisions unchanged. Consider moving the stale-draft revision
notice check outside the document-identity branch too, so a draft notices the
same round trip. These are scalar metadata checks; retain existing choice,
token and diagnostic invalidation rather than rebuilding all DOM on every
refresh. One focused clean/drafted edit→undo→refresh regression is sufficient;
no session/parser/schema/host change or generic form framework is needed.

This newly found P3 does not reopen R1-01's captured-draft loss/equality paths,
which pass at the corrected hash. Root can track the small correction for the
next panel change before exposure without making full F2 a prerequisite here.

## Authority, async ownership and preservation

**Observed:** one injected accepted session remains the sole document/history/
saved-content owner. The panel imports D1 path/numberToken access and the
generated LORD inventory, consumes canonical DS1 assessments and makes
revision-checked scalar commands. No parser, serializer, number conversion,
history manager, schema inventory, backend policy or save service is duplicated.
Unknown/missing/ambiguous/nonnumeric content stays preserved; target diagnostics
remain distinct from preservation and unverified game behavior.

The existing fresh lifecycle trace suppresses late errors after adoption,
prevents detached listeners replaying actions after remount, retains pending
saves across remount, ignores success-shaped return data and verifies translation
injection. The disposal-settlement probe passes with identical current session,
bytes/root, one mounted section and busy=false after old success settlement.

Additional independent coverage replaces the session during an async reconcile,
then creates a new invalid draft before rejecting the old callback. The new
session, document, root, text, error and validation flag stay identical; the old
unknown snapshot remains attached to its old session. Async settlement never
adopts callback data. Disposal still leaves actual accepted backend operations
with their controller/host owner, as required.

All displayed source/error/diagnostic content uses textContent. CSS remains
byte-identical and scoped to the panel within the components layer. Source
search finds panel references only in its own JS/CSS under src/scripts: no
bootstrap/host/Classic wiring has appeared. No new cross-owner edit is requested.

## Fresh commands, finite traces and evidence

Node `v26.7.0`; actual browser T3CodeBeta0.1.2 / Electron44.9.3 /
Chromium152.0.7977.167, Windows x64, secure loopback context, 1280×800 viewport.
These are real-browser component traces with synthetic DOM events and
explicitly synthetic controller receipts. They are not native keyboard/pointer,
authenticated filesystem writes, paint measurements or game acceptance.

All commands use explicit `exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\setup.cjs'
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\capture.cjs'
node --check 'S:\Projects\UCP\AI-Toolkit-DE\src\js\de-lord-panel.js'
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\build.cjs' baseline
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\build.cjs' candidate
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\server.cjs'
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\verify.cjs'
# After probes and server shutdown:
node 'S:\Projects\UCP\de-research\review-lord-panel-ui-r2\capture.cjs' after
```

The baseline is the exact Review35 before-image; scratch-only import redirects
point it at unchanged real shared modules. Candidate bundles actual current
source. Existing esbuild produces baseline134,315 bytes and candidate135,123
bytes, each seven local inputs and zero external/Node imports. Syntax/bundling
pass. Path spelling explains differences from the correction owner's bundle
lengths; source byte identity is checked separately.

Use T3 preview_status, then preview_open(reuseExistingTab:false,open:false), and
the returned tabId on every subsequent call. Navigate the owned tab to
`http://127.0.0.1:5194/baseline/`. Read each script as exact UTF-8 using
`[System.IO.File]::ReadAllText(path,[System.Text.Encoding]::UTF8)`; evaluate its
trimmed complete text with awaitPromise:true:

1. Baseline `independent-probes.js` freshly reproduces all three Review35 defects;
   `type-loss-observation.js` independently records zero and103 remaining fields.
2. Candidate: existing `dom-qa.js` **44 checks pass**, `lifecycle-qa.js` **nine
   checks pass**, correction `regression-qa.js` **36 checks pass**, and
   `dispose-settlement-probe.js` passes.
3. Candidate `reviewer-probes.js` completes its additional13 labeled checks/
   waits, records R2-01 and verifies the async/restored-eligibility interactions
   above. A separate baseline expression reproduces R2-01 too.

These are finite traces, not102 repository tests; some labels are settlement
checks. All returned page-error/unhandled-rejection arrays are empty. The
existing60-event instrumented typing trace makes zero DS1 read/replace/undo/
redo calls. No unchanged180-domain-test rerun or broad/native suite is claimed.
Results are retained as baseline-independent-results.json,
baseline-type-loss-results.json, baseline-clean-revision-edge.json,
candidate-*-results.json and reviewer-probes-results.json, with scripts alongside.

T3 snapshot returned exactly
`Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`
Navigation/evaluation worked; no alternate browser was needed. This review
uses DOM evidence for the correction and inherits the unchanged CSS/earlier
visual evidence; it claims no new screenshot or screen-reader observation.

Owned tab `tab_4_422ff097-252a-494d-8cce-c7b46a326f38` was closed. Server PID37360 /
exec session77956 was stopped with Ctrl-C. Subsequent PID and5194 LISTEN queries
returned no entries. shutdown-results.json records that cleanup.

## Performance assessment and limits

**Observed source preservation:** retained worker scenes, latest-only queues,
batching, caches, dirty invalidation, visible-row updates and deferred work are
untouched. Diagnostic rendering still caps/reuses40 rows plus a truncation row;
choices rebuild only on eligibility or translation changes. There is no typing/
draw parser, session read, profile probe, large hash, decode, IPC, timer/polling or
animation loop. Explicit Commit delegates existing synchronous D1/DS1 work.

**Fresh owned before/after DOM task comparison:** original/final panel in
baseline/candidate/candidate/baseline order, fresh navigation per run, identical
real DS1, fixtures and1280×800 viewport. Each runs typing-workload.js (120 events)
then performance-run-expression.js:90 small input+Commit steps and60 large steps
with16ms scheduled tasks. Raw full summaries, heap samples, intervals and scope
labels are in fresh-performance-results.json. Handler p95 / max milliseconds:

- Typing baseline:0.20/0.20 and0.10/0.70; candidate:0.10/0.20 and0.10/0.20.
  All four runs make zero DS1 calls and retain revision0.
- 5,079-byte fixture baseline:2.10/4.00 and2.40/2.90;
  candidate:2.30/2.70 and1.70/2.50.
- 1,048,636-byte fixture baseline:18.90/28.50 and18.50/18.80;
  candidate:26.50/27.00 and17.50/19.70. Means are15.97/15.60 baseline and
  17.82/15.26 candidate. The first candidate run has a higher tail; the second
  does not reproduce it. Large input-task interval p95/max is35.80/45.20 and
  34.90/36.60 baseline,43.30/44.20 and34.30/36.40 candidate.

No >=50ms long tasks are observed. Small outputs match at revision89/token90,
32 history entries/162,560 source bytes; large outputs match at revision60/
token60,15 entries/15,729,555 bytes. Samples show run-to-run variation, including
one candidate upper-tail increase; they do not prove zero overhead or isolate
a causal regression. Heap samples are unforced-GC process observations, not
allocation attribution or retained-memory bounds.

This measures actual DOM task handlers and task pacing, **not paint/frame/rAF,
physical presentation, native input, native/Classic smoothness or8MiB worst-case
cost**. It is not a helper microbenchmark relabelled UI evidence. Owned native
interactive comparison remains necessary when those paths are integrated.

## Exact source/evidence identities

Both44-record source/evidence captures match the correction receipt with zero
mismatches. Independently verifying the correction final manifest matches all97
owned/protected/evidence records, including its earlier outputs; none was
rewritten. Reviewed-source.diff is the independently captured original→current
panel diff. CSS, six domain/schema/fixture inputs, Review35, prior handoff/session
review, performance documents and Classic renderer/editor/worker pins are intact.
Exact relevant working-tree SHA-256:

```text
8fd2cf08ea814d2e86abe06f029a712c437162b74e962180f4547c85ffc2f663  src/js/de-lord-panel.js (18117)
72a2a8a9bde46fbea26c64384c807c4e4c34305cbb22a24cf0ed5e98d7b18339  src/css/de-lord-panel.css (3452)
b1da483fd5de8902e988c607348cad131734b9000092d092546796696f6ab23b  docs/de-mode/research/33-lord-panel-handoff.md (33277)
d84f7bd4cce6960e1726666aa5a14ccaee13c3c7e72df0a6ffa15d315302273f  docs/de-mode/research/35-lord-panel-review-r1.md (18203)
88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a  src/shared/de-document-session.js
9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1  src/shared/lossless-json.js
325d33b872722c7056c6bbe9fcf10ecb7aa848e47a9444953e0cbc57182b3174  src/shared/generated/de-lord-pin.js
fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25  src/js/de-lord-format.js
aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4  config/de-lord-schema.json
a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15  tests/fixtures/de-documents/complete-synthetic.lordjson (5079)
79cdb63a64ff68de5b36863472e2b4514ecd8b5f3af60f24953459ad66290ec7  docs/iso-scrub-performance.md
9705170f6d8bda74b9cbded12fedb1d81d633bb6a57324d7e9fe8aaeba249763  docs/native-parity.md
8aeae13a13e986663f978725c5173612109e2cfeb0d3f76d2bb94c681a9c4bb8  src/js/iso-view.js
```

Original panel baseline:16,879 bytes,
`f8461dbb8fea77ce07cd4c4aaf99e31d6427afa85bdf0401b92764b0e39573d6`.
The original handoff33 prefix is exactly17,147 bytes with SHA-256
`747c48d0fb5fefcfa96f72f4d438ee67bd37c60ae4bb03519ab29c96314b85eb`.
Fresh baseline bundle SHA-256:
`61157b09f9af70d1e7721981a5b33492b47a0a4ae6e7566427031155f0783524`;
candidate bundle:
`c8f2f3121301f221af38fe639654955307e13fee73bc94674d84ebadf9cac8af`.
Full receipts are before/after-fingerprints.json and
inherited-evidence-verification.json; review-evidence-fingerprints.json records
this review's artifacts and report hash outside Git, avoiding self-hashing.

**Inherited primary pins, not re-decompiled or remotely reverified here:**
develop `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, declaration blob
`9cd4c4ad0a601aab1217bb786e741ef15a39f1be`, transfer blob
`97bf5fcabdd626a6e80c1e17e546f357fc2d4874`; managed/native SHA-256
`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` /
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
The canonical JSON remains the only maintained LORD inventory; generated data
and repeated tests do not independently approve a source change.

## Remaining owners and acceptance

The panel owner has the small R2-01 revision-cache fix; no cross-owner source
change is required for it. Root owns integration and deciding when to take that
nonblocking correction. The existing controller/build/host gates remain:
authenticated fresh DE binding before eager Classic startup, real raw bytes and
immutable identities, explicit intermediate refreshes, dialogs/unsaved/freeze/
drain/adopt, actual leased writes and matching receipts/reconciliation, both-host
packaging/WebCrypto and a fresh DE open/edit/Save As/reopen beside unchanged
Classic. Actual keyboard/accessibility/theme behavior and native interactive
comparison remain unverified. Playable export, assets/media/packages and isolated
game acceptance remain open under the full user goal. No broad refactor,
additional domain test campaign or full F2 gate is requested for this additive GO.
