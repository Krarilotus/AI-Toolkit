# Offline A isolation harness: implementation and review handoff

2026-10-22. This task read the four governing goal/contract/plan/synthesis files,
reports 06, 13 and 03, and acceptance protocol 04. Supplied baseline:
`818503dc40971defef3769ca883f82290405ab94`, branch `de/separate-game-mode`.
The shared branch advanced through other work; observed HEAD during preparation
was `7f227286c6bd90f60a3ba3fd709484538efd66af`. Nothing was reset or committed.
This report is the **only repository file owned/edited by this task**.
All tools, instrumented copies, synthetic targets, detailed manifests and logs
are under `S:\Projects\UCP\de-research\isolation-harness-a` (abbreviated **H**).
This is shared-checkout work, not T3 worktree isolation. No children were spawned.

**Observed** means reproduced offline here; **source-confirmed** means explicit
pinned source/documentation; **inferred** means an engineering consequence;
**unverified** means no runtime/preventive acceptance evidence.

## Disposition

**Observed:** a concrete reproducible offline harness now exists, with exact
input/count rejection, coherent absolute managed/copy roots, independent metadata
verification, complete original-method before/after manifests, unchanged licensing
method bytes, early account/Workshop mutation suppression and actual synthetic
tests of the guard implementation. `preflight.py` verifies these artifacts and
reports **`launchAllowed: false`**. No runnable game copy was prepared.

**Unverified / unresolved:** this cooperative managed guard is not a universal
OS sandbox. It supplies no veto over pre-managed Unity, native calls outside the
checked bridge, raw inherited/pre-opened handles, uninstrumented children, or the
existing Steam client. A concurrent path/link replacement race also remains.
Three synthetic probes positively reproduce native-handle, raw-child and
unrestricted-client-surrogate bypass classes. See the quantified residual table.
No real-game isolation or Toolkit feature acceptance is claimed.

No game/editor launch, attachment, game-DLL execution, Steam Init/live API call,
policy change, original file/registry/ACL change, user-window operation,
account/VM/service creation, classic-checkout modification, commit/push/CI/PR/
release occurred. Original binaries were read and rehashed. The only network
fetch added here was a 2.4 MB metadata-editing library, explained below; no loader
release was fetched or installed.

## Concrete package and APIs

Inspect `H\README.md` first. The executable entry points are:

| File | Purpose / actual API |
| --- | --- |
| `run.py` | Pins inputs/tools/sources, compiles owned tools, transforms twice, independently verifies every method with Cecil, tests five negative cases, runs the synthetic guard suite. |
| `Instrument.cs`, `Instrument.exe` | dnlib metadata-only transformer; exact original SHA, exact output path, exact counts per transform category. Never CLR-loads game code. |
| `Audit.cs`, `Audit2.exe` | Independent Cecil reader; method token/RVA, normalized instructions/locals/EH fingerprint, raw IL and full method-body hashes including headers/EH sections, call targets and literals. |
| `Guard.cs`, `OfflineA.Guard.dll` | Actual static wrapper implementation referenced by transformed calls. `PersistentRoot()`, `ManagedRoot(string)`, `Bridge(string,string,string)`; checked file/directory/stream operations; registry deny; account suppress/deny counters. |
| `GuardTests.cs`, `GuardTests.exe` | Runs the same guard DLL, not a separate policy model; fresh owned allowed/protected targets and synthetic workers. |
| `verify-guard-wiring.py` | Independent metadata check of 79 redirect/IO replacement signatures, 98 mutation replacement stack shapes and all helper/stub references. |
| `capture-cloud.py` | Replays the exact pinned Review13 appinfo parser with only its output-root assignment changed. No Steam API/policy action. |
| `snapshot.py` | Read-only scoped inventory; optional bounded scratch-only file backup and DPAPI-encrypted exact PlayerPrefs-key recovery data. No registry write/restore API. |
| `snapshot-test.py` | Synthetic DPAPI protect/unprotect round trip; no original backup or restore. |
| `rollback-plan.py` | Verifies all three owned artifacts and original source hashes; emits a read-only exact-byte rollback plan. No apply/delete action. |
| `preflight.py` | Verifies original input identities, output/guard hashes and synthetic results; emits explicit remaining gates. Contains no launch/policy API. |

`Guard.Canonical` requires an absolute local drive path in an allowed root,
normalizes ordinary slash separators, rejects traversal, device/UNC/extended/ADS
paths, trailing-dot/space ambiguity, all existing reparse ancestors and files
with link count other than one. Recursive directory operations inspect descendants
before mutation. Stream writes inspect a FileStream's actual final handle path
and link count; memory streams are allowed and unknown stream types fail closed.
Read-only file opens/source reads remain possible; this protects writes, not input
confidentiality. Registry mutation is wholly denied through the cooperative API.
Checks precede forwarding but are not atomic against hostile concurrent changes.

Source SHA-256 for review of the actual implementation:

| Source | SHA-256 |
| --- | --- |
| `Guard.cs` | `cdb51c987a81d84076f30783152565f6a5fb6b341343fef7d63c0219011f6a91` |
| `Instrument.cs` | `9dd831aa732ebf1aa32714f9f4ce4e99fc43bbe562ccc32e09fe0efbb3c1afe9` |
| `Audit.cs` | `a9be6e7a4678bb85aaced8ab6df13f9d539e35843f4bf3db9315b0746afb2583` |
| `GuardTests.cs` | `d248f937291dca5a51ce47b3cb0e1d123a83c89d01e4df7211a9f3ac9113211f` |

`build-identities.json` supplies compiler/source/executable hashes; legacy C#
compiler builds need not have reproducible MVIDs. The **managed transform output
itself is byte-identical across repeated transforms**, independently of the
helper build MVID. `transform-manifest.json` pins the exact guard DLL used for
the recorded run. `package-index.json` indexes final deliverables.

## Inputs, metadata transforms and reversal

**Observed:** before copying, inspected prior probe/tool inventories and free
space: S: had about 2.99 TB free. Reused Cecil and UnityPy; no full game copy.
Only the 9.3 MB metadata object file, 3.7 MB managed output, tiny app.info and
owned tools/manifests were needed. Original installed data was never written.

`input-identities.json` pins/rechecks the original EXE, UnityPlayer, managed/core/
Steamworks assemblies, native simulation/Steam DLLs, metadata, compiler and tools.
All game hashes match reports 06/13. Important exact transformations:

| Object | Original SHA-256 | After SHA-256 |
| --- | --- | --- |
| `globalgamemanagers`, 9,282,036 bytes | `a3c0644553b1d0178a065ec15e45a4660a4e275547bf3decdc6fad937ac04a61` | `1ac3b8f4f3bf522a8b13e4acaeb72d218becd465dfd0c3317815ae5d2347ed3f` |
| `app.info`, 54 bytes | `304789e4d9276b23253e3d13ae2d0bbabe83a5d6d61d226a3b79aa39523a65e2` | `90b3cbaf7e11c7ea8a94d469ee50dc3098d8f42d567ed3f3224c369aadaa8d9f` |
| `Assembly-CSharp.dll`, 3,693,056 original / 3,743,744 output bytes | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` | `1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c` |

Outputs are `H\artifacts\globalgamemanagers.offline`, `app.info.offline` and
`Assembly-CSharp.offline.dll`. Metadata edits require exactly one PlayerSettings
object, path ID 1, byte start 4096, object length 1150, Unity `2021.3.45f2`:

| Field | Payload offset / length | Original | New |
| --- | --- | --- | --- |
| Company | 4136 / 15 bytes | `Firefly Studios` | `Toolkit DE LabA` |
| Product | 4156 / 38 bytes | `Stronghold Crusader Definitive Edition` | `AIToolkit DE Offline AXXXXXXXXXXXXXXXX` |

**Observed:** exactly one length-prefixed occurrence of each field; 51 byte
positions differ; all other PlayerSettings fields and all **17 other objects**
are unchanged after UnityPy reparsing. Byte-exact reverse replacement restores
the original. app.info has exactly the same two new names, no trailing newline.
Wrong metadata hash, PlayerSettings count or app.info hash is refused.

**Inferred, not observed:** Unity's new engine profile would be
`C:\Users\Krarilotus\AppData\LocalLow\Toolkit DE LabA\AIToolkit DE Offline AXXXXXXXXXXXXXXXX`
and PlayerPrefs would be
`HKCU\Software\Toolkit DE LabA\AIToolkit DE Offline AXXXXXXXXXXXXXXXX`.
Those locations were **not created**. Company/product metadata does not force
native Unity data under S:. They are a distinct proposed engine namespace,
not a demonstrated owned runtime root. Any later use must be owned explicitly
by the coordinator's runtime gate. The absolute S: managed root below is separate.
Temporary-cache/native crash/registry consumption remains unverified.

The managed transformation uses [dnlib's PreserveAll writer option][DNLIB].
A Cecil-only rewrite was first inspected and rejected because it changed raw
token bytes in 7,928 method IL bodies, including SteamManager, despite matching
semantic fingerprints. The final dnlib output preserves untouched method bytes.
An independent Cecil reader verifies the output; neither parser CLR-loads it.

Tools: Cecil SHA-256
`7ae470288fff4a402899c254d0a76cefef55877f5c54f96e83c797cc5bb6e2f6`;
UnityPy **1.24.2** reused from `assets\pydeps`, bytecode writing disabled;
compiler SHA-256
`eca02e6b15cde93009a59a3d129d5a77fb5008f2e1cf62cf573b6737c747ecc3`.
The official NuGet `dnlib/4.5.0` package is 2,375,358 bytes, SHA-256
`63bc2f9579568204cc8b30fa9f6700a231bcf868a8032e09118887af3eafee58`;
its net45 DLL is 1,179,136 bytes, SHA-256
`97ef5328d1d1703924c48d9cd1d45b7227fe3836e116dcded623b6a0dbd52c23`.
No game loader was obtained as part of this task.

Reversal means restore exact pinned original bytes **only into an owned copy**.
`rollback-plan.json` validates current after-hashes and original hashes for all
three objects. No current original file or Steam preference needs restoration.
There is no automatic live restore. A future installed-copy rollback must refuse
changed/foreign files, hardlinks/reparse escapes or source-version mismatch;
stage/recheck before atomic replacement and remove only unchanged owned additions.

## All managed roots, bridge and exact method accounting

**Observed:** all configured managed paths use
`H\owned\profile`; the planned physical installation is `H\owned\game`.
`launch-plan.json` records exact EXE/CWD, StreamingAssets, log/crash arguments
and all three native bridge arguments. No EXE was copied or launched.

Every persistent getter call becomes a call to `Guard.PersistentRoot()`, which
validates the root before returning. All 16 ConfigSettings root-return sites
also pass through `Guard.ManagedRoot` before returning. Exact original IL sites:

| Original method | IL offset |
| --- | --- |
| `ConfigSettings.GetSettingsFileName(bool)` | `0000` |
| `ConfigSettings.GetSavesPath()` | `0000` |
| `ConfigSettings.GetUserMapsPath()` | `0000` |
| `ConfigSettings.GetMpAutoSavePath()` | `0000` |
| `ConfigSettings.GetUserCustomLordsPath()` | `0000` |
| `ConfigSettings.GetUserExtendedLordsPath()` | `0000` |
| `ConfigSettings.GetUserCustomTrailsPath()` | `0000` |
| `ConfigSettings.GetUserTrailMakerPath()` | `0000` |
| `ConfigSettings.GetUserCustomMediaPath()` | `0000` |
| `ConfigSettings.GetUserTrailMakerBackupPath()` | `0000` |
| `ConfigSettings.GetScoresFileName()` | `0000` |
| `ConfigSettings.GetSkirmishMastersFileName()` | `0000` |
| `ConfigSettings.GetCoopFileName()` | `0000` |
| `ConfigSettings.GetCustomTrailsCompletedFileName()` | `0000` |
| `ConfigSettings.GetUserWorkshopPath()` | `0000` |
| `ConfigSettings.GetWorkshopUploadRootPath()` | `0000` |
| `Avatars.GetAvatarTexture(AvatarDesign,bool,bool,bool)` | `0abf` |
| `Avatars.OutputCoAPNG(string,Texture2D)` | `000e` |
| `CrusaderDE.HUD_Options.ButtonClicked(int)` | `0460` |

There are **zero** remaining direct persistentDataPath calls in the output.
The only remaining original-identity string match is the display title in
`MinimumWindowSize.SetWindowTitle`, not a path. `root-manifest.json` also records
the **25 StreamingAssets** and **9 dataPath** calls, unchanged read/resource roots
that must resolve from the future physical copy. These were not falsely counted
as 34 redirected persistence sites. Cached ConfigSettings-derived watchers and
paths receive the redirected roots before their ordinary initialization.

**Observed/source-confirmed:** exactly one managed `DLL_SetPath` caller exists,
`EngineInterface.sendPath(string,string,string)`. Its new entry guard requires:

- `H\owned\game\Stronghold Crusader Definitive Edition_Data\StreamingAssets`;
- `H\owned\profile\Saves\` for the MP autosave **directory**, not a guessed file;
- `H\owned\profile\Saves` for ordinary saves.

It validates all three before the original UTF-16 encoding and pointer/length
forwarding code executes. Synthetic exact/wrong-root tests exercise that same
`Guard.Bridge`. Native code was never called. The original native consumer is
the pinned RVA `0x876F0` in report 13. [Managed bridge][BRIDGE].

`transform-sites.tsv` records method, original offset, category and effect for
**195** exact edits. Counts are enforced before writing:

| Category | Count |
| --- | ---: |
| Persistent getters / validated ConfigSettings returns / native bridge entry | 19 / 16 / 1 |
| Directory create / recursive directory delete | 22 / 1 |
| File copy / delete / WriteAllText / WriteAllBytes | 14 / 3 / 10 / 3 |
| FileStream constructor / Stream.Write / Stream.CopyTo | 4 / 2 / 1 |
| Empty Workshop enumeration | 1 |
| Account SetStat / SetAchievement / StoreStats / leaderboard upload | 24 / 41 / 22 / 1 |
| Workshop mutation requests | 10 |

**Observed:** independent parsing finds **8,138 original methods: 55 changed,
8,083 byte-identical**, plus **13 new mutation-gate stubs**. Every changed original
method is attributable to the site manifest; no unlisted method differs.
`method-manifest.json` contains **every original method's before/after raw IL,
full method-body and normalized fingerprints**, tokens/RVAs and transformations;
it also inventories all added methods. `before.json`/`after.json` retain calls
and strings. `destructive-call-sites.json` accounts for all **60** direct audited
destructive file/directory/stream sites; independent signature scanning requires
each to have a transformation. This is the pinned Assembly-CSharp scope, not
all installed dependencies or all possible runtime/reflection calls.

**Observed:** `guard-wiring-results.json` independently checks all **79** direct
redirect/IO signatures, **98** mutation-replacement parameter/return stack shapes,
and resolves every helper/stub reference by exact signature against separately
read metadata. This is not a full Mono IL verifier or proof of actual game-side
loading/execution. The game wiring was never executed; actual helper loading and
Unity/Mono compatibility remain runtime-review obligations.

## Licensing unchanged; account and Workshop mutations blocked early

**Observed:** `licensing-manifest.json` verifies **12 game-side method bodies**
including all ten SteamManager methods and relevant command-line/DLC callers,
with both raw-body/IL hashes and unchanged semantic call targets. For example,
`SteamManager.Awake` full raw method-body SHA-256 remains
`2b4f279ad485f16a65fe21f172bc5d8ad1289fb36beaffd69463376164cff105`.
Restart-before-Init, genuine `SteamAPI.Init`, returned initialization status,
packsize/DLL checks, DLC/ownership calls, callbacks and shutdown remain intact.
All **84 P/Invoke declarations** compare unchanged: 77 CrusaderDE, seven user32.

The genuine Steamworks managed file is untouched, SHA-256
`71123ab0b6b8e8489a39ce16bfa3d7498b40904e0b43d7cb5369fe40b6552596`.
Ten relevant Steamworks methods and their call paths are separately fingerprinted.
The original native Steam DLL is untouched, SHA-256
`670d654aa3255c5061cf0236a1cdbb2f5076cbd5ae44f613b6f4921558e83e2d`.
No replacement Steam DLL, fake initialized flag, authentication emulation or
ownership bypass exists. Successful licensed startup remains **unverified**.

**Observed/source-confirmed:** all 24 SetStat sites, 41 SetAchievement sites,
22 StoreStats sites and the one leaderboard upload are replaced before any
managed startup. This includes `LoadAchievements`'s `stat_VersionNumber = 4`
migration. Boolean mutations return **false**, count suppression, and never
forward; leaderboard and UGC mutation stubs throw. This avoids test-origin
client dirty stats at those setters; merely suppressing StoreStats would not
prevent Valve's documented implicit persistence. [Version migration][STATS],
[implicit StoreStats][VALVE-STATS].

The first subscribed-item enumeration now returns a new empty list with no
Steam enumeration/installation query. Ten CreateItem/StartItemUpdate/SetItem*
/SubmitItemUpdate call sites are denied. Cecil finds **zero remaining direct
SteamUGC calls** or account mutation calls in the transformed game assembly.
`account-manifest.json` supplies every method/offset and the migration finding.
No subscription operation was present in that audited game scope; it is not a
claim that Steam or another dependency cannot make one.

**Source-confirmed second-stage gap:** SE binary is absent and excluded. Reused
15 pinned Review13 source files (full pins/hashes in `source-manifest.json`):
Serpens `a23aa1b32276d670ffbb2a7b641d23b500d8e298` and SE
`4014ca67c96974a5e6d697665baf5351cbfebde6`. SE independently caches the original
LocalLow base and derived roots; its optional early Init and Workshop updater
require actual-assembly verification and suppression **before** plugin startup.
Its hook calls vanilla enumeration even with its update option disabled.
The source-model probe from 06 is not promoted to released-DLL evidence.
No SE/Fixes fetch, install or execution was used to expand vanilla scope.
[SE roots][SE-ROOT], [early Init][SE-INIT], [updater][SE-UPDATE].

## Actual guard tests and explicit coverage limits

**Observed:** `guard-results.json`: **51 checks, zero failures**, synthetic
protected tree byte-identical after all guarded attempts. This includes:

- Create, overwrite, byte write, append, truncate, copy destinations;
  rename source/destination; replace source/destination/backup; file deletion;
  directory creation, recursive deletion and directory move source/destination.
- Allowed operations really succeed, including file and recursive-directory
  deletion; protected deletion is refused **before mutation**.
- Sibling-prefix, traversal, drive-relative, UNC/extended, ADS, trailing-dot/
  space, NUL/device paths; an actual NTFS junction and an actual hardlink.
  Recursive deletion rejects a tree containing either escape.
- Protected pre-opened FileStream write, copy-to and SetLength attempts are
  denied through the actual handle-aware wrapper. Unknown stream type is denied.
- Exact native bridge tuple accepted; each of its three wrong protected arguments
  and an owned-but-wrong save root denied. Mixed slash settings paths normalize.
- Seven registry mutation operations are refused at the actual registry front
  door, including a declared pre-opened-key operation. **No real synthetic or
  original registry key/value was created or modified.** The pinned game has
  zero direct managed Registry/PlayerPrefs mutators to rewrite; these seven
  tests prove cooperative API denial, not native PlayerPrefs containment.
- Cooperative synthetic child starts successfully and cannot delete the sentinel.
  The previous failed restricted-token construction was not retried.

The three **passing residual demonstrations** mean a bypass exists, not that
containment passed: a raw child appends to a synthetic target; a native WriteFile
through a pre-opened handle changes a synthetic target; a same-process surrogate
for an unrestricted external client deletes its synthetic target. No real Steam
behavior or pre-managed Unity startup was exercised by those probes.

| Residual | Measured coverage / risk left | Smallest concrete next step |
| --- | --- | --- |
| Before managed startup | Zero startup executions or OS vetoes. Two metadata strings source-predict a new engine identity, but Unity temp/cache/crash/registry writes are unverified. | Independent review must decide whether pinned identity redirection is sufficient for the narrow preservation claim; otherwise use a separately isolated environment where originals are not writable before any Unity start. Later activity/launch gate belongs to coordinator. |
| Native simulation / other dependencies | One checked SetPath bridge among 77 CrusaderDE declarations; seven user32 declarations unchanged. Six native plugin DLLs exist; no full native write-sink containment. 107 of 108 installed managed DLLs are uninstrumented. One raw native-handle bypass reproduced. Unknown write-sink counts remain **unknown**, not zero. | Review the exact bridge/native source mapping and restrict claims to its configured save roots. A stronger boundary requires handle-relative/native controls or an independent writable environment; managed wrapper tests cannot close it. |
| Children and pre-opened handles | One cooperative child test passes; one raw child and one raw native handle bypass succeed. Zero automatic child/broker inheritance controls. | Do not allow an unreviewed child/broker path under an A preservation claim. Add a concrete reviewed process/native boundary or use the independent environment; a job alone would not supply file/registry denial. |
| Existing Steam client | Zero policy changes, zero Init calls, zero runtime Cloud/Workshop quiescence observations. Fourteen original Cloud rules remain. One surrogate deletion bypass succeeds. | Establish supported app-only Cloud false plus prior UI/boolean and no in-flight app sync/Workshop activity before any Init; unresolved app-triggered client writes keep A NO-GO. |
| Check-to-forward race | All 60 audited direct destructive sites use wrappers, but path/descendant checking and forwarding are not atomic. No hostile concurrent reparse/hardlink mutation test or preventive guarantee. | If that adversarial guarantee is required, implement handle-relative atomic operations with held root/ancestor identities and new race tests; otherwise coordinator must explicitly limit the claim to a stable owned-path deterministic redirect. |

No token, source ACL/registry policy, kernel driver, account or VM was changed.
Backups, observation, after-hashes and a kill-on-event watcher are not credited
as preventive controls. Neither metadata reparsing nor 51 checks establishes
real-engine/profile acceptance.

## Supported per-app Cloud plan, inventory and rollback

**Observed:** exact pinned v41 app-info parser rerun read-only. App 3024040:
change `39479681`, payload SHA-256
`4688263fae360cb9f54e86c718efb40ee50edf20ccc6b86440d4fa14fe326f32`,
SHA-1 header validated, **14 original WinAppDataLocalLow rules** unchanged.
`steam-cloud-config.json` preserves their exact paths/patterns, including literal
`missons.cfg`; no rule spelling was silently corrected. The parser's original
SHA-256 is `28c6ec902279ff1cebc8a132c4450a5e4460b1cf0605cabfa4fe1d9709d2045f`;
only output-root routing changed, recorded in `cloud-parser-provenance.json`.
No cache access token/account identifier is printed by it.

**Observed:** `snapshot.py` inventory-only run:

| Scoped source | Files | Bytes |
| --- | ---: | ---: |
| Original DE LocalLow profile | 113 | 230,475,057 |
| App Workshop content | 1 | 4,001,968 |
| `appworkshop_3024040.acf` | 1 | 639 |
| Per-app Steam userdata bookkeeping | 1 | 34,041 |
| Total | 116 | 234,511,705 |

PlayerPrefs original key exists; only its exact-tree hash/presence is emitted.
Account path label is anonymized. The inventory is
`H\snapshots\20261022T212120388707Z\inventory.json`, SHA-256
`828e23f3be06a9abb0030c5d74feea24ef8a8d98d02b6f1465b0212f9461d6f0`.
`latest-snapshot.json` points there. This is **not an atomic or recoverable full
backup**. No original file/key backup was performed just to enlarge offline scope.
Optional `snapshot.py --backup` is implemented, limited to 512 MiB/free-space
preflight, scoped files and DPAPI-encrypted exact-key recovery data in scratch.
Its synthetic DPAPI round trip passes; actual original restore is untested.
No Steam global/local configuration or credentials are copied or bulk-rewritten.

**Prepared / not executed:** `cloud-policy.json` gives the exact ordered plan:

1. Inventory and create recoverable scoped backups before policy; compare again
   because no live process was frozen and another device/session can change state.
2. Before **any** game/helper/SE Init or app association, require no DE session,
   Cloud conflict/sync or app Workshop install/download in progress. Record Steam
   game Properties > General's per-app Cloud checkbox and prior boolean/UI
   evidence. These are **still pending**, not inferred from `last_sync_state`.
3. If already false, preserve false. If true, the minimal preference decision is
   temporary **app-only** disablement with exact restoration. A later coordinator
   may ask that specific decision only after reviewing these artifacts; this is
   not a repeat request for isolated-testing permission. This task asks/executes
   no policy change. Use supported per-game UI, not global toggles or VDF editing.
4. Confirm resulting app-only false and stable app-specific state before Init.
   Offline Workshop flags cannot prove absence of queued/in-flight client writes.
   Do not terminate/restart/suspend the user's client to manufacture quiescence.
   If these conditions cannot be established safely, defer the run.
5. Retain genuine Init/ownership. Prepared copy-local `steam_appid.txt` contains
   `3024040\n`; it routes restart behavior, supplies no Cloud namespace, and was
   not installed into a runnable game. Optional `SuspendDownloads(true)` is
   post-Init and affects broad Workshop scope; it was not called or credited as
   pre-Init prevention. No subscriptions, publishing or updater actions are made.
6. After stopping only owned processes and closing owned children/handles, keep
   Cloud off until preservation comparisons pass or changes are attributed.
   Restore only the exact changed per-app checkbox. Initially false stays false.
   Observe subsequent sync/conflict handling; never auto-resolve a conflict,
   reset achievements/stats, or bulk-restore live Steam configuration.
7. On a conflict/unexplained original change, preserve evidence and stop cleanup.
   Do not overwrite newer user data. Remote achievements/leaderboards are not
   reliably reversible, so their test-origin mutation must be prevented.

This plan follows Valve's [Cloud guidance][VALVE-CLOUD],
[explicit-request per-app setting API][VALVE-CLOUD-API],
[Workshop suspension scope][VALVE-UGC] and [restart/init documentation][VALVE-INIT],
reusing the pinned Review13 source/documentation captures. Prior boolean, UI,
in-flight conditions and restoration observations are deliberately null/pending.

## Commands, results and bounded handoff

All commands used explicit `exec_command.workdir = S:\Projects\UCP\AI-Toolkit-DE`.
Reproduce with Python from that directory; the native .NET compiler invocations
and synthetic EXE commands are fully recorded in `H\commands.json`:

```powershell
python 'S:\Projects\UCP\de-research\isolation-harness-a\run.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\verify-guard-wiring.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\capture-cloud.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\snapshot.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\snapshot-test.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\rollback-plan.py'
python 'S:\Projects\UCP\de-research\isolation-harness-a\preflight.py'
```

**Observed results:** transform run exit 0, exact method/site/account checks pass,
two managed outputs identical, all metadata objects reparse, 51 guard checks
pass, signature/stack-shape metadata audit passes, all five wrong-input/count cases refuse before output mutation, original
input pins recheck unchanged. Cloud parser exit 0/14 rules. Inventory exit 0;
synthetic snapshot-tool test exit 0. Rollback planner verifies three artifacts,
zero executed actions. Preflight exit 0 means **offline verification only** and
explicitly reports `launchAllowed: false` with the five boundary classes above.

Initial implementation compile/syntax errors were corrected before the recorded
passing run; they are not acceptance evidence. No broad Toolkit test suite or
formatter was run because no production code changed. No generated TypeScript
was hand-edited. Shared central/research/product files were left to their owners.

**Review handoff:** independently inspect `Instrument.cs`/`Guard.cs`, the 195-site
manifest, all-method raw hashes, licensing evidence and 51 actual guard results.
The concrete narrow claim supported here is verified offline IL redirection for
the exact pinned assembly plus synthetic denial by its referenced guard for the
enumerated stable managed paths. Actual game-side execution remains unverified.
Decide whether that finite evidence plus supported pre-Init Cloud
ordering is proportionate to preservation; do not silently promote it to a
native/child/Steam veto. If such a veto is required, these results still leave
A NO-GO and the smallest alternative is a genuinely independent writable test
environment with originals inaccessible writable, not another unchanged token
retry. No account/VM/environment creation is authorized or performed here.

The next bounded implementation, if A continues, is a **handle-relative guard
revision for the same owned file signatures plus deterministic concurrent-link
and pre-opened-handle tests**, followed by fresh independent review; it must not
claim to solve early Unity or Steam. Alternatively coordinator can review the
finite redirect claim first and choose the environment boundary. Vanilla remains
first; actual SE assembly remains a separate second-stage gap. Coordinator alone
owns central synthesis, commits, the current-user activity check and real-launch
gate. No acceptance matrix row is closed by this offline task.

[DNLIB]: https://github.com/0xd4d/dnlib/blob/v4.5.0/src/DotNet/Writer/Metadata.cs
[BRIDGE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4018-L4033
[STATS]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Achievements.cs#L72-L81
[SE-ROOT]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/IO/DirectoryHelpers.cs#L12-47
[SE-INIT]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Bootstrap/Plugin.cs#L121-123
[SE-UPDATE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Workshop/WorkshopUpdateManager.cs#L49-77
[VALVE-CLOUD]: https://partner.steamgames.com/doc/features/cloud?l=english
[VALVE-CLOUD-API]: https://partner.steamgames.com/doc/api/ISteamRemoteStorage#SetCloudEnabledForApp
[VALVE-UGC]: https://partner.steamgames.com/doc/api/ISteamUGC#SuspendDownloads
[VALVE-STATS]: https://partner.steamgames.com/doc/api/ISteamUserStats#StoreStats
[VALVE-INIT]: https://partner.steamgames.com/doc/api/steam_api?l=english#SteamAPI_RestartAppIfNecessary
