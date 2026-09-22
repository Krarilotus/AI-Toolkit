# Static idle troop previews: verified research

Status: **not implemented**. The current local unit thumbnails use frame 0; they
must not be described as verified idle sprites. This investigation read local
game files and OpenSHC references without starting or attaching to the game.

## Verified classic-game contract

The local OpenSHC C++ export is at
`S:\Projects\Harness\texture-research\openshc-sarif\cpp-126f25c9\src\OpenSHC`.
Its named layouts are in `S:\Projects\UCP\OpenSHC\src\OpenSHC`.
These are developer research inputs, not packaged assets or runtime dependencies.

- `Rendering/ViewportRenderState/renderMap.cpp:1009–1012` selects a zero-based
  GM1 picture using `gfxNumber - 1`.
- `Map/Units/UnitsState/setUnitValues.cpp` copies the GM1 file header's `originX`
  and `originY` into the unit. These are signed 32-bit values at offsets `0x48`
  and `0x4c`. Preserve the origin when trimming transparent margins, as the
  current native extraction already does.
- `Map/Units/UnitsState/updateUnits.cpp` derives walking pictures from direction
  and `animationSheetFrameOffset`. The first body frame belongs to this sequence.
- Idle states have separate unit-specific byte tables and sprite offsets.
  `Map/AnimationFrameData.hpp` names those tables; their base in the inspected
  executable is `0xB56AC4`. This address is research evidence for this build,
  **not a portable address to hard-code into the editor**.
- Indexed body GM1 palettes 1–8 are player colors. Palette 1 is the existing
  blue preview color; palette 0 can contain authoring magenta/cyan. Continue
  resolving the selected game's active texture overrides before extraction.

The following zero-based pictures were checked against both named idle code
and actual GM1 directories in `D:\Games\Stronghold Crusader KI-Liga`:

| Unit | GM1 source | Idle table / first value | Game picture formula | Zero-based picture |
| --- | --- | --- | --- | ---: |
| European archer | `body_archer` | `0xB57938` / 1 | `0x280 + value*4 + direction/2` | 643 at direction 0 |
| Crossbowman | `body_crossbowman` | `0xB57F68` / 8 | `0x90 + value` | 151 |
| Swordsman | `body_swordsman` | `0xB58988` / 21 | `0x141 + value` | 341 |
| Arabian archer | `body_arab_shortbow` | `0xB592E0` / 1 | `0x36C + value` | 876 |
| Slave | `body_arab_slave` | `0xB59030` / 1 | `0x100 + value` | 256 |
| Horse archer body | `body_horse_archer` | `0xB59A28` / 1 | `0x250 + value` | 592 |
| Horse archer rider | `body_horse_archer_top` | `0xB599C8` / 1 | `0x250 + value` | 592 |

See `Map/Units/UpdateCrusaderArcher.cpp:635`,
`UpdateCrossbowman.cpp:148`, `UpdateSwordsman.cpp:104`,
`UpdateArabianArcher.cpp:530`, `UpdateSlave.cpp:186` and
`UpdateHorseArcher.cpp:137`. These are static samples of idle/look-around
animations, not a claim that every pose has eight directional variants. The
horse and rider use different tables; their frame numbers coincide only at the
sampled phase. Their origins also differ (69,95 versus 68,95).

## Bounded implementation plan

1. Finish a small, source-annotated metadata registry for the remaining supported
   troop and siege types. Verify each chosen frame exists in installed classic
   assets; report missing overrides rather than substituting an unrelated frame.
2. Extract one static pose through the existing Rust GM1 decoder and active-pack
   resolver. Cache immutable PNGs and origins by graphics revision, pose and
   player palette. Ship metadata only, never game pixels.
3. Compute preview occupancy when defense AIC values or marker types/counts
   change. The requested example implies flooring: `80 / 8 / 4 = 2.5` becomes
   two drawn units per marker, with a maximum of nine. Document zero-count and
   missing-character behavior before enabling the feature.
4. Cache placement commands; integrate them with the current depth ordering,
   height lookup, spatial index and GPU texture cache. Building-step changes
   must still update marker visibility and supporting wall/tower height using
   visible geometry, without leaking future steps. Panning and zooming only
   change the view transform.
5. Benchmark the same full-size, zoomed-in castle with rapid alternating step
   positions before enabling the preview by default. Static caching avoids
   animation work, but additional draw commands are not literally free.

Definitive Edition-specific units and the remaining classic idle frames are
unverified here. No game installation or runtime process was modified.
