'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/js/castle-editor.js'), 'utf8');

test('resizing the 2D viewport preserves its camera instead of recentering or clamping', () => {
  const start = source.indexOf('  function resizeCanvas()');
  const end = source.indexOf('  function invalidatePlacementCache()', start);
  let rect = {width: 500, height: 600}, draws = 0;
  const state = {centeredOnce: true, panX: -123.25, panY: 72.5, cell: 8};
  const context = vm.createContext({
    state, GRID: 100, MAX_RENDER_DPR: 1.5,
    window: {devicePixelRatio: 1.25},
    els: {host: {getBoundingClientRect: () => rect}, canvas: {style: {}}},
    staticCacheCanvas: {}, futureCacheCanvas: {},
    displayCtx: {setTransform() {}}, staticCacheCtx: {setTransform() {}}, futureCacheCtx: {setTransform() {}},
    scheduleDraw() { draws++; }
  });
  vm.runInContext(source.slice(start, end), context);
  for (const size of [[1200, 1000], [250, 300], [900, 500], [500, 600]]) {
    rect = {width: size[0], height: size[1]};
    context.resizeCanvas();
    assert.deepEqual([state.panX, state.panY, state.cell], [-123.25, 72.5, 8]);
    assert.equal(context.els.canvas.width, Math.floor(rect.width * 1.25));
    assert.equal(context.els.canvas.height, Math.floor(rect.height * 1.25));
  }
  assert.equal(draws, 4);
});

test('2.5D uses a constant device scale even when buffer dimensions round down', () => {
  const iso = fs.readFileSync(require('node:path').join(__dirname, '../src/js/iso-view.js'), 'utf8');
  const start = iso.indexOf('  function surface()');
  const end = iso.indexOf('  // Compose at native scale', start);
  let width = 583;
  const canvas = {style: {}, getContext: () => ({setTransform() {}})};
  const context = vm.createContext({MAX_RENDER_DPR: 1.5, state: {host: {
    canvas, win: {devicePixelRatio: 1.25},
    box: {getBoundingClientRect: () => ({width, height: 971})}
  }}});
  vm.runInContext(iso.slice(start, end), context);
  for (width of [583, 1093, 364]) {
    const target = context.surface();
    assert.equal(target.dpr, 1.25, 'scale must not be inferred from rounded buffer width');
    assert.equal(canvas.width, Math.floor(width * 1.25));
    assert.equal(canvas.style.width, width + 'px');
  }
});
