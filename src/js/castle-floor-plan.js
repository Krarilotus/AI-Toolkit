// Colour assignment for "uniform" floor plans: every building is one flat
// colour so image editors can pick it with an eyedropper or magic wand.
// Each region keeps the average colour of its rendered sprite. Instances of a
// region step one brightness level around that colour (0, +1, -1, +2, ...), so
// a low tolerance picks one building and a higher one every building of that
// kind. Only kinds that would otherwise share the same colours are moved apart
// by TYPE_GAP levels; distinct colours are already distinct for the picker.
(function (root, factory) {
  const floorPlan = factory();
  if (typeof module === 'object' && module.exports) module.exports = floorPlan;
  else root.castleFloorPlan = floorPlan;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const TYPE_GAP = 20;
  // Nearest colours of two different kinds must differ by at least this much,
  // so a tolerance of 1 never picks both.
  const MIN_DISTANCE = 2;
  const KEEP = 61, STOCKPILE = 52;

  // Building block and forecourt plates, from assets/aiv/iso/verzeichnis.json
  // ("platten"): [dx, dy, tiles], dx to the east, dy south of the top row.
  const FORECOURTS = Object.freeze({
    86: {size: 5, plates: [[5, 0, 5], [0, 5, 5], [5, 5, 5]]}, // Mercenary Post
    87: {size: 5, plates: [[5, 0, 5], [0, 5, 5], [5, 5, 5]]}, // Barracks
    88: {size: 5, plates: [[0, 5, 5]]}, // Engineering Guild
    89: {size: 5, plates: [[0, 5, 5]]}, // Tunnelors Guild
    180: {size: 4, plates: [[0, 4, 4]]}, // Oil Smelter
  });

  const square = (left, top, size) => ({left, right: left + size - 1, top, bottom: top - size + 1});

  // Split a placement's footprint into separately coloured regions: the
  // building itself and its forecourt. The keep's courtyard includes the
  // entrance row; its attached stockpile is coloured as a stockpile.
  function regions(type, rects) {
    type = Number(type);
    if (type === KEEP) {
      const keep = rects.filter(rect => rect.part === 'keep');
      const stockpile = rects.filter(rect => rect.part === 'stockpile');
      return [
        {key: String(KEEP), rects: keep.slice(0, 1)},
        {key: `${KEEP}:forecourt`, rects: keep.slice(1)},
        ...(stockpile.length ? [{key: String(STOCKPILE), rects: stockpile}] : []),
      ];
    }
    const layout = FORECOURTS[type];
    if (!layout || rects.length !== 1) return [{key: String(type), rects}];
    const {left, top} = rects[0];
    return [
      {key: String(type), rects: [square(left, top, layout.size)]},
      {key: `${type}:forecourt`, rects: layout.plates.map(([dx, dy, size]) => square(left + dx, top - dy, size))},
    ];
  }

  // Instance index -> brightness offset: 0, +1, -1, +2, -2, ...
  const offset = index => index % 2 ? (index + 1) / 2 : 0 - index / 2;

  // The levels around `base` used by `count` instances, kept inside 0..255 by
  // moving the whole band as little as possible. Very long bands flatten the
  // colour towards its grey so every level stays distinct.
  function fitBand(base, count) {
    const length = Math.max(1, Math.min(256, count));
    const low = -Math.floor((length - 1) / 2), high = Math.ceil((length - 1) / 2);
    const mean = (base[0] + base[1] + base[2]) / 3;
    const spread = Math.max(...base) - Math.min(...base), room = 256 - length;
    const scale = spread > room ? room / spread : 1;
    let centre = base.map(value => Math.round(mean + (value - mean) * scale));
    const shift = Math.max(0, -(Math.min(...centre) + low)) - Math.max(0, Math.max(...centre) + high - 255);
    centre = centre.map(value => value + shift);
    return {centre, low, high, length};
  }

  // Largest-channel difference between the closest colours of two bands.
  function bandDistance(a, b) {
    const d = [0, 1, 2].map(c => a.centre[c] - b.centre[c]);
    // Colours differ by d + k, with k = (offset in a) - (offset in b).
    const lowest = a.low - b.high, highest = a.high - b.low;
    const ideal = -(Math.max(...d) + Math.min(...d)) / 2;
    let best = Infinity;
    for (const k of [Math.floor(ideal), Math.ceil(ideal)]) {
      const step = Math.min(highest, Math.max(lowest, k));
      best = Math.min(best, Math.max(...d.map(value => Math.abs(value + step))));
    }
    return best;
  }

  const moved = (band, shift) => ({...band, centre: band.centre.map(value => value + shift)});

  // groups: [{key, base: [r, g, b], count, area}] -> Map(key -> index => [r, g, b]).
  // Groups covering more tiles keep their own colour first, so the keep wins
  // over a pair of small huts that look alike; a later group only moves when
  // it would share colours with one already placed, preferring whole gaps of
  // TYPE_GAP levels around its own colour.
  function assignColours(groups, gap = TYPE_GAP) {
    const placed = [], colours = new Map();
    const ordered = [...groups].sort((a, b) => (b.area ?? b.count) - (a.area ?? a.count) || b.count - a.count || String(a.key).localeCompare(String(b.key)));
    for (const group of ordered) {
      const band = fitBand(group.base, group.count);
      const lowest = -(Math.min(...band.centre) + band.low), highest = 255 - (Math.max(...band.centre) + band.high);
      const shifts = [0];
      for (let step = gap; step <= 255; step += gap) shifts.push(step, -step);
      for (let step = 1; step <= 255; step++) if (step % gap) shifts.push(step, -step);
      let chosen = 0, chosenDistance = -1;
      for (const shift of shifts) {
        if (shift < lowest || shift > highest) continue;
        const distance = Math.min(Infinity, ...placed.map(other => bandDistance(moved(band, shift), other)));
        if (distance > chosenDistance) { chosen = shift; chosenDistance = distance; }
        if (distance >= MIN_DISTANCE) break;
      }
      const final = moved(band, chosen);
      placed.push(final);
      colours.set(String(group.key), index => final.centre.map(value => value + offset(index % final.length)));
    }
    return colours;
  }

  return {TYPE_GAP, MIN_DISTANCE, FORECOURTS, regions, offset, assignColours, bandDistance, fitBand};
});
