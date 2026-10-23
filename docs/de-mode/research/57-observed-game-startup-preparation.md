# Bounded observed-startup preparation and copy executor

23 October 2026. Sol6.1; no children. Read goal00, contract01, plan02 and
standard05 first, then full acceptance04 and reports15/22/41/46/55/56. Review56
SHA-256 is `41b87f71a61eb840660e33a2815ffd2414bdeddff9a9701ab79e25e4ad1810e3`.
The resumed full goal remains authoritative. This is shared-checkout work,
not worktree isolation. Only this report is owned inside Git. No staging,
commit, push, CI, PR, release or central/product file change occurred.

Initial HEAD was `14a5884cfd6943be3433b1aa6c60e6a90186dbb6`; final observed HEAD
was `dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, branch `de/separate-game-mode`.
Those advances were coordinator work. Every terminal command explicitly used
`S:/Projects/UCP/AI-Toolkit-DE` as workdir.

**S** = `S:/Projects/UCP/de-research/observed-game-startup-r2`.
**H**, **P**, **R** retain Review56's exact definitions. H/R, their receipts and
r1 plans were kept immutable; `P/game-original-copy` remains unmodified.

## Disposition

**Ready for independent review of the built offline diagnostic delta, tested
finite controller and five-file executor. No real startup or installation.**
`S/final/` is the final artifact/plan handoff; root-level draft binaries/manifests
are retained development evidence, not the proposed installation sources.

**Verified material limit:** uniquely named `StartTraceW` returned Win32 **5,
ACCESS_DENIED**, before creating a session. No trace session/provider remained.
Built-in WPR/logman/tracerpt/wevtutil are present; Procmon was not on PATH.
No tool was downloaded, driver/service installed, privilege enabled, UAC invoked,
security setting changed or broad process termination attempted.

The working controller proves scoped directory/key notifications, Job process
identity/lifetime and sampled modules on self-authored synthetic workers. Those
notifications lack PID attribution, file reads and registry operation/value
details; module sampling can miss transient loads. Actual parent PIDs/command
lines are read through bounded native queries on retained owned handles.
**The scoped observers cannot honestly satisfy the complete
early Unity/native OS-capture requirement.** `drive(synthetic=False)` therefore
refuses before creating a process. This is a concrete capture-capability limit,
not a new permission request or a recommendation for another sandbox project.

The root's smallest external handoff is an **existing suitable observation
context** that can capture file/registry/process/image events before creation,
or the already accepted Review22 independently writable Windows/Steam test
context with no writable mappings to originals and appropriate observation.
Recheck capabilities there; do not manufacture success by enabling privileges,
installing a driver or changing host security. Root owns that choice and the
existing activity/Steam/preservation gates. Standing isolated-test authority
has not been superseded.

## Final pins and diagnostic delta

Entry points are `S/README.md`, `S/final/build-result.json`,
`S/final/verification-result.json`, `S/final/diagnostic-delta.json` and
`S/handoff-index.json`. The index lists source/output identities and test records.
Final SHA-256:

| File under S | SHA-256 |
| --- | --- |
| `final/owned-install-plan-r2.json` | `aa04c10dbe978871b31e1f3db2afe3b326dbb8602c21e9034558f86b2aacd823` |
| `final/run-manifest-r2.json` | `e2588be7f17b515322d2eb52c6a9b4d9945fa534afa379ca0ed425a2119ba847` |
| `final/OfflineA.Guard.dll` | `95c050978cda86a350c3bf3f62ed323e49545325202e9df2586c5ed6a56b7abe` |
| `final/Assembly-CSharp.observed.dll` | `c7415d8890154b70c1dacb13614ab3550c443e0cde0c1860062692dc370a39cb` |
| `Guard.cs` | `514310c3bca3637a165456890ef56c1f453364d643c1d959205e69c80e0ff894` |
| `Diagnostic.cs` | `65e767625b88ae8360f2406d2535eacb2c7e43b1af2f7d483603d6b6607b7b56` |
| `AddStartup.cs` | `217ae2bc20ae043e83e31e5db8dd3ff8760c271bb8636bdff9df877cdfcbc3dd` |

The final helper is20,992 bytes and managed assembly3,764,224 bytes.
Dependencies are the existing pinned csc, dnlib4.5.0 and Cecil, plus compile-only
references to the physical copy's original `Assembly-CSharp.dll` and
`UnityEngine.CoreModule.dll`. The latter is1,275,640 bytes, SHA
`e468e19789d608b41e2c7fe4f367c7082fece7d1883f568e75870f6c5384cc86`.
Exact paths/sizes/hashes are in build-result; no new product dependency exists.

The original195-site artifact remains separate and unchanged at
`1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c`.
The new metadata-only transform adds **one call at `FatControler.Awake` entry**
to `OfflineA.Startup.Capture`. Pinned source puts its ordinary `LoadSettings`
in `Start`, and the native bridge later in its startup `Update` branch. This
is a small source-bound hook before that object's configuration consumer,
not a claim that it precedes every Unity/native/dependency initializer.
No generic patch framework or per-frame hook was introduced.

Relative to the r1 game assembly, only `FatControler.Awake` changes; the other
8,150 method records retain raw body bytes and all tokens remain unchanged.
No method is added to that game assembly. The original13 mutation stubs remain.
All **12 licensing bodies and their call records**, and all **84 P/Invoke
declarations**, remain unchanged. Two final transforms are byte-identical.
Independent PE/body-span parsing verifies all8,151 game and46 final-helper
method body/IL records against Cecil metadata. This is not full Mono validation
or proof of licensed startup.

Only three existing Guard methods acquire diagnostics: `PersistentRoot`,
`ManagedRoot` and `Bridge`. The other27 existing helper-method semantic
fingerprints are unchanged. Signatures, validation policy and account counters
remain intact. Distinct successful returns are logged once; Bridge records
**all three raw/canonical inputs and UTF-16 lengths before encoding/forwarding**.
Invalid required roots fail the process with exit198 as well as a failure flag;
the outer controller independently watches flags/readiness and terminates its
exact Job. A caught Unity callback exception cannot supply the sole stop signal.

The real caller references Unity's company/product/version, data/StreamingAssets,
**unredirected** persistent path, temporary cache and console-log APIs. It logs
actual image/CWD/PID/creation time, helper path/MVID, manifest pin, effective
OS TEMP/TMP and the crash argument. It checks engine identity, roots, CWD,
helper identity, TEMP/TMP and effective Unity log path. Crash argument is labeled
an argument, not an observed crash output. Actual cache/crash consumption and
loaded native-module identity still require the OS observer.

Its only explicit configuration evaluation is
`ConfigSettings.GetSettingsFileName(false)`. It records that as a diagnostic
observation, **not game consumption**; true is never invoked for diagnostics.
Other settings returns are witnessed only when their actual callers reach the
guard. Logging is capped at128 lines/256KiB and64 distinct roots. Paths-ready
means engine plus checked bridge only; it does not claim authentication or
gameplay. Exit samples include suppression counts; forced Job termination may
prevent a final managed exit sample and must remain labeled missing.

## A concrete prior path assumption needs correction

`final/path-semantics-finding.json` is an **exact final helper** execution with
the source-equivalent input to `GetMpAutoSavePath`; the game getter/native code
was not executed. The existing `ManagedRoot` calls `Canonical`, which trims the
source getter's trailing separator. The raw getter expression has232 UTF-16
bytes at these configured roots, but the transformed return and subsequent
synthetic Bridge input have230. Review56's proposed306/232/230 tuple therefore
describes the source input rather than the actual transformed return; the
observed helper pipeline supplies306/230/230.

This task deliberately preserves existing guard return semantics, as requested,
and exposes the discrepancy instead of silently repairing it within a diagnostic
delta. The native MP path consumer appends its autosave name in Review22's pinned
slices, so root should reconcile that contract before any MP/native-autosave
claim. The initial single-player startup still excludes multiplayer and the
known memory-compression path. Directly passing a hand-built trailing-slash tuple
in a bridge test is not evidence that the transformed game produces that tuple.

## Finite controller evidence and lifecycle

`controller-test-results.json`: **10 cases** cover normal creation/exit with a
live descendant; actual file/key notifications and winmm load; missing/wrong
readiness; failure flag; nonzero exit; cancellation; protected-file notification;
foreign child; unexpected module and module-hash mismatch. Synthetic fixtures
are fresh UUID-owned trees. The single new synthetic HKCU key was deleted and
its absence verified; no original key/profile/config was changed.

Observers are armed before process creation. The process starts suspended,
enters a kill-on-close Job before resume, and uses no arbitrary inherited data
handles. A completion port records Job process events and retains exact child
handles, image, parent PID, command line and creation time. All
success/error/timeout/cancel paths stop
the Job, wait/reap the parent, verify Job Active=0, then wait retained descendant
handles to signal and close watches/port/handles. Scope/time/output limits are
explicit; there is no watcher server or daemon.

`diagnostic-test-results.json`: **six tests** exercise actual Diagnostic/Guard
logic with three routed test constants and **fake engine arguments**. They
cover successful distinct/bridge/readiness ordering and exit counts, engine and
bridge mismatch, missing readiness, distinct-root bound and bounded stop. They
do not call `Startup.Capture`, Unity or ConfigSettings and are not real effective
path evidence. An additional exact final-helper path probe does not substitute
for those real engine observations.

`final-owned-processes.json` independently checked **201 retained PID/creation
identities**, finding **0 live owned /0 unverifiable**, with0 servers/ports and
no kill action in that check. Two now-inaccessible PID numbers were disambiguated
by a read-only system process/creation snapshot rather than treating PID reuse
as ownership. Every tested controller's retained handles were already signaled
at reap. Original failed fixtures remain evidence, not passing test counts.

## Five-file executor and recovery

`copy_executor.py` accepts the explicitly pinned plan and only the named real
copy or new self-authored synthetic descendants of S. The final plan keeps the
same five destinations and three original before-hashes as r1, changing only
the managed/helper source identities and manifest binding. The three other
sources remain their pinned old artifacts. All37 r1 receipt entries still match.

Apply freshly validates source/target paths, sizes, hashes, containment, ordinary
ancestors and single-link targets. It **exclusively creates** a new owned backup
root, makes and verifies **all three old backups before the first replacement**,
stages new files under its owned ordinary paths, rechecks each target immediately
before atomic replacement and journals intent/result. Addition rename refuses a
collision. Only a stage file successfully created exclusively by this invocation
is eligible for cleanup; a pre-existing stage is never removed.

Rollback binds its recovery metadata to the exact plan and independently
classifies every target as before/after/absent/unexpected. It restores an
after-hash overwrite from its individually verified old backup, removes an
unchanged owned addition, and leaves already-before/never-added targets alone.
An unexpected target, missing old overwrite or bad individual backup stops that
operation and preserves its bytes; other recoverable operations continue. It
does not assume an entirely installed copy. Recovery backups/journal remain.

`executor-test-results.json`: **all32 before/after mixtures** and **all five
injected failure prefixes** recover independently. Apply/rollback, changed
target, late target mutation, changed source, backup collision/tamper and the
Review49-style pre-existing stage collision are covered with real synthetic
files. Corrupt backup stops only its own operation. No actual copy file changed.
This accepts Review22's stable owned-path model; it is not atomic protection
against an adversary concurrently replacing path ancestors.

## Commands, retained failures and root handoff

Exact compiler/metadata argv, cwd, PID/creation, exits and Job counts are in
`S/commands.jsonl`. All commands used explicit Toolkit cwd. Successful entry
commands were `python -B` followed by S's `test_offline.py`, `test_diagnostic.py`,
`seal_final.py`, `verify_final.py` and `check_shutdown.py`. The final source/binary
build is exclusive; repeated builds require fresh owned output. The historical
H runner was not executed. The read-only actual-copy command also passed:

```powershell
python -B S:/Projects/UCP/de-research/observed-game-startup-r2/copy_executor.py check S:/Projects/UCP/de-research/observed-game-startup-r2/final/owned-install-plan-r2.json --sha256 aa04c10dbe978871b31e1f3db2afe3b326dbb8602c21e9034558f86b2aacd823
```

Final target states are **before, absent, before, before, absent**. Root can
later use `apply`/`rollback` with that exact plan/hash after independent review
and fresh checks. This preparation did not execute either against the real copy.

Retained failures: initial two-entry-point compilation lacked `/main:AddStartup`;
first synthetic allowlist omitted its owned Windows conhost; Job Active=0 alone
preceded some descendant handle signaling; Toolhelp raced an exiting process
(Win32 299); and initial final verification wrongly applied destination hardlink
policy to the read-only Windows-serviced csc binary. Each is recorded/explained
in S/README with corrected checks. A live unexplained module-snapshot failure
still stops the controller. The first later PID check's two AccessDenied numbers
were resolved by creation identity, not killed or declared absent by assumption.

Root must independently review this new delta, resolve actual OS capture using
the finite capability result, refresh original profile/PlayerPrefs recovery and
game/Workshop/bookkeeping/Classic inventories, verify fresh copy/namespace
conditions, establish supported **app3024040 Cloud off before association** plus
current queue/sync state, and recheck current user activity/exact processes.
`final/protected-watch-plan.json` preserves the known target inventory and
explicitly leaves fresh live Classic user-data root discovery to root.
The GUI observer is not a substitute for the Cloud control. No API/VDF/global
toggle, client restart, subscription or authentication change occurred.

Only then can root own actual install/startup/exit, real engine/native/child
paths and genuine licensed initialization, post-exit preservation and restoration
of a temporarily changed app-only Cloud checkbox. The memory DeflateStream and
dirty preopened FileStream limits remain honest. No SE/Fixes, multiplayer,
browser/Workshop UI, app/game/Steam launch or actual owned-copy installation
occurred. No renderer/draw/input, worker/cache/invalidation or queue changed;
no UI-performance evidence is claimed. `launchAllowed`, `artifactsInstalled`
and `gameLaunched` remain **false**. No feature acceptance row is closed.
