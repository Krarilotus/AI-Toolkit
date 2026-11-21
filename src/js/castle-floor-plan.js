// Colour assignment for "uniform" floor plans: every building is one flat
// colour so image editors can pick it with an eyedropper or magic wand.
// Instances of one building type step by a single brightness level from the
// type's base colour, so a low tolerance selects one building and a higher one
// selects every building of that type. Different types keep at least TYPE_GAP
// levels (largest channel difference) apart so they never get selected together.
(function (root, factory) {
  const floorPlan = factory();
  if (typeof module === 'object' && module.exports) module.exports = floorPlan;
  else root.castleFloorPlan = floorPlan;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const TYPE_GAP = 20;

  // A band runs from `start` to start + (length - 1) on every channel. Returns
  // the largest-channel difference between the closest colours of two bands.
  function bandDistance(a, b) {
    const d = [0, 1, 2].map(c => a.start[c] - b.start[c]);
    // Colour difference for instances i, j is d + k with k = i - j.
    const low = -(b.length - 1), high = a.length - 1;
    const ideal = -(Math.max(...d) + Math.min(...d)) / 2;
    let best = Infinity;
    for (const k of [Math.floor(ideal), Math.ceil(ideal), low, high]) {
      const step = Math.min(high, Math.max(low, k));
      best = Math.min(best, Math.max(...d.map(value => Math.abs(value + step))));
    }
    return best;
  }

  // Fit a band of `length` brightness levels around the base colour. Very long
  // bands flatten the colour towards its grey so every level stays distinct.
  function fitBand(base, length) {
    length = Math.max(1, Math.min(256, length));
    const mean = (base[0] + base[1] + base[2]) / 3;
    const spread = Math.max(...base) - Math.min(...base), room = 256 - length;
    const scale = spread > room ? room / spread : 1;
    let start = base.map(value => Math.round(mean + (value - mean) * scale - (length - 1) / 2));
    const shift = Math.max(0, -Math.min(...start)) - Math.max(0, Math.max(...start) + length - 1 - 255);
    start = start.map(value => value + shift);
    return { start, length };
  }

  // groups: [{type, base: [r, g, b], count}] -> Map(type -> index => [r, g, b]).
  // Types with more instances claim their natural brightness first.
  function assignColours(groups, gap = TYPE_GAP) {
    const placed = [], colours = new Map();
    const ordered = [...groups].sort((a, b) => b.count - a.count || Number(a.type) - Number(b.type));
    for (const group of ordered) {
      const band = fitBand(group.base, group.count);
      const lowest = -Math.min(...band.start), highest = 255 - (Math.max(...band.start) + band.length - 1);
      let chosen = 0, chosenDistance = -1;
      for (let step = 0; step <= 255; step++) {
        for (const shift of step ? [step, -step] : [0]) {
          if (shift < lowest || shift > highest) continue;
          const candidate = { start: band.start.map(value => value + shift), length: band.length };
          const distance = Math.min(Infinity, ...placed.map(other => bandDistance(candidate, other)));
          if (distance > chosenDistance) { chosen = shift; chosenDistance = distance; }
          if (distance >= gap) break;
        }
        if (chosenDistance >= gap) break;
      }
      const final = { start: band.start.map(value => value + chosen), length: band.length };
      placed.push(final);
      colours.set(group.type, index => final.start.map(value => value + (index % final.length)));
    }
    return colours;
  }

  return { TYPE_GAP, assignColours, bandDistance, fitBand };
});
