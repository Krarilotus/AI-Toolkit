const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('a castle edit queued after a hover invalidates the cached scene', () => {
  const source = fs.readFileSync(require.resolve('../src/js/castle-editor.js'), 'utf8');
  const start = source.indexOf('  function scheduleDraw(');
  const end = source.indexOf('  function updateBlueprintControls(', start);
  const frames = [], changes = [];
  let analyses = 0;
  const context = vm.createContext({state: {}, draw() {}, getAnalysisOverlay() { analyses++; },
    requestAnimationFrame: callback => frames.push(callback),
    changeListeners: new Set([changed => changes.push(changed)])});
  vm.runInContext(source.slice(start, end), context);
  context.scheduleDraw(false);
  context.scheduleDraw(true);
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.deepEqual(changes, [true]);
  context.scheduleDraw(false);
  frames.shift()();
  assert.deepEqual(changes, [true, false]);
  assert.equal(analyses, 1, "Hover must not recalculate overlays");
});

test('an immediate scrub consumes the pending repaint without painting twice', () => {
  const source = fs.readFileSync(require.resolve('../src/js/castle-editor.js'), 'utf8');
  const start = source.indexOf('  function scheduleDraw(');
  const end = source.indexOf('  function updateBlueprintControls(', start);
  const frames = [], changes = [];
  let draws = 0;
  const context = vm.createContext({state: {}, draw() {draws++;}, getAnalysisOverlay() {},
    requestAnimationFrame: callback => frames.push(callback),
    changeListeners: new Set([changed => changes.push(changed)])});
  vm.runInContext(source.slice(start, end), context);
  context.scheduleDraw(false);
  context.scheduleDraw(true, true);
  assert.equal(draws, 1);
  frames.shift()();
  assert.equal(draws, 1, 'the previously queued callback must not repaint the same scene');
  assert.deepEqual(changes, [true]);
});
