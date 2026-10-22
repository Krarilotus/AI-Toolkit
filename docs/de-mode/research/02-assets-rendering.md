# DE assets and rendering: bounded research

Date: 2026-10-22. Toolkit baseline `818503dc40971defef3769ca883f82290405ab94`, branch `de/separate-game-mode`. Read the goal, working contract and plan before this investigation.

**Result:** authentic DE unit, building and terrain art is extractable locally without launching the game. The DE world renderer uses Unity Sprite/Texture2D objects behind native GM identifiers. The classic GM1 decoder is not a DE asset reader. All eight DE troop bodies were verified locally; idle/facing tables, complete building compositions and flattened/lowered scene parity remain separate work.

## Evidence and boundaries

- **Observed:** reproduced against installed files, including extraction and hashes.
- **Source-confirmed:** inspected exact code/metadata at the pinned identities below. Matching binary hashes connect the managed decompilation to this installation.
- **Inferred:** proposed adapter or algebraic translation without end-to-end game comparison.
- **Unverified:** not established here; extraction success alone is not rendering acceptance.

Only this report was written inside Toolkit. Dependencies, decompilations, probes and proprietary extracted images stay under `S:\Projects\UCP\de-research\assets`. No implementation, commit, push, CI, PR, release, game launch or installed-game write occurred. Existing sources were read without pulls, checkouts or ref changes. The native game DLL was hashed, never executed. The system D3D shader disassembler was used offline.

## Sources and binary identities

Read-only Serpens clone: `S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods`.

- **D** = `origin/develop` at `7e199e6f0818173794bdeeb0c4c32d74500b0eec`.
- **M** = `origin/main` at `a23aa1b32276d670ffbb2a7b641d23b500d8e298`.
- [AIToolkitDE.md][handoff] was a lead, then checked against installed files and exact code.
- Managed source references below use D, directory `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/`.
- Native references use D, `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c`. Generated function names/signatures are not universally audited; only the reported explicit data flow is relied upon.
- Existing Script Extender source was inventoried at `4014ca67c96974a5e6d697665baf5351cbfebde6`, clean, remote `https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender.git`. No clone was needed.
- Research extraction used [UnityPy][unitypy] `1.24.2`, Python `3.14`, Pillow `13.0.0`, installed only into the owned scratch directory. This is a proven offline research option, not a selected shipping dependency.

Game root **G**: `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`. **Data** abbreviates `G\Stronghold Crusader Definitive Edition_Data`, not a literal directory named Data.

| Input relative to G | Newly computed SHA-256 |
| --- | --- |
| `Stronghold Crusader Definitive Edition.exe` | `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a` |
| `Data\Managed\Assembly-CSharp.dll` | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Data\Plugins\x86_64\CrusaderDE.dll` | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `Data\resources.assets` | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| `Data\resources.assets.resS` | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |
| `Data\globalgamemanagers.assets` | `ace9a4ecfa52d2c5ed364e2a03dbca370d9e88a3a43a8b6ef82a3869adf40167` |
| `Data\globalgamemanagers` | `a3c0644553b1d0178a065ec15e45a4660a4e275547bf3decdc6fad937ac04a61` |

**Observed:** both assembly hashes match the reference baseline. Serialized metadata reports Unity `2021.3.45f2`. `resources.assets` is 114,825,928 bytes; `.resS` is 1,396,428,560 bytes; `globalgamemanagers.assets` is 225,892,548 bytes. Machine-readable identities are in scratch `input-hashes.json`. Cache identity must include art files, not just matching game DLLs.

## Unity/native/GM contract

**Source-confirmed:** [spriteLoader.cs:246–285][load] loads Resources keys including `Sprites/AllTiles/AllTileSprites`, `Sprites/body1Sprites` through selected body atlases up to `body16Sprites`. [465–509][resource] calls `Resources.LoadAll<Sprite>` and loads a separate `path + "_m"` texture. These are Unity Resources keys, not disk PNG/GM1 paths.

[spriteLoader.cs:533–607][key] builds GM-indexed sprite arrays:

- Tiles: `fileName + " " + ID.ToString("000")`, e.g. `tile_land8 001`. Three digits is minimum width; larger IDs are valid.
- Bodies: `fileName + "-" + ID`, e.g. `body_bedouin_healer-0`.
- Alternate bodies/animations append `x`, e.g. `body_bedouin_healer-0x`.
- Arrays can contain holes. `expectImageCount` scans name suffixes and allocates storage; it is not a count of present sprites. [621–636][get] falls back from missing alternate to main sprite.

**Observed:** initial `resources.assets` inventory contains 135,354 Sprite and 41 Texture2D objects. Pixels are streamed from `.resS`. Object enumeration order and path IDs are not frame order; path IDs are meaningful only within the identified serialized file.

**Source-confirmed:** [GameMap.cs:891–959][stream] consumes native render records using stride 21 shorts. Terrain records carry file/image, height, light and building height. [1047–1075][body] reads body file/image, colour, transparency, layer delay, feet clipping, secondary layers and offsets. Native simulation determines what to render; Unity resolves resources and draws/transforms/interpolates them.

[EngineInterface.cs:3835–3837][tick] P/Invokes `DLL_RunTick`. Native RVA `0x86680` passes `flattenedLandscape` into RVA `0x72720` ([native C:78368–78433][native-tick]). This boundary does not prove the DLL initializes safely as a standalone Toolkit helper.

**Inferred implementation:** add a DE asset provider emitting shared preview DTOs, with separate Unity discovery/decoding. Reuse generic image transport/packing after decode. Do not point classic `resolve_graphics` at DE or extend the classic GM1 list with guessed DE names.

## Verified DE troops

**Source-confirmed:** GM IDs are explicit in [Enums.cs:4330–4337][gm]; body names in [spriteLoader.cs:360–380][de-bodies]. Toolkit marker labels independently occur at baseline `config/aiv_constants.json:834–920`. Marker, GM and chimp IDs are different domains.

**Observed:** all following exact `-0` samples and corresponding atlas-mask samples were extracted. **Frame 0 is not certified as idle.** All have 64 pixels per Unity unit.

| Toolkit marker/unit | GM | Body prefix | Atlas; mask adds `_m` | Normal count; maximum suffix | Sample path ID; size |
| --- | ---: | --- | --- | --- | --- |
| 9022 Camel Lancer | 208 | `body_camel_lancer` | `body16Sprites` | 1344; 1343 | 55186; 108×220 |
| 9023 Bedouin Healer | 209 | `body_bedouin_healer` | `body15Sprites` | 1600; 1599 | 88083; 55×98 |
| 9024 Eunuch | 210 | `body_eunuch` | `body15Sprites` | 1592; 1591 | 113845; 72×119 |
| 9025 Ambusher | 211 | `body_ambusher` | `body2Sprites` | 1472; 1471 | 108753; 59×98 |
| 9026 Skirmisher | 212 | `body_skirmisher` | `body14Sprites` | 2392; 2427 | 24632; 79×104 |
| 9027 Heavy Camel | 213 | `body_heavy_camel` | `body7Sprites` | 1216; 1215 | 108318; 126×193 |
| 9028 Sapper | 214 | `body_sapper` | `body5Sprites` | 1464; 1463 | 34978; 50×101 |
| 9029 Demolisher | 215 | `body_demolisher` | `body14Sprites` | 2104; 2103 | 105510; 69×99 |

Skirmisher suffixes **2136–2171 are missing**. The other seven normal ranges are contiguous from zero. Alternate `x` counts, in table order: 256, 256, 128, 128, 512, 128, 256, 384. Never compact missing indexes or treat alternates as sequential normal frames.

Full metadata and eight PNG hashes: scratch `unit-probe.json`. Representative SHA-256:

- Healer `-0.png`: `9955b005a651cfd74536086bd386beb236088d64bdc21825b7469d407fd048b2`.
- Eunuch `-0.png`: `2e76212233810dceacd71077359c8f08a6b6248a7f0ebe2718b55a81d7aeb645`.
- Camel Lancer `-0.png`: `3ffd44d5a60826afa05de303c826890cf963515c4504ad05110d1e44066b2744`.
- Healer `-0-mask.png`: `cb91c4b968113f8a1272982b4a61c9e6074ec6ee289a47570b6e5647f3336928`.

Healer, Eunuch and Camel Lancer samples were visually inspected as successful transparent art extraction. Raw base-atlas colours are not final player-coloured appearance.

## Colours, masks and transparency

**Source-confirmed:** DE uses masked shaders here rather than classic GM1 palette tables. [spriteLoader.cs:465–509][resource] creates `Unlit/TeamColour` materials, sets `_TeamMask` and `_SpriteCutoff`. [22–34][colours] supplies default float colours, with separate arrays for lord/lady, knight, animal and foliage. [SpriteMapping.cs:296–306][colour-map] remaps player colours, with exceptions for some GM families. Classic palette 1 is not a DE colour renderer.

[GetGMMaterial, lines 639–666][material] sets alpha to `(32 - transparency) / 32`, selects cutoff material from `chop_feet / 4` capped at 6, and uses white for plain materials. Cutoffs for material indices 0…6 are `0`, `.25`, `.30`, `.35`, `.40`, `.45`, `.50`.

**Observed shader; inferred algebraic translation:** resources shader object 58 is `Unlit/TeamColour`, platform 4. Serialized bindings identify t0/s0 as `_MainTex`, t1/s1 as `_TeamMask`, and constant-buffer byte offset 32 as `_SpriteCutoff`. Offline disassembly of its pixel program 3 gives this equivalent calculation before framebuffer blending:

```text
B = sampled base RGBA; M = sampled mask; C = renderer colour
q = clamp(10 * (cutoff + M.g - 1), 0, 1)
RGB = B.rgb * ((1 - M.r) + M.r * C.rgb)
A = clamp(B.a - q*q*(3 - 2*q), 0, 1) * C.a
```

Evidence: scratch `resources-shader-58.json`, bindings around lines 80–107 and 646–685; `resources-shader-58-program-3.dxasm`, samples/arithmetic lines 30–41; `probe_shader.py`. DXASM SHA-256 `0373bd054a0f2b5c8da0d06195b6ac145fb42d4fb010a88af0ff329dbc09128e`. Original shader bytes are covered by the resources asset hash. **Unverified:** gamma/sRGB, filtering, blending and screenshot parity.

**Observed/source-confirmed:** foliage has a separate shader (`Unlit/Foliage`, object 57) and colour arrays. Extracted pixel code performs hue/saturation/value-style arithmetic plus mask mixing; it is not the team-colour multiply above. Foliage parity requires a separate implementation and comparison.

## Anchors, scale, frames and rotations

**Observed:** sprite pivots and dimensions differ even between normal and alternate poses. At native image pixel scale, a useful initial top-left-origin adapter is `dx = -pivot.x * width`, `dy = -(1-pivot.y) * height`. This is an **inferred adapter convention**, not the complete placement contract. Preserve floating-point precision; transparent trimming must update offsets.

| Sample | Normalized pivot x,y | Approximate untrimmed offset from pivot |
| --- | --- | --- |
| Healer `-0` | .45454547, .22448979 | −25, −76 px |
| Healer `-0x` | .49056605, .22 | −26, −78 px |
| Eunuch `-0` | .58333331, .20168068 | −42, −95 px |
| Camel Lancer `-0` | .43518519, .19090909 | −47, −178 px |
| `tile_buildings1 001` | .5, .08418400 | −32, −179.5 px |
| `tile_land8 001` | .5, .40243900 | −32, −24.5 px |
| `tile_flatties 001` | .5, .515625 | −32, −15.5 px |

Healer `-0` has fractional render texture-rect y/height and serialized geometry/settings. UnityPy applies sprite geometry/packing rather than merely taking an integer rectangle. Preserve `m_Rect`, `m_Pivot`, `m_PixelsToUnits`, `m_Offset`, render rect and offsets, packing flags, mesh and texture references. Do not discard margins before calculating anchors.

**Source-confirmed:** [GameMap.cs:1664–1680][position] unwraps micro-coordinates greater than 128, obtains cell centre, and adds micro/half-pixel offsets. [1683–1710][pivots] adds troop-type corrections: type 70 `(0,1/32)`, 71 `(0,1/32)`, 72 `(0,5/64)`, 78 `(0,3/32)`, 79–81 `(0,5/64)`, 82–84 `(0,1/16)`, 85 `(0,1/8)`. Establish the numeric domain before assigning any correction to a Toolkit marker.

[SpriteMapping.cs:440–481][frame-map] resolves most body families, including GM 208–215, with `image - 1`; other GM families use `image` directly. There is no universal one-off adjustment. Multiple body/rider layers have distinct y offsets and sorting layers; interpolated placement applies them separately ([GameMap.cs:2606–2637][interpolation]). Classic rider composition is not independently established for DE.

The `x` suffix is an **alternate animation frame**, not camera rotation. Managed interpolation selects it when progress exceeds `.5` while not rotating (lines 2634–2637). Explicit turning has further logic after 2640. A name inventory does not establish idle/action/facing semantics.

[EngineInterface.cs:6914–6919][rotation-call] sends `DLL_SetMapRotation((int)(rotation - 1), centreX, centreY)`. [GameMap.cs:3854–3911][rotation-map] waits for rotation completion, changes mappings and clears sprites. Rotating a PNG 90 degrees does not reproduce another game view.

M-branch [KEEP_FLAG_ROTATION.md:10–34][keep] distinguishes global view values 0/2/4/6 from keep orientation and micro-coordinate rotation. Blob `609f39a131182e742b637295607c447278ef8db0` is identical on D and M. Its runtime observations are prior-source evidence, not fresh game testing here.

**Unverified:** static DE idle/action/direction tables and every building’s four-view tile composition. An explicitly named sample thumbnail can use extracted sample art after review; do not call sample frame 0 idle. The next proof requires native table analysis or separately authorized isolated render-buffer captures.

## Buildings, terrain and flat/lowered views

**Observed authentic world samples:**

| Resource | Path ID | Texture | Size | Extracted PNG SHA-256 |
| --- | ---: | --- | --- | --- |
| `tile_buildings1 001` | 7750 | `AllTileSprites`, ID 31 | 64×196 | `6ef29ee0ba4e228715ee5ae2d2f7beb634893e72f6b425ead452e8b272e22549` |
| `tile_land8 001` | 133532 | same | 64×41 | `65684b2c0c5c480806dcc8fe5e84b44f5d313080cca721a776825c4844e5b449` |
| `tile_flatties 001` | 79779 | same | 64×32 | `488b99838f7b150663ffadf0cfc8a2701623ef7a889b1ef1aaec3355b8ef3004` |

The wall/pillar piece and land tile were visually inspected. Terrain art can be taller than a nominal diamond. These DE samples are 64 pixels wide; classic renderer comments describe 30-pixel GM1 diamonds and 32-pixel screen-row spacing (`src/js/iso-view.js:580–581`). Separate scale assumptions; this is not proof of a uniform exact 2× conversion.

**Source-confirmed:** [spriteLoader.cs:264–285][load] registers separate land/building/farmland/ruins/sea/flatties/pillars/cliffs/walls families. [SpriteMapping.cs:22–188][tile-map] has family-specific transformations, including sea image variants becoming sprite plus light and some building images collapsing to shared art. [234–249][sea-map] remaps new-sea image/light domains. The loader concatenates `tile_sea_new_01` and `tile_sea_shore` with an index offset. Native image IDs are not universally sprite suffixes.

**Observed/source-confirmed DE-only building:** `globalgamemanagers.assets` holds Texture2D ID 13, `UI-MasterAtlas`, 8192×8192. [UI-MasterAtlas.xaml:1076][ui-crop] defines `UI-Buildings C015` crop `(4905,6146,144,133)`. The game [HUD_Main.xaml:351–362][ui-stockade] assigns this resource to `ButtonBuildWoodenBedouinStockade` with `CommandParameter="STRUCT_BEDOUIN_STOCKADE"`. Extracting that installed atlas crop gives a visually verified 144×133 Stockade menu icon, SHA-256 `4ffa8e36332f365a737ad7449614d53cfc885232d62888637ed4f7d92aa55136` (`stockade-build-menu.png`).

This proves a **menu icon**, not the complete 10×10 stockade world render. [CastlePlanner BlueprintBuildingIconCatalog.cs:304–311][stockade-catalog] independently associates C015 with the stockade mapper. Do not stretch a menu icon over the footprint and call it verified world composition. Stockade/outpost world rotations, overlays, damage states and terrain transitions remain gaps.

**Source-confirmed flattening path:**

1. [EngineInterface.cs:6739–6758][flat-call] toggles a separate `flattenedLandscape` flag.
2. `DLL_RunTick` passes it to native RVA `0x72720`, which compares/stores it and marks refresh state ([native C:67052–67065][native-flat]).
3. Unity receives changed image/height records. Dedicated flatties exist. On `flattenedHappened`, GameMap disables existing chimp interpolation ([914–919][stream]).
4. [gameTile.cs:112–166][tile-transform] draws tile and chevron geometry through separate transforms and shading. Compressing a composed bitmap loses that structure.

**Unverified:** full native selection rules for flat buildings, terrain heights, wall tops, stumps, farms, pits and units. Partial native decompilation references flattened state in visibility/terrain branches but has not been audited into a complete scene generator. Toolkit `flatView`/`peekView` (`src/js/iso-view.js:660–743`) contains classic constants and crop rules; do not treat them as established DE behavior. `buildingOverDepth`/`troopOverdepth` also occur in native picking logic, so names alone do not establish lowered rendering.

## Toolkit replacement points

The following paths/lines refer to Toolkit commit `818503dc40971defef3769ca883f82290405ab94`.

| Existing file/lines | Current behavior | DE work |
| --- | --- | --- |
| `assets/aiv/skins/9022.svg` … `9029.svg` | Bundled drawn stand-ins; Healer SVG inspected directly | Select locally extracted, provenance-labelled DE art; missing art remains explicit |
| `src/desktop/assets.ts:3–18` | Bundled manifest, then game sprites, then user skins | Feed DE thumbnails into the game-sprite route; preserve explicit user overrides and edition caches |
| `src-tauri/src/game/units.rs:40–78,117–167` | Classic GM1 sources, palette 1, GM1 file-header origins; list ends at 21 plus separate classic poses | Separate Unity reader, not guessed extra GM1s or classic palette/origin reuse |
| `src-tauri/src/game/graphics.rs:13–22,117–122` | Resolves `gm/*.gm1` and classic UCP graphics inputs | Edition-specific resolver/cache identity |
| `src/js/iso-view.js:1174–1193` | `idleSprites[marker.type]` else explicit numbered rally marker | Supply DE idle DTOs only after idle/facing/anchor validation |
| `src/js/castle-editor.js:3476–3486` | Fits unit thumbnail silhouette while preserving aspect ratio | Reuse that presentation for authentic thumbnails |
| `main.js:904–918` | Alternative Electron backend loads bundled, then user art | Keep this path consistent if shipped |
| `src/node/game-building-assets.js`, `src-tauri/src/game/buildings.rs` | Classic GM1 building/flat extraction | Separate verified DE catalogue rather than inheriting classic indices |

**Inferred design:** per-sprite manifest should retain edition/install identity, asset file hash, object ID/name, texture/mask IDs, original rect/mesh/pivot/PPU, trim offsets, output size, GM identity, native-index adjustment, sample/idle/facing evidence and renderer revision. Generated-output cache keys also need shader identity and chosen player colour. Distinguish custom-user art, authentic local art and missing-art placeholders.

## Reproduction and review material

All files below are outside Git in `S:\Projects\UCP\de-research\assets`:

- `probe_inventory.py` → `resources-inventory.json`.
- `probe_extract.py` → representative PNGs, sprite metadata and resource shader metadata.
- `probe_units.py` → all eight `-0` bodies/masks and `unit-probe.json`, including pivots, texture IDs, frame gaps and output hashes. Mask extraction redirects a texture pointer in memory only; no serialization back into game files.
- `probe_gui.py` → inventories of `globalgamemanagers.assets` and `sharedassets1.assets`.
- `probe_stockade.py` → menu PNG and `stockade-probe.json`.
- `probe_shader.py` → shader DXASM by decompressing serialized subprograms, locating DXBC and invoking system `d3dcompiler_47.dll!D3DDisassemble`.
- `input-hashes.json`, `source-manifest.json`, `artifact-hashes.json`, pinned source copies. The source manifest covers the initial ten managed files; artifact hashes cover subsequent scratch files too.

Run from explicit Toolkit working directory. These commands write only owned scratch:

```powershell
python -m pip install --target 'S:\Projects\UCP\de-research\assets\pydeps' UnityPy==1.24.2
python 'S:\Projects\UCP\de-research\assets\probe_inventory.py'
python 'S:\Projects\UCP\de-research\assets\probe_extract.py'
python 'S:\Projects\UCP\de-research\assets\probe_units.py'
python 'S:\Projects\UCP\de-research\assets\probe_gui.py'
python 'S:\Projects\UCP\de-research\assets\probe_stockade.py'
python 'S:\Projects\UCP\de-research\assets\probe_shader.py'
```

Large companions remain in the installed Data folder for read-only streamed-data resolution. Do not move them or eagerly export every sprite. Independent minimal extraction:

```python
from pathlib import Path
import sys
sys.path.insert(0, r'S:\Projects\UCP\de-research\assets\pydeps')
import UnityPy
root = Path(r'D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data')
env = UnityPy.load(str(root / 'resources.assets'))
source = next(iter(env.files.values()))
sprite = source.objects[88083].read()
assert sprite.m_Name == 'body_bedouin_healer-0'
assert sprite.m_PixelsToUnits == 64
sprite.image.save(r'S:\Projects\UCP\de-research\assets\healer-independent.png')
```

A production extractor must package/pin dependencies, validate file/output limits and preserve installation isolation. The research dependency was not added to Toolkit.

## Concrete sequencing and unresolved gates

1. **Separate asset identity/capabilities:** detect DE resource layout, separate roots/caches, retain classic and custom skins. Promote a small read-only extraction helper from these probes after review.
2. **Authentic thumbnails:** review a thumbnail pose for each of the eight troops and extract Stockade/menu icons. If frame 0 remains a sample, label it as such. This can replace generated selection art before scene parity is ready.
3. **Colour/anchors:** reproduce masked TeamColour sampling, fractional pivots, PPU and trimming. Compare two player colours plus feet clipping/transparency against a separately authorized isolated game capture. Check mounted/layered art independently.
4. **Idle/facing and building records:** audit native animation tables or capture render records for Healer, a mounted DE troop and a turning/layered unit. Map Stockade and all three outposts in four views, including overlays and footprints. Menu icons are not that proof.
5. **Terrain/modes:** map representative grass/sand/water/shore/cliff/wall/farm/tree/pit file-image-light records, then native flat/lowered rules. Compare the same scene at four views and every advertised mode; expose unsupported combinations.
6. **Acceptance/regression:** confirm classic rendering, DE-only installations, hash-based invalidation, sparse-frame handling, missing-mask diagnostics, and no extracted art in Git/game directories. Parent owns central ledger and final game-backed acceptance.

Still unresolved: complete DE idle/action/facing tables; Stockade/outpost world tiles; overlays/construction/damage ordering; exact colour/filtering parity; foliage shader parity; flat/lowered rules; shipping choice between direct Unity decoding and a packaged helper. Evidence supports starting a DE provider, **not closing the authentic-rendering acceptance criterion yet**.

[handoff]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Findings/AIToolkitDE.md
[unitypy]: https://github.com/K0lb3/UnityPy
[load]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L246-L285
[resource]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L465-L509
[key]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L533-L607
[get]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L621-L636
[de-bodies]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L360-L380
[colours]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L22-L34
[material]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L639-L666
[gm]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Enums.cs#L4330-L4337
[colour-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L296-L306
[frame-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L440-L481
[tile-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L22-L188
[sea-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L234-L249
[stream]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L891-L959
[body]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1047-L1075
[position]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1664-L1680
[pivots]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1683-L1710
[interpolation]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L2606-L2637
[rotation-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L3854-L3911
[tick]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L3835-L3837
[flat-call]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L6739-L6758
[rotation-call]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L6914-L6919
[tile-transform]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/gameTile.cs#L112-L166
[native-tick]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L78368-L78433
[native-flat]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L67052-L67065
[keep]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge/KEEP_FLAG_ROTATION.md#L10-L34
[ui-crop]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/resources/xaml/Assets/GUI/Sprites/UI-MasterAtlas.xaml#L1076
[ui-stockade]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/resources/xaml/Assets/GUI/XAMLResources/HUD_Main.xaml#L351-L362
[stockade-catalog]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/CastlePlanner/src/BlueprintBuildingIconCatalog.cs#L304-L311
