# Isometric build-step command cache (Phases 1 and 2)

Base: `c9c345b`. Branch: `perf/iso-scrub-commands`.

Terrain draw commands are recorded and frozen when `paintMapTiles` builds the
terrain. A 256-pixel spatial grid retains their painter-order indices. A damaged
rectangle retrieves only intersecting terrain commands; a stable linear merge
interleaves them with sorted building draws. Exact ties retain terrain-first
ordering, matching the previous stable sort. The scene and fire mask share the
same selected commands when their damage bounds match.

The recorder, rectangle intersection, grid iteration and merge each have one
implementation. Command shapes and merge boundaries have JSDoc types. There is
no new dependency, history cache, renderer setting or invalidation contract.
Building variants still use the currently visible neighbours. Phases 3 and later,
2D caching, panels and the slider notification chain are unchanged.

## Measurements

Measured on GamerGrill with Electron, hardware acceleration enabled. Chromium
reported `2d_canvas`, `gpu_compositing` and `rasterization` enabled. The hidden
window used the docked 2.5D layout, Kratoloros AIV and the existing native
`toolkit-diagnostic.map` atlas fixture. This is a real loaded map, not a synthetic
terrain count; it is not claimed to be the separate GreekSea file.

The harness dispatches the real slider's input events for steps 450 through 549,
waiting four animation frames between inputs. There are 99 changed-step scene
paints (the first input retains the starting step). CDP CPU and sampling heap
profilers run during this sequence; heap sampling includes collected objects and
uses a 16 KiB interval. These are allocation estimates over the sequence, not
retained heap size. Timings include profiling overhead and are not an FPS claim.

| Measurement | Before | After |
| --- | ---: | ---: |
| Scenery objects | 20,757 | 20,757 |
| Terrain draw commands | 21,720 | 21,720 |
| Mean paintScene | 23.92 ms | 13.92 ms |
| Median paintScene | 23.50 ms | 14.00 ms |
| p95 paintScene | 30.40 ms | 18.40 ms |
| Sampled allocation attributed directly to iso-view.js | 823,876,056 bytes | 308,927,372 bytes |
| Sampled allocation, entire renderer | 2,730,351,068 bytes | 1,935,519,464 bytes |
| Mean input plus four-frame wait | 100.41 ms | 90.89 ms |

The terrain count is measured, not inferred from the world extent. The 2D canvas
had **one client rectangle**, with `display: block`, throughout this docked
configuration: its draw guard does not skip it. This measurement does not establish
visibility in every detached-window layout or in a user's separate live session.

Raw before/after CPU and allocation profiles, the harness and test logs are kept
outside the repository in `ai-toolkit-setup/iso-scrub-evidence.zip`. No private map,
AIV or game executable is added to the repository. An initial harness run with a
mismatched map/atlas path produced zero scenery and was rejected; the reported
runs assert nonzero native scenery and use the matching map and atlas.

## Verification

Four added regressions check:

- Terrain command and index identity across consecutive scrubs, with frozen commands.
- Merge equivalence to the previous full stable sort, including exact ties.
- Spatial-query equivalence to a full intersection scan, including negative
  coordinates, cell boundaries and large sprites spanning multiple cells.
- Rebuilding and clearing terrain replace the cache and index.

Existing forward/backward pixel-equivalence, neighbour-dependent sprite changes,
fire-mask occlusion and enabling-fire-without-scene-damage checks pass. All eight
requested suites were included in the complete run.

`npm run check` on GamerGrill: syntax passed; **425 passed, 2 failed**. Running
unchanged `c9c345b` on the same machine gives **421 passed, the same 2 failures**:

- `der Grund liegt unter der Burg...` requires more than 3,000 installed-map
  cases; this machine has 1,944. No checked coordinate mismatch occurred.
- `Kakteen holen ihr Bild...` requires more than 60,000 installed cacti; this
  machine has 47,659. The assertion fails on fixture count.

No upstream assertions or game files were modified. With only these two known
fixture-count tests excluded, the final run passes **425/425**, zero failures:

```powershell
node scripts/check-syntax.js
node --test '--test-skip-pattern=^(der Grund liegt unter der Burg|Kakteen holen ihr Bild)' tests/*.test.js
```

The handover's 413-pass/10-skip result is from a different fixture environment;
GamerGrill discovers a game installation and executes the native tests. The full
unfiltered suite therefore cannot honestly be described as green on this host.

No PR was opened, no branch was merged, and the installed application was not
changed. The earlier UI-polish edits remain preserved in the named Git stash.

## Follow-up: live drag checks, 20 September 2026

The follow-up keeps the terrain command index and visible-neighbour rules. It
caches document geometry before prefix filtering, keeps loaded building sprites
from invalidating terrain, separates distant dirty regions, consumes queued
repaints when a scrub paints immediately, and ignores repeated inputs at the
same step. Population/cost summaries settle after 150 ms instead of competing
with every slider update. Production cycle settings are computed once per worker
per estimate. Redundant 2D clears and explicit isometric refresh requests were
removed. Held arrows advance 1 step, then 3 after one second and 5 after two.

On GreekSea / Kratoloros, the measured scenery count is **21,717** and the 2D
canvas has one client rectangle. With both views docked, a 90-input drag advancing
8 steps per animation frame measured **39.63 ms mean / 102.70 ms p95 / 269.40 ms
maximum** between callbacks. The same earlier workload before this follow-up
measured 124.38 / 306.20 / 438.80 ms. These are diagnostic frame intervals, not a
claim of end-to-end input latency below 10 ms. Large jumps still need more work.

A real Electron check compared incremental and complete rendering at steps
1, 150, 400, 402, 800, 200 and 998. Six comparisons were identical; the first
had only one-channel-unit rounding differences (18 channel values). The held-key
check advanced from 100 to 109 through 1, 3 and 5 step increments.
`npm run check`: **431 passed, 0 failed, 10 skipped** on this host.

Two experiments were rejected: worker bitmap transfers and a multi-rectangle
union clip. Both added overhead in the actual drag workload. Neither ships.
Per-region redraws can replay a sprite crossing separate clipped areas; these
are distinct pixel regions, not duplicate full-scene paints. Consolidating those
calls without measuring made the renderer slower.

The same follow-up fixes physical ASAR receipt hashing under Electron and turns
off native helper cursor clipping/edge scrolling. The intermittent cursor issue
was not reproduced under instrumentation, so that configuration change is a
mitigation, not proof of complete resolution. No native helper is launched by
the local performance harness; it uses the previously captured map data.

## Retained worker rendering snapshot

The native-map 2.5D scene now uses a worker-owned WebGL canvas. Terrain commands,
textures and sprite objects are retained; scrubbing sends visible building IDs,
not a newly rasterized whole-scene bitmap. The 2D view records the existing
placement drawing functions and replays those commands on a worker-owned canvas.
Neither path caches complete build steps. Both keep only the latest pending frame.
Interaction and analysis overlays stay on the existing foreground canvas.

The build list updates visible rows during scrubbing and avoids forced layout
reads after DOM writes. Scene assets invalidate on document, camera, skin and
asset changes, not on every slider input. Canvas fallbacks remain for unsupported
workers/WebGL and for the isometric fire overlay. These fallbacks are intentional;
fire-overlay performance is still a follow-up, not covered by the speed claim.

Validation: 437 tests pass, 10 skipped, no failures. Worker tests cover latest-only
queues, identity reuse, revision resets and disposal. Real Electron comparisons
of the 2D worker and original Canvas rendering at steps 1, 101, 400, 901 and 998
found no channel differences greater than one, including names and fractional
camera positions. GPU geometry/occlusion was checked visually.

Representative manual observation uses a maximized 2560 x 1392 viewport, native
isometric zoom and both views visible, with five synthetic back-and-forth sweeps
per second. Earlier small-window timings are not representative of this setup.
The installed baseline repeatedly stalls for hundreds of milliseconds; the new
path is visibly improved, but sub-10 ms end-to-end input latency is not established.
The snapshot is released for hands-on updater and responsiveness testing before
calling the performance work complete.

Packaging includes only the Pixi browser bundles and license, not its development
package tree. Electron locales retain the nine UCP languages. Window normal bounds
and maximized state are now persisted for subsequent launches.

## Interaction follow-up: units and deferred analysis

Unit sprites and number/stack markers now share the 2D worker scene with the
castle, avoiding independent main-thread camera updates. When settled analysis
must sit behind units, foreground ownership moves to the overlay canvas instead
of painting duplicate units in both layers. Moving-unit previews stay interactive.

Slider input and 2D camera changes suppress analysis until 180 ms of inactivity.
Pending results are invalidated immediately; the selected position is then
recomputed using the existing analysis worker. The 2.5D scene uses its WebGL path
while scrubbing even with fire checked, and builds the fire mask only after
settling. This deliberately prioritizes input over live analysis visualization.

Validation: 445 tests passed, 10 skipped. A maximized real Electron comparison
at steps 1, 101, 400, 901 and 998 matched the original 2D output pixel-for-pixel.
Focused tests cover unit/marker order, foreground ownership, deferred analysis,
stale-request rejection and the GPU fire-disabled path during scrubbing.
