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
