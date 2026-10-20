# 2.5D camera modes

X/C rotate the camera in quarter turns. A loaded saved-map atlas is sufficient:
its terrain, heights and scenery are indexed by world tile, and the existing
camera transform resolves those tiles for each direction. Four historical
engine-generated layers remain preferred when available. Without them, the
saved directional artwork is reused; this does not regenerate engine-specific
shorelines, cliff faces or directional sprites. No game process is started.

The old guard required those historical captures even after saved terrain loaded
successfully. Its "wait or reload" message could therefore persist forever.
Rotation now waits only for the atlas, and retains an actual map load error.

Space toggles flat view: terrain and troops use the game's constant 8-pixel
datum, with no cliff pillars or overground scenery. Buildings use the selected
installation's `tile_flatties.gm1` textures, selected by native building type,
instead of generated footprint diamonds. Farm fields retain their sparse native
layout, stairs use flat stair tiles, and walls retain their roof diamonds.
The compact Flat view button exposes the state. V toggles lowered view: terrain uses the
game's settled height table, `floor(height / 4) + 1`, rather than zero. Cliff and
wall columns are shortened while their ground/roof diamonds keep their native
proportions. Other building and scenery sprites retain their original pixels;
the previous whole-image 20% vertical scaling distorted their footprints.
Troops retain their visible building support heights, with wall/stair supports
following their shortened columns. Press V again, or click the
Lowered view button, to turn it off. The pressed button exposes its state.
Key release, losing focus, closing, reopening or docking the viewport retains
the mode so screenshots can be captured. The editor deliberately uses a toggle
for V instead of the game's held-key interaction. The game controls are described
in the [Crusader manual, Camera Interface](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/40970/manuals/Stronghold_Crusader_HD_Manual_-_English.pdf?t=1758726250).
Flat texture variation uses the saved map's RandomLayer. Preview instance parity
and the alternate hut variant are deterministic approximations of runtime
building allocation/logic flags, so they can differ from a running match.
Saved directional artwork is still subject to the camera limitations above.

Flat-view provenance: `renderMap` at `0x004E9845` / `0x004EBBC4` selects a
texture group from the native type table at `0x00B44220`, combines instance parity
and RandomLayer bits, and fixes the terrain datum at 8 pixels. The 46 tile
references and type metadata can be regenerated with
`node scripts/extract-flat-view-rules.cjs <game-folder>`. Pictures are decoded
locally through the existing game-asset path; game pixels are not bundled.

Height provenance: `triggerLoweredView` at `0x004F6FD0` selects mode 3;
`updateShowHiLayerOrResetChangedLayer` at `0x00501A20` converges the 256-entry
height table to `(height >> 2) + 1`. `rebuildShowHiLayerFromHeights` at
`0x004F79D0` applies it to terrain. The terrain renderer draws its 30x16 diamonds
and TGX uppers without whole-sprite scaling (`0x004E9BE6` / `0x004E9C8F`).
These rules were inspected in the installed, previously verified classic
executable; no game executable or image pixels are bundled.

The modes affect presentation and picking only. They never modify terrain,
castle contents, build order or analysis inputs. Mode changes invalidate scene,
terrain and troop draw caches; pan/zoom continue to reuse the composed scene.
The world point at the viewport centre is preserved when displayed height changes.

Both actions are configurable in castle shortcuts. Adding the defaults preserves
existing custom Space/V assignments, camera keys and explicitly cleared bindings.
Typing in fields and open dialogs retains the existing shortcut guards. Holding
either toggle key does not toggle repeatedly. Both hosts share the same mode.

Focused follow-ups cover toggle keys, native height mapping, unscaled ground
and building/scenery commands, cropped cliff/wall columns and camera-centre
restoration between normal, lowered and flat modes.
Original camera-mode validation: 101 shortcut, camera/cache, geometry and troop tests passed.
The saved GreekSea atlas (without camera captures) was rendered through all four
directions in normal, flat and peek modes; Canvas and the GPU worker were checked
visually, including normal-view restoration. No full-suite or benchmark rerun.
