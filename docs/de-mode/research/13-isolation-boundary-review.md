# Independent isolation boundary review — bounded follow-up 1

2026-10-22. Read `00-goal-verbatim.md`, `01-working-contract.md`, `02-plan.md`,
reports 06/03, and `04-acceptance-protocol.md`. Supplied baseline:
`818503dc40971defef3769ca883f82290405ab94`, `de/separate-game-mode`.
The shared checkout advanced concurrently to `3f2484468e9175832fe781da136c3c5498295b8b`
before this review's first status read; other agents' changes were left alone.
This task owns only this report. All explicit scratch writes are under
`S:\Projects\UCP\de-research\isolation-boundary-review`.

No game/editor launch or attachment, game-DLL invocation, installed-game/profile/
registry mutation, Steam preference change, original ACL change, account/VM
creation, commit, push, CI, PR, or delegation occurred. Synthetic ACLs were
applied only to newly created test directories inside that scratch root.
The tiny executables used Windows security APIs and Cecil metadata reading.
No user window was activated, closed, or otherwise operated.

Labels: **observed** = reproduced in this task; **source-confirmed** = explicit
pinned source/documentation; **inferred** = engineering consequence;
**unverified** = no acceptance evidence yet.

## Decision and selected next task

| Candidate | Independent disposition |
| --- | --- |
| A: copy-local App ID, per-app Cloud off, exact root redirects, early Workshop/account-write suppression, preventive original-write protection | **Conditional GO as the selected design; NO-GO for a game launch in the present state.** Supported Steam controls can remove specific client-side risks while retaining ownership checks. A concrete guard, startup ordering, Cloud policy and restoration record are still missing. Monitoring/backups alone do not complete the candidate. No extra licensed account or VM is inherently required by the working contract. |
| B: same-user `WRITE_RESTRICTED` token with only scratch DACL grants | **NO-GO as the preservation boundary.** The synthetic token denied normal data writes but successfully deleted a protected sentinel. Child creation also did not produce a functioning worker. Do not promote token creation or a positive scratch write into isolation acceptance. |
| C: separate environment if A's remaining gates cannot be satisfied | **Conditional GO only with a concrete complete boundary.** An owned VM or otherwise independently isolated Steam/Windows environment must hide original writable roots and address the same account's Cloud/stats/Workshop state. A second user or another copied directory alone is insufficient. This is a fallback, not the selected immediate prerequisite. |

**Next bounded assignment:** build and review an **offline A acceptance harness**
against the pinned binaries, with a complete transformation manifest, synthetic
file/registry-operation denial tests and a concrete Steam policy/rollback plan.
Do not spend another task trying the demonstrated-incomplete token unchanged.
Do not launch merely because this report gives conditional design GO. The
coordinator retains the actual launch/activity gate. F1/D1 implementation is
independent of this acceptance harness and should continue.

## The preservation target is specific

The contract preserves existing saves, mod setups, the installed game and the
classic editor. It does not promise a Steam session with no playtime, last-played,
presence, authentication, shader-cache or client-log activity. Those ordinary
account/client signals are material residuals to disclose, not equivalent to
overwriting a save or modifying a subscription.

Treat effects separately:

- **Must protect:** original game files; the original LocalLow tree and
  PlayerPrefs key; installed Workshop content/mod inputs; user subscriptions;
  Cloud save content; stats, achievements and leaderboard scores modified by
  synthetic gameplay. This review conservatively protects account progress,
  without interpreting that as a ban on ordinary licensed-play signals.
- **Permissible only as an explicit bounded policy:** temporarily disabling this
  app's Cloud synchronization, with its prior state recorded and restored. It
  affects the current user/app, not just the copied EXE. Do not silently change
  global Cloud settings or other games.
- **Observe and attribute:** normal Steam background updates/logs. An update
  caused by this test's app activation is relevant; an unrelated client's log
  write is not an isolation failure. Baseline observation is necessary to make
  that distinction. Do not freeze or terminate the user's Steam client.

## Independent boundary audit

All game-source references below use Serpens commit
`a23aa1b32276d670ffbb2a7b641d23b500d8e298`, base
`_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/`.
`G/` means `managed/BC8B6A39/decompiled/` under that base. This is hash-associated
decompilation, not original publisher source. The handoff summary was not used
as proof. `audit_sources.py` reads pinned Git objects without checking out or
changing refs; its copied sources and their hashes are in `source-manifest.json`.

| Boundary | Independent evidence and remaining obligation |
| --- | --- |
| Native Unity identity | **Observed:** installed `globalgamemanagers` contains the 15-byte company string at payload offset 4136 and 38-byte product string at 4156, with matching preceding lengths. The two-line `app.info` remains the original identity. **Source-confirmed:** Unity 2021.3 derives Windows persistent storage and PlayerPrefs identity from company/product. Report 06's equal-length metadata edit is therefore a concrete prevention mechanism for those selected engine paths, not an EXE-rename heuristic. **Unverified:** actual native startup consumption, temporary-cache/crash/registry destinations. Change coherent metadata only in the owned copy; retain explicit log/crash destinations. [Unity persistent path][U-PATH], [PlayerPrefs][U-PREFS], [player arguments][U-ARGS]. |
| Managed roots | **Observed:** a separate Cecil reader of the actual installed assembly finds exactly **19** direct `get_persistentDataPath` call sites: 16 ConfigSettings methods, two Avatars methods, one HUD folder-opening call. It loads no game assembly into the CLR. `managed-call-sites.txt` identifies methods and IL offsets. **Source-confirmed:** `G/ConfigSettings.cs:2556-2656,4419-4447` includes settings, saves, lords/media, progress/staging, creation and directory deletion. Guard the resolved destination and every destructive operation, not only settings/save writes. [Root construction][G-CONFIG]. |
| Native simulation | **Source-confirmed:** `G/FatControler.cs:364-375` passes StreamingAssets, multiplayer autosave and save roots; `G/EngineInterface.cs:4018-4033` encodes all three as UTF-16 and passes lengths to `DLL_SetPath`. Native `exports/semantic-decompiled-functions.c:79019-79034`, RVA `0x876F0`, consumes these three inputs. Thus native save roots have a concrete managed bridge. This is not proof that every native/Unity/third-party write uses it. Assert actual arguments before forwarding and keep initialization/CWD inside the copy. [Startup][G-START], [bridge][G-ENGINE], [native function][G-NATIVE]. |
| Startup ordering | **Source-confirmed:** `FatControler.Start:343-354` loads settings and initializes achievements before the ordinary scene, so menu-time hooks are late. A failed BepInEx patch must stop execution; its ordinary catch/log/continue behavior is not a guard. [Startup][G-START], [BepInEx patch behavior][B-PATCH]. |
| SE roots | **Source-confirmed, re-read at SE `4014ca67c96974a5e6d697665baf5351cbfebde6`:** `IO/DirectoryHelpers.cs:12-47` hard-codes the original profile and caches dependent roots. Metadata changes alone miss it. `:50-139` separately derives plugin/game/BepInEx paths. Redirect its base getter before initialization and verify actual release DLLs; report 06 tested a source model, not a released SE binary. `Bootstrap/Plugin.cs:121-123` can initialize Steam early; `PluginOptions.cs:241-244` controls that extra Init/update behavior. [SE paths][SE-PATH], [SE initialization][SE-START], [SE options][SE-OPTIONS]. |
| Steam relaunch/license | **Source-confirmed:** `G/SteamManager.cs:70-91` performs restart-before-Init. Valve documents copy-local `steam_appid.txt` with `3024040` and matching CWD to avoid relaunching the library-installed EXE. Steam must still be running in compatible OS context, and the active account must own the app. Keep `SteamAPI.Init`, all ownership/DRM checks and genuine Steam DLLs intact. **Unverified:** this precise copied build's successful licensed start. A false restart return with the file present does not prove Init succeeded. [Game code][G-STEAM], [Valve initialization/relaunch][V-API]. |
| Auto-Cloud | **Observed:** independently reran the read-only v41 app-info parser, redirected only its output to this task's scratch. App 3024040 still has **14** original `WinAppDataLocalLow` rules, change number `39479681`, payload SHA-256 `4688263fae360cb9f54e86c718efb40ee50edf20ccc6b86440d4fa14fe326f32`, SHA-1 header validated. Changing the copy's Unity identity cannot change these rules. Current user enabled/disabled state is **unverified**; no Steam API was initialized. [Parser reference][APPINFO], [Valve Cloud][V-CLOUD]. |
| Workshop inputs/client downloads | **Source-confirmed:** `G/Platform_Workshop.cs:56-68` returns the current account's installed item paths; map/lord scans consume those results. SE's hook calls the original enumeration even when its own download option is disabled; its updater explicitly calls `DownloadItem`. **Observed:** `D:\SteamLibrary\steamapps\workshop\appworkshop_3024040.acf` has one installed item and one content directory, `NeedsUpdate=0`, `NeedsDownload=0` at this snapshot. The 639-byte manifest SHA-256 is `4eb9a2d350c8e117a15e015d784df84ac35edadc458e616e2909b3cf19ccbd87`. This is not a live subscription query or a promise that new work cannot be queued. [Game Workshop][G-WORKSHOP], [SE hook][SE-WORKSHOP], [SE updater][SE-UPDATES]. |
| Stats/leaderboards | **Source-confirmed, expanded audit:** 133 textual game-side Steam stats/UGC calls across 165 decompiled files: 114 in Platform_Achievements, six in Platform_Leaderboards, 13 in Platform_Workshop. `Platform_Achievements.cs:72-81` can call `SetStat("stat_VersionNumber",4)` while loading; `:193-247,383-482` mutate stats/awards. `Platform_Leaderboards.cs:89-115` uploads a score at line 113. No `SteamRemoteStorage.` call appeared in this scoped source search; native/client use remains outside that negative result. Suppress setters/awards/uploads before the first call, not just StoreStats or UI buttons. [Achievements][G-STATS], [leaderboard][G-LEADER]. |

Relevant installed identities were independently rehashed, all SHA-256:

| File (`Data` = original game's `_Data` directory) | Hash |
| --- | --- |
| Game EXE, 887880 bytes | `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a` |
| `UnityPlayer.dll`, 29438200 | `fae6c04f23916263879196211ed241aee5f1f1b53ba4566bb99d4df8526cc105` |
| `Data/globalgamemanagers`, 9282036 | `a3c0644553b1d0178a065ec15e45a4660a4e275547bf3decdc6fad937ac04a61` |
| `Data/app.info`, 54 | `304789e4d9276b23253e3d13ae2d0bbabe83a5d6d61d226a3b79aa39523a65e2` |
| `Data/Managed/Assembly-CSharp.dll`, 3693056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Data/Plugins/x86_64/CrusaderDE.dll`, 3451392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `Data/Plugins/x86_64/steam_api64.dll`, 319584 | `670d654aa3255c5061cf0236a1cdbb2f5076cbd5ae44f613b6f4921558e83e2d` |

`binary-identities.json` also records CoreModule. Original root:
`D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`.
This task did not fetch/run released SE/Fixes assemblies or create a runnable copy.
Final rehashes of all eight entries in `binary-identities.json` matched the
initial audit, and all 32 report reference definitions resolve locally.

## A: feasible supported controls, with a launch gate still to close

**Source-confirmed:** Valve provides per-game Cloud disabling in game properties.
`IsCloudEnabledForApp` queries that setting; `SetCloudEnabledForApp` requires an
explicit user request. Prefer a documented UI change before test startup, not a
late game API call, manual VDF editing, deleting `steam_autocloud.vdf`, a global
toggle, or guessed network arguments. The app file selects App ID/launch routing;
it provides no Cloud namespace. [Cloud policy][V-CLOUD], [Cloud API][V-REMOTE].

**Source-confirmed:** `ISteamUGC.SuspendDownloads(true)` suspends Workshop downloads
until resumed or the game ends. This is a useful session-scoped control beyond
SE's own update option. It does not erase installed inputs, change subscriptions,
prove no earlier/in-flight write, or remain a post-exit barrier. Its documented
scope says all Workshop downloads; do not assume it cannot affect other client
work. Leave user subscriptions and caches intact. [Workshop suspension][V-UGC].

**Source-confirmed:** Valve's `SetStat`/`SetAchievement` modify client state, and
`StoreStats` can be called automatically when a process ends with unsent progress.
Suppressing only explicit StoreStats calls is insufficient. The copy's harness
must prevent setters/awards and leaderboard upload requests; do not change
`SteamManager.Initialized` to false or fake successful authentication.
[Stats and implicit persistence][V-STATS].

**Inferred, selected architecture:** use a pinned copy with exact metadata and
managed/SE redirects; no external Workshop inputs; no test-origin account progress
writes; per-app Cloud off before app association; guards that refuse protected
file/registry destinations before destructive operations. This can meet the
actual contract without eliminating normal licensed Steam activity. It is a
test harness, not a shipping Toolkit install feature. Record which binaries are
instrumented; do not call it unmodified-game acceptance.

**Unresolved preventive objection:** redirects prevent the enumerated paths, but
the existing probes do not establish a general original-write veto before native
Unity startup or for all native/child activity. A managed guard starts too late
to cover engine activity before managed initialization. ProcMon, hashes and a
launcher that kills a process after an event are detection/recovery, not denial.
Similarly, suspending downloads after Init leaves an ordering question for an
already-running unrestricted Steam client. A token on the game does not fix it.
The next harness must either demonstrate the needed deny/redirect coverage
before use, or explicitly retain NO-GO and take C. No broad Steam-directory
deny, client suspension, or original ACL modification is recommended.

### Exact later preflight, backup and restore obligations

These are execution instructions for a later authorized task, not actions taken
here. Permission for isolated testing and idle-time launch already exists.

1. **Record protected and owned identities.** Resolve physical paths and reject
   hardlinks, junctions, reparse escapes and ambiguous roots. Record game build,
   exact binary set, original LocalLow location, original PlayerPrefs key,
   DE-specific Workshop tree/manifest and the classic editor identity. Prepare
   a full ordinary copy outside Git with explicit EXE/CWD; no original-file
   hardlinks. Select fresh metadata identities and actual owned scratch roots.
2. **Make recoverable snapshots before touching policy.** Into owned scratch,
   copy the original DE profile with metadata and a SHA-256/size manifest, export
   the exact DE PlayerPrefs key if present (record absence otherwise), snapshot
   the app-specific Workshop manifest/content and relevant Cloud bookkeeping.
   Pin the 14 Auto-Cloud rules again. Do not read/print tokens or replace the
   whole Steam configuration. Record a secure recovery copy of affected config
   and the exact prior app Cloud boolean/UI evidence. Backup protects recovery;
   it is not permission to risk an overwrite.
3. **Resolve app policy before any game/helper Steam Init.** If Cloud already
   disabled, record and preserve that state. If enabled, use the user's explicit
   selection of temporary app-only disablement; this is a distinct preference
   decision, not another request to authorize the already-authorized test.
   No policy-changing action was authorized for this review itself. Record the
   UI result and, when safe, verify the real queried boolean. Require no active
   DE game/session, Cloud sync/conflict, or app Workshop install/download at the
   transition. Never resolve a Cloud conflict automatically. Do not restart,
   log out, close or reposition existing Steam/Toolkit windows.
4. **Verify the harness offline first.** Refuse wrong input hashes, missing/extra
   call sites, stale metadata, late SE root changes, patch exceptions, original
   EXE/CWD selection, foreign Workshop paths and original PlayerPrefs targets.
   Test create/write/append/truncate/rename/delete/replace, directory deletion,
   registry value/key mutation and pre-existing writable handles using synthetic
   protected targets. Cover early native/child activity to the scope claimed.
   Include malformed paths, sibling prefixes, junctions and hardlinks. An
   original-path guard must deny before the operation, with testable errors.
5. **Close Steam's separate boundary.** Make vanilla enumeration return an empty
   owned result before first scan; disallow test publishing/subscription calls;
   suppress SE update requests; establish when download suspension is effective
   and how in-flight work is handled without disturbing the user's client.
   Deny all test-origin stats setters/awards/leaderboard uploads from startup,
   including version migration. Record counters/call sites and preserve normal
   Init/ownership behavior. If an app-triggered original Workshop write cannot
   be prevented, A remains NO-GO; unrelated Steam logging is not the reason.
6. **Coordinator alone opens the real-run gate.** After independent review and
   its fresh user-activity/process check, trace the exact owned process and
   children, module identities, Unity/company/product/persistent/temporary paths,
   PlayerPrefs identity, all managed roots, native DLL_SetPath arguments and SE
   caches. Require guard logs plus protected-root before/after evidence and
   app-specific Cloud/Workshop observations through shutdown. A first-scene path
   assertion is corroboration, not protection for an earlier write.
7. **Restore the preference safely, then validate preservation.** Stop only
   owned test processes; keep Cloud off until their handles/children are closed
   and protected profile/registry/Workshop baselines match or any differences
   are independently attributed. Restore only the exact changed per-app setting
   through Steam's supported UI; if it began disabled, leave it disabled.
   Download suspension expires at game end; do not blindly resume unrelated
   client work as cleanup. Observe re-enable/sync behavior before declaring
   recovery complete. If a conflict or unexplained protected change appears,
   stop with recovery evidence; do not overwrite user data or bulk-restore live
   Steam config. Remove only unchanged manifest-owned test files later.

Rollback cannot reliably undo an uploaded achievement, leaderboard result or
remote conflict. Those require prevention; resetting account stats is not an
acceptable cleanup technique. If another device is actively changing the same
Cloud files, defer the policy window rather than pretending a snapshot freezes
remote state. Do not touch another device/account without authority.

## B: synthetic results and practical constraints

**Observed on Windows 11 Pro `10.0.26300`, S: NTFS:**
`TokenProbe.cs` creates synthetic allowed/protected directories, grants the
normal user/System on both, and grants a newly generated restricting SID only on
allowed. It does not create a user/account or touch any original DACL. It creates
tokens with `DISABLE_MAX_PRIVILEGE | WRITE_RESTRICTED` (`0x9`) and, as a contrast,
`DISABLE_MAX_PRIVILEGE` plus the same restricting SID (`0x1`). Each new token
reports one restricting SID; the original primary token reports zero.

The operation matrix runs with `ImpersonateLoggedOnUser`, then always reverts.
This independently tests object access even when a child cannot initialize.

| Operation on synthetic protected files | `0x9` write-restricted | `0x1` fully restricted |
| --- | --- | --- |
| Read | Allowed | Denied |
| Create/overwrite/append/mkdir | Denied | Denied |
| Rename | Denied | Denied at the operation layer (reported FileNotFound) |
| Delete existing sentinel | **Allowed; file actually absent afterwards** | Denied; sentinel remains |
| Set attributes / grant restricting SID through file ACL / overwrite after ACL attempt | Denied | Denied |
| Same operations under allowed | All succeeded | All succeeded |

**Observed child result:** `CreateProcessAsUserW` succeeded for both tokens,
using an exact synthetic EXE/CWD, no inherited handles and `CREATE_NO_WINDOW`.
The write-restricted process exited `0xC0000142`; the fully restricted one exited
`0xC0000022`. Neither produced its entry-point output. Therefore the coded
grandchild check did **not** run. Root cause, desktop/loader compatibility and
Unity/Mono/D3D success are **unverified**. The old .NET OS string reports 6.2;
the independent CIM build query above identifies the actual OS. No desktop ACL
was loosened, desktop switched, driver loaded, Steam IPC opened or DLL injected.

**Source-confirmed:** Microsoft distinguishes write-restricted from general
restricted access and file `DELETE` from generic file-write rights. The observed
deletion is enough to reject this specific allowlist construction; do not assume
the word “write” covers every destructive operation. [Token flags][M-TOKEN],
[file rights][M-FILE]. A fully restricted token avoids that observed delete but
also denies ordinary reads without additional grants. Adding Everyone/Users/
Authenticated Users to restricting SIDs merely to make startup work requires
re-auditing every target's DACL; broad write grants can defeat the allowlist.

Practical requirements for any later replacement, none certified here:

- **Child/process model:** ordinary CreateProcess uses the calling process's
  primary context, not a thread impersonation token. A future launcher must
  create the actual restricted primary process, avoid pre-opened writable
  handles, place it in an appropriate no-breakaway job before resume, and audit
  broker-created/Steam-launched children separately. A job manages the tree;
  it is not a file/registry allowlist. Existing Steam is outside that tree.
  [Process context][M-PROCESS], [restricted launch][M-ASUSER], [jobs][M-JOB].
- **Desktop/Unity/D3D:** Microsoft recommends a separate desktop for restricted
  applications; desktop objects have their own access rights. The synthetic
  worker failure has not been diagnosed as a particular desktop or D3D failure.
  A noninteractive/private desktop may prevent useful game observation or
  graphics initialization; a working console probe would still not establish
  Unity/audio/GPU compatibility. Do not repair this by changing the original
  desktop/window-station ACL or interrupting the user. [Token warning][M-RESTRICT],
  [desktop rights][M-DESKTOP].
- **Registry:** no real registry key was created or mutated in this task.
  File-test success cannot certify PlayerPrefs key/value/delete semantics,
  inherited handles, COM or registry broker behavior. These need separate
  synthetic tests before any broad preservation claim.
- **Steam IPC/license:** Valve requires a compatible OS user/context; same user
  is necessary evidence, not a documented guarantee that a custom restricted
  token can access the required pipes/shared memory/handles. Grant only owned
  objects; do not alter Steam IPC ACLs, emulate responses, replace Steam DLLs,
  disable ownership checks or use account impersonation to force it to work.
  An already-running Steam client remains unrestricted even if Init works.
  [Valve requirements][V-API].
- **Low integrity/AppContainer equivalents:** low integrity blocks upward
  integrity writes, not all writes to equal/lower objects; it is not an exact
  root allowlist and must not be assumed to fix a LocalLow boundary. AppContainer
  supplies a stronger user/package intersection but requires a separate launch/
  profile/capability design and Steam IPC/GPU verification. No such profile was
  created. Neither is an established drop-in solution for this owned game's
  licensed launch. [Integrity][M-INTEGRITY], [AppContainer][M-APPCONTAINER].

### Reproduce without game execution

Use `exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE` explicitly:

```powershell
python 'S:\Projects\UCP\de-research\isolation-boundary-review\audit_sources.py'
python 'S:\Projects\UCP\de-research\isolation-boundary-review\probe_steam_cloud.py'
python 'S:\Projects\UCP\de-research\isolation-boundary-review\local_workshop_inventory.py'
python 'S:\Projects\UCP\de-research\isolation-boundary-review\run_probes.py'
```

Inspect first. The source audit reads installed binaries and pinned sources;
the Cloud script reads HKCU SteamPath/appinfo only. The final command compiles
and runs only the synthetic token programs and creates fresh scratch directories.
It changes **those synthetic DACLs only**, makes no registry mutations and leaves
the sentinels/results for inspection. It is not a reusable production sandbox.

Recorded final probe binaries, SHA-256:

- write-restricted EXE: `742be948f05d967c34d660d17c7c5d9537dd296443fd754427a569e5e6034d86`;
  generated source: `d17c5505ddbd64864c63dc242d75c77f40f82082650ccdcb26e499f7a29f1629`.
- fully restricted EXE: `af59dda23a32d519b3557d11919010d13b1d915dc55007c9a516baffd1e98214`;
  generated source: `82509fcf39a72376d9a0a6b0f1cd81d92b7b400147a770140380486af591256c`.
- metadata reader: `eae720d56fa571bb66c2e1a3b8c2bc04b6080fd50588a7ef4ebeff4e8c58baca`;
  Cecil dependency: `7ae470288fff4a402899c254d0a76cefef55877f5c54f96e83c797cc5bb6e2f6`.

Legacy compiler outputs need not reproduce byte-identically. Exact source,
compiler identity, output hashes, unique run paths and deleted-sentinel checks
are in `synthetic-probe-results.json`; operation logs are
`write-restricted.log` and `full-restricted.log`. Earlier exploratory failed
setup/worker runs are retained separately and are not passing evidence.

## C: narrow fallback and the next handoff

If A cannot supply preventive original-path coverage and safe client ordering,
the narrow external prerequisite is an **independently writable test environment
with usable graphics and a legitimate Steam context, with originals inaccessible
writable**. An owned VM snapshot with no writable host game/profile/Steam shares
is an example. A separately isolated Windows/Steam context can also qualify if
its filesystem permissions and launch context actually establish those facts.
Do not claim a second user isolates the remote account or works with the first
user's running client. Do not create accounts or VMs as part of this research.

The same legitimately owning Steam account may be sufficient if app Cloud is
disabled before testing and the harness suppresses account progress and Workshop
mutations. Ordinary playtime/presence remains possible. A separate licensed
account is necessary only if a later user choice requires separating those
account signals too; that is a stronger target than the present contract.

The smallest potential user choice is **temporary app-only Cloud disablement
with exact restoration**, if the current state is enabled and the existing
authority does not include that preference change. Prepare the concrete
manifest/guard/rollback result first. Do not repeat the general “may we do
isolated testing?” question. If that policy is declined or cannot be applied
without disrupting their Steam session, offer the concrete separate-environment
option with its GPU/disk/license-context tradeoffs instead of silently escalating
the preservation requirement.

Safe preparation now: physical-copy manifests, exact-hash metadata/managed edits,
Workshop/stats/leaderboard suppression plans, root/registry policy definitions,
synthetic destructive-operation tests, loader release provenance review and
rollback documentation. No current result certifies a real-game isolation run.

**Precise next-task acceptance:** one offline harness package outside Git plus a
reviewable transformation/policy manifest; unchanged authentication/DRM method
fingerprints; zero unexpected original-root references in audited managed/SE
code; all 19 call sites accounted for; native save-argument checks; full account
mutation call-site coverage including version migration/leaderboards; no original
Workshop input; passing synthetic deny-before-mutate cases including deletion
and registry operations; an explicit statement of pre-managed and Steam-client
coverage. Return any missing preventive control as an unresolved objection,
without launching or blocking F1/D1. The coordinator then decides whether the
remaining A gate is closed or the narrow C environment is required.

## Source pins and documentation provenance

Primary Microsoft source snapshots were fetched directly without cloning:
`MicrosoftDocs/sdk-api` **`656e9656bfaef34dd29cd7ee9e1146aec17e924c`** and
`MicrosoftDocs/win32` **`ca8274decead49403d70ceeed4af8d4ca74eaf11`**.
Exact file paths, hashes and primary links are in `ms-doc-source-pins.json`.
`docs/ms-*.md` preserves line-addressable source. Some Learn concept URLs
returned 404 through urllib while the browsing tool returned their text; pinned
official GitHub sources were fetched successfully instead. API-page build
metadata's internal Microsoft commit was not misrepresented as a GitHub commit.

Valve/Unity pages are unversioned documentation accessed 2026-10-22; snapshots,
HTML hashes and retrieval outcomes are in `docs-manifest.json`, with readable
captures under `docs/`. No upstream commit is invented for those pages. Valve
claims above come from actual Steamworks documentation, not the JS-only Support
FAQ capture. `pin_ms_docs.py`/`capture_docs.py` reproduce retrieval; new fetches
can legitimately have newer commits/page hashes.

[G-CONFIG]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L2556-L2656
[G-START]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/FatControler.cs#L343-L375
[G-ENGINE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4018-L4033
[G-NATIVE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L79019-L79034
[G-STEAM]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SteamManager.cs#L70-L91
[G-WORKSHOP]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Workshop.cs#L56-L68
[G-STATS]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Achievements.cs#L72-L81
[G-LEADER]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Leaderboards.cs#L89-L115
[SE-PATH]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/IO/DirectoryHelpers.cs#L12-139
[SE-START]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Bootstrap/Plugin.cs#L121-123
[SE-OPTIONS]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Bootstrap/PluginOptions.cs#L241-244
[SE-WORKSHOP]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/ManagedHooks/Platform_Workshop_Hooks.cs#L22-42
[SE-UPDATES]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Workshop/WorkshopUpdateManager.cs#L49-77
[B-PATCH]: https://github.com/BepInEx/BepInEx/blob/02413dd28c9a1d090f0d1d6fbb3ee4b775daec72/BepInEx.Preloader/Patching/AssemblyPatcher.cs#L265-L274
[APPINFO]: https://github.com/xPaw/SteamAppInfo/blob/32a4912a9b49679cfc6a7c6f7988b39ba86b267a/SteamAppInfoParser/AppInfo.cs#L36-L114
[U-PATH]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/Application-persistentDataPath.html
[U-PREFS]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/PlayerPrefs.html
[U-ARGS]: https://docs.unity3d.com/2021.3/Documentation/Manual/PlayerCommandLineArguments.html
[V-API]: https://partner.steamgames.com/doc/api/steam_api?l=english#SteamAPI_RestartAppIfNecessary
[V-CLOUD]: https://partner.steamgames.com/doc/features/cloud?l=english
[V-REMOTE]: https://partner.steamgames.com/doc/api/ISteamRemoteStorage#SetCloudEnabledForApp
[V-UGC]: https://partner.steamgames.com/doc/api/ISteamUGC#SuspendDownloads
[V-STATS]: https://partner.steamgames.com/doc/api/ISteamUserStats#StoreStats
[M-TOKEN]: https://github.com/MicrosoftDocs/sdk-api/blob/656e9656bfaef34dd29cd7ee9e1146aec17e924c/sdk-api-src/content/securitybaseapi/nf-securitybaseapi-createrestrictedtoken.md#L70-L77
[M-ASUSER]: https://github.com/MicrosoftDocs/sdk-api/blob/656e9656bfaef34dd29cd7ee9e1146aec17e924c/sdk-api-src/content/processthreadsapi/nf-processthreadsapi-createprocessasuserw.md#L73-L89
[M-PROCESS]: https://github.com/MicrosoftDocs/sdk-api/blob/656e9656bfaef34dd29cd7ee9e1146aec17e924c/sdk-api-src/content/processthreadsapi/nf-processthreadsapi-createprocessw.md#L67-L71
[M-RESTRICT]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/SecAuthZ/restricted-tokens.md#L11-L26
[M-FILE]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/FileIO/file-security-and-access-rights.md#L22-L32
[M-JOB]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/ProcThread/job-objects.md#L32-L37
[M-DESKTOP]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/winstation/desktop-security-and-access-rights.md#L13-L17
[M-INTEGRITY]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/SecAuthZ/mandatory-integrity-control.md#L14-L20
[M-APPCONTAINER]: https://github.com/MicrosoftDocs/win32/blob/ca8274decead49403d70ceeed4af8d4ca74eaf11/desktop-src/SecAuthZ/implementing-an-appcontainer.md#L28
