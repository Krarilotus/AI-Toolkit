# F2W1 desktop consumer correction — round 2

23 October 2026. The assigned consumer corrections are implemented and frozen for
independent review. **This is implementation and synthetic boundary evidence,
not desktop, smoothness, playable-export or full DE acceptance.** Root owns
integration, acceptance, commits and later observations. Core correction53 owns
canonical Rust, generated contracts, native ingress and final build/package work.

Read mandatory goal00, contract01, plan02 and standard05 first, then complete
Review50, handoffs44/45, adopted23, Reviews05/21, C1/DS1/panel obligations,
`docs/iso-scrub-performance.md` and `docs/native-parity.md`. The resumed goal
supersedes the historical pause. All Toolkit shell commands explicitly used
`S:/Projects/UCP/AI-Toolkit-DE`, branch `de/separate-game-mode`; the enclosing UCP
directory is not Git. Shared mode is not worktree isolation. Entry HEAD was
`9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`; the first source-freeze capture observed
`14a5884cfd6943be3433b1aa6c60e6a90186dbb6`. Final capture observes root's docs-only
HEAD `dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, with all nine owned source/test
hashes unchanged. Exact bytes below identify this work.

No children, commits/push, CI/dispatch/PR/merge/release, dependency installation,
app/game/Steam/native-browser launch, mounted OpenSHC/Ghidra call, live/original
settings/profile or installed-editor change occurred here. No Rust, generated
output, build script, package manifest, bundle, translation, theme, global CSS,
Classic renderer or asset source was edited. Existing reports44/45/49/50 were
read, not rewritten. Their final hashes are recorded outside Git.

Evidence is under `S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2`
(**evidence/** below). **Observed** means executed/inspected here; **inherited**
means earlier evidence at its own pins; **unverified** means an open gate.

## Corrected boundaries

**F2-CONSUMER-01:** Open, Close, public Save and public Save As now share the
controller's one lifecycle admission, including an outstanding Save As picker.
The unsaved gate can request its private Save without exposing a public bypass.
New external saves cannot enter while a transition is authorizing destruction
or after closing begins. Typing, scalar Commit, undo and redo remain available;
revision or draft-token changes revoke authorization. The permit checks current
session/generation, revision, draft token and absence of a DS1 save immediately
before adoption/Close. `canUnload` checks that permit again, so a subsequent edit
or snapshot cannot retain an obsolete bypass.

The actual bootstrap/header Close → prompt → enabled panel Save sequence now
submits zero writes while the prompt owns admission. Discard can close with no
pending snapshot; subsequent typing revokes unload authorization. This correction
does not rely on disabling the Save button or assume OS modal input behavior.
An unresolved document adoption also blocks the real `beforeunload` handler,
including first Open before any session has mounted. Pending/unknown saves,
receipt correlation, older-snapshot settlement and original-context recovery
remain with the unchanged DS1.

**F2-CONSUMER-02:** `gameRootOrDefault` now distinguishes explicit installation
authority from optional discovery at its existing resolver. A supplied non-null
root that is empty or missing throws; list/load/tile consumers share that refusal.
Only omitted/null standalone-tool calls may discover the legacy default. Main
still returns an empty standalone map listing and requires a bound root for map
reads/tiles. No main-only race-prone precheck, profile probe/hash, resource
extraction, copied map algorithm or cache change was added. Existing caller
search found main, the integration map tests and internal map readers; their
explicit roots remain authoritative. A synthetic actual-main/actual-resolver
fixture makes only the default foreign installation available and verifies all
three authenticated channels refuse the vanished bound root.

**F2-CONSUMER-03:** the Classic new-window picker captures its authenticated
parent/context, rechecks it after the picker and file read, and checks again after
fresh binding. No late picker/read creates a child for an already-closed parent.
The owned child is closed on failed binding or parent loss during binding; its
Close cleanup runs even when readiness rejected. Fresh inherited/activation
failures do not route through startup defaults. Initial-window unavailable
diagnostics remain. Delivery checks the child's captured logical context.
Successful inheritance retains the original root and `restoreProject=0`.
Finite modeled cases observe zero orphan child/context after each negative
scenario. These are Electron VM lifetimes, not native HWND observations.

## Canonical document adoption consumed

The frozen53 `interface-r2.txt` (including its labeled clarification) has SHA-256
`d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191`.
The actual generated protocol1.3 files read and consumed here are:

- `src/desktop/generated/core/types.ts`:
  `5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96`.
- `src/desktop/generated/core/contract.json`:
  `509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace`.

Electron/preload and native `de-api.ts` add narrow `adoptRaw`, `adoptionStatus`,
`finishAdoption` and `releaseRaw` calls. Hosts inject authenticated owner identity;
renderers cannot pick host owners/roots. Native pair typing derives from the
generated `ContextCommand`, rather than a second DTO. CoreClient's existing
generated write/result inventory automatically consumes the new commands; no
client/private-context/wire implementation edit or JS classification list was
needed. Actual main Close continues to return a core refusal without destroying
the window, now covered by a focused regression.

Controller Open parses the candidate through real DS1 before requesting ready
adoption, retains the previous session/draft and rechecks its authorization.
Only an exactly matching ready receipt permits synchronous panel installation.
Controller session/generation change only after the panel succeeds. It then
finishes the same pair; Rust alone retires the previous authority. Invalid,
foreign, stale and late post-disposal raw candidates attempt authenticated
release in `finally`. Transient release failure is reported without inventing
authority: core53's next-read/Close/backend-loss transient policy owns cleanup.
The controller never releases the old ID merely because a picker/prompt opened.

An uncertain ready reply keeps the old DS1 and draft; the controller queries
the exact pair once. An unavailable/conflicting/mismatched status retains the
transition and blocks Open/Save/Close. Explicit Restore connection restores the
original context and queries that same pair. It never reads another candidate,
binds defaults or replays a save. A ready result completes only while the original
authorization still holds; otherwise the candidate is released. Only canonical
`document-adoption-not-found` proves unchanged prior authority and clears a
pre-persistence uncertainty after idempotent release. Generic rejection and
transport failure never grant that fallback.

After successful mounting, an uncertain finish keeps the exact new DS1 and pair,
allowing edits but blocking replacement/save/close. Status ready permits the same
idempotent finish; committed settles without remounting or losing edits/history.
Released or unexpected committed-before-install is not treated as success.
Backend transient/record/accepted-write/unknown-save policy remains canonical
Rust; no JS retirement ledger, JSON model, timeout-success rule or new quota was
introduced. Recovery/durable disk correctness belongs to53's real-core tests
and the forthcoming combined review, not these synthetic receipts.

## Approved panel transaction

Root explicitly approved a narrow correction to existing `panel.setSession`
after source inspection showed it cleared the old draft before rendering. A new
public capture/restore model was unnecessary. The function now reads the next
session before mutation and retains the existing view references/internal state
while attempting the complete synchronous mount. On failure it restores the old
session, generation, revision base, draft object/text/path, selection, token,
messages/invalid state, cached choices/diagnostic rows and existing DOM nodes and
properties. Controller adoption commits only after this function returns.

This bounded snapshot occurs only at explicit session replacement, not typing,
Commit, refresh, draw or camera/input paths. No parser/session/schema/validation
algorithm changed. One-shot failures before mutation (`read`) and after mutation
(`buildChoices`, diagnostics, refresh translation and the second `read`) verify
the exact prior draft/view and token remain. A later external edit leaves that
draft stale; Commit cannot silently rebase it; Reset permits an explicit new
Commit. The same tests check clean revision after undo/redo, invalid ARIA state,
and real controller+panel rollback/release together.

Rollback cannot promise restoration after a destroyed/unusable DOM. If restoring
the old view itself throws, an AggregateError retains both errors instead of
claiming success. That exceptional broken-DOM recovery and physical focus,
screen-reader and native accessibility behavior remain unverified. Synthetic
DOM lacks layout/paint; its adapter supplies the browser methods under test.

## Fresh checks, performance scope and cleanup

Final source selection: **65/65 passed**, zero failures/skips/cancellations,
`focused-1792779829638.log`; final strict desktop TypeScript `--noEmit` passes in
`types-1792779831293.log`. Changed JS syntax and scoped `git diff --check` pass.
The existing DS1 selection passed **23/23** earlier in this correction at the
unchanged DS1 bytes (`session-1792778893823.log`); it was not repeatedly rerun.
No broad D1/parser or unchanged full repository suite was repeated. The final
selection includes affected Classic bridge/save/config/security/titlebar tests.
Actual Electron main/preload and native frontend source execute in synthetic
transport fixtures; these do not authenticate native OS file operations.

`initial-pins.json` captures all62 Review50 files with **zero mismatch** and copies
them into `baseline/` before correction. `consumer-source-freeze.json` records
their current hashes, original/final owned hashes, reference-report hashes and
the53 interface hash. D1, DS1, schema/pin, accepted panel CSS, Classic editors,
retained worker scenes, latest-only queues, terrain indexes, batching, caches,
dirty invalidation and deferred work remain unchanged. Unowned core/native/DTO
drift in that receipt is53's coordinated correction, not an edit by this owner.

Final finite baseline/candidate/candidate/baseline workload is
`synthetic-workload-1792779748232.json`: real panel/controller/DS1 in a Node DOM,
120 typing events,90 small Commit steps,60 approximately1MiB Commit steps and12
Open/Save cycles per run. Typing/Commit perform **zero host calls**. Candidate
explicit Open adds the two required ready/finish calls; total synthetic host
calls are54 versus26 over the whole workload. Handler p95/max milliseconds:

| Workload | Baseline runs | Candidate runs |
| --- | --- | --- |
| Typing |0.076/0.285;0.025/0.086|0.031/0.087;0.092/0.160|
| Small Commit |0.422/1.658;0.333/0.462|0.517/1.143;0.485/0.654|
| Large Commit |6.131/6.682;6.364/7.819|6.501/8.978;7.147/10.085|
| Synthetic Open/Save |2.406/2.406;0.748/0.748|1.850/1.850;1.136/1.136|

These finite non-exclusive Node samples show the measured costs honestly; they
do not prove zero overhead, causal speedup, browser UI latency, native input,
paint/FPS or worst-case8MiB behavior. No browser/app launch was authorized here.
Root still owns equal-workload browser/native Classic and DE observations. The
prior real-browser evidence in45 remains inherited at its earlier source pins;
this change does not relabel it fresh UI performance evidence.

Reproduce with explicit actual Toolkit cwd:

```powershell
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/capture.cjs'
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/run.cjs' focused
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/run.cjs' types
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/run.cjs' session
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/compare.cjs'
node 'S:/Projects/UCP/de-research/fix-desktop-consumer-f2w1-r2/finalize.cjs'
```

`capture.cjs` initial mode is provenance for this run; a replay must preserve
these receipts and choose a fresh evidence directory/baseline. No generator,
core/frontend build or package command was run by this owner. Existing44/45
packages predate these corrections;53 serializes the final generation/build/
package after the consumer source freeze. No new helper/EXE/ASAR acceptance or
real-host save claim is made here.

`failed-probes.md` and the failed focused log retain initial harness mistakes:
async fixture assert.throws, incomplete synthetic DOM methods and wrong Reset
label. Production was not weakened to make those pass. Final wrappers have60s
deadlines, exact PID/start/exit/log receipts, identity-checked ancestry cleanup
on completion/deadline/signal/error, and final remaining-process queries. Test
isolation is disabled. Existing bridge tests do run finite tsc/esbuild subprocesses;
these are accounted for, not called “no child processes.” Earlier direct finite
jobs and wrapper results remain honestly scoped in their receipts. All final
wrapper cleanup arrays and final attributed process inventory are empty. No
helper/server/browser was started, no service remains, and no process was killed
by executable name or unrelated broad sweep.

## Exact owned source freeze

Only these nine production/test files plus this new handoff were edited. Full
original/final SHA-256 values are physical working-file bytes; they do not imply
Git line-ending normalization of game data. Report self-hash is stored outside
Git to avoid a self-hash cycle.

| Path | Original SHA-256 | Final SHA-256 |
| --- | --- | --- |
| `main.js` |`e9a13891bf2356b9b80203ef9a0474b8b2170099d3f5fd87292af31bbebeb376`|`6a735990109e6fca23aa924b73a1ef9e1eded5af3c46010ea4c9787bda684cfe`|
| `preload.js` |`0644fe170ec70e6cf49ec0a566854516db7fdb2b65db3941c801ec4c60419367`|`594539fccb5788cf3f6abfafe0c56b77184cbe628528dc902c402eb3cbdfdd78`|
| `src/node/game-map.js` |`58342ef1d75c11e07eb791e8a109110bb952456aed906b64234e2e9a58ef3f92`|`35471fb78b3cc26c253b4148efebd5531664e5b6a8bd36974a81fb7d1796d585`|
| `src/js/de-lord-controller.js` |`c5581da7ff2bc95b6b46d2610d7536a0acf6a98da0da75319fc28d557b4f9b9d`|`5d9ad4e44fe5c4a3918956ad2c6dee95bcfe48ce3dee6d6f5163cfd0569daf4d`|
| `src/js/de-lord-panel.js` |`bc3b59e79e00ea5a2013ece1738438a40df25c9b4fe232c89eb7a5cd4fb26278`|`32f7817b6493a5048f75933d491a57f4d51b39b544b7f2fb94911738b5f634c0`|
| `src/desktop/de-api.ts` |`e013156ec426fcee2e78886650bfec95c8bfc96b758272c29a0c56747a855d51`|`1c0a638495f596b3382525e3e36e7b6376983178bf1f1e6fb52353c2b53ab4a3`|
| `src/desktop/de-editor.js` |`63de59f46385f6ceddb14aeef428b7738fe5a77e0e5a3762f92ad0df286ebbf4`|`94062d9a9ea6da8af5f8269b654e7d51d31b0af2b63f797f19f8c2ea51ef2e20`|
| `tests/de-desktop-controller.test.js` |`57363d0f4848708c6e3c604792fda105fa7f595c3a3e781a6b20be3a18f998a0`|`b07e6d5ad4b512765ccfa8c378bc85da48c35f7140dad152bbbf19f7f4b1ec6e`|
| `tests/de-desktop-host.test.js` |`ddc2a802aba0232bca2a2021042c8b872367a585d157592aaea8f90d3f5bbbfc`|`b5b97dd9ef89aacf5db5ca0c00c082865f16caea374e38176d0c1730d91f35ec`|

Independent review of the combined exact consumer/core/artifact boundaries is
still required. Native pickers/modality/window pairs, failure/recovery through
both real hosts, accessibility/paint/smoothness and actual game acceptance remain
open. This handoff completes only the assigned consumer corrections.
