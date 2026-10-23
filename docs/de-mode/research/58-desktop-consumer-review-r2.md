# Independent F2W1 consumer correction review — round 2

23 October 2026. **NO-GO for the corrected consumer source: one new P2 remains
at the final Close commit phase.** The three Review50 corrections and the narrow
panel adoption transaction are otherwise supported by this bounded review.
Root has received the new witness and owns correction60, fresh review,
integration, acceptance and commits. This is not desktop/game acceptance.

Read goal00, contract01, plan02 and standard05 first; then frozen Review50 and
handoff54, initial44/45, adopted23 and relevant05/21, C1 handoff25/Review39,
DS1 handoff26/Review32, panel33/Review38/root43, performance and native-parity
contracts. The resumed full objective supersedes the historical pause. One Rust
authority, one DS1 and actual ingress/callback follow-through remain requirements;
green component tests alone do not accept this workflow.

All Toolkit shell commands explicitly used `S:/Projects/UCP/AI-Toolkit-DE`,
branch `de/separate-game-mode`. Start and final HEAD:
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`. Shared checkout is not worktree
isolation. This report is the only repository file written. All scratch sources,
bundles, receipts and logs are outside Git under
`S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2` (**review/** below).
No children, production/test/generated edit, shared build, contract generation,
dependency installation, commit/push, CI/PR/merge/release, native Toolkit/game/
Steam launch, original/live profile/settings or Classic change occurred.

Evidence labels: **observed** means executed here; **source-confirmed** means
inspected at the recorded bytes; **inherited** means prior pinned evidence,
not a fresh execution claim; **unverified** means an outstanding gate.

## F2-CONSUMER-04 / P2 — post-authorized Close permits a new edit after authority retirement begins

**Observed synthetic witness through the actual bootstrap, controller, panel,
DS1 and Electron main.** Open a clean document, click the header Close button,
and hold the service Close response after submission. While that request is
pending, enter a new number and submit the actual panel form. Commit succeeds:
revision1, dirty=true. Complete canonical-modeled Close, removing the backend
context. Actual main then calls `win.close()`. The actual bootstrap's
`beforeunload` callback now refuses because `canUnload()` rechecks the changed
revision/draft token. The modeled window stays alive with its new dirty DS1,
but its context is gone. Subsequent public Save, Close and Restore connection
all return false because `closing` remains truthy.

`review/node-results.json` records that sequence (Node PID52104,
2026-10-23T18:33:36.949Z). Only service timing/receipts and Electron/DOM window
mechanics are synthetic; main's handler, bootstrap callback and edit/session
code are actual reviewed source. The BrowserWindow fixture was extended in
scratch to invoke the real `beforeunload` callback before destruction. This
demonstrates a supported asynchronous interleaving, **not a physical Electron
or Windows close observation**.

**Observed corroboration in a real Chromium component:** actual panel input and
form submission with a gated synthetic Close transport also produce revision1,
dirty=true, enabled input, revoked unload permission, removed modeled authority,
and false Save/Close/Restore results. `review/browser-results.json` records it.
This separate trace supplies browser DOM behavior; it does not supply native IPC,
OS modality, HWND destruction or an authenticated Rust execution.

**Source-confirmed cause:** `src/js/de-lord-controller.js:207` sets
`closing=permit` immediately before awaiting `desktop.close()` and clears it
only on an exception. `canUnload` at line224 correctly revokes stale permits,
but that revocation cannot undo a successful destructive backend Close.
Panel `controls` at line108 and the input/submit/history handlers at
lines270/295/309 do not share a final-close edit freeze. Main at line462 awaits
core Close, then calls `win.close()` after a `closed` result. Native
`src-tauri/src/de_context.rs:254` likewise calls canonical Close before
`window.close()` at line267. Native physical outcome is unverified; no claim
that its WebView actually retains or destroys the new edit was made here.

**Owner and smallest correction:** controller plus its existing panel/view
boundary should enter one final Close commit phase before host IPC/authority
retirement. Its actual handlers and DOM controls, including typing, Commit,
Reset/selection and undo/redo as applicable, must honor that same view authority
until destruction or a known refusal returns. Keep editing during the earlier
confirmation prompt: it must still invalidate that prompt's authorization.
Known refusal can restore editing while retaining session/draft. Do not make a
late `beforeunload` check the only protection after backend retirement; do not
add a second DS1 policy or backend retirement ledger. A true prepare/confirm
close handshake is an alternative if necessary, not a requested broad redesign.

Root acknowledged the witness as actionable P2 and held final53 packages after
their current stage. No correction was made by this reviewer. This finding is
separate from the now-corrected prompt → public Save → Discard race.

## Review50 closure and canonical adoption follow-through

- **F2-CONSUMER-01 / P2: CLOSED for its reported prompt/save race.** One
  controller admission now covers Open, Close, public Save and Save As, including
  a pending picker. The gate's private requested Save is retained. Fresh authored
  checks execute the actual bootstrap/header/panel sequence and observe zero
  writes while the prompt owns admission; revision/token/pending checks reject
  stale authorization. The new finding above concerns the later commit phase.
- **F2-CONSUMER-02 / P2: CLOSED.** Source tracing and the fresh actual-main /
  retained-resolver synthetic test confirm that explicit non-null bound authority
  cannot fall back when absent. List/read/tile paths share
  `gameRootOrDefault` at `src/node/game-map.js:533`. Deliberate omitted/null
  standalone discovery remains. No host-only precheck, repeated profile probe,
  hash, map algorithm copy or cache change was added.
- **F2-CONSUMER-03 / P3: CLOSED.** Fresh modeled actual-main cases cover parent
  loss after picker, after file read and during binding, plus rejected fresh
  binding. Captured-context checks precede child side effects; failed owned
  children and contexts are cleaned even when readiness rejected. Successful
  inheritance retains its original root and `restoreProject=0`. No native
  window-lifetime claim follows from these VM tests.

The complete frozen53 interface including clarification was read with actual
generated protocol1.3 DTOs. Interface SHA-256:
`d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191`.
Generated types:
`5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96`;
contract:
`509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace`.

**Source-confirmed plus fresh synthetic recovery tests:** real DS1 parses the
candidate before ready adoption; exact owner/document/previous pair is checked;
panel installation completes synchronously before controller state changes;
finish uses that same pair. Invalid/foreign/stale/late-disposed candidates attempt
authenticated release in finally. Old authority is not released on picker/prompt
or failed installation. Uncertain ready preserves the old DS1/draft and queries
exact status; unavailable/conflicting/mismatched status keeps the transition
blocked. Only canonical not-found proof allows the prior authority fallback and
idempotent candidate release. Lost finish preserves the installed new DS1/pair
and blocks Open/Save/Close until exact status. Ready repeats the same finish;
committed settles without remount; released does not manufacture success.

Electron main/preload and native frontend inject authenticated current owner,
carry narrow lifecycle commands, and honor canonical Close refusal. The unchanged
CoreClient consumes Rust-generated operation/result inventories; no second JS
write list or retirement policy appeared. Original recovery retains the exact
session/history/snapshot and does not bind defaults or replay writes. Late save
settlement updates its captured DS1 without remounting another session.

Core49's four disk/admission/native-root findings belong to correction53 and
independent59. This review does **not** independently close their Rust disk
internals, lifetime counts or real helper recovery. It traces consumer promises
and actual host callers, with the Close exception stated above.

## Panel transaction and preservation

**Observed real browser component:** four one-shot failures — first read,
choice rebuild after mutation, diagnostics after mutation, and second read —
were injected into `panel.setSession`. Old/new fixtures have different available
schema fields, numeric tokens, unavailable types, extension content and paths.
The old non-first `lord_gfx_type` selection has an invalid draft before adoption.
Each failure restores the same old DOM node identities/text, draft/token, input,
field selection, invalid ARIA flag, focused input and backward text selection
range2–7. An external old-session edit then makes that draft stale; Commit cannot
rebase it. Explicit Reset permits old-session Commit, with the candidate still
revision0. Clean edit/undo/redo/undo refresh permits the next Commit at revision6
and clears ARIA invalid. Dispose removes listeners; a detached form submission
cannot edit. All four traces pass.

The fresh authored selection additionally checks refresh-translation failure,
real controller+panel failure/release, unresolved first-adoption beforeunload,
unknown saves, exact-pair recovery, mismatch/released statuses and late disposal.
Its rollback fixtures are Node DOM; the separate four browser cases above are
real DOM, without claiming paint, physical accessibility or native focus behavior.
Unusable rollback DOM remains an honest AggregateError limit, not guaranteed
recovery from external DOM destruction.

The transaction is correctly at the existing view owner and snapshots only on
explicit adoption. It adds no public capture model, JSON projection or DS1/parser
algorithm. Protected D1/DS1, schema/pin, panel CSS, Classic editors/workers and
optimized paths retain the supplied hashes. Retained scenes/latest-only queues,
batching, caches, dirty invalidation, terrain indexes and deferred work were not
changed. Source inspection finds no typing/draw probe, large hash/decode or IPC.
Report54's finite Node workload and45's earlier browser performance are inherited,
at their own source pins. This correctness-only browser probe establishes no new
performance comparison, FPS, paint latency or native smoothness result.

## Fresh commands, pins, cleanup and outstanding artifact gate

Fresh authored selection: **32/32 passed**, zero failures/skips/cancellations,
exit0; log `review/focused-1792780603815.log`. Wrapper PID35812 spawned exact
Node PID31792 with60s deadline, test isolation disabled and finally ancestry
cleanup; receipt reports no remaining process. Native frontend transformation
uses esbuild; no app/helper was launched. Report54's65 and unchanged DS1's23
are inherited, not added to this unique32-test total. No unchanged full suite,
Rust test, generator, TypeScript build or package pipeline was rerun.

Exact substantive replay, explicit Toolkit cwd for every command:

```powershell
node 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2/capture.cjs'
node 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2/node-probes.cjs'
node 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2/browser-server.cjs'
# T3 preview_status -> preview_open(new owned incognito tab) -> navigate5199
# preview_evaluate: (async()=>({rollback:qa.rollback(),closeRace:await qa.closeRace(),userAgent:navigator.userAgent}))()
node 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2/run.cjs' focused
node 'S:/Projects/UCP/de-research/review-desktop-consumer-f2w1-r2/capture.cjs' final
```

Scratch-only bundle/source, real-browser results, test args/exits and failed
driver attempts are retained. The initial omitted VM `queueMicrotask`, absent
schema field in the first selection probe, invalid top-level await expression
and initially missing thread prefix are explained in `failed-probes.md`.
Only scratch drivers/expressions were corrected; no production source was
weakened. Replays should use a fresh scratch destination to preserve receipts.

Start/final inventories `source-start.json` / `source-final.json` cover62 physical
files. All nine consumer production/test files match54's freeze at both captures.
The sole mismatch against54's larger receipt is coordinated53 completion of
`crates/toolkit-core/src/context.rs`:52,769 bytes,
`fb7a1ef962c0674eadc498b730d9ceae46865bfdd4cc3ae0e8f2ea88f53c6739`,
stable from this review's first capture to final. Root confirmed that ownership;
it is not drift in reviewed consumer files. The full original/final nine-file
hash inventory remains in54's freeze and these independent captures. No HEAD-only
or Git-normalized identity is substituted for physical source bytes.

Owned browser tab `tab_8_422ff097-252a-494d-8cce-c7b46a326f38` was closed via
`window.close()`; subsequent preview_status reports no tab. Owned server
Node PID43116/exec session80905 listened only on127.0.0.1:5199, with180s bound.
After the probe it was stopped/reaped through its exact session (exit1 from the
interrupt, not advertised as a successful test). PID43116, its direct descendants
and port5199 listener queries are empty in `server-shutdown.json`. No helper,
Python process, optional decompiler state or unrelated process was started or
killed, and no blocked old-copy cleanup was retried. No service is left running.

**Updated shipping artifact gate remains outstanding.** Root held final53
packaging after receiving the new P2. No protocol1.3 ASAR/helper/native artifact
execution is claimed here. Old44/45 protocol1.2 packages predate these corrections
and cannot verify them. Independent59/root own final source/artifact matching
and helper payload checks after correction. Native Close behavior, real dialogs,
both-host isolated open/edit/Save As/reopen beside Classic, recovery/accessibility/
paint/smoothness and game/playable-export acceptance remain open. Close this
bounded review with the one actionable P2; do not expand optional style gates.
