# Startup tooling and first-run preservation: independent review

23 October 2026. Sol6.1; no children. Read the exact goal00, contract01,
plan02 and standard05 first, then full04 and reports13/15/22/41/46/55/56/57;
also research06 and the performance/native-parity rationale. The user's resumed
full Classic/DE objective remains active. Reports are evidence and working
interpretation; root owns reconciliation and acceptance. This review does not
convert an earlier review's preferred capture mechanism into user instructions.

Actual Toolkit cwd for every terminal command was
`S:/Projects/UCP/AI-Toolkit-DE`. Initial and final HEAD were
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, branch `de/separate-game-mode`.
The shared tree already contained other owners' uncommitted work; it was not
reset, staged or adopted. This report is the only repository file owned here.
Reviewer scratch **Q** is
`S:/Projects/UCP/de-research/review-startup-tooling-scope-r2`.
**S** is report57's `observed-game-startup-r2`; **H/P/R** retain report56's
definitions. S/final is the reviewed handoff; root-level S draft outputs are
not interchangeable with it. H/R/S and the physical copy stayed read-only.

**Verdict A:** the small metadata/diagnostic delta is source-bound and honestly
scoped. Its authentication audit passes independently. The five-file install
algorithm meets the normal stable-path backup/staging and partial-state cases,
but its actual rollback entry point has a recovery defect. The controller is
useful synthetic preparation, not ready to certify an observed host run: two
reproduced observation gaps and one module-error gap need correction below.
The pre-existing MP return defect should receive the minimal fidelity correction
before freezing the next installable helper. No implementation was edited here.

**Verdict B:** complete PID-attributed file reads, registry operation/value
tracing, and a full kernel trace are **not requirements of the original goal**.
A finite ordinary-user host gate is defensible for this exact pinned,
instrumented, direct-EXE vanilla startup/exit, subject to the concrete corrections
and evidence below. ETW denial alone does not require a VM or elevation.
The current package still refuses real execution and remains launch-disabled;
this review changes no switch and supplies no actual launch approval.

No app/game/Steam launch, native game-DLL execution, original profile/registry/
settings/ACL/security change, actual copy installation, dependency download,
OpenSHC/Ghidra call, old-copy cleanup, commit, push, CI, PR or release occurred.
Only metadata readers, the exact cooperative helper and self-authored synthetic
fixtures executed. No synthetic registry key was needed for this review.

## Fresh evidence and retained scope

`Q/initial-pins.json` and `final-pins.json` contain **82 identical initial/final
input identities**. The handoff index, all final outputs, reviewed source files,
37 configured receipt entries and three existing overwrite targets match.
`final-pin-check.json`, `metadata-result.json`, `primary-source-check.json`,
`native-source-check.json` and the negative results are entry points.

Key SHA-256 values, initial = final:

| Reviewed input | SHA-256 |
| --- | --- |
| S/handoff-index.json | `c4104e4f470c18d191ab1460b65fb26f574c6d642f2564a9b7f2c5cc2d2e398f` |
| S/final/owned-install-plan-r2.json | `aa04c10dbe978871b31e1f3db2afe3b326dbb8602c21e9034558f86b2aacd823` |
| S/final/run-manifest-r2.json | `e2588be7f17b515322d2eb52c6a9b4d9945fa534afa379ca0ed425a2119ba847` |
| S/final/Assembly-CSharp.observed.dll | `c7415d8890154b70c1dacb13614ab3550c443e0cde0c1860062692dc370a39cb` |
| S/final/OfflineA.Guard.dll | `95c050978cda86a350c3bf3f62ed323e49545325202e9df2586c5ed6a56b7abe` |
| S/controller.py | `669e3cdfeaec3f2196eb87ae882aa5b949175090a537e8a8c7dfd776293fb88b` |
| S/copy_executor.py | `0f0c75fed892bc6873f6902f7219fc4b0353fb3151b7ee63b68f3b8b98b7ac3b` |

**Fresh observed metadata:** compiled the pinned Cecil reader in Q, read both
r1/r2 game artifacts and both configured helpers, and separately parsed PE raw
body/IL spans for all **16,378** resulting records. Exactly one game method
changes from r1: `FatControler.Awake`, whose first call is
`OfflineA.Startup.Capture`. The other8,150 method bodies and all original tokens
match; no game method is added. All12 audited licensing bodies **and call
records**, and all84 P/Invokes, match. The helper changes exactly the three
declared existing methods; its other27 existing semantic fingerprints match.
The 195-site parent artifact retains hash
`1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c`.

**Fresh source-confirmed:** four managed source copies equal their exact local
Git objects at Serpens pin `a23aa1b32276d670ffbb2a7b641d23b500d8e298`.
Read the native semantic source once from that pin; its10,524,612bytes hash to
`04c3f601ad9579c8137ac718e664031238e451271cf65bc8c8afa6173223ee32`.
Review22's SetPath, MP-root setter and two save-consumer slices match that object
exactly. This remains hash-associated decompilation, not original publisher
source or executed native behavior. Primary locations are
[ConfigSettings](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L2556-L2656),
[startup](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/FatControler.cs#L343-L375),
[bridge](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4018-L4033)
and [native SetPath](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L79013-L79036).

**Fresh observed recovery:** executed only the original test module's
`executor_tests` function with Q-owned paths. All32 mixtures, five injected
failure prefixes, apply/rollback, changed bytes, source mutation, backup
collision/tamper, late target mutation and stage-collision preservation pass.
Its final print mentions controller10, but this review did **not** rerun those10
controller cases. Their evidence, report57's six fake-engine diagnostic cases,
201 retired identities and ETW ACCESS_DENIED result remain **inherited**.
No combined test total enlarges the actual coverage.

Source inspection confirms exclusive backup-root creation, all three verified
old backups before first replacement, exact five copy-only targets, staged
exclusive creation, immediate pre-replace state checks, and cleanup limited to
the stage created by that invocation. Ordinary changed file bytes stop only
their rollback operation. Real copy target states remain
**before / absent / before / before / absent**. No repeated full6.7GB inventory
or fresh original-profile/Steam/namespace gate is claimed.

## Actionable findings and smallest ownership moves

**63-01 — Medium, existing fidelity defect: validation normalization changes the
MP directory returned to native code.** `S/Guard.cs:60-61` returns
`Canonical(p)` from ManagedRoot; Canonical trims the final separator.
Pinned `ConfigSettings.GetMpAutoSavePath:2624-2627` returns
`persistentDataPath + "\\Saves\\"`. The actual sendPath caller passes that return,
and EngineInterface encodes it without repairing the separator. Native
`FUN_180013030` copies this MP root and appends `autosave.msv`/a numbered name
without inserting a directory separator. Thus this is a wrong return value,
not merely a harmless representation in the diagnostic log.

`Q/exact-helper-result.json` freshly reproduces **232 ->230 UTF-16 bytes** with
the exact final helper and a source-equivalent getter input. Its subsequent
Bridge logs **306/230/230**, not the source-preserving306/232/230. No actual
ConfigSettings getter or native DLL executed. Multiplayer remains excluded;
this result does not invent an observed single-player corruption.

Owner: root's external harness maintainer. Smallest correction: ManagedRoot
computes Canonical solely for validation/logging, then returns the original
validated `p`. Keep PersistentRoot's deliberately configured redirect and
Canonical's write-path policy intact. Bridge compares canonical values and
records/forwards the original strings; do not silently reconstruct an MP path
there. This separates validation from the source getter's lexical contract
without changing authentication or creating a generic path-security redesign.
Tests should use all16 source-bound getter return expressions, require exact
MP trailing separator and settings slash preservation, prove the real helper
pipeline produces306/232/230, and compare a simple native-style filename append.
Retain wrong-root/traversal/link refusals. Refresh helper/plan pins separately;
do not rewrite immutable S/final or describe hand-built Bridge inputs as game
getter evidence.

**63-02 — Medium, recovery entry point aborts unrelated safe operations.**
`copy_executor.py:38` calls `ordinary(src); ordinary(target)` for every operation
even when `read_plan(..., verify_sources=False)` is selected by CLI rollback
at128-132. One now-linked target, or an unused source that became linked, throws
before rollback's per-operation error handling at113-125. The existing32-state
suite calls rollback directly after preparing an in-memory plan and misses this
entry boundary.

`Q/actual-cli-recovery-findings.json` records two actual CLI executions of an
identical executor copy in Q. A synthetic hardlinked target and, separately,
a hardlinked unused source each abort the command, leaving all four other
installed targets unrecovered. The foreign alias is preserved, correctly;
the global recovery refusal contradicts the advertised independent recovery.

Owner: external copy executor. Keep plan hash/schema, fixed target inventory,
lexical containment and backup-root binding validation global. During rollback,
inspect each mutable target and required individual backup inside that operation's
existing try/stop boundary; do not inspect unused installation sources as a
prerequisite for recovery. Do not follow or replace the linked target. Add actual
CLI tests for these two cases and require the other safe operations to recover.
This is one ownership correction, not a new installer framework.

**63-03 — Medium for an observed host gate: notification continuity does not
cover root replacement or the shutdown tail.** `controller.py:44-77` watches
contents through a directory handle, without anchoring its pathname in its
parent or checking root identity. `Q/negative-review-results.json` renames the
watched synthetic root, recreates its old pathname and writes into that new
root. The watch returns **no events**, while the physical file IDs differ.
This is an observation defect even in the absence of an adversarial attacker;
ordinary installation/rename activity can replace roots.

Also, the loop polls watches, then processes, then breaks on parent exit at183;
finally it terminates the Job and closes watches without draining pending events.
`Q/tail-review-result.json` deterministically schedules a real synthetic protected
write between watch polling and observed exit. The unchanged controller reports
**success**, records **zero file notifications**, and the sentinel has changed.
Only the test scheduling is injected; the file write, exit and watcher are real.
The Job and retained handles still reap correctly. Post-comparison would catch
these persistent changed bytes, but it does not make the capture continuous.

Owner: external observation controller. Add parent/name anchors and retained
root identities for the explicitly protected roots (nearest existing parent
when absent). Treat replacement/deletion, overflow, watch errors or uncertain
coverage as a failed run. Keep observers active through owned Job shutdown,
drain queued notifications/process records to a bounded quiet/final state, then
take the final identity/content/registry comparison before accepting success.
Cover root rename/recreate, absent-root creation and an exit-tail write. For
registry watches, current re-arm errors already throw; explicitly test key
deletion/recreation and watch an existing parent for an absent protected key.
Do not silently reopen a replacement object and call the original interval
observed. Neither a watcher nor this correction is preventive denial.

**63-04 — Medium for an observed host gate: module enumeration can fail silently
and required identities are not asserted.** `controller.py:129-139` treats any
false Module32FirstW as an empty sample and any false Module32NextW as ordinary
end; it does not distinguish ERROR_NO_MORE_FILES from a live-process failure.
The finite negative probe injects FirstW ACCESS_DENIED on an actual owned
synthetic process: the controller returns **success with zero module samples**.
This contradicts the stated live unexplained-snapshot fail-closed behavior.
The present drive entry also has no required-module set tied to paths readiness;
passing optional module pins does not require that any critical image was seen.

Owner: external observation controller/run adapter. Check both enumeration
results/errors; accept a race only when the exact retained process handle proves
exit and label the sample unavailable. Require finite positive identity witnesses
for the EXE, UnityPlayer, CrusaderDE and genuine steam_api64 when this startup
reaches the checked native bridge, plus the managed/helper identities already
sealed externally. Check pinned copy modules rather than accepting any DLL under
the copy root. An expected Vuplex worker needs its exact image/command/cache
ownership if it appears. Missing required images at the bounded checkpoint fail
the run. A transient image not sampled stays unobserved; this correction must
not claim a complete image-load trace.

## What the diagnostic delta does and does not establish

`Startup.Capture` uses real Unity API references at FatControler.Awake entry,
before that object's LoadSettings in Start and sendPath in its later startup
Update branch. It does not precede Unity native startup, every Awake, or
Vuplex's attributed runtime initializer. Reading those values later cannot
retroactively establish which paths earlier engine/native code used.

The explicit settings getter argument is false; pinned source confirms the
directory creation/ReadMe copy is inside the true branch. Other unused getters
remain unobserved rather than being artificially exercised. Root logs distinguish
raw/canonical values and callers; Bridge logs before original UTF-16 encoding.
Required assertion failure calls Environment.Exit(198), and the outer owner
also handles failure/readiness deadlines; it does not rely on Unity propagating
an exception. Paths-ready means engine plus checked bridge only. Genuine Init
must be observed separately. Actual crash output is not established by recording
its argument, and nonempty temporaryCachePath alone is not an ownership check.

The caps and distinct-path logging are appropriate for startup research. No
Toolkit renderer/input/draw path, retained scene, latest-only queue, batching,
cache or invalidation changed. No UI smoothness or game performance is measured
here. This tooling must remain outside shipping game/profile/document policy;
the one concrete manifest owns its run roots. Reusing the existing controller,
guard and executor for the small fixes is preferable to parallel implementations.

## Re-derived first single-player startup/exit gate

Goal00 requires a separated DE mode and actual in-game proof; contract01 adds
an isolated test setup preserving saves, mods, profiles and Classic. Neither
requires recording every file read, PID-attributing every preservation notification,
nor eliminating ordinary licensed playtime/presence or graphics-driver caches.
Review22 explicitly accepted stable physically separate paths and cooperative
source controls for a legitimate pinned single-player workflow, while rejecting
a claim of universal native/child/Steam confinement. That distinction remains.

Review56's early file/registry/image/process observation asks for evidence of
those boundaries; it does not itself say every file read must be traced.
Report57's elevation of this to **complete** early OS capture, and its automatic
requirement for another capture context, is a tooling-method choice. Root can
amend it for this selected case on the source and failure evidence here. The
reason is the actual preservation contract and Review22, not making an
ACCESS_DENIED probe green. The failed ETW probe remains intact and must not be
retried through another tool to bypass its denial.

**Branch (a): finite ordinary-user host route, conditional on concrete evidence.**
The following bundle can meet the selected startup/exit preservation gate after
63-01..04 and the missing run adapter checks are resolved. This is a recommendation
to root, not an assertion that the present synthetic controller executes it.

1. Bind one fresh run manifest to a sealed ordinary physical copy, exact five
   installed hashes/verified copy-only backups, EXE/CWD/app-ID bytes, fixed
   managed root and unused engine LocalLow/PlayerPrefs namespace. Freshly reject
   links, collisions, unexpected executable dependencies and existing namespace
   ownership. Retain current source/binary pins and the precise instrumented
   delta. No SE/Fixes, MP/compression, browser/Help/Workshop or package gameplay
   is included in this first startup/exit. Full package/feature acceptance follows.
2. Before any association, refresh and verify scoped recoverable original-profile,
   exact PlayerPrefs presence/type/data tree and Workshop/bookkeeping backups;
   refresh protected game and actual Classic editor/settings/root identities.
   Report41 is preparation-time evidence, not this baseline. Arm protected-root
   and parent-anchor notifications before process creation, compare identities
   immediately around arming/baseline acquisition, and fail if the scoped snapshot
   is unstable. Baselines need content/tree evidence, not only timestamps.
3. Root establishes supported app3024040 Cloud-off with prior state recorded and
   fresh matching UI evidence, no active DE game/sync/conflict or pending/in-flight
   app depot/Workshop work. Keep the direct copied-EXE route and genuine license
   checks. Current queue evidence is independent of old ACF flags. A demanded
   original-library update, interfering client work or indeterminate queue fails
   the route. No global toggle, VDF edit, restart, subscription change, API policy
   shortcut or late download suspension manufactures this state.
4. Root checks current user activity and relevant exact process identities;
   create the exact copied process suspended, no arbitrary inherited writable
   application-data handles, assign the no-breakaway kill-on-close Job before
   resume, use child-local TEMP/TMP and explicit owned log/crash arguments.
   Retain handles/creation identities and record actual command lines. Maintain
   Job identity/accounting through shutdown, reconcile missed/pending completion
   records, and treat unknown children or an unidentifiable child as failure.
   A Job controls its members, not a Steam broker outside it: observe relevant
   original-game/Steam process state before/during/after, require the copied
   process to remain the actual runtime and fail a relaunch/handoff. App-ID source
   prevention plus this evidence is the selected contract, not a universal
   promise to see every broker process. Do not kill an unrelated user process.
5. At a bounded checkpoint require the actual engine/company/product/data/
   StreamingAssets/persistent paths, helper identity, source-bound managed returns,
   exact pre-forward Bridge tuple, genuine licensed Init, required native-module
   pins and owned log evidence. Validate actual temporaryCachePath against owned
   roots or a specifically reviewed ordinary OS-cache destination; merely logging
   a nonempty string is insufficient. Attribute any actual Vuplex child and its
   cache/temp path; source predicts its cache under the changed engine namespace.
   Missing readiness/authentication, wrong module/root/helper, watcher/identity
   errors, overflow or coverage loss stop and fail the exact owned run.
6. A notification on a protected profile/game/mod/PlayerPrefs target fails the
   preservation claim even without PID attribution; do not infer innocence from
   missing attribution. Shared Steam bookkeeping changes require exact expected
   field/log attribution; unresolved installation/sync/progress changes fail.
   Keep watches through all owned descendants/handles closing and the final
   drain; compare protected content/tree/presence with the fresh baseline before
   crediting startup/exit. Owned-root outputs must match the declared scope.
   A timeout/bounded stop proves only the observed bounded interval; missing
   managed shutdown samples stay missing. Do not call a forced stop a graceful
   game-exit observation. Obtain the intended normal exit separately if needed.
7. Keep Cloud off until preservation passes and owned handles/children are reaped.
   Investigate any difference without overwriting newer user data; backups are
   recovery, not permission to accept original writes. Only then restore a changed
   app-only Cloud checkbox and observe sync/conflict outcome; initially off stays
   off. Account setters/uploads stay prevented by the pinned transform, never
   'repaired' by a later stats reset. Remove/restore only unchanged owned copy
   entries through corrected per-operation recovery.

**Why this is enough for the selected claim, and its actual remaining limits:**

- Early Unity can precede the hook, but coherent company/product metadata is a
  preventive input before native startup. Watchers armed before creation cover
  changes to the specified originals regardless of whether Unity, native code or
  Steam caused them. Parent anchors, final identity checks and exact post-content/
  registry comparison close the demonstrated root/tail gaps for that scope.
  These mechanisms detect violations; none becomes an OS veto. A transient
  write-and-restore can leave equal final bytes, so continuous scoped notifications
  must not be omitted. File reads do not threaten the stated preservation goal.
- Registry details need not come from an event stream: any protected-key event is
  a failure signal, and exact before/after tree/type/data/presence comparison
  supplies final preservation evidence. Deletion, absent-key creation or a lost
  notification interval is not 'no change'. Existing native PlayerPrefs internals
  remain unexecuted until the actual test; metadata prevention plus these checks
  supports the conditional first observation, not an already-proven runtime.
- The native save-root setter/consumer evidence and exact bridge protect the
  identified save path. The dependency audit22 found no concrete original-root
  write source requiring general hostile-code confinement. Critical loaded image
  witnesses and the sealed copy are proportional corroboration. Sampling cannot
  prove no transient image ever loaded; that is an explicit limit, not a reason
  to silently certify arbitrary plugins. A new foreign image/child or concrete
  original-path writer reopens the gate for that source.
- Steam's existing client is genuinely outside the Job. Cloud policy, fresh
  quiescence, empty in-game Workshop enumeration and early account suppression
  close the source-identified test-origin requests for this direct route.
  Original-target/Workshop/bookkeeping observations and comparisons catch local
  violations, but cannot undo remote account writes. If the required early
  prevention/policy or queue state is missing, recovery copies cannot close it.
- Ordinary OS graphics/shader/driver caches, authentication, playtime/presence
  and routine client logs are outside the accepted save/mod/Classic preservation
  target. Their existence is not a demand for all-Windows trace coverage. A cache
  path overlapping original saves/mods/settings is inside the target and fails.
  Neither available observers nor this review claims universal writable confinement.

**Branch (b): essential unresolved condition requiring an existing capable context.**
Use this branch if the concrete scoped observers cannot maintain continuity on
a required protected root/key, an essential native/child/cache destination cannot
be tied to the declared owned identities, genuine Init insists on original-library
launch/update, or app-specific Cloud/queue/progress prevention cannot be established
without disrupting the user's client. A known writer outside scoped coverage is
also a real missing condition; 'all Windows file reads unavailable' is not.
An already capable observer context can close a specific observation gap; a
full trace still does not prevent a known destructive writer. Do not run an
exposed Init experiment merely to discover whether a known prevention gap matters.

The fallback is the existing06/22 prerequisite: **one independently writable
graphical Windows/Steam context**, legitimate ownership in its compatible OS
context, adequate disk/graphics, and **no writable mapping to original host game,
saves, PlayerPrefs, Workshop or Classic data**. The same licensed account can
suffice with pre-association app Cloud-off and early progress/subscription
suppression; ordinary licensed signals remain possible. A second Windows-user
label using the host's Steam client, or another copied folder, does not establish
these facts. Prefer an already suitable isolated machine/VM/checkpoint if this
condition occurs. No new account/VM/tool/driver/service, elevation, ACL/security
change or permission question is created by this review.

## Reproduction, cleanup and next owner

All source/argv/cwd/exit/process receipts are under Q. The executed entry commands
were `python -B` followed by `review.py` (retained reviewer harness error),
`finish_metadata.py`, `negative_review.py`, `supplement.py` (retained decode
error), `finish_native.py`, `tail_review.py` and `final_seal.py`, each with explicit
Toolkit workdir. The initial review import resolved the executor's ROOT to Q
and correctly refused a real-copy backup path; correcting only that imported
constant to S enabled the read-only check. The later native-source decode used
the Windows default instead of UTF-8; its helper had already exited/reaped.
The correction reused retained bytes, with no repeated native extraction.
Both errors and their limits remain in Q; neither is passing test evidence.
One supplemental rg for a nonexistent object-only repository .gitignore also
returned an IO error and made no changes.

For reproduction use **fresh owned scratch**, route ROOT coherently and retain
Q/S/H/R. Most entry scripts exclusively create their outputs. Negative tests use
only self-authored tiny files/hardlinks; they do not need original writes or
registry changes. Actual CLI recovery commands and their errors are retained,
so direct internal-function success is not substituted for wrapper behavior.
Exact final-helper, source-pin and PE metadata commands are recorded separately.

Every spawned compiler/reader/probe/Git helper used a suspended-before-assignment
kill-on-close Job, bounded waits and finally cleanup; synthetic controllers also
verified retained descendant handle signaling. Fresh shutdown checking found
**19 retained PID/creation identities, zero live owned, zero unverifiable**;
every recorded Job ended Active=0. One native Git-copy helper's identity receipt
was not persisted before the decode failure, although its finally cleanup ran
and reaped its Job before decoding. That is an explicit receipt limitation, not
an invented PID or blanket assertion over all host processes. No server/port was
opened, no unrelated process was killed and no old-directory sweep occurred.

**Next owner/action:** root's acceptance-tooling owner should implement63-01..04
in fresh external artifacts, review the narrow CLI/observer regressions, and
choose/update the first-run gate using branch(a) or a concrete branch(b) condition.
Then root owns fresh Steam/preservation/activity evidence and any later actual
installation/startup/exit. This review ends here; it launches nothing and changes
no launchAllowed flag. Authentic rendering, representative exported lord/castle/
media/save-reload, expanded features and Classic game-backed acceptance remain
the full required objective after this first preservation experiment.
