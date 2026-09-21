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
