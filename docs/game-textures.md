# Game texture sources and scenery composition

The 2.5D view reads building and terrain GM1 textures from the selected game
installation. `game-graphics.js` resolves base `gm` files, followed by literal
`modules.files:registerFileSource(...)` registrations in active UCP plugin load
order. Later registrations win, matching `extension-files/overrides/registry`.
Only `resources/gm` participates: a pack's `gmx` folder is inactive under that
module. No plugin Lua, executable, or game process is run.

This is a deliberately bounded static resolver. Dynamically calculated Lua
paths, ZIP-only plugins, and runtime texture modification hooks are not
interpreted. A game's running memory is not a texture source for the editor.

## Buildings

`iso-source-parts.json` maps bundled atlas coordinates to native GM1 picture
identities. Regenerate it with `scripts/export-native-building-parts.js
GAME_FOLDER --sources-only` against the documented reference executable.
`iso-wall-sources.json` records the top tile and wall pillar for each wall/stair
variant. All 236 composites were matched pixel-for-pixel against the existing
bundled sprites using the reference game's `tile_land3` and `tile_walls`.

The shared GM1 decoder builds a lossless atlas in a worker thread. The disk
cache identity includes selected files' paths, sizes, mtimes, catalogue and
source mappings. Concurrent view mounts share the same job. Geometry does not
change with a texture pack; no image resizing or lossy conversion is used.
Missing replacement picture indices fall back to the base file and are listed
in the returned catalogue's `assetWarnings`. Failure to load the installation
retains the bundled catalogue, with a console diagnostic.

## Terrain IDs and pillars

Saved map GFX values are global picture IDs. Some maps were saved with the
classic layout; the supplied Reconquista maps were saved with the replacement
pack's different picture counts. Neither layout can safely be assumed for all
maps. The loader tests unique GFX IDs against GM1 type-3 tile files and valid
local picture indices. It uses the installed pack layout only when the classic
layout fails validation and the pack layout validates completely. Ambiguous or
unsupported cases retain classic compatibility. Non-tile references are counted
as missing instead of decoding animation bytes as raw tile pixels.

`map-picture-layout.json` preserves the existing classic compatibility layout,
including its empirical 21-picture correction after slot 149. The origin of that
legacy correction remains unresolved. The installed layout follows the game's
`TextureRenderCore::loadGmFiles` cumulative counts without that correction.
Validated native captures use their captured base-installation layout directly,
independently of currently active overrides. Runtime cache format was bumped so
old atlas pixels cannot survive the geometry/layout changes.

OpenSHC's decompilation of `Rendering::BlitMapImageWithVerticalClip` (0x453b00)
writes each two-pixel column at vertical offsets 0,1,...,7,...,1,0. GM1 type-5
pillar rows therefore need this stagger, not rectangular stretching. Pillars
are prepared at their displayed height when the map atlas is built. Type-5
wall pillars are preserved too; non-strip references still use the established
cliff fallback. Runtime cliff continuation/blending and neighbour half-face
clipping are not fully emulated.

## Construction clears scenery

Ground and pillar commands remain in the immutable terrain cache. Upper
scenery and tree commands are also recorded once, but are filtered against the
visible construction footprints and attached ground plates before merging in
depth order. Advancing past a placement removes covered scenery; stepping back
restores the original command objects. Adjacent scenery is retained. Neither
operation modifies the source map or rebuilds its terrain atlas.

## Reconquista verification

The shared Reconquista 1.0.0 ZIP contains 68 GM1 files under `resources/gmx`,
not an active `gm` folder. Several picture counts differ from the reference
installation (including deer, churches, land macros and ruins). For offline
verification only, the files were copied into an isolated test plugin's `gm`
folder and activated via a fixture configuration. Neither the original archive
nor the user's game installation was modified. Both supplied maps selected the installed-pack layout and decoded with
zero missing terrain pictures: 1,167 and 2,288 unique pictures. This checks an
explicitly activated pack; it does not establish the friend's runtime setup.


## Atomic map loading and moat edges

The 2.5D view no longer stretches the map's 200x200 preview as a loading or
error fallback. It shows a loading message until every camera atlas and upper
scenery image has decoded. Failures remain visible with a retry instruction.
Reselecting a map creates fresh image objects and revalidates the building
catalogue. Request tokens prevent an older selection or decode from replacing
the latest map. These operations happen on loading, not during step scrubbing.

Placed moat uses the seven-entry neighbour table in `updateGfxLayer` (0x509180,
`TerrainDefinedData+0x1d64`). Cardinal edges take precedence over diagonal
corners; attached bridges count as connected moat. Camera-rotated tile
coordinates determine the mask. Seventeen lossless pictures cover the
unshadowed variants from `tile_sea8`; installed texture overrides supply the
same picture identities. This replaces the constant shaded picture 235.
It does not reproduce the game's dynamic luminescence/shadow calculation.

Moat variants are cached against visible tile occupancy. Only changed tiles
and their eight neighbours invalidate cached choices; future steps never
contribute neighbours. Castles without moat skip this resolver entirely.

Map loading remains read-only with respect to the selected game installation:
existing compatible native captures may be read, but a miss or stale capture
uses saved terrain. It never starts or attaches to Crusader. A crash reported
with an older build has not been reproduced or attributed to a specific cause.


Large scenery atlases now pack into up to eight 2048x4096 texture pages, sorted
by sprite height with original picture indices preserved. Each page is cropped
to its occupied extent and encoded separately. No image resizing is involved.
The renderer selects the page when recording immutable terrain commands; it
does not repack during step changes. Cache format v3 discards old single-image
atlases. The supplied Double Trouble map (SHA256
`cc840ca2fdec37f90e1b7575d60cd689575f11a0cb07ae40b5e1ecaf921499c9`)
reproduces the previous size-limit exception with 6,134 scenery sprites. The
paged packer uses three pages (1986x3969, 2048x4015, 2048x2849), about 83.7 MiB
of RGBA pixels. Released snapshot-4aa3336 loaded and reloaded this map in
packaged Electron with the activated Reconquista fixture: 1,938 unique terrain
pictures, zero missing pictures and zero renderer errors. This used saved
terrain without native captures or starting the game.
