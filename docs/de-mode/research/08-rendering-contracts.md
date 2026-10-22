# Representative DE rendering contracts — bounded follow-up 1

Date: 2026-10-22. Toolkit baseline `818503dc40971defef3769ca883f82290405ab94`, branch `de/separate-game-mode`.
Read `00-goal-verbatim.md`, `01-working-contract.md`, `02-plan.md`, research `02-assets-rendering.md`, and `03-synthesis-and-sequencing.md` (the last file is directly under `docs/de-mode`).

**Result:** native stationary-loop samples are established for Healer and Camel Lancer, including eight numeric facings. The European outpost's entire 25-tile base composition is established across four native views. Installed sprites for all 41 selected entries were decoded. These are static contracts and diagnostic reconstructions, **not game-view acceptance**. Flat/lowered mode selection, dynamic overlays, final shading and placement still have separate acceptance work.

Only this report was written inside Toolkit. All scripts, copied source, metadata, PNGs and helper-source inspection are in `S:\Projects\UCP\de-research\rendering-contracts` (**R** below). No recursive delegation, implementation change, install, commit, push, CI, PR, release, game launch, DLL invocation, game/profile write or classic-checkout modification occurred. Existing sources were inventoried and read without pull/checkout/ref changes. Script Extender was used as source, never attached to a process.

## Evidence identities and reproduction

Labels: **observed** = reproduced against installed bytes; **source-confirmed** = explicit pinned source/data flow, corroborated by matching binary identity where applicable; **inferred** = derived adapter/diagnostic rather than an observed game frame; **unverified** = acceptance remains open.

Primary game-source clone: `S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods`, read-only.

- **D:** `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, pinned `origin/develop`.
- **M:** `a23aa1b32276d670ffbb2a7b641d23b500d8e298`, pinned `origin/main`; read its `knowledge/OUTPOSTS.md` and `BEDOUIN_HEALER_TARGETS.md` as navigation leads, then verified the relevant native data independently.
- D native **C**: `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c`, freshly copied with `git show`, SHA-256 `04c3f601ad9579c8137ac718e664031238e451271cf65bc8c8afa6173223ee32`.
- D managed **CS**: `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/`.
- Script Extender source: `4014ca67c96974a5e6d697665baf5351cbfebde6`, `https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender.git`; inspected existing [Interop/GameUnit.cs:9–37,51–60][se-unit], not its symbolic field names as proof by themselves.
- OpenSHC: `126f25c9a53c14270ccd10c6a5db6f05bd143204`, `https://github.com/sourcehold/OpenSHC`. Existing generated classic C++ export under `S:\Projects\Harness\texture-research\openshc-sarif\cpp-126f25c9`; used only for qualified comparison.

New streaming SHA-256 checks, all under `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data`:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `Plugins/x86_64/CrusaderDE.dll` | 3,451,392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `Managed/Assembly-CSharp.dll` | 3,693,056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `resources.assets` | 114,825,928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| `resources.assets.resS` | 1,396,428,560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |

Native PE preferred image base is `0x180000000`; every address below is an **RVA**, never a live address. The probe maps file-backed sections before reading; BSS tables are reconstructed from their initializer, not read as supposed disk data. `native-contracts.json`, `identities-and-layouts.json`, `updater-disassembly.json`, `oracle-extraction.json`, `asset-format.json` and `direct-index.json` retain detailed evidence. No dependency was installed: reused UnityPy 1.24.2/Pillow 13.0.0 in prior `assets/pydeps`, existing Capstone in Harness research `pydeps`, Python 3.14 and Node. Exact imported Capstone version is recorded in `updater-disassembly.json`.

Reproduction, with every command's working directory explicitly set to Toolkit:

```powershell
python 'S:\Projects\UCP\de-research\rendering-contracts\probe_contracts.py'
python 'S:\Projects\UCP\de-research\rendering-contracts\verify_idle_machine.py'
python 'S:\Projects\UCP\de-research\rendering-contracts\probe_format.py'
python 'S:\Projects\UCP\de-research\rendering-contracts\probe_oracle.py'
node 'S:\Projects\UCP\de-research\rendering-contracts\probe_direct_index.cjs'
python 'S:\Projects\UCP\de-research\rendering-contracts\probe_layouts.py'
```

These scratch probes write only R. Their absolute inputs make them reproducible without changing the application's T3 workspace binding. `probe_native.py func 0x1731f0` / `func 0x174100` prints numbered pinned source. Parent can promote reviewed, non-proprietary probe code later; none was added as Toolkit implementation in this round.

## 1. Stationary units: explicit domains and tables

**Source-confirmed/observed:** unit-type dispatch is a preferred-VA pointer table at RVA `0x321CB0`, stride 8. Entry 78 at `0x321F20` points to updater `0x1731F0` (Camel Lancer); entry 79 at `0x321F28` points to `0x174100` (Healer). The indirect caller indexes native unit type: [C:219229–219232][unit-dispatch]. This independently connects names to dedicated updaters instead of guessing from sprite suffixes.

The separate GM table is signed int32 at `0x321F80`, stride 4: entries 78/79 are 208/209. [Initializer C:233484–233492][unit-init] copies its low short into the unit's GM field. Managed [Enums.cs:4330–4337][gm] and [spriteLoader.cs:360–380][body-names] resolve those to `body_camel_lancer` / `body_bedouin_healer`.

| Domain | Camel Lancer | Healer |
| --- | ---: | ---: |
| Toolkit AIV/rally marker | 9022 | 9023 |
| Native chimp type | 78 | 79 |
| GM resource family | 208 | 209 |
| Updater RVA | `0x1731F0` | `0x174100` |
| First stationary native image | `513 + d` | `641 + d` |
| Unity body suffix after managed `image - 1` | **`512 + d`** | **`640 + d`** |

Native unit manager RVA `0x67E8400` has record address `manager + 0x65C + unitId*0x490`; unit IDs are one-based here. Relevant structure-relative fields: native image `+0x00` (int32), GM `+0x08` (short), selected table value `+0x44` (int32), corrected facing `+0x50` (short), animation-cycle index `+0x2AC` (int32), state `+0x2BC` (short). These come from arithmetic in the cited routines; do not reuse this record layout in a different binary revision.

`d` is the camera-corrected native facing **0…7**. [C:219143–219160][facing] chooses a world-facing source, subtracts global view RVA `0x60AD40C`, and adds 8 if negative. For the ordinary stationary path this is `(worldFacing - view) mod 8`; special turning/direction modes choose different facing inputs. Native camera views are `0,2,4,6`. Managed UI `Dircs` uses North/East/South/West `1,3,5,7` and subtracts one in [EngineInterface.cs:6914–6919][rotation-call]. These domains must remain distinct. This report does not invent compass labels for each troop's artwork direction.

**Stationary state selection:** Camel state 0 chooses state 1 (or a separate state 3 branch); state 1 explicitly sets motion contribution to zero. It selects table A/B using bit 1 of the native byte field at GameUnit `+0x380`, then computes `nativeImage = 0x1F9 + tableValue*8 + d`: [C:210427–210483][camel-idle]. Healer state 0 chooses states 1 or 2 when no movement/heal target takes precedence. Both clear motion; state 1 uses table D and state 2 table C, with `nativeImage = 0x279 + tableValue*8 + d`: [C:210893–210977][healer-idle]. Thus the representative sample is the **first positive table value in a stationary loop**, not an assertion that state 0 immediately writes an idle image or that the game has only one idle action.

| Table | RVA / file offset | Positive entries before zero | Values relevant to sample |
| --- | --- | ---: | --- |
| Camel A | `0x320AB0` / `0x31F0B0` | 48 | Starts six `1`s, then `2,3,4,5,6,7,8,9,10`; max 10 |
| Camel B | `0x320B00` / `0x31F100` | 57 | Starts `1,2,3,…,13,12,…`; max 32 |
| Healer C, state 2 | `0x320B88` / `0x31F188` | 25 | `1…9`, five total `9`s, `8…1`, five total trailing `1`s |
| Healer D, state 1 | `0x320BC0` / `0x31F1C0` | 50 | Starts nine `1`s; later reaches 32 |

All are **signed int8 animation-value sequences with zero termination**, not arrays of image IDs, directions, or pointers. A zero/nonpositive value ends the branch; it is not body frame zero. Full values and SHA-256 including first terminating zero:

- A: `3ee86aba56d3749eaa507a56a2c4c1b616358e5bcdfdcd8d9871e5dcfa9a6b32`.
- B: `d558033551ab665b0ff336a0e2115047248ee54e409afc57265bf06660504bc8`.
- C: `2ade0f5db0056bf12ca64d039ef78e71799a788366b551e45a74e6143dc08504`.
- D: `f24ca62836188c965749a0824962f0d86aee666e1b9cc01d65b39e8622b6c25e`.

The machine-code cross-check also records actual `movsx` signed-byte reads, facing reads and `lea` constants. Examples: Camel `0x173C39/0x173C42` select B/A, `0x173C6D` has bytes `8d0ccdf9010000` (`value*8 + 0x1F9`), store at `0x173C7D`; Healer `0x174A97` reads table C, `0x174BA9` reads D, `0x174ACA` has bytes `8d0ccd79020000` (`value*8 + 0x279`), store at `0x174AD9`. These are offline disassembly, not DLL calls. Generated decompiler signatures elsewhere remain candidate.

**Observed extraction:** all suffixes `512…519` and `640…647`, plus corresponding atlas masks, exist and decode. [SpriteMapping.cs:440–481][body-map] subtracts one for GM 208/209; it does not do this for every GM. Eight numeric facings at the first positive table value:

| Corrected facing d | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Camel suffix | 512 | 513 | 514 | 515 | 516 | 517 | 518 | 519 |
| Healer suffix | 640 | 641 | 642 | 643 | 644 | 645 | 646 | 647 |

For fixed world facing 0, native views `0,2,4,6` select Camel `512,518,516,514` and Healer `640,646,644,642`. This is a valid static facing selector. Final game-view calibration of the editor's world-facing convention remains unverified.

Representative source-sprite details (full hashes/metadata for all 16 in `oracle-extraction.json`): Healer `640` path ID 103049, 35×85, pivot approximately `(15/35,17/85)`; Camel `512` path ID 28503, 87×211, pivot approximately `(35/87,36/211)`; both PPU 64. Raw top-left offsets before shared positioning are approximately `(-15,-68)` and `(-35,-175)` pixels. Preserve fractional metadata and mesh.

**Source-confirmed anchor closure:** the render record's low byte at short index20 becomes `_gameObjectType` in [GameMap.cs:1069–1075,1154][record-type] and [1806–1844][unit-anchor]. `getPivotOffset` gives type 79 `(0,5/64)` and type 78 `(0,3/32)` Unity units: [1683–1710][pivot]. At PPU 64 these add 5/6 pixels in positive Unity Y, in addition to the common cell/micro-coordinate transform. The GM-to-type mapping is independently explicit for managed preview pixies at [3580–3603][pixie]. This connects the correction to the **chimp domain**, not marker 9023/9022 or GM 209/208. Shader colour, trim/mesh rasterization and screenshot parity still require checks.

The diagnostic eight-facing sheet was visually inspected: the Camel sprite contains mount, rider and lance; Healer sprites are stationary standing poses. This does not certify every layered state or authorize adding a classic `body_knight_top` overlay. Normal versus `x` alternates remains the interpolation distinction established in report 02, not another camera view.

## 2. European outpost: the complete base tile group in four views

**Source-confirmed/observed:** native structure **106** (`STRUCT_OUTPOST`) is distinct from mapper **178** (`MAPPER_OUTPOST`). Managed enums: [Enums.cs:496–498][structures], [902–903][mappers]. Native mapper conversion reads byte table RVA `0xC7B98`, index `mapper - 0x1C`; mapper 178 returns switch case `0x41`, producing structure `0x6A=106`: [C:114540–114545,114674–114677][mapper-convert]. This is static table decoding, not a DLL call.

The mapper-size switch byte table RVA `0x899D4`, index `mapper - 0x2C`, contains 3 for mapper 178. `DLL_GetMapperSize`, RVA `0x84130`, maps case 3 to **5**: [C:76489–76515][mapper-size]. The building initializer stores supplied width at GameBuilding `+0xF8`. Width 5 therefore has independent native evidence, not just Toolkit's catalogue.

Building tables at `0x2E7AF0` (int32 GM family) and `0x2E7CB0` (int32 initial native image) have stride 4 indexed by **structure**, not mapper. Row 106 is **GM 7, base 1290**. [C:103882–103903][building-init] sets the record; [spriteLoader.cs:266–268][tile-loader] resolves GM7 to `tile_buildings2` with space/three-digit naming (minimum width only). Other newly read rows, not acceptance claims: structure 2 Bedouin outpost → GM 7/base 1315 ; 107 Arabian → GM 7/base 1265 ; 108 Stockade main body → GM 7/base 1240.

The tile initializer [RVA `0x619C0`, C:56095–56324][tile-order] constructs a BSS table at RVA **`0x8DDCC0`**, **0xFD8 bytes per size**, **0x18 bytes per cell**, with six int32 fields `(x,y,k0,k2,k4,k6)` and capacity 169 cells per size. Cell index is `y*n+x`; size `n` selects `base + n*0xFD8`. It initializes each size's four permutations, rather than storing four rendered whole-building pictures in the DLL. The lookup at [RVA `0x69850`, C:61330–61360][tile-lookup] selects the corresponding field for view 0/2/4/6.

`probe_contracts.py` transcribes all four initializer loops, then independently compares them with an analytic diagonal/rotation implementation for **every size 2…13**. All 48 permutations are bijections over `0…n²-1` and match. This validates the transcription against a separately expressed rule, not a running game.

For structure 106, [visual updater RVA `0x6E620`, C:64644–64660][outpost-select] selects `packed = (GM7 << 16) | (base1290 + k(view,x,y) - 1)` for all 25 cells. Unlike the default branch for many other buildings, this outpost branch does not add orientation-selected blocks of 25. [Render writer RVA `0x1A2D90`, C:238042–238045][tile-wire] writes image `(packed & 65535)+1` to the 21-short render record. Managed [SpriteMapping.cs:215–226][tile-map] uses GM 7's image **directly**. Thus the Unity suffix is exactly **1290+k**, not 1289+k or 1291+k.

Matrices contain **Unity sprite suffixes**, row=y, column=x, world offsets 0…4 from the outpost origin. They are not screen raster scanlines:

```text
view 0                         view 2
1314 1313 1311 1308 1304        1300 1305 1309 1312 1314
1312 1310 1307 1303 1299        1296 1301 1306 1310 1313
1309 1306 1302 1298 1295        1293 1297 1302 1307 1311
1305 1301 1297 1294 1292        1291 1294 1298 1303 1308
1300 1296 1293 1291 1290        1290 1292 1295 1299 1304

view 4                         view 6
1290 1291 1293 1296 1300        1304 1299 1295 1292 1290
1292 1294 1297 1301 1305        1308 1303 1298 1294 1291
1295 1298 1302 1306 1309        1311 1307 1302 1297 1293
1299 1303 1307 1310 1312        1313 1310 1306 1301 1296
1304 1308 1311 1313 1314        1314 1312 1309 1305 1300
```

Equivalent recipe: enumerate view 0 cells by decreasing `x+y`, within a diagonal increasing x, assigning k=0…24. Other views use `k0(y,4-x)`, `k0(4-x,4-y)`, `k0(4-y,x)` respectively. This is rotation of cell assignment, **not PNG pixels**. [GameMap.cs:3773–3813][map-coords] separately maps world to camera/tilemap coordinates.

**Observed:** every `tile_buildings2 1290…1314` exists and was decoded with original pivots. `oracle-extraction.json` records each path ID, dimensions, rect, texture ID, mesh and PNG hash. The reconstructed full tower/flag/base artwork was visually inspected and is a coherent world building, not menu art.

**Inferred diagnostic, not acceptance:** the probe composes those tiles on a 64×32 isometric grid with original pivots and no synthetic fill. Four native permutations plus camera-coordinate transforms produce identical 320×325 diagnostics, SHA-256 `c51a1220e6470449bba89819648a5ac571ec248b7df2b12c8b7fb3aa7063a20c`. This equality is consistent with the special branch using the same tile group in every view. It does not prove that game screenshots, transitions, lighting, ownership flags, construction/damage or animated overlays are identical. Keep per-tile commands/anchors in production; do not flatten this diagnostic into the authoritative scene model.

Stockade scope warning: mapper 79's native size case also gives 5, while Toolkit's full stockade footprint is 10×10. [RVA `0x72E10`, C:67335–67435][stockade-parts] creates a main structure plus three structure 56/57/58 companions using orientation-dependent offsets at RVA `0x2D2E90`, stride 0x18 (six int32). Thus main-body group 1240…1264 is **not the whole compound Stockade**. Choose outpost 106 as this round's complete base-tile fixture; leave the stockade compound, companions and footprint union for another bounded task.

## 3. Remaining flat/lowered rules: trace this path next

There are independent native states; report 02's flattening lead must not collapse them into one boolean or Classic `flatView`/`peekView` crop constants.

**Source-confirmed:** world manager RVA `0x405EDB0` plus:

| Field offset / resulting RVA | Established static role |
| --- | --- |
| `+0x204E68C` / `0x60AD43C` | Height-transition completion state used by unit/world rendering; initialized to 1 |
| `+0x204E690` / `0x60AD440` | Selects native flat-building tile branch when nonzero; writer/input semantics still to trace |
| `+0x204E694` / `0x60AD444` | Value supplied by managed `flattenedLandscape` through `DLL_RunTick`/`0x72720` |
| `+0x204E69C` / `0x60AD44C` | Copy written by `0x72720`; separately tested by world render code |

- [C:67052–67064][flatten-set] stores managed flatten flag at offsets `+0x204E694` and `+0x204E69C` and refreshes the scene. This is distinct from `+0x204E690`. Managed toggle is [EngineInterface.cs:6739–6758][flatten-managed].
- [RVA `0x7BAB0`, C:70885–70975][height-transition] operates on a 256-entry int32 height lookup at manager+`0x7080` = RVA `0x4065E30`. Mode 1 assigns `h -> (h >> 2)+1`; mode 2 restores `h -> h`; modes 3/4 approach those targets with distance-dependent steps. Completion writes `+0x204E68C`. This is concrete lowering/raising behavior; UI input/domain names are not yet certified.
- [C:64987–64991][generic-flat] replaces building cells when `+0x204E690` is nonzero with packed GM 157 plus table RVA `0x2D165C`, stride 4 indexed by width, plus camera-dependent k. A naïve direct outpost-size5 application requests suffixes 32…56, while installed `tile_flatties` has only 1…46. Therefore **do not certify this branch alone as the final DE outpost flat output**. This reproducible mismatch requires final render-stage substitutions and actual input-state conditions to be traced.
- Final world renderer [RVA `0x41D60`, C:38705–38816][flat-render] tests flatten states, building subtype flags and structure-indexed int32 category table RVA `0x2CF0F0`; entries2/106/107/108 are2/1/2/2. This is a **flat-render category, not footprint width**. For ordinary nonnegative categories it chooses short flatties variants using cell variant/building parity. Other branches retain full art, special wall/stockpile cases, sea/terrain or construction images. Further flag/height handling occurs [C:39556–39618][flat-render-more].
- Terrain and chevron transforms remain separate in [gameTile.cs:112–166][tile-transform]; unit elevation is also remapped. Bitmap compression cannot reproduce those rules.

**Next static closure:** recover action/keyboard writers of field `+0x204E690` and transition mode at offset `0x204E680`, enumerate `0x2CF0F0` categories, then symbolically execute a small final-render fixture for outpost 106, one wall/stair, tree, farm and pit under each actual flag combination. Trace `0x41D60` through `0x1A2D90` to Unity names, not only pre-render tile storage. Resolve the 32…56/46 discrepancy before advertising flat outposts. Parent can then schedule isolated captures of the same fixed scene in 4 views and normal/lowered/flat/landscape modes. No game-view acceptance happened here.

## 4. Lightweight production extraction strategy

**Recommendation/inference:** use a **narrow direct Rust serialized reader/decoder** for the native backend, with the same core exposed through a small owned CLI if Electron still ships. Keep UnityPy as the offline oracle. Pure JS is viable for indexing/metadata; duplicating BC7/mesh/shader behavior in two production decoders is avoidable. This is a recommended architecture; no production dependency/helper was added.

Reasons established by probes rather than installed-tool availability:

1. **Direct index reproduced.** Dependency-free `probe_direct_index.cjs` reads v22 headers, types, object records and names with Node fs/Buffer. It found 137,773 objects, 135,354 Sprites and 41 Texture2Ds, matching all 41 selected names/path IDs against UnityPy. One run took 83ms including reading 114.8MB; this is a scratch measurement, not production startup/peak-memory acceptance.
2. **No embedded type trees.** File version 22, little-endian data, Unity 2021.3.45f2, platform 19; metadata 3,309,703 bytes, data offset 3,309,760, 67 types. An arbitrary self-describing Unity decoder would not work from file trees alone here. UnityPy falls back to its TPK class database. Scratch exports `Sprite-2021.3.45f2-layout.json` (class 213, 167 nodes) and `Texture2D-2021.3.45f2-layout.json` (class 28, 44 nodes) preserve field order, arrays and alignment. Observed type hashes: Sprite `7012a9da776ed53774e22013565dbbd2`, Texture2D `0d08414cfd5bdb0d22792011bda9ab26`. Version/type-hash gate these two audited layouts and reject unsupported changes.
3. **Two observed GPU codecs for these fixtures.** Colour atlases are BC7 (Unity texture format 25), masks DXT1/BC1 (format 10), all 8192×8192, streamed from separately hashed `.resS`. Decode intersecting 4×4 blocks lazily; one full RGBA atlas costs 256MiB. Do not read/decode all 41 atlases for 16 sprites.
4. **Sprite geometry matters.** Healer 640 has 5 vertices/9 indices and fractional texture rect; Camel 512 has 11 vertices/27 indices. Outpost tiles are quads. Rectangular crops alone are insufficient for general troops. Preserve mesh/UV, rect, pivot, PPU, render offsets, packing flags, texture references and mask pairing. Oracle `SpriteHelper.py` handles packed rotations and mesh extraction; compare actual output/metadata, not merely file existence.

Observed streamed texture records:

| Texture object | Name | Format | `.resS` offset | Size |
| --- | --- | ---: | ---: | ---: |
| 23 | `body16Sprites` | BC7/25 | 405,454,912 | 67,108,864 |
| 12 | `body16Sprites_m` | DXT1/10 | 5,472 | 33,554,432 |
| 42 | `body15Sprites` | BC7/25 | 943,443,472 | 67,108,864 |
| 50 | `body15Sprites_m` | DXT1/10 | 1,346,096,912 | 33,554,432 |
| 31 | `AllTileSprites` | BC7/25 | 606,847,536 | 67,108,864 |

**Dependency candidate inspected, not installed or accepted:** [`texture2ddecoder` Rust source][rust-decoder], pinned commit `551fcbfbe86c05424ccc2ff942525c0ec7171d65`. [Cargo.toml:1–38][rust-cargo] identifies 0.1.2, Rust 2021, MIT OR Apache-2.0, ordinary dependency `paste`; [BC7 source:132–134][rust-bc7] exposes a block decoder. [colour.rs:26–28][rust-color] constructs little-endian **BGRA**; explicitly convert to Toolkit RGBA. It fits observed BC7/BC1 needs and existing Rust/png backend; require a bounded oracle comparison and release-size/performance measurements before choosing/locking it. Source bytes/hashes are in `decoder-source-manifest.json`. No assumption that a similarly named crate is already locked into Toolkit.

**Packaged helper alternative:** a pinned UnityPy worker reduces parser implementation initially but requires a shipped Python runtime and native Pillow/texture decoder binaries plus a larger dependency graph. Installed metadata includes LZ4, Brotli, etcpak, ASTC and FMOD-related dependencies beyond this fixture's needs. A helper still needs output manifests, profile/cache isolation, cancellation, source validation and deployment tests. Current [UnityPy docs][unitypy] advise version pinning; installed 1.24.2 is already the recorded oracle. AssetRipper is a broader [Unity asset analysis application][assetripper], not an inspected small headless component here. Do not choose either by availability or require users to install Python/.NET manually. If direct-reader parity proves too costly, measure a narrowly exposed packaged helper as an explicit fallback decision; never call game DLL entry points as the helper.

**Concrete next bounded tasks:**

1. Parent reviews static mappings; keep capabilities `sample`, `stationary-facing`, `building-base-tiles`, `flat/lowered` separate. First semantic slice: two stationary units and outpost 106 base tiles. No general DE rotation/mode parity claim.
2. New owned module/scratch task: implement only v22 index plus version/type-hash-gated Sprite/Texture2D layouts and bounded relative `.resS` access. Compare every field for these 41 sprites to the oracle, including fractional fields and sparse-name identity. Validate counts, bounds, `m_FileID/pathID`; reject external paths escaping installation.
3. Evaluate pinned BC7/BC1 block-decoder candidate against UnityPy on selected actual texture blocks, including channel order, orientation and masks. Measure shipped bytes, cold/warm time and peak memory; then select/lock dependency. A general Unity editor/export stack is unnecessary for this gate.
4. Reconstruct 16 unit sprites and 25 building tiles, preserving geometry/pivots and report 02's separate colour/shader contract. Compare dimensions, anchors and pixels to oracle. Gamma/filtering/edge coverage can still differ from the game. Cache only under DE profile with native/managed/art/type-layout/shader/provider identities.
5. Emit provider DTOs carrying explicit chimp/GM/marker/frame-domain metadata and outpost world-cell commands. Apply native view correction and verified type-specific unit pivot offsets at the caller boundary; unknown scenes/modes stay unavailable. Follow outpost special branch rather than generic orientation multiplication.
6. Separate static task closes flat/lowered inputs and final substitutions; another closes Stockade compound placement/overlays. Parent owns independent review and isolated game captures after profile isolation. Only those observations can close authentic-rendering acceptance.

## 5. Classic comparison and unresolved acceptance

**Verified comparison:** classic OpenSHC [Unit.hpp][classic-unit] separately models facing and map-corrected facing; [AnimationFrameData.hpp][classic-animation] contains unit-specific byte sequences. Existing generated `UpdateKnight.cpp:115–146` uses `value*8 + direction + constant` and separate rider/body sequences. That is the same kind of lookup as this DE sample, but does not establish matching offsets, frames, palettes or geometry. Toolkit [classic unit_poses.rs][classic-poses] keeps only researched Classic poses. Healer/Camel have no equivalent Classic row to inherit. Verified DE GM 7/body mappings and Unity anchors remain independent of GM1 decoding/header origins.

Open items: final world-facing calibration; full unit motion/interpolation states; team-colour/gamma/filtering/mesh edge parity; dynamic ownership/construction/damage overlays; whole Stockade compound; flat/lowered input semantics/final symbols; terrain/chevrons/units in each mode. Numeric matrices and stationary selectors can now be reviewed as implementation inputs. They do not close game-view acceptance.

[unit-dispatch]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L219229-L219232
[unit-init]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L233484-L233492
[gm]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Enums.cs#L4330-L4337
[body-names]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L360-L380
[facing]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L219143-L219160
[rotation-call]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L6914-L6919
[camel-idle]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L210427-L210483
[healer-idle]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L210893-L210977
[body-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L440-L481
[record-type]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1069-L1154
[unit-anchor]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1806-L1844
[pivot]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1683-L1710
[pixie]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L3580-L3603
[structures]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Enums.cs#L496-L498
[mappers]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/Enums.cs#L902-L903
[mapper-convert]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L114535-L114677
[mapper-size]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L76489-L76515
[building-init]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L103882-L103903
[tile-loader]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs#L266-L268
[tile-order]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L56095-L56324
[tile-lookup]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L61330-L61360
[outpost-select]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L64644-L64660
[tile-wire]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L238042-L238045
[tile-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L215-L226
[map-coords]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L3773-L3813
[stockade-parts]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L67335-L67435
[flatten-set]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L67052-L67064
[flatten-managed]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L6739-L6758
[height-transition]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L70885-L70975
[generic-flat]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L64987-L64991
[flat-render]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L38705-L38816
[flat-render-more]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L39556-L39618
[tile-transform]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/gameTile.cs#L112-L166
[rust-decoder]: https://github.com/K0lb3/texture2ddecoder-rs/tree/551fcbfbe86c05424ccc2ff942525c0ec7171d65
[rust-cargo]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/Cargo.toml#L1-L38
[rust-bc7]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/src/bcn/bc7.rs#L132-L134
[rust-color]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/src/color.rs#L26-L28
[unitypy]: https://github.com/K0lb3/UnityPy#readme
[assetripper]: https://github.com/AssetRipper/AssetRipper#readme
[classic-unit]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/src/OpenSHC/Map/Units/Unit.hpp#L65-L153
[classic-animation]: https://github.com/sourcehold/OpenSHC/blob/126f25c9a53c14270ccd10c6a5db6f05bd143204/src/OpenSHC/Map/AnimationFrameData.hpp#L15-L21
[classic-poses]: https://github.com/Krarilotus/AI-Toolkit/blob/818503dc40971defef3769ca883f82290405ab94/src-tauri/src/game/unit_poses.rs#L1-L69
[se-unit]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/GameUnit.cs#L9-60
