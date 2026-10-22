# DE runtime, loaders, paths and isolated verification

Research date: 2026-10-22. Owned report for the bounded runtime/loaders track.
Toolkit baseline: `818503dc40971defef3769ca883f82290405ab94`, branch
`de/separate-game-mode`. Read `00-goal-verbatim.md`, `01-working-contract.md`
and `02-plan.md` first. No implementation, game launch, process attachment,
installation, save/profile mutation, commit, CI, PR or publication was performed.
This report does not claim gameplay acceptance.

Evidence labels used below:

- **Observed**: reproduced by this investigation through read-only filesystem,
  Git-object, hash, PE-header or static-disassembly probes.
- **Source-confirmed**: explicit behavior in a pinned source or hash-associated
  decompilation; execution in this user's session remains unverified.
- **Inferred**: a proposed consequence or implementation choice, with its basis.
- **Unverified**: requires a later targeted check; never an implicit capability.

## Findings that change implementation order

1. **Observed / source-confirmed:** the user's native and managed DE DLL hashes
   exactly match the supplied Serpens native baseline. DE is an AMD64 Unity/Mono
   application with a managed frontend and a separate AMD64 simulation DLL.
   `Assembly-CSharp.dll` itself is PE32/I386 **IL-only, without 32-bit-required or
   32-bit-preferred flags**. Detecting the edition from that assembly's Machine
   field would misclassify this installation. See the identity table and probe.
2. **Source-confirmed:** vanilla already discovers `.lordjson` and `.aivjson`
   packages, an optional `avatar.png`, and custom speech/video/text. A community
   loader is unnecessary for the first ordinary custom-lord acceptance package.
   Use vanilla first, then add the loader-dependent capabilities separately.
   [Lord discovery and image checks][G-LORD] · [vanilla speech][G-SFX-A]
   · [vanilla video][G-SFX-V].
3. **Source-confirmed / observed:** vanilla's native misc-marker importer indexes
   a ten-slot group as `itemType * 10 + number`. Slots 10+ can alias the next
   class; successfully parsing a file is not evidence of expanded support.
   Fixes replaces the storage and consumers for supported classes, up to 30.
   All seven reviewed Fixes signatures matched the local DLL uniquely, which
   establishes static compatibility of those signatures, not working hooks.
   [Native importer][N-IMPORT] · [Fixes implementation][F-GUARD].
4. **Source-confirmed:** copying the installation directory does not isolate the
   profile. Vanilla uses `Application.persistentDataPath`; the extender additionally
   hard-codes LocalLow from `Environment.SpecialFolder.UserProfile`. Prefer a
   separate Windows test user or VM for the later game test. Do not assume an
   executable rename or an undocumented launch switch isolates saves and mods.
   [Game paths][G-PATH] · [extender paths][S-PATH].
5. **Observed / source-confirmed:** the extender's 256-byte speech formatting
   allocation does not protect earlier native 100-byte message-path copies.
   Keep native-facing references ASCII and at most **99 bytes before NUL** until
   that path is fixed and independently verified. Validate the fully qualified
   `_SLA_/...` reference, including the escaped provider GUID, not just a basename.
   [Speech audit][N-SPEECH] · [current substitution][S-SPEECH]
   · [provider reference construction][S-REF].

## Source and binary identities

All remote ref names below were resolved once; subsequent claims are pinned to
the full commit. Existing source checkouts were read without pulls or edits.
The Serpens clone remained a no-checkout object source: `git show`/`git ls-tree`
were used, without changing its checkout or refs.

| Source | Pinned identity and local location |
| --- | --- |
| Serpens native seed (`origin/main`) | `a23aa1b32276d670ffbb2a7b641d23b500d8e298`; `S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods` |
| Serpens handoff lead (`origin/develop`) | `7e199e6f0818173794bdeeb0c4c32d74500b0eec`; [handoff][HANDOFF], used as an investigation lead |
| Script Extender existing clean checkout | `4014ca67c96974a5e6d697665baf5351cbfebde6` (handoff identifies v2.14.3); `S:\Projects\Harness\ai-toolkit-setup\research-shcde-script-extender` |
| Fixes reviewed source | `a90f96c176e9c8981af83534f5a8bb444838ae0a` (1.28.1 reviewed by existing Toolkit documentation); `S:\Projects\UCP\de-research\runtime-loaders\shcde-fixes` |
| OpenSHC existing clean checkout | `126f25c9a53c14270ccd10c6a5db6f05bd143204`; `S:\Projects\UCP\OpenSHC` |

No Fixes source was present in the inspected UCP/Harness inventories or the
handoff's external-machine path. A separate `--no-checkout --filter=blob:none`
clone was therefore created in this track's external research directory. Its
`origin/main` resolved to `29c9a5dd6b05b4bf62e24916c20e9bfc49ac5c6e`;
that newer revision was **not** substituted for the reviewed pin. No release
archive or loader binary was installed or executed. GitLab browsing returned
403, so source verification used the local pinned Git objects; the public links
below remain reproducible source locations.

Observed local file hashes, all SHA-256:

| File, relative to the stated root | Bytes | SHA-256 |
| --- | ---: | --- |
| DE root: `Stronghold Crusader Definitive Edition.exe` | 887880 | `8ACEA6D11AF81CF26B035A479BA633BDB0D09513742055F3F46330D72B2F203A` |
| DE root: `UnityPlayer.dll` | 29438200 | `FAE6C04F23916263879196211ED241AEE5F1F1B53BA4566BB99D4DF8526CC105` |
| DE data: `Plugins/x86_64/CrusaderDE.dll` | 3451392 | `FBCB93195FC7EFCA9BDAC5204852EFDD76F9818F59A6711750D77C9CEF2831E2` |
| DE data: `Managed/Assembly-CSharp.dll` | 3693056 | `BC8B6A395F01D48557DB413600C8DD8D1FDFD3ABDF97BFBBB68A3C56B04FD789` |
| Classic root: `Stronghold Crusader.exe` | 8376320 | `3BB0A8C1E72331B3A30A5AA93ED94BECA0081B476B04C1960E26D5B45387AC5A` |
| Classic root: `Stronghold_Crusader_Extreme.exe` | 7962624 | `55648E6B05D67D37A5773FE699BBB17A2D6AD4DE1BB9DBDED9A21CAEF82BD7FB` |

DE root is
`D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`;
DE data is its `Stronghold Crusader Definitive Edition_Data` subdirectory.
Classic root is
`D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme`.
The ordinary classic executable's hash matches OpenSHC's strict 1.41 comparison
target, despite its file-version resource reading `1, 1, 0, 1`.
[Target hash][H-HASH] · [1.41 scope][H-README].

The DE root contained `Assets`, `MonoBleedingEdge`, the data directory, the game
EXE, `UnityPlayer.dll`, and `UnityCrashHandler64.exe`. No `BepInEx` directory or
root loader proxy was observed. Therefore the handoff's installed `SHCDESE.dll`
hash `5CB1...8498` describes its author's machine, **not an observed installation
here**. This is not an exhaustive originality audit of every game asset.
The local Steam manifest is `appmanifest_3024040.acf`, build ID `24816905`.
The Unity player EXE version is `2021.3.45.8976527`; it is not the DE gameplay
version. Preserve hashes/build ID and a separately obtained game-version string.

## Runtime boundary and ordered difference rows for the coordinator

These are proposed ordered rows, not edits to the central ledger. They distinguish
HD structures, DE JSON/managed transfer structures, and DE native structures.

| Order / suggested key | HD 1.41 evidence | DE evidence | Implementation consequence / confidence |
| --- | --- | --- | --- |
| 01 `runtime.pe-abi` | Local EXE: Machine `0x14C`, PE32 `0x10B`, no CLR header; OpenSHC explicitly links I386 ([CMake lines 43–64][H-CMAKE]) | Game EXE, UnityPlayer and native DLL: `0x8664`, PE32+ `0x20B`, no CLR header | Separate native/runtime adapters; no reuse of x86 addresses, pointer sizes, calling stubs or signatures. **Observed/source-confirmed.** |
| 02 `runtime.managed-boundary` | Classic comparison target is the native EXE | IL-only managed frontend calls `CrusaderDE` through P/Invoke ([declarations 3691+][G-ABI]); local CLR flags `1` | Identify the runtime using the complete layout and native PE, not the managed assembly Machine field. Never load the game DLL into Toolkit merely for detection. **Observed/source-confirmed; recommendation inferred.** |
| 03 `ai.aic-memory-vs-file` | OpenSHC `AICSpecification` is 676 bytes ([line 196][H-AIC]) | SE native `InternalAIC`: packed, 377 `Int32` fields, ending at `0x5E0`, hence 1508 bytes ([layout][S-AIC]); game JSON converts through `CreateAILordConfigData`, and encoded config starts with version word 2 ([conversion][G-AIC], [encoding][G-ENC]) | Neither the JSON object, the managed transfer encoding nor SE `.baic` is a reinterpretation of classic's 676-byte structure. Build named codecs and explicit field mappings. **Source-confirmed; 1508 is a source-layout calculation, not a runtime Marshal test.** |
| 04 `ai.aiv-marker-storage` | `AIVState.unitLocations[24][10]` ([line 60][H-AIV]) | Game `GetRawData` emits signed 16-bit triples and subtracts 9000 only when `itemType > 9000` ([lines 72–82][G-AIV]); native importer uses class×10+slot ([native lines 49376–49384][N-IMPORT]) | Preserve IDs on disk; normalize only at the documented boundary. Enabling 30 in the editor does not make vanilla consume it. **Source-confirmed + local native function-hash confirmation.** |
| 05 `ai.guarding-capability` | No classic extension established by this investigation | Fixes supports class 6–19, 22–28, capacity 10–30, native hooks and external save data ([implementation][F-GUARD], [readme][F-GUARD-DOC]) | Gate active slots 11–30 on exact loader/Fixes evidence. Class 29 and oil/siege marker limits stay separate. **Source-confirmed; gameplay unverified.** |
| 06 `lords.discovery-identity` | Classic castle/AIC integrations remain separate | Vanilla named `CustomLords`, standard-type `ExtendedLords`, and Workshop identity prefixes ([discovery][G-LORD]) | Track named lord identity, base type, source path and config/AIV checksum separately. A Lord type enum is not a unique package ID. **Source-confirmed.** |
| 07 `media.vanilla-vs-extender` | No classic media runtime extension audited here | Vanilla avatar + CustomMedia; SE adds `info.json`/`lordmeta.json`, scoped asset providers and message mappings | Model vanilla and SE media backends independently; do not make SE mandatory for WAV/WebM/avatar support. **Source-confirmed; playback unverified.** |
| 08 `profile.install-vs-userdata` | Keep existing classic profile/settings untouched | Vanilla profile methods use persistentDataPath; SE LocalLow and plugin paths are independently constructed | Separate installation identity from profile identity. A cloned install is insufficient isolation. **Source-confirmed.** |
| 09 `native.version-provenance` | OpenSHC exact classic hash available | Serpens current hash matches local DLL, but its main baseline SE provenance is 2.14.1, not the newer handoff's 2.14.3 | Pin binary hash and source revision per capability; reject offset portability assumptions across builds. **Observed/source-confirmed.** |
| 10 `native.preview-vs-execution` | Shared conceptual 100×100 plans do not prove matching constructors | AIV fit, preparation and later construction have separate native paths; completed castles mutate live state ([range/build audit][N-RANGE], [selection lines 69–106][N-SELECT]) | A preview/JSON roundtrip is not game acceptance. Do not promise full construction from offline fit. **Source-confirmed; audit observations belong to their recorded sessions.** |
| 11 `saves.native-layout` | Historical sections 1022/1015 according to the pinned audit | Current DE player/unit sections 2022/3015, record sizes 22588/1168 ([remap audit line 21][N-REMAP]) | Do not send DE maps/saves through classic structure readers. These section/layout claims are **source-confirmed only**, not independently decompressed here. |

No complete function-by-function HD↔DE semantic equivalence map was established.
The same names, arrays or concepts are leads for mapping, not proof that the
simulation, sizes, constants, resource behavior or constructors are unchanged.

## Vanilla loading contract: use this first

**Source-confirmed against the hash-matching managed decompilation:**

- `BuildFileLists` scans immediate directories under `ExtendedLords`, then
  `CustomLords`, then subscribed Workshop roots. It scans each lord's immediate
  files, not arbitrary nested `.lordjson`/`.aivjson` files.
  [CustomisationFileManager 463–538][G-SCAN].
- A named custom lord is registered only if at least one AIV and one config were
  successfully processed. Its local identity is the folder name, type `-1`;
  Workshop identity is `<item-ID>\<folder-name>`. No `info.json` or `lordmeta.json`
  prerequisite exists in this vanilla builder. Invalid JSON/conversion exceptions
  are swallowed by the file processor, so file presence is not proof of discovery.
  [622–722][G-LORD].
- An Extended Lord folder must resolve to one of `ConfigSettings.extendedLordPaths`
  (29 entries in this hash, `Rat` through `Baibars`). It receives built-in AIVs
  before additional files are read. [Names][G-NAMES] · [566–619][G-EXTENDED].
- A custom portrait is a root-level file named `avatar.png`, less than 80000 bytes,
  decoded dimensions exactly 144×144. Wrong dimensions cause its image to be
  discarded. This is a different asset contract from SE `FacePath`.
  [724–747][G-AVATAR].

**Observed local official instructions:**
`..._Data/StreamingAssets/CustomMediaExample/ReadMe.txt`, 7162 bytes, SHA-256
`7962A7CDED30B14A2022D40011078D41631BB2E1B337BF521E134B975ACDD2F9`.
This is primary evidence shipped with this user's game. Lines 3–24 describe the
matching-name `CustomMedia` directory and shared-name collision behavior; lines
54–100 enumerate the media names. It recommends 348×348 VP8 WebM video. Its
phrase “30 speech files” at line 12 is stale: the installed example contains
**32 WAV, four WebM and two TXT files**. `text.txt` is 2455 bytes, SHA-256
`8D9D9DADAD7D4B089A62B2B153B1EC6E3A1FF04910B87606BADE51BA001A3D45`.
The publisher announced vanilla custom portrait/video/text/speech support in
[the v2.6 announcement][OFFICIAL-MEDIA]. No assets were copied into Git.

The managed code independently confirms the loading route:

- `SFXManager.playSpeech` resolves a custom-lord placeholder through the current
  roster to `CustomMedia/<name>/<speech-token>.wav`, otherwise falling back to
  built-in speech. `playBink` similarly checks the mapped custom emotion WebM.
  [Speech 1360–1388][G-SFX-A] · [video 1800–1823][G-SFX-V].
- `MapFileManager.SplitCustomTrailName` takes the second component of a
  backslash-prefixed name; Workshop and local lords with the same basename can
  resolve to the same media folder. [1840–1851][G-SPLIT].
- `text.txt` is parsed as tag=value entries, with eight title fields and a
  20-character title truncation; the resulting text is selected by the message
  ID. [Parser 758–823][G-TEXT] · [message display 473–487][G-OST].
- `ADD_PLAYER.wav` is a convenient later smoke check: the custom-lord add-to-lobby
  path explicitly checks and plays it. [5294–5302][G-JOIN].

**Minimal reproducible allowed package route (proposed, not installed/tested):**

```text
<isolated-profile>/CustomLords/TkProbe/
    probe.lordjson       complete known-good DE lord fixture, then one controlled edit
    probe.aivjson        known-good asymmetric DE castle, initially slots 0..9 only
    avatar.png           optional: 144x144, strictly below 80000 bytes
<isolated-profile>/CustomMedia/TkProbe/
    ADD_PLAYER.wav       distinctive owned test audio
    text.txt             correct shipped tag syntax with synthetic text
    angry.webm           optional, 348x348 VP8
    happy.webm
    neutral.webm
    sad.webm
    <other documented WAV names as needed>
```

Do not use an empty `{"lord":{}}` as a valid fixture: the conversion accesses
array members and can reject incomplete input. Use the file-contract track's
complete verified fixture. The first gameplay run should verify selection of
the actual config and actual castle, avatar display, lobby audio, one in-game
speech/text/video event, build progression, and save/reload. Restart the game
after publishing a package to obtain a fresh scan. Missing media can fall back,
so require a distinctive observable signal instead of accepting an absence of
errors. This vanilla path is the smallest source-supported path that can meet
the ordinary AI/media requirement.

## Script Extender and Fixes: incremental capabilities and limits

### Discovery and media

At the reviewed pin the extender is a `net481` BepInEx plugin with native x64
hooking dependencies; the README targets BepInEx 5.4.23.4. Its compatibility
table covers game versions through 2.8.0.2, but that table alone is not proof that
a particular release archive matches the local DLL pair. Installation instructions
copy the release archive into the game root. Do that only in the later isolated
test copy, after recording the archive hash and every installed file.
[Project dependencies][S-PROJECT] · [compatibility/install 138–193][S-INSTALL].

The `ProcessExtendedLordFile` managed hook calls vanilla first. For named custom
lords it invokes the extender only when processing `info.json`; Extended Lord
events use each source directory, deduplicated per object/source. This matters
for Workshop overrides. [Hook 23–48][S-LORD-HOOK].

`GameAIManagerAPI.ProcessCustomLord` reads `info.json`, registers its asset mod,
then reads `lordmeta.json`. It builds an entry keyed by lowercase game lord name,
with provider GUID and asset mode. Invalid/duplicate registration is possible;
the returned game `CustomLord` identity is authoritative, not just `info.Name`.
The source also notices root `init.lua`; omit Lua and plugin DLLs from the first
data-only package. [Processing 221–287][S-AI].

For an SE extension of the package, retain the vanilla root `.lordjson` and
`.aivjson`, add `info.json` (`Manifest: 0`, short unique GUID, `AssetMode: Local`)
and `lordmeta.json`, plus `Override/Assets/GUI/Sprites/...`, `Override/fx/speech/...`
and `Override/Assets/GUI/Video/...` as required. `lordmeta.json` supplies localized
display/title fields, `FacePath`, join/leave paths and message→clip lists. Voice
mapping uses enum-key parsing and warns for invalid keys. The doc's `.ogg`/WAV
and VP8 WebM recommendations are source documentation, not codecs tested here.
[Guide 21–96, 179–226][S-LORD-DOC].

Local mode scopes face/audio/video references to the provider GUID. Omitted
asset mode defaults to Global, retaining shared last-provider-wins behavior;
`Patches/` remains global even with Local. Use no global XAML patch in the probe.
The path normalizer rejects rooted paths, `..`, colon and NUL; its directory
resolver also checks the resulting lexical root. These are useful source guards,
not proof of containment through reparse points. Toolkit's installer must enforce
its own physical destination policy. [Normalizer][S-NORMALIZE]
· [resolver 44–55][S-DIRECTORY] · [qualified message references 729–769][S-VOICE].

### Guarding capacity and preference scope

Fixes is a hard-dependent extender plugin ([bootstrap line 28][F-BOOT]). The
reviewed implementation has vanilla capacity 10 and extended capacity 30;
classes are exactly 6–19 and 22–28. Classes 20/21, other specialized marker types
and 29 are not granted 30 by these class tables. Requested capacity is clamped
to 10–30, missing values remain 10. JSON must contain unique contiguous
zero-based numbers for each class. [Class tables][F-GUARD]
· [map capacity application 42–70][F-MAP] · [documented numbering][F-GUARD-DOC].

Use only this controlled addition for the second probe:

```text
CustomLords/TkProbe/Override/Fixes/preferences.json
    {"GuardingSpotsPerUnitType":30}
```

Expand one supported class from slots `0..9` to `0..29` in the same AIV. A
capacity preference without actual marker data does not create positions.
The source allocates new working/player/tribe storage, intercepts native import,
layout commit, group allocation and movement, and serializes its extra state
under `expanded-guarding-spots-savedata`. **Save/reload with the same loader and
Fixes must therefore be a separate acceptance gate**; removing the loader is
not a demonstrated way to load an expanded save safely. [Hooks][F-GUARD]
· [save handler 174–205][F-SAVE].

For named custom lords, Fixes finds preferences through the registered provider
GUID. For Extended Lords it reads each event's `SourceDirectory` and stores the
preferences by base type+1. Extended preferences apply even when that folder's
AIC/AIV is not selected; a later Workshop source can replace the local entry.
Map/save embedded preferences can override lord settings, with slot-specific
settings ahead of name-specific settings. Thus an installer must inventory
existing lord, map and Workshop influences rather than promising a per-file
toggle. Prefer a new named custom lord for the isolated acceptance package.
[Lord event 305–364][F-LORD] · [lookup/load][F-PREF]
· [documented Extended precedence 702–704][F-EXTENDED-DOC].

### Speech path limit is still material

The pinned knowledge file identifies immediate and queued unbounded NUL-copy
loops. I independently disassembled the local DLL bytes:

- RVA `FEEA0..FEEAF`: byte loop writes immediate audio at manager+`0x70` until NUL;
  RVA `FEEB1` then reads the player ID at +`0xD4`, 100 bytes later.
- RVA `103316`: queue audio stride is `0x64`; `103320..103331` copies until NUL.
- RVA `FEF21..FEF2B`: the later 15-byte block is the formatting call redirected
  by SE to its 256-byte buffer. It occurs after the immediate copy.

The current extender passes allocated ANSI media strings into the original
native enqueue call, with no length guard in that substitution. The shorter
`_SLA_/` prefix reduces but does not eliminate the problem. Restrict **native
message references**, including GUID escaping and separators, to 99 ASCII bytes
before NUL. This recommendation is conservative; it is not a complete audit of
every sound-manager buffer or a new loader patch. An audio clip playing without
a crash does not prove adjacent message state remained intact.
[Hash-bound earlier audit][N-SPEECH] · [formatting hook][S-SPEECH]
· [native string substitution 258–300][S-SUBSTITUTE]
· [message layout][S-MESSAGE] · [reference encoding][S-REF].

## Safe discovery, installation and reversible test isolation

**Observed profile:**
`C:\Users\Krarilotus\AppData\LocalLow\Firefly Studios\Stronghold Crusader Definitive Edition`
exists and contains `CustomLords`, `CustomMedia`, `CustomTrails`, `ExtendedLords`,
`Maps`, `Saves`, `TrailMaker`, `UserWorkshopMaps`, settings/progress files,
`Player.log`, and `steam_autocloud.vdf`. Only names/metadata were inventoried;
save contents and cloud identity were not read or changed.

**Source-confirmed paths:** `ConfigSettings` creates/returns the above directories
under `Application.persistentDataPath`, plus TrailMaker backups, WorkshopTemp
and upload content. Do not invoke `GetSettingsFileName(createPaths:true)` during
read-only discovery: it creates folders and can copy the shipped readme.
The extender separately constructs its own LocalLow root, `Maps`,
`_SE_PERSISTENT`, game root from the running process, data/StreamingAssets,
`BepInEx`, and `BepInEx/plugins`. [Game path methods][G-PATH]
· [extender directory helpers][S-PATH].

**Recommended discovery implementation (inferred):**

1. Keep the user-selected root explicit. Optionally read Steam library manifests
   and `appmanifest_3024040.acf` to suggest it; do not depend on `C:` or one library.
2. Validate the EXE, matching `_Data`, `UnityPlayer.dll`, Mono directory, managed
   assembly and native `Plugins/x86_64/CrusaderDE.dll`. Read PE/CLR metadata and
   hashes without executing game code. Distinguish recognized edition from a
   recognized/validated version pair. An unknown new DLL hash should disable
   version-specific native capability claims, not turn DE into classic.
3. Record installation and Windows-profile identities separately. Keep classic
   root/profile/cache/settings and DE root/profile/cache/settings separate.
   Path selection and mode switching must not install anything or convert an
   open document implicitly.
4. Inventory loaders, plugin versions/hashes, existing loose/packed asset mods,
   GUID conflicts, Workshop sources and Extended preferences before offering an
   installation. The SE plugin manager also discovers immediate plugin folders
   and `.semod` packages ([discovery 178–260][S-MODS]). The minimal test should
   avoid Workshop publishing/subscription entirely.

**Later isolated execution sequence (not performed by this research task):**

1. Check that the user is not actively using the PC, then prepare a separate
   Windows test user or owned VM. Preserve the normal user's existing profile.
   Use a fresh local test profile and no pre-existing saves/mods. Confirm Steam
   launch/licensing/cloud behavior in that environment before game execution;
   `steam_autocloud.vdf` proves cloud metadata exists, not which folders sync.
2. Make a normal physical copy of the complete game outside Git, for example
   `S:\Projects\UCP\de-research\runtime-loaders\test-install`. Preserve the
   EXE/data names initially; avoid hardlinks or writable junctions to the installed
   files. The extender's multiple-instance rename guide is about concurrent
   launch, not profile isolation, and its DirectoryHelpers hard-codes the original
   data-folder name. There is no need for multiple concurrent instances here.
   [Multiple-instance guide][S-INSTANCES] · [paths][S-PATH].
3. Record a manifest of copied files and original hashes; record the actual
   persistent paths in the test session and ensure they belong to the test
   identity. Merely overriding an environment variable or passing a guessed
   `-userpath`/`-savedir` is not a verified isolation mechanism. If a separate
   test identity cannot be used, stop before launching until both vanilla and
   extender persistence have a demonstrated isolation route.
4. Publish the vanilla `TkProbe` package into only the test profile with an atomic
   staged-directory rename. Keep a manifest of every owned file/hash and any
   pre-existing destination. Use complete valid DE fixtures, short names and
   owned/synthetic media. Compare the resulting actual discovery and selected
   config/AIV to the manifest, then run the vanilla checks described above.
5. Add pinned x64 BepInEx + SE only in the copy. Record release URLs, archive and
   installed DLL hashes; source pins do not identify release binaries. Check
   `BepInEx/LogOutput.txt` and actual module/version/hook results; the SE menu
   marker alone is insufficient, as its own README warns. Validate scoped media
   first. Then add pinned Fixes and the one-class guarding probe, inspect capacity
   and hook logs, actual extra defender positions, rotation and save/reload.
6. Keep outputs/logs/save captures outside Git. Record binary/loader/config/media
   hashes and expected/observed results per run. For multiplayer, later require
   matching mod and package evidence on both peers; this bounded source review
   establishes no synchronization acceptance.
7. Undo through the owned install manifest: remove only unchanged files belonging
   to this test; restore backed-up destinations atomically. Refuse deletion when
   a file has changed since installation. Retain recovery paths if rollback fails.
   Dispose of the owned copy/profile only after resolving their absolute paths
   and confirming there is no link into the installed game or ordinary profile.
   Do not promise that uninstalling Fixes converts its saves back to vanilla.

## Reproduction probes and observed results

All Toolkit commands must use workdir `S:\Projects\UCP\AI-Toolkit-DE` explicitly.
Use `git -C` for the read-only source clones. No probe below requires launching,
loading or attaching to the game. Python used here was 3.14.7; optional static
disassembly used installed Capstone 5.0.7.

### A. Binary hash, architecture, CLR flags and export directory

Run the following read-only Python from that explicit Toolkit workdir. Add the
other files from the identity table to `paths` to reproduce their hashes too.

```python
from pathlib import Path
import hashlib, json, struct

de = Path(r"D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition")
data = de / "Stronghold Crusader Definitive Edition_Data"
paths = [de / "Stronghold Crusader Definitive Edition.exe",
         de / "UnityPlayer.dll",
         data / "Plugins/x86_64/CrusaderDE.dll",
         data / "Managed/Assembly-CSharp.dll",
         Path(r"D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme\Stronghold Crusader.exe")]
for path in paths:
    b = path.read_bytes()
    pe = struct.unpack_from("<I", b, 0x3C)[0]
    assert b[pe:pe+4] == b"PE\0\0"
    machine, n = struct.unpack_from("<HH", b, pe+4)
    opt = pe+24
    magic = struct.unpack_from("<H", b, opt)[0]
    directories = opt + (112 if magic == 0x20B else 96)
    sections = opt + struct.unpack_from("<H", b, pe+20)[0]
    rows = [struct.unpack_from("<8sIIII", b, sections+40*i) for i in range(n)]
    def offset(rva):
        for name, virtual_size, va, raw_size, raw in rows:
            if va <= rva < va + max(virtual_size, raw_size):
                return raw+rva-va
        raise ValueError(hex(rva))
    cli, cli_size = struct.unpack_from("<II", b, directories+14*8)
    result = dict(file=str(path), bytes=len(b),
                  sha256=hashlib.sha256(b).hexdigest().upper(),
                  machine=hex(machine), pe_magic=hex(magic),
                  cli_size=cli_size)
    if cli:
        result["CorFlags"] = hex(struct.unpack_from("<I", b, offset(cli)+16)[0])
    exports = struct.unpack_from("<I", b, directories)[0]
    if exports:
        result["export_functions_names"] = struct.unpack_from("<II", b, offset(exports)+20)
    print(json.dumps(result))
```

Observed: the three DE native files are `8664/20B/CLI=0`, managed is
`14C/10B/CLI=72/CorFlags=1`, classic is `14C/10B/CLI=0`. The native export
directory has **77 functions and 77 names**, all `DLL_*`; `entry` is absent from
the name table. This conflicts with `SEMANTIC_INFO.md:96`, which calls 78 native
PE exports including `entry`. Treat the local directory count as observed;
Ghidra's entry symbol is a possible explanation, not a verified extra PE export.
[Baseline narrative][N-INFO].

### B. Native function byte checks and disassembly

Read `exports/semantic-functions.jsonl` at the pinned Serpens main commit with
`git show`; match `rva`, read the local PE section bytes using `offset()` above,
and hash `b[offset(rva):offset(rva)+size]`. Observed:

| RVA | JSONL line | Size | SHA-256 of local contiguous span, equal to baseline rawHash |
| --- | ---: | ---: | --- |
| `55320` | 721 | 2648 | `82C2EC8B15861341F35073BF176C2C19E5FD76AB5B1D3344D9B8C7E5209EC645` |
| `94350` | 1094 | 11216 | `C1E43B90053D630E50E2BC8E1597A1266189D4C0706D1528E31B2A776F3DE2AC` |
| `FEE50` | 1805 | 473 | `C30A95DFD57905F4504D51091C9165224629432DD8308C12CD48B66FEB743CF0` |
| `103290` | 1825 | 219 | `4672F6E2DC798B14C5D30C84CA87B8453A8A6815EF547EFF87CFEB6435A22553` |

For Capstone disassembly, use `Cs(CS_ARCH_X86, CS_MODE_64).disasm` over the native
function bytes at VA `0x180000000 + rva`. Begin at a known instruction/function
boundary (e.g. `FEE50`, `103290`, `FEF21`), then filter the addresses discussed
above. These are static bytes; ASLR-adjusted live addresses were never read.

A deliberately checked contiguous span at `53D00`, size 4014, **did not** match
that record's `rawHash`: local
`EE04B1E3F2D14D31ECDC33A7A3C976D489EF53DD06260B29B4270956772F8BAE`,
baseline `4A09C1520DFAFCD9C8C9AEC65DBE8AFC48EEE75C6C0D04BDCEEDC20906F52C9C`.
Whole-DLL identity
still matches. Do not generalize the contiguous-span method to all Ghidra function
bodies: noncontiguous bodies or exporter hashing require a body-range audit.
This mismatch was not used as evidence of a different game build.

### C. Fixes AOBs against the actual local DLL

Read the pinned Fixes file with:

```powershell
git -C 'S:\Projects\UCP\de-research\runtime-loaders\shcde-fixes' show 'a90f96c176e9c8981af83534f5a8bb444838ae0a:src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs'
```

Convert space-separated AOB tokens to a byte regex (`?` = any byte), scan only
PE sections with `IMAGE_SCN_MEM_EXECUTE`, and convert each match's raw offset
back to RVA. All seven source patterns had exactly one executable-section match:

| Source line | Intended role from source | Local match RVA |
| --- | --- | --- |
| 77 | retreat helper | `3E940` |
| 78 | keep enclosure helper | `CF4A0` |
| 97 | misc decode inline block | `55D43` |
| 127 | layout commit | `53D00` |
| 128 | defensive tribe allocation | `2BC40` |
| 129 | defensive handler | `2FE20` |
| 130 | defensive move | `3E850` |

The decoder hook is inside the independently byte-matched `55320` function.
A unique AOB is not proof of ABI, complete instruction displacement, hook
publication, successful allocation, lack of another mod's overlap or gameplay.

### D. Source provenance checks and limits of the supplied knowledge tree

```powershell
git -C 'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' rev-parse origin/main origin/develop
git -C 'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' ls-tree -r --name-only a23aa1b32276d670ffbb2a7b641d23b500d8e298 -- '_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge'
git -C 'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' show 'a23aa1b32276d670ffbb2a7b641d23b500d8e298:_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json'
```

Inspected the source-tree inventory and the relevant `AIV_BUILD_RANGE`,
`AIV_LOBBY_SELECTION`, `LORD_SLOT_REMAP`, `TRAIL_CUSTOM_AIC_EXPORT`,
`FIXES_COMPATIBILITY`, `SE_2_11_SPEECH_PATH`, identity and semantic-info files,
plus their relevant decompiled/native/export and current SE/Fixes sources.
This was not a review of every feature note or every archived runtime capture.
No Ghidra database was opened, mutated or rebuilt.

Main's `IDENTITY.json` names SE commit
`5908e1f12437deb7ef5f5b1dc2d64e301178fba3` (2.14.1); its narrative also retains
older 2.6.0 extractor counts and `unknown` AOB-resolution descriptions. The newer
develop handoff discusses 2.14.2/2.14.3. These are different provenance layers,
not an assurance that every main-branch claim was refreshed for 2.14.3. Native
hash equality makes the native byte audit applicable; loader-specific conclusions
were rechecked against `4014ca...` and Fixes `a90f96...` explicitly.
[Identity][N-IDENTITY] · [semantic-info][N-INFO].

The Trail export note confirms a further source-level trap: a standard lord with
a selected custom config can legitimately have an empty lord name, and its
serialized config drops the source path/Workshop flag. Do not reconstruct package
identity from a display name or default false Workshop flag. This is relevant
to later save/import support, not necessary for the first named local probe.
[Trail source identity audit 7–24][N-TRAIL].

## Remaining questions and concrete implementation sequence

1. **Implement read-only edition/profile discovery first.** Use the native PE,
   layout, hashes and manifest; retain unknown-version status. Include the managed
   PE32/IL-only case as a meaningful edition-detection fixture. Keep classic
   comparison hash and paths separate.
2. **Finish the lossless vanilla codecs and package manifest.** Depend on the
   file-contract research for complete LORDJSON arrays/defaults and proper AIV
   orientation/timing. Enforce exact avatar constraints and safe package names.
   Reject an active vanilla export using expanded slots; preserve such data when
   merely opening/saving an unsupported project. Confirm how the final game UI
   selects the package/config/AIV before claiming “installed and active.”
3. **Implement vanilla media packaging next.** Use fixed names and correct tag
   syntax; preflight collisions under `CustomMedia/<basename>`, including
   Workshop duplicates. Treat the shipped 32-WAV inventory as evidence rather
   than trusting the readme's stale count. Verify missing-media fallbacks and
   actual text/video/audio separately in the isolated session.
4. **Build reversible install/uninstall before any live acceptance.** Use a
   physical copy plus an isolated Windows profile, staging, collision detection,
   explicit owned-file hashes and rollback. Resolve Steam/cloud/launch behavior
   empirically in that environment. No tested profile-redirection switch is known
   from this investigation.
5. **Run the smallest vanilla acceptance package.** Obtain real log/observation
   evidence for lord selection, castle construction, portrait and media, then
   save/reload. This remains **unverified**. Source evidence alone does not close
   contract acceptance criteria 4 or 5.
6. **Add SE scoped media only where it adds required behavior.** Pin source and
   released binaries separately, use Local assets and short provider references,
   and verify actual hook startup. Resolve the native speech-length issue by
   export limits or a separately audited upstream fix; do not claim arbitrary
   long-path support from the 256-byte allocation.
7. **Then add Fixes guarding.** Verify the seven hooks at startup, slot numbers,
   class support, configured capacity, placement/rotation, defender recruitment
   and save/reload. Prefer named CustomLords to avoid unconditional Extended Lord
   side effects. Record the minimum supported **tested** release instead of
   claiming 1.28.1 was the earliest release.
8. **Broaden only after the above succeeds.** Multiplayer, Workshop distribution,
   trails, prebuilt castles and multiple installed packages need additional
   identity, synchronization and conflict checks. No game launch, loader release
   binary identity, custom save compatibility after loader removal, or universal
   HD↔DE native parity is established by this bounded report.

[HANDOFF]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Findings/AIToolkitDE.md
[N-IDENTITY]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/IDENTITY.json#L1-L9
[N-INFO]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/SEMANTIC_INFO.md#L89-L96
[N-IMPORT]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L49376-L49384
[N-SELECT]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/AIV_LOBBY_SELECTION.md#L69-L106
[N-RANGE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/AIV_BUILD_RANGE.md#L17-L80
[N-SPEECH]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/SE_2_11_SPEECH_PATH.md#L3-L11
[N-REMAP]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/LORD_SLOT_REMAP.md#L19-L29
[N-TRAIL]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/TRAIL_CUSTOM_AIC_EXPORT.md#L7-L24
[G-SCAN]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L463-L538
[G-LORD]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L622-L722
[G-EXTENDED]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L566-L619
[G-AVATAR]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L724-L747
[G-TEXT]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L758-L823
[G-PATH]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L2556-L2656
[G-NAMES]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L302-L307
[G-ABI]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L3691-L3997
[G-AIC]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4303-L4324
[G-ENC]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4589-L4598
[G-AIV]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/AIVLoader.cs#L35-L85
[G-SFX-A]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SFXManager.cs#L1360-L1388
[G-SFX-V]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SFXManager.cs#L1800-L1823
[G-SPLIT]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/MapFileManager.cs#L1840-L1851
[G-OST]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/OnScreenText.cs#L473-L487
[G-JOIN]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CrusaderDE/FRONT_Multiplayer.cs#L5294-L5302
[S-PATH]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/IO/DirectoryHelpers.cs#L9-139
[S-AIC]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/InternalAIC.cs#L6-386
[S-PROJECT]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/SHCDESE.csproj#L3-40
[S-INSTALL]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/README.md#L138-193
[S-LORD-HOOK]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/ManagedHooks/CustomisationFileManager_Hooks.cs#L23-48
[S-AI]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/GameAIManagerAPI.cs#L221-287
[S-LORD-DOC]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/docs/guides/extended-ai-modding.md#L21-226
[S-NORMALIZE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Assets/ModResourcePath.cs#L11-36
[S-DIRECTORY]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/Assets/DirectoryResourceSource.cs#L44-55
[S-VOICE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/GameAIManagerAPI.cs#L729-769
[S-SPEECH]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Detours/BulkAIDetours.cs#L74-93
[S-SUBSTITUTE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Detours/BulkAIDetours.cs#L258-300
[S-MESSAGE]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/ReverseEngineering/structs/MessageManager.h#L3-18
[S-REF]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/GameAssetManagerAPI.cs#L515-525
[S-MODS]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/ModManager/GameAssetModManager.cs#L178-260
[S-INSTANCES]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/docs/guides/multiple-instances.md#L3-15
[F-GUARD]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L24-132
[F-GUARD-DOC]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/README.md#L542-590
[F-SAVE]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L174-205
[F-MAP]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Events/FixesMapEvents.cs#L42-70
[F-LORD]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Events/FixesAIEvents.cs#L305-364
[F-PREF]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Config/Preferences.cs#L14-186
[F-BOOT]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Bootstrap/Plugin.cs#L28
[F-EXTENDED-DOC]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/README.md#L702-704
[H-README]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/README.md#L4-L6
[H-HASH]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/reccmp/dll/reccmp-project.yml#L1-L12
[H-CMAKE]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/CMakeLists.txt#L43-L64
[H-AIC]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/src/OpenSHC/AI/AIC/AICSpecification.hpp#L185-L196
[H-AIV]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/src/OpenSHC/AI/AIVState.hpp#L53-L60
[OFFICIAL-MEDIA]: https://steamcommunity.com/games/3024040/announcements/detail/540005249102905454
