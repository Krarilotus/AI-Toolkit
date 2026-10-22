# Follow-up research: same-user DE profile isolation

Research round 1, 2026-10-22. Supplied Toolkit baseline:
`818503dc40971defef3769ca883f82290405ab94`, `de/separate-game-mode`.
Read `00-goal-verbatim.md`, `01-working-contract.md`, `02-plan.md` and completed
`03-runtime-loaders.md`. This report is the only Toolkit file edited by this task.
Scratch: `S:\Projects\UCP\de-research\profile-isolation`.

No game/editor launch, process attachment, installation, game-profile/registry/
Steam-setting mutation, account/VM creation, commit, push, CI, PR or delegation
was performed. Required files were copied only into scratch; no full test install
was made. The custom executables run were offline metadata utilities and a tiny
directory-string test. Game assemblies were read through Cecil metadata, never
loaded into a running game or invoked.

Evidence labels: **Observed** = reproduced offline here; **source-confirmed** =
explicit pinned code/documentation; **inferred** = proposed consequence;
**unverified** = needs further evidence before use.

## Decision for the coordinator

1. **Observed:** same-user path redirection is technically feasible. Actual Unity
   company/product metadata can be changed reversibly in an owned copy. A second
   probe redirects all **19** managed `persistentDataPath` calls into scratch.
   A tiny program built from pinned SE directory-helper source demonstrates
   redirecting its base root, `Maps` and `_SE_PERSISTENT`.
2. **Source-confirmed / inferred:** copied metadata addresses native Unity profile,
   log and PlayerPrefs identity, which a ConfigSettings-only hook misses. Metadata
   alone leaves SE pointing at the original LocalLow folder. Early/offline changes
   offer a concrete candidate, not a guessed Unity launch switch.
3. **Observed:** Steam's actual app-info cache has **14 Auto-Cloud rules targeting
   the original profile**. They do not follow copied Unity metadata. Workshop
   discovery, SE download requests and account statistics are additional shared
   Steam paths/state.
4. **Unverified; launch gate remains closed:** offline path feasibility is not a
   safe whole-session isolation boundary. No control preventing the existing
   Steam client from writing original paths, no demonstrated virtualization/
   write-denial boundary covering that client, and no real Unity/SE startup trace
   were established. Do not launch on the strength of these probes. The fallback
   at the end specifies the narrower separate-user/VM prerequisites; a second
   Windows user alone is not a verified turnkey answer either.

This refines report 03's recommendation without weakening the original-path
preservation requirement. No user decision is needed to finish this research.

## Sources, pins and binary provenance

Existing sources were inventoried and read without pull, checkout or ref changes.
No repository was cloned. The Fixes object-only clone has no working checkout;
its apparent deleted-file status was not repaired.

| Source | Pin and relevant primary files |
| --- | --- |
| Serpens main managed decompilation | `a23aa1b32276d670ffbb2a7b641d23b500d8e298`; `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/`; [ConfigSettings][G-CONFIG], [FatControler][G-START], [SteamManager][G-STEAM], [MapFileManager][G-MAP], [Avatars][G-AVATAR], [EngineInterface][G-ENGINE], [Workshop][G-WORKSHOP], [lord discovery][G-LORD], [statistics][G-STATS] |
| SE existing clean checkout | `4014ca67c96974a5e6d697665baf5351cbfebde6`; [paths][SE-PATH], [startup][SE-START], [options][SE-OPTIONS], [Workshop hook][SE-WORKSHOP] |
| Fixes existing objects | `a90f96c176e9c8981af83534f5a8bb444838ae0a`; [plugin writes][F-DATA], [location helper][F-PATH] |
| BepInEx 5.4.23.4 | Tag resolves to `02413dd28c9a1d090f0d1d6fbb3ee4b775daec72`; [preloader][B-PRE], [patcher][B-PATCH], [paths][B-PATH] |
| App-info parser reference | xPaw/SteamAppInfo `32a4912a9b49679cfc6a7c6f7988b39ba86b267a`, [AppInfo.cs 36-114][APPINFO] |
| Platform documentation | Unity 2021.3 [persistent directory][U-PERSIST], [PlayerPrefs][U-PREFS], [player arguments][U-ARGS], [logs][U-LOG]; Valve [initialization/relaunch][V-INIT], [Cloud][V-CLOUD], [Cloud API][V-CLOUD-API]; accessed 2026-10-22 |

UnityPy **1.24.2** was reused read-only from the asset track's `assets\pydeps`,
with bytecode writing disabled. No dependency installation was needed. The actual
serialized-file Unity version is **2021.3.45f2**.

Downloaded the official [BepInEx x64 ZIP][B-RELEASE] into scratch only: 638940
bytes, SHA-256 `f881201b79da03e513bf97cdf39607ffa7f9e0d31a519b1aeeca8eb60f8309e7`.
Only `Mono.Cecil.dll` and `BepInEx.Preloader.dll` were extracted as tools/evidence;
BepInEx was not installed. Cecil: 339456 bytes, SHA-256
`7ae470288fff4a402899c254d0a76cefef55877f5c54f96e83c797cc5bb6e2f6`.
Preloader: 43008 bytes, SHA-256
`24ea4f141eb34631fd3a978abba1c6b4519a4c257b5f0716e09241ddf48a8628`.
Current SE/Fixes release binaries were not obtained or executed; full released
assembly compatibility remains unverified.

**Observed local SHA-256**, rehashed in this round. Root:
`D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`;
`Data` means its `Stronghold Crusader Definitive Edition_Data` directory.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| Game EXE | 887880 | `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a` |
| `UnityPlayer.dll` | 29438200 | `fae6c04f23916263879196211ed241aee5f1f1b53ba4566bb99d4df8526cc105` |
| `Data/globalgamemanagers` | 9282036 | `a3c0644553b1d0178a065ec15e45a4660a4e275547bf3decdc6fad937ac04a61` |
| `Data/app.info` | 54 | `304789e4d9276b23253e3d13ae2d0bbabe83a5d6d61d226a3b79aa39523a65e2` |
| `Data/Managed/Assembly-CSharp.dll` | 3693056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Data/Managed/UnityEngine.CoreModule.dll` | 1275640 | `e468e19789d608b41e2c7fe4f367c7082fece7d1883f568e75870f6c5384cc86` |
| `Data/Plugins/x86_64/CrusaderDE.dll` | 3451392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `Data/Plugins/x86_64/steam_api64.dll` | 319584 | `670d654aa3255c5061cf0236a1cdbb2f5076cbd5ae44f613b6f4921558e83e2d` |

## 1. Unity metadata: reversible copy-only probe

**Observed:** `globalgamemanagers` has one PlayerSettings object, path ID 1,
starting at file offset 4096, length 1150. Decoded company/product match the two
lines of `app.info`. Cloning the directory or renaming the EXE changes neither.

`probe_metadata.py` checks the exact input SHA, makes ordinary scratch copies,
and changes only the two length-prefixed string payloads in a separate output:

| Field | Payload file offset | Bytes | Original | Replacement |
| --- | ---: | ---: | --- | --- |
| `companyName` | 4136 (`0x1028`) | 15 | `Firefly Studios` | `Toolkit DE Lab1` |
| `productName` | 4156 (`0x103C`) | 38 | `Stronghold Crusader Definitive Edition` | `AIToolkit DE Probe 20261022R1XXXXXXXXX` |

Equal byte lengths preserve offsets, object tables and file size. Result:
**50 differing byte positions**, other **17 objects byte identical**, reparsed
PlayerSettings differing only in those two fields, and byte-exact reversal.
Installed source bytes compared equal afterwards. No whole-asset reserialization,
GUID change or modification of another setting was used.

`globalgamemanagers.isolated` SHA-256:
`c52892057f34ba59661689cf8cd07f63ffcd5bbca23f871500c2c33c86cca1a5`.
A coherent two-line `app.info.isolated` was produced, SHA-256
`0ae0d178d6eff8ee1d79b1d39be21dd6dec1459e260042bff9cadcd5b4f8db47`.
These offsets are for the recorded hash only.

**Source-confirmed:** Unity documents the Windows persistent directory as normally
`LocalLow/<company>/<product>`, resolved through Windows known-folder APIs, and
PlayerPrefs under `HKCU\Software\<company>\<product>`.
[Persistent directory][U-PERSIST], [registry][U-PREFS]. **Inferred:** coherent
copied metadata should provide a distinct engine identity. Actual UnityPlayer
consumption is **unverified** by asset reparsing alone. No new LocalLow directory
or registry key was created here. Changing only `app.info` is not demonstrated
sufficient.

Unity documents `-logFile <pathname>` and crash-file location controls, including
`-crash-report-folder`. [Arguments][U-ARGS], [logs][U-LOG]. These control logs/
crashes, not saves. No supported `-savedir`, `-userpath` or persistent-data switch
was established. A guessed environment override cannot demonstrate redirection
of Unity's known-folder API, .NET's special-folder API and Steam simultaneously.

## 2. Concrete game paths and initialization order

**Source-confirmed:** `FatControler.Start` at lines 343-354 calls
`ConfigSettings.LoadSettings`. That method (2659-2743) calls
`GetSettingsFileName(createPaths:true)` at line 2705, creating directories before
reading settings. `SaveSettings` can write settings at line 2764. These writes
can precede ordinary menu interaction. [Startup][G-START], [ConfigSettings][G-CONFIG].

| Coverage | Concrete paths | Exact file/lines at the Serpens pin above |
| --- | --- | --- |
| Initial settings | `settings.cfg`; `Saves`, `Maps`, `CustomLords`, `ExtendedLords` and standard-lord children, `CustomTrails`, `TrailMaker`, `CustomMedia`; media ReadMe copy | `ConfigSettings.cs:2556-2656` |
| Progress | `missions.cfg`, `skirmishmasters.cfg`, `coop.cfg`, `custom_trails.cfg` | `ConfigSettings.cs:3538-3540,3654-3656,3736-3738,4299-4301` |
| Backups/staging | `TrailMaker/Backups`, `UserWorkshopMaps`, `WorkshopTemp/Content`; Content is deleted/recreated | `ConfigSettings.cs:2654-2656,4419-4447` |
| Portrait/output | `Coat Of Arms.png`, profile-folder opening | `Avatars.cs:746-775` |
| Cached roots/watchers | User maps, Workshop uploads, saves, trail-maker/custom-trail roots cached before file thread/watchers | `MapFileManager.cs:116-133` |
| Native save paths | StreamingAssets, MP auto-save and save roots passed into UTF-16 `DLL_SetPath` arguments | `FatControler.cs:364-375`; `EngineInterface.cs:4018-4033` |

**Observed offline:** Cecil finds **19** direct
`UnityEngine.Application.get_persistentDataPath` calls: 16 ConfigSettings methods,
two Avatars methods and `CrusaderDE.HUD_Options.ButtonClicked`. The static
ConfigSettings constructor has no such getter call. Source grep's 40 text hits
include variable uses; they do not represent 40 calls.

`OfflinePathProbe.cs` changes those 19 `call` instructions to `ldstr` of
`S:\Projects\UCP\de-research\profile-isolation\isolated-profile`, writing only
`Assembly-CSharp.isolated.dll`. It enforces input SHA and expected count before
writing, then reopens the output to check zero remaining calls.
`VerifyRewrite.cs` compares method instruction/local fingerprints:
**8138 methods; exactly 19 differ; 8119 unchanged; assembly references unchanged**.
This is not full metadata equivalence or a runtime test. Output: 3688960 bytes,
SHA-256 `169d1c42d9def89823523a03bd81dcd9f9bd8a61a501c01022e5bcc4589d05b8`.
The installed assembly was not overwritten or executed.

There are two candidate strategies, not a requirement to combine redundant edits:

- **Minimal vanilla candidate:** copied metadata identity changes Unity's root;
  unmodified game methods should follow it. Actual resolution needs verification.
- **Explicit-root candidate:** copied metadata isolates engine identity while all
  19 managed call sites use an explicit scratch profile. SE must use that same
  root. Engine/third-party data may still occupy the new LocalLow identity;
  account for both owned roots instead of claiming every write reaches one folder.

Both are isolation-harness changes, not ordinary Toolkit export requirements.
Managed-only redirection cannot cover native Unity writes before managed loading
or its original PlayerPrefs identity. No output was installed into a runnable copy.

## 3. SE/Fixes and early BepInEx

**Source-confirmed:** SE `DirectoryHelpers.cs:12-47` independently caches
`Environment.GetFolderPath(UserProfile)/AppData/LocalLow/Firefly Studios/Stronghold
Crusader Definitive Edition`; Maps and `_SE_PERSISTENT` derive from it.
Metadata-only changes leave that original root in use. Late reflection assignment
can also leave dependent caches and prior writes unaffected. [SE paths][SE-PATH].

**Observed source-model probe:** compiled complete pinned DirectoryHelpers source
into a tiny executable, with only syntax-equivalent legacy-compiler conversions
(block namespace and one interpolated exception message). It invokes only the
base/maps/persistent getters, never CopyDirectory or writes. Unmodified results
point at original LocalLow. Replacing the compiled base getter with
`ldstr <scratch-root>; ret` changes all three results to scratch. See
`se-model.log`. Original source SHA-256:
`04d6fa4c8b5ef9bec7bda307a511c0cb9563cb0f456c068e855c373a895dddf1`.
This is **not execution of a released SHCDESE.dll**.

For the metadata-only strategy, SE's base getter would instead return Unity's
isolated persistent path. For explicit-root redirection it must return the same
explicit root. Apply before the complete SE assembly runs, through a reviewed
copy-only offline patch/build or a separately demonstrated preloader route.

Additional destinations require a physical copy with original EXE/data names:

| Component | Destination and exact source at the pins above |
| --- | --- |
| SE `.semod` cache/editor/Lua | `_SE_PERSISTENT/AssetCache/...` and related storage derive from `GamePersistentDirectory`; `API/Components/Assets/SEModResourceSource.cs:51-59`, `API/Components/MapEditor/SEMAAssetStorage.cs:93-106`, `LUA/LUAPersistentAPI.cs:31-58` ([cache][SE-CACHE], [editor][SE-EDITOR], [Lua][SE-LUA]) |
| SE map restoration | `API/GameMapArchiveManagerAPI.cs:417` uses `GameMapsDirectory` ([map][SE-MAP]) |
| SE staging/export/cache | `_SE/.staging`, `_EXPORT`, BepInEx/plugins and plugin `data/aobcache.json` derive from running EXE/plugin locations; `IO/DirectoryHelpers.cs:51-139`, `API/Components/Archive/MapModManager.cs:40-49`, `Bootstrap/Plugin.cs:367` ([paths][SE-PATH], [staging][SE-STAGING], [startup][SE-START]) |
| Plugin-local settings | SE lobby storage is sibling to actual plugin assembly (`API/Components/ModManager/LobbyModSettingsStorage.cs:71-88`); Fixes creates plugin `data/hopsFarmWhitelist.json` (`Util/IOHelper.cs:9-32`, `Bootstrap/Plugin.cs:140-156`) ([storage][SE-STORAGE], [Fixes helper][F-PATH], [writes][F-DATA]) |
| BepInEx | Config, cache, plugins and patchers default beside EXE (`Paths.cs:13-31`) ([paths][B-PATH]) |
| SE crash dumps | `BepInEx/crashdumps`; old dumps trimmed at startup even with handler disabled (`Bootstrap/Plugin.cs:145-168`, `NativeHooks/NativeCrashHandler.cs:40-73`) ([startup][SE-START], [handler][SE-CRASH]) |

**Source-confirmed:** BepInEx documents preload-time `TargetDLLs` and
`Patch(AssemblyDefinition)` before game initialization. [Contract][B-DOC]. Pinned
`Preloader.cs:81-96` loads patchers then calls PatchAndLoad. The offline Cecil
probe demonstrates the core operation on the actual managed assembly.

Two loader-source negative cases matter:

- `TargetDLLs = SHCDESE.dll` alone does not select a plugin-directory DLL. The
  dictionary is built from supplied DLL search directories; defaults are Managed
  plus explicitly supplied directories, not the plugin tree (`Paths.cs:31`,
  `AssemblyPatcher.cs:209-260`). No complete SE custom search/load mapping was
  built or tested. [Paths][B-PATH], [patcher][B-PATCH].
- A patcher exception logs an error, removes the assembly from the patched set,
  then continues (`AssemblyPatcher.cs:265-274`). It does not automatically stop
  the game. Normal BepInEx error recovery is not a protective isolation boundary.
  A separately reviewed launcher/guard must refuse an unisolated start. Native
  Unity can write before managed patchers, so metadata/log controls still matter.

## 4. Steam: observed Cloud rules and shared external state

### Actual local Auto-Cloud configuration

**Observed:** `probe_steam_cloud.py` reads SteamPath from HKCU and reads
`appcache/appinfo.vdf` without modification. It parses v41 magic `0x07564429`,
its string table and app 3024040's record. Record end/size and binary SHA-1 header
hash validate. Tokens, Steam IDs and unrelated app records are not output.
The format follows pinned [AppInfo.cs:36-114][APPINFO].

App change number **39479681**; record payload SHA-256
`4688263fae360cb9f54e86c718efb40ee50edf20ccc6b86440d4fa14fe326f32`.
Result: `steam-cloud-config.json`. This is a Steam-supplied local cache snapshot,
not a claim about future publisher settings.

All 14 `ufs.savefiles` rules have root `WinAppDataLocalLow` and prefix
`Firefly Studios/Stronghold Crusader Definitive Edition`:

| Rule | Suffix below prefix | Pattern | Recursive explicitly set |
| ---: | --- | --- | --- |
| 0 | `Saves` | `*.sav` | absent |
| 1 | `Maps` | `*.map` | absent |
| 2 | root | `skirmishmasters.cfg` | absent |
| 3 | root | `settings.cfg` | absent |
| 4 | `Maps` | `*.tmp` | absent |
| 5 | `UserWorkshopMaps` | `*.map` | absent |
| 6 | `UserWorkshopMaps` | `*.data` | absent |
| 7 | `Saves` | `*.msv` | absent |
| 8 | root | `coop.cfg` | absent |
| 9 | root | `missons.cfg` | absent |
| 10 | `CustomTrails` | `*.*` | 1 |
| 11 | `TrailMaker` | `*.*` | 1 |
| 12 | root | `custom_trails.cfg` | absent |
| 13 | `CustomMedia` | `*.*` | 1 |

`missons.cfg` is literal cache spelling; game source uses `missions.cfg`. It was
not corrected. The new metadata identity is outside these prefixes, but the
**original prefixes remain configured**.

**Source-confirmed:** Auto-Cloud operates in Steam using configured paths and can
synchronize around sessions; Windows roots use Windows folder APIs. A
`steam_autocloud.vdf` marks a configured location, not a per-copy switch.
[Valve Cloud documentation][V-CLOUD]. **Unverified:** whether directly launching
a copied EXE avoids any particular sync phase. Do not infer that a renamed EXE,
`steam_appid.txt`, or offline network state prevents Steam's cached/local actions.

A targeted local-config read found app cloud `last_sync_state = synchronized`;
it did not establish an authoritative current enabled boolean. No Steam API was
initialized to query it. This report does **not** claim Cloud currently on/off.

`SetCloudEnabledForApp(false)` changes the per-app/user preference, not a
process-local sandbox. Valve requires an explicit user request for that setting.
[V-CLOUD-API]. A call after initialization would also not prove an earlier sync
was prevented. No cloud preference was changed here.

### Retaining the copied EXE, Workshop and account state

**Source-confirmed:** `SteamManager.Awake:70-91` calls
`SteamAPI.RestartAppIfNecessary(3024040)` before Init. [Game code][G-STEAM]. Valve
says relaunch runs the library-installed version; it can escape the owned copy.
Valve also documents that copy-local `steam_appid.txt` containing `3024040`, with
the copy as working directory, causes RestartAppIfNecessary to return false.
A running Steam client in the same OS context and a valid account license are
still required. [Valve API][V-INIT]. This is a documented candidate for retaining
the copied EXE, **not proof of licensing/cloud isolation on this machine**.
No such file was installed here.

SE defaults `Steam/EarlyInitialization = true` (`PluginOptions.cs:241-244`) and
calls `SteamAPI.Init()` in Awake before later hooks (`Plugin.cs:121-123`).
[Options][SE-OPTIONS], [startup][SE-START]. Disabling that setting postpones SE's
extra Init; vanilla later initializes Steam anyway. `AllowMultipleInstances`
bypasses a restart call, not profiles/cloud.

Vanilla uses account Workshop install locations, then scans them for maps/lords:
`Platform_Workshop.cs:56-68`, `CustomisationFileManager.cs:495-537`,
`MapFileManager.cs:177-200`. [Workshop API][G-WORKSHOP], [lords][G-LORD],
[maps][G-MAP]. A new LocalLow directory is therefore not a clean mod environment.
A later harness must prevent external Workshop discovery or establish an empty
isolated subscription/cache boundary without changing existing subscriptions.

SE additionally requests Workshop updates through `SteamUGC.DownloadItem`.
`Steam/DisableSteamUGCUpdates = true` in only the copy's config skips SE update
requests; it does not suppress original enumeration or Steam-client updates.
Exact sources: `ManagedHooks/Platform_Workshop_Hooks.cs:22-42`,
`Bootstrap/PluginOptions.cs:244`,
`API/Components/Workshop/WorkshopUpdateManager.cs:49-77`.
[Hook][SE-WORKSHOP], [option][SE-OPTIONS], [updater][SE-UPDATES].

Gameplay writes account statistics/achievements through SetStat, SetAchievement
and StoreStats (`Platform_Achievements.cs:193-247,383-482`).
[Statistics][G-STATS]. Local path changes cannot isolate the same Steam account's
progress. No direct game-level SteamRemoteStorage FileWrite/FileRead/SetCloud use
was found by the scoped Assembly-CSharp text audit outside wrappers; this negative
search does not audit native/client behavior or prove no Cloud use.

## 5. Reproduction and negative cases

Use explicit Toolkit workdir `S:\Projects\UCP\AI-Toolkit-DE`. These scripts
write only owned scratch outputs, never launch the game. Inspect before rerunning.

```powershell
python 'S:\Projects\UCP\de-research\profile-isolation\probe_metadata.py'
python 'S:\Projects\UCP\de-research\profile-isolation\probe_managed.py'
python 'S:\Projects\UCP\de-research\profile-isolation\probe_steam_cloud.py'
& 'S:\Projects\UCP\de-research\profile-isolation\VerifyRewrite.exe' 'D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data\Managed\Assembly-CSharp.dll' 'S:\Projects\UCP\de-research\profile-isolation\Assembly-CSharp.isolated.dll'
```

The managed script uses existing
`C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe`, reads dependencies as
metadata from Managed, and runs only the two tiny PathSmoke programs. No
proprietary game code is invoked. It does not compile VerifyRewrite; its source
and compiled utility are also retained in scratch. Legacy C# builds need not have
deterministic hashes; `prototype-identities.json` identifies the observed run.

Key evidence files:

- `metadata-probe.json`, `PlayerSettings.json`, `BuildSettings.json`,
  `managed-rewrite.log`, `verify-rewrite.log`, `se-model.log`, `negative-probes.json`.
- `game-identities.json`, `prototype-identities.json`, `bepinex-provenance.json`;
  `source-manifest.json` records hashes, pins, URLs and local files for the
  extracted game/SE/Fixes/BepInEx sources.
- `managed-path-audit.txt`, `startup-audit.txt`, `writes-audit.txt`,
  `platform-api-audit.txt`, `se-platform-audit.txt`, `steam-cloud-config.json`,
  `steam-cloud-setting-audit.json`.

**Observed negatives:** wrong game input SHA is refused before output; output
outside the scratch prefix is refused; no rejected output exists. The
`isolated-profile` directory itself does **not** exist after testing: the pure
getter tests did not create a profile. Checked scratch/immediate source directories
were not reparse points. The prototype's lexical guard is not a complete physical
path/reparse-point policy.

Other concrete failure cases:

- Copy/EXE rename alone leaves both Unity metadata and SE's root unchanged.
- Metadata-only plus stock SE leaves its original LocalLow root active.
- ConfigSettings-only changes miss Avatars, HUD folder opening, native Unity and SE.
- Late hooks can lose initialization races and retain original cached roots/watchers.
- Preloader exceptions can continue with the unpatched assembly.
- Steam relaunch can run the installed EXE; correct game paths cannot stop client
  Cloud writes, original Workshop inputs/downloads or shared account-stat writes.
- ProcMon observation and before/after hashes can discover an original write after
  it occurred; they are not preventive isolation.

## 6. Concrete implementation sequence and pre-launch verification gate

1. **Keep the harness separate from Toolkit product work.** Parent reviews the
   pins/probes and chooses metadata-only versus explicit managed-root redirection.
   Retain original bytes/output hashes outside Git. Do not copy experimental DLLs
   into the installed game. The source-model SE test is not release compatibility.
2. **Prepare the owned physical copy later.** No hardlinks or writable junctions
   into installed game/profile/Workshop roots; preserve EXE/data names. Manifest
   copied and added files. Validate resolved paths, reparse points and link
   identities, not just prefixes. Set explicit EXE and working directory.
3. **Close the external Steam gate first.** Establish how original-path Auto-Cloud
   and Workshop writes are prevented without a trial exposing originals. A
   same-user filesystem/registry virtualization boundary must cover relevant Steam
   operations as well as the game tree, or Steam needs a demonstrated separate
   data boundary. Neither was established here. Do not silently toggle the original
   client's Cloud settings/subscriptions. Network blocking alone does not prove
   absence of cached/local actions. Keep license checks intact.
4. **Finish early instrumentation offline.** Validate metadata; explicit-root mode
   must enforce the exact SHA and 19 sites. Obtain/hash actual SE/Fixes releases,
   review the base-getter change on that full SE binary, and ensure it precedes
   dependent caches. A failed patch must refuse the launch. Suppress unwanted
   Workshop sources/update requests in the test harness and establish how existing
   account statistics remain unaffected.
5. **Only then, after the coordinator's activity check, launch the smallest probe.**
   Before first scene/settings load, record actual Unity company/product,
   persistent/temporary-cache paths, all 16 ConfigSettings roots, SE base/Maps/
   persistent roots, EXE/CWD/Managed/BepInEx/plugin locations and native
   DLL_SetPath arguments. Refuse continuation if a protected root is selected.
   Engine writes preceding managed code require the already established preventive
   boundary; a later assertion cannot protect against earlier writes.
6. **Verify protected destinations during that authorized run.** Observe the game,
   crash/webview children and relevant Steam processes' file and registry writes.
   Require no test-attributable create/write/delete/rename in original game,
   LocalLow, Workshop roots or
   `HKCU\Software\Firefly Studios\Stronghold Crusader Definitive Edition`.
   Compare content/metadata manifests, including Steam actions outside the game
   process. Require the new engine registry identity and expected owned outputs;
   unchanged save hashes or absence of errors alone is insufficient.
7. **Stage acceptance:** clean startup; vanilla lord/media; save/reload; then SE
   media/Fixes guarding and save/reload. Record harness changes alongside binary
   identities: instrumented acceptance is not unmodified-binary acceptance. Stop
   on any isolation violation. Keep game assets, test saves and logs outside Git.
8. **Rollback only owned data.** Remove unchanged manifest-owned files in validated
   test roots. Do not move/rename/symlink/change ACLs on original profiles as an
   isolation technique or silently repair unrelated original files.

### Narrow fallback prerequisite if same-user protection cannot be established

Use a **separate Windows test identity with its own Steam client context**, or
an owned VM with separate writable filesystem/registry and adequate graphics
support. Original game/profile must not be exposed writable. Running copied EXE
as another Windows user against the original user's Steam process is insufficient:
Valve lists OS-context mismatch as an Init failure condition. Establish valid
licensing in the client account/context before testing. [Valve requirements][V-INIT].

Also establish Cloud/Workshop/statistics handling before that environment's first
game start. The same Steam account across users/VMs still shares remote state;
a fresh Windows identity isolates local paths, not the remote account. A separate
licensed test account or a verified, explicitly selected Cloud/statistics policy
is needed if that remote state must remain untouched. No new account, extra
license, VM capability or offline-launch success is assumed or requested here.

Specific unresolved gates: actual Unity metadata consumption; released SE startup/
getter compatibility; pre-managed/third-party writes; direct-copy Steam behavior;
preventing original-path Auto-Cloud actions; clean Workshop inputs; account-stat
handling; and a preventive write boundary. Path rewriting now has reproducible
offline evidence. Real-game isolation and acceptance remain open.


[G-CONFIG]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L2556-L2656
[G-START]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/FatControler.cs#L343-L375
[G-STEAM]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SteamManager.cs#L70-L91
[G-MAP]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/MapFileManager.cs#L116-L200
[G-AVATAR]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Avatars.cs#L746-L775
[G-ENGINE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4018-L4033
[G-WORKSHOP]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Workshop.cs#L56-L68
[G-LORD]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L495-L537
[G-STATS]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Platform_Achievements.cs#L193-L247
[SE-PATH]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/IO/DirectoryHelpers.cs#L9-139
[SE-START]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Bootstrap/Plugin.cs#L85-168
[SE-OPTIONS]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Bootstrap/PluginOptions.cs#L241-244
[SE-WORKSHOP]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/ManagedHooks/Platform_Workshop_Hooks.cs#L22-42
[SE-CACHE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Assets/SEModResourceSource.cs#L51-59
[SE-EDITOR]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/MapEditor/SEMAAssetStorage.cs#L93-106
[SE-LUA]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/LUA/LUAPersistentAPI.cs#L31-58
[SE-MAP]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/GameMapArchiveManagerAPI.cs#L417
[SE-STAGING]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Archive/MapModManager.cs#L40-49
[SE-STORAGE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/ModManager/LobbyModSettingsStorage.cs#L71-88
[SE-CRASH]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/NativeHooks/NativeCrashHandler.cs#L40-73
[SE-UPDATES]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Workshop/WorkshopUpdateManager.cs#L49-77
[F-DATA]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Bootstrap/Plugin.cs#L140-156
[F-PATH]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Util/IOHelper.cs#L9-32
[B-PRE]: https://github.com/BepInEx/BepInEx/blob/02413dd28c9a1d090f0d1d6fbb3ee4b775daec72/BepInEx.Preloader/Preloader.cs#L81-L96
[B-PATCH]: https://github.com/BepInEx/BepInEx/blob/02413dd28c9a1d090f0d1d6fbb3ee4b775daec72/BepInEx.Preloader/Patching/AssemblyPatcher.cs#L209-L274
[B-PATH]: https://github.com/BepInEx/BepInEx/blob/02413dd28c9a1d090f0d1d6fbb3ee4b775daec72/BepInEx/Paths.cs#L13-L31
[B-DOC]: https://docs.bepinex.dev/articles/dev_guide/preloader_patchers.html
[B-RELEASE]: https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.4/BepInEx_win_x64_5.4.23.4.zip
[APPINFO]: https://github.com/xPaw/SteamAppInfo/blob/32a4912a9b49679cfc6a7c6f7988b39ba86b267a/SteamAppInfoParser/AppInfo.cs#L36-L114
[U-PERSIST]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/Application-persistentDataPath.html
[U-PREFS]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/PlayerPrefs.html
[U-ARGS]: https://docs.unity3d.com/2021.3/Documentation/Manual/PlayerCommandLineArguments.html
[U-LOG]: https://docs.unity3d.com/2021.3/Documentation/Manual/LogFiles.html
[V-INIT]: https://partner.steamgames.com/doc/api/steam_api#SteamAPI_RestartAppIfNecessary
[V-CLOUD]: https://partner.steamgames.com/doc/features/cloud
[V-CLOUD-API]: https://partner.steamgames.com/doc/api/ISteamRemoteStorage#SetCloudEnabledForApp
