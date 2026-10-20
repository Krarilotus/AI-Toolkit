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

Space toggles flat view: zero displayed terrain height, no cliff pillars or
overground scenery, building footprints and troops at ground level. The compact
Flat view button exposes the state. V toggles lowered view: it lowers the terrain
and compresses building/tree sprites to 20% of their displayed height, with troop
and route elevations following the same scale. Press V again, or click the
Lowered view button, to turn it off. The pressed button exposes its state.
Key release, losing focus, closing, reopening or docking the viewport retains
the mode so screenshots can be captured. The editor deliberately uses a toggle
for V instead of the game's held-key interaction. The game controls are described
in the [Crusader manual, Camera Interface](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/40970/manuals/Stronghold_Crusader_HD_Manual_-_English.pdf?t=1758726250).
The flattened foundations and compressed sprites are Toolkit representations,
rather than a port of the game's renderer or its individual flat-image mappings.

The modes affect presentation and picking only. They never modify terrain,
castle contents, build order or analysis inputs. Mode changes invalidate scene,
terrain and troop draw caches; pan/zoom continue to reuse the composed scene.
The world point at the viewport centre is preserved when displayed height changes.

Both actions are configurable in castle shortcuts. Adding the defaults preserves
existing custom Space/V assignments, camera keys and explicitly cleared bindings.
Typing in fields and open dialogs retains the existing shortcut guards. Holding
either toggle key does not toggle repeatedly. Both hosts share the same mode.

The toggle follow-up passes 19 focused shortcut and view-mode tests, including
single activation per press, custom bindings and camera-position restoration.
Original camera-mode validation: 101 shortcut, camera/cache, geometry and troop tests passed.
The saved GreekSea atlas (without camera captures) was rendered through all four
directions in normal, flat and peek modes; Canvas and the GPU worker were checked
visually, including normal-view restoration. No full-suite or benchmark rerun.
