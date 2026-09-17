const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/js/iso-view.js'), 'utf8');

function raster(size) {
  const pixels = new Uint8Array(size * size), stack = [];
  let clip = {x: 0, y: 0, w: size, h: size}, path;
  const ctx = {pixels, draws: 0, cleared: 0,
    save() { stack.push({...clip}); }, restore() { clip = stack.pop(); },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
    rect(x, y, w, h) { path = {x, y, w, h}; }, clip() { clip = path; },
    clearRect(x, y, w, h) { this.cleared += w * h; fill(0, x, y, w, h); },
    drawImage(image, ...args) { this.draws++; fill(this.globalCompositeOperation === 'destination-out' ? 0 : image.color, ...args.slice(-4)); }
  };
  function fill(color, x, y, w, h) {
    for (let py = Math.max(0, clip.y, y); py < Math.min(size, clip.y + clip.h, y + h); py++)
      for (let px = Math.max(0, clip.x, x); px < Math.min(size, clip.x + clip.w, x + w); px++) pixels[py * size + px] = color;
  }
  return ctx;
}

function scene(fire = false) {
  const size = 100, ctx = raster(size), terrainImage = {color: 1}, frontImage = {color: 9};
  const images = [{color: 2}, {color: 3}];
  let items = [], terrainBuilds = 0;
  const state = {view: {zoom: 1, panX: 0, panY: 0}, catalogue: {}};
  const mask = raster(size);
  const context = vm.createContext({state, document: {getElementById: () => ({checked: fire}), createElement: () => ({width: 0, height: 0, getContext: () => mask})}, window: {castleGameData: {flammability: {Hovel: 1}}, castleCostData: {buildings: {54: {balance: 'Hovel'}}}, castleEditor: {getActiveBuildStep: () => 1}},
    currentDocument: () => null, turnedTiles: value => value,
    geo: {GRID: 100, collectItems: () => items, attachDrawbridges: value => value,
      collectPlates: () => [], wallLookup: value => value.length, hoehenLookup: () => null,
      buildingParts: () => null, isoPoint: (x, y) => [x, y],
      renderOrder: (a, b) => a.gy - b.gy || a.gx - b.gx || (a.layer ?? 2) - (b.layer ?? 2)},
    paintMapTiles() {
      terrainBuilds++;
      state.mapScenery = [];
      for (let gy = 0; gy < size; gy++) for (let gx = 0; gx < size; gx++)
        state.mapScenery.push({gx, gy, layer: 0, draw: target => target.drawImage(terrainImage, gx, gy, 1, 1)});
      // Foreground scenery must stay interleaved, not become a flat backdrop.
      state.mapScenery.push({gx: 53, gy: 53, layer: 3, draw: target => target.drawImage(frontImage, 49, 48, 6, 6)});
      return true;
    },
    drawSprite(target, entry, gx, gy, tiles, walls) {
      // Mimic a retained wall changing its sprite when a neighbouring step appears.
      target.drawImage(images[walls > 1 ? 1 : 0], gx, gy - 5, tiles, 6); return true;
    }
  });
  vm.runInContext(source.slice(source.indexOf('  function paintScene('), source.indexOf('  function paintInteraction(')), context);
  return {ctx, mask, state, context, get terrainBuilds() { return terrainBuilds; },
    render(nextItems, previousCommands = null, reuseTerrain = false, previousFireMask = null) {
      items = nextItems; return context.paintScene(ctx, size, size, {previousCommands, reuseTerrain, previousFireMask});
    }};
}

test('incremental forward/backward steps are pixel-identical to full depth-ordered rendering', t => {
  const incremental = scene();
  const item = (gx, gy) => ({gx, gy, entry: {}, tiles: 4});
  const first = item(50, 50), second = item(52, 52), distant = item(10, 15);
  let previous = incremental.render([first]);
  const fullDraws = incremental.ctx.draws;
  let nearbyDraws;
  for (const items of [[first, second], [first], [first, distant], [], [first, second], [second, first]]) {
    const startDraws = incremental.ctx.draws;
    previous = incremental.render(items, previous.commands, true);
    if (nearbyDraws == null) nearbyDraws = incremental.ctx.draws - startDraws;
    const full = scene(); full.render(items);
    assert.deepEqual(incremental.ctx.pixels, full.ctx.pixels, 'partial repaint must match a fresh frame');
  }
  assert.equal(incremental.terrainBuilds, 1, 'terrain is prepared once across all build steps');
  assert.ok(nearbyDraws < fullDraws / 20, `${nearbyDraws} vs ${fullDraws} draws`);
  t.diagnostic(`Synthetic 10,000-tile scene: nearby step used ${nearbyDraws} image draws vs ${fullDraws} for a full repaint.`);
});

test('damage includes disappearing sprites and uses a full redraw for changed occlusion order', () => {
  const {context} = scene(), command = (key, x) => ({key, x, y: 10, w: 10, h: 10});
  const a = command('a', 10), b = command('b', 70);
  assert.equal(context.sceneDamage([a], [a], 100, 100), null);
  const removed = context.sceneDamage([a, b], [a], 100, 100);
  assert.equal(removed.x, 68); assert.equal(removed.w, 14);
  const reordered = context.sceneDamage([a, b], [b, a], 100, 100);
  assert.equal(reordered.w, 100); assert.equal(reordered.h, 100);
  const duplicate = context.sceneDamage([a], [a, a], 100, 100);
  assert.equal(duplicate.x, 8); assert.equal(duplicate.w, 14);
});

test('step notifications avoid document cloning and serialization until an edit changes its revision', () => {
  let revision = 1, step = 0, clones = 0;
  const refreshes = [], state = {};
  const context = vm.createContext({state, document: {getElementById: () => ({checked: fire}), createElement: () => ({width: 0, height: 0, getContext: () => mask})}, window: {castleGameData: {flammability: {Hovel: 1}}, castleCostData: {buildings: {54: {balance: 'Hovel'}}}, castleEditor: {hasDocument: () => true,
    getDocument: () => { clones++; return {frames: []}; }, getDocumentRevision: () => revision,
    getActiveBuildStep: () => step}}, refresh: (...args) => refreshes.push(args)});
  vm.runInContext(source.slice(source.indexOf('  function currentDocument('), source.indexOf('  // The ground under')), context);
  vm.runInContext(source.slice(source.indexOf('  function editorChanged('), source.indexOf('  function init()')), context);
  const first = context.currentDocument();
  for (step = 0; step < 100; step++) { context.editorChanged(true); assert.equal(context.currentDocument(), first); }
  assert.equal(clones, 1);
  revision++; context.editorChanged(true);
  assert.notEqual(context.currentDocument(), first); assert.equal(clones, 2);
  assert.ok(refreshes.every(args => args[1] === true), 'step/edit notifications keep the terrain cache');
});


test('fire mask stays depth-correct during forward/backward partial redraws and enabling fire', () => {
  const incremental = scene(true), first = {itemType:54,gx:50,gy:50,entry:{},tiles:4};
  const second = {itemType:54,gx:52,gy:52,entry:{},tiles:4};
  let previous = incremental.render([first]);
  for (const items of [[first,second],[first],[],[second]]) {
    previous = incremental.render(items, previous.commands, true, previous.fireMask);
    const full = scene(true); full.render(items);
    assert.deepEqual(incremental.mask.pixels, full.mask.pixels, 'incremental mask must match a full rebuild');
    assert.equal(incremental.mask.pixels[50*100+52],0,'foreground terrain masks the burnable building');
  }
  const enabled = scene(true);
  const withoutMask = enabled.render([first]);
  enabled.mask.pixels.fill(0);
  enabled.render([first],withoutMask.commands,true,null);
  assert.ok(enabled.mask.pixels.some(value=>value>0),'newly enabled mask is built even with no scene damage');
});
