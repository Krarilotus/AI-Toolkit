# Flood fill pipeline

All three editor tools (bucket placement, connected selection and connected deletion)
use `castleGeometry.floodRegion`. `floodTiles` is a coordinate-output adapter;
`floodPlacementRefs` supplies footprint membership, lock barriers and a reference visitor.
There is no 4,000-tile cap. Selection includes locked objects and the Keep; deletion
preserves them. Diagonal connectivity is unchanged.

The core is iterative, with a byte visited map and integer stack: 50 KB of scratch
space on the 100x100 grid, each predicate evaluated at most once per cell. Region
work is O(grid area + reached cells), including array initialization, with O(grid
area) scratch. Four/eight connectivity, rectangular dimensions, visitors and an
optional explicit traversal limit are supported; editor tools traverse full regions.

The bucket previously called whole-document hit testing for every flood neighbour,
then rebuilt/scanned all pending placements for each accepted tile. An empty 4,000
cell fill performed about 8 million footprint calculations. Operation-local tile
indexes now shortlist both existing and pending placements for the same collision
validator used by ordinary placement. No status updates or repaint requests are
issued per tile; the operation commits once and retains normal undo semantics.

For multi-tile buildings, a greedy boundary-contact score orders candidate anchors.
Integer score buckets avoid comparison sorting; row order breaks ties. All anchors
are considered rather than imposing a grid phase from the clicked tile. Actual
footprints and normal overlap/lock/quantity rules decide acceptance. For a fixed
building footprint, ordering and placement are linear in the bounded grid plus
candidate count and local collision candidates; heavily overlapping imported
placements can add collision work. This is not an optimal packing solver.

Algorithm reference: [Lode Vandevenne's flood-fill tutorial](https://lodev.org/cgtutor/floodfill.html).
Scanline filling reduces stack traffic for broad regions, but does not remove
quadratic hit testing or placement validation. The typed iterative core preserves
single-tile visitation behavior, supports eight-way connectivity directly and avoids
recursive depth limits. Touching N output tiles necessarily requires O(N) work;
parallel propagation rounds are not the total amount of work.

## Measurements

Same VM harness, same full bucket/validation functions, 4,000 outputs:

| Existing placements | Before | Indexed batch | Footprint calls before / after |
|---|---:|---:|---:|
| 0 | 1,933 ms | 10.2 ms | 8,006,000 / 16,000 |
| 1,000 | 6,397 ms | 13.2 ms | 21,013,543 / 17,000 |

The old traversal cap was lifted in the comparison harness for full-region testing:
10,000 empty-map outputs took 11,348 ms before versus 28 ms after; 9,000 free tiles
with 1,000 existing placements took 14,688 ms versus 28 ms. These timings exclude
rendering and are single runs, not cross-machine performance guarantees.

Real Electron, both views mounted, full empty-map moat fill: 10,000 placements in
31.8 ms, 248.3 ms including two animation frames and scene updates. Connected
selection took 19.3 ms, deletion 34.1 ms; zero placements remained and no renderer
errors were reported. These whole-tool times include document/UI bookkeeping;
they are not timings of only the flood traversal.

Profiling the post-fill update revealed that completed bucket offsets were still
returned as a live placement preview. The 2.5D view drew all 10,000 preview tiles
over the committed scene. Preview output now requires an active brush/line gesture.
Removing that duplicate reduced the same measured two-frame interval from about
244 ms to 216 ms (single profiled runs). The interval is not a GPU completion
measurement. Remaining sampled work includes 2.5D scene/selection preparation,
2D command recording and worker transfer, and garbage collection; it is not
flood traversal time.

## Lossless 2D scene transport

Scene recording now reuses one command recorder and its method functions. CSS
colors are resolved once per scene preparation instead of per placement. Each
preparation owns its color cache; subsequent scene preparations read fresh values.

Commands use a transferable Float64 tape, shared operation/value tables and
per-placement ranges for normal, selected and outline drawing. The worker retains
the tape for subsequent step changes. This replaces structured cloning of thousands
of nested command arrays, preserving Canvas call order, double-precision coordinates,
styles, image sources and resolution. It does not compress or resize images.
Tests compare the replay with the original drawing calls and cover tape growth,
buffer transfer, fractional coordinates, Unicode text, image arguments and all
three placement variants. Cancellation still releases abandoned scene bitmaps.

Five full 10,000-tile moat fills, both views mounted in an isolated 2048x1152
hardware-accelerated Electron offscreen window (baseline snapshot-0099d43):

| Measurement | Before, median (range) | After, median (range) |
|---|---:|---:|
| Main-thread scene postMessage | 33.7 ms (30.1–42.3) | 7.7 ms (5.4–8.8) |
| Fill start to 2D worker acknowledgement | 503.5 ms (302.9–1560) | 268.2 ms (229.7–299.9) |

Each run reset the document; both versions ran sequentially on the same machine.
The acknowledgement includes scene preparation, scheduling and worker execution,
but is not a GPU presentation fence or visible-window latency measurement. These
five-run results show reduced transfer work, not a guarantee for all maps or a
10 ms total-update claim. Dense 2.5D scene composition and selection painting remain
separate costs; further changes there need their own visual/correctness checks.

## Split-view resizing

Both worker canvases use their intrinsic buffer dimensions with one uniform DPR
scale. They no longer stretch the previous image to 100% of a changing host while
a resized frame is pending. The 2.5D interaction canvas also uses explicit CSS
pixel dimensions matching its buffer. Panning and panel resizing preserve zoom;
this changes presentation sizing, not scene quality or terrain cache invalidation.

Verification: 494 tests pass. Real Electron with Reconquista_Trail_1 terrain and
Kratoloros.aiv completed 12 alternating 25%/75% split resizes plus horizontal pans
at each of 100% and 200% display scaling. Each run sampled 144 canvas bounds across
immediate, next-frame and settled states: horizontal/vertical scale ratios matched,
2D cell size and 2.5D zoom remained unchanged, and no renderer errors occurred.
