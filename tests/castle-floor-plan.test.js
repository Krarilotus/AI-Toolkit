const test = require('node:test');
const assert = require('node:assert/strict');
const {assignColours, bandDistance, fitBand, TYPE_GAP} = require('../src/js/castle-floor-plan.js');

const distance = (a, b) => Math.max(...a.map((value, c) => Math.abs(value - b[c])));

test('instances of one type step by a single brightness level from the base colour', () => {
  const colours = assignColours([{type: 32, base: [120, 90, 60], count: 3}]);
  const pick = colours.get(32);
  assert.deepEqual([pick(0), pick(1), pick(2)], [[119, 89, 59], [120, 90, 60], [121, 91, 61]]);
});

test('different types keep at least the type gap even when their sprites look alike', () => {
  const groups = [
    {type: 1, base: [120, 90, 60], count: 4},
    {type: 2, base: [122, 91, 61], count: 3},
    {type: 3, base: [118, 92, 58], count: 1},
  ];
  const colours = assignColours(groups);
  const all = groups.map(group => Array.from({length: group.count}, (_, i) => colours.get(group.type)(i)));
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++)
    for (const first of all[a]) for (const second of all[b]) assert.ok(distance(first, second) >= TYPE_GAP);
  for (const colour of all.flat()) for (const value of colour) assert.ok(value >= 0 && value <= 255);
});

test('bands stay inside the byte range and every instance colour is distinct', () => {
  const band = fitBand([250, 10, 128], 200);
  assert.ok(Math.min(...band.start) >= 0 && Math.max(...band.start) + band.length - 1 <= 255);
  const pick = assignColours([{type: 9, base: [250, 10, 128], count: 200}]).get(9);
  assert.equal(new Set(Array.from({length: 200}, (_, i) => pick(i).join())).size, 200);
});

test('band distance measures the closest pair of colours between two bands', () => {
  assert.equal(bandDistance({start: [0, 0, 0], length: 5}, {start: [10, 10, 10], length: 1}), 6);
  assert.equal(bandDistance({start: [0, 0, 0], length: 1}, {start: [0, 30, 0], length: 1}), 30);
});
