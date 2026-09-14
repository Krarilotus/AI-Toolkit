const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const geometry = require('../src/js/castle-geometry');
const source = fs.readFileSync(require.resolve('../src/js/castle-editor.js'), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));

function setup() {
  let created = 0;
  const make = () => {
    created++;
    const node = {children: [], dataset: {}, style: {}, attributes: {}, handlers: {},
      append(...nodes) { this.children.push(...nodes); }, appendChild(node) { this.children.push(node); },
      addEventListener(type, fn) { this.handlers[type] = fn; }, setAttribute(k, v) { this.attributes[k] = v; },
      removeAttribute(k) { delete this.attributes[k]; }, focus() {}, scrollIntoView() {},
      classList: {add(key) { this[key] = true; }, remove(key) { this[key] = false; }, toggle(key, value) { this[key] = value; }}};
    Object.defineProperty(node, 'innerHTML', {set() { this.children = []; }});
    return node;
  };
  const elements = new Map(), get = id => { if (!elements.has(id)) elements.set(id, make()); return elements.get(id); };
  const doc = {frames: Array.from({length: 100}, (_, i) => ({itemType: 25, tilePositionOfsets: [i]})), miscItems: []};
  const state = {document: doc, documentRevision: 1, selected: new Set(['f:0:0']), insertionFrameIndex: 0};
  const els = Object.fromEntries(['buildList', 'buildSlider', 'buildSliderValue', 'buildCount'].map(key => [key, make()]));
  els.buildList.querySelector = () => els.buildList.children[state.insertionFrameIndex];
  const callbacks = [], selections = [];
  const context = vm.createContext({state, els, geometry,
    document: {createElement: make, getElementById: get}, window: {innerWidth: 800, innerHeight: 600},
    frames: () => doc.frames, frameRefKey: (fi, oi) => `f:${fi}:${oi}`, itemName: () => 'Wall', isUnitType: () => false,
    updatePopulationPanel() {}, updateCostPanel() {}, scheduleDraw() {}, setStatus() {},
    requestAnimationFrame: fn => callbacks.push(fn),
    selectBuildFrame: fi => { state.insertionFrameIndex = fi; state.selected = new Set([`f:${fi}:0`]); selections.push(fi); },
    selectedBuildFrameIndexes: () => [...state.selected].map(ref => Number(ref.split(':')[1])),
    frameIsLocked: fi => Boolean(doc.frames[fi].locked), mergeableTypes: () => [25], mergeSelectedSteps() {}
  });
  vm.runInContext(section('  function renderBuildList(', '  function unlockedFrameIndexes('), context);
  vm.runInContext(section('  function closeBuildContextMenu(', '  function placeSingle('), context);
  vm.runInContext(section('  function toggleFrameLock(', '  function deleteRefs('), context);
  return {context, state, els, doc, get, callbacks, selections, get created() { return created; }};
}

test('scrubbing updates existing build rows without replacing their DOM or handlers', () => {
  const h = setup(); h.context.renderBuildList();
  const rows = [...h.els.buildList.children], created = h.created;
  for (let step = 0; step < 100; step++) {
    h.context.selectBuildFrame(step); h.context.renderBuildList();
  }
  assert.equal(h.created, created);
  assert.deepEqual(h.els.buildList.children, rows);
  assert.equal(rows[99].attributes['aria-current'], 'step');
  assert.equal(rows[0].classList.selected, false);
  h.doc.frames[99].locked = true; h.context.renderBuildList();
  assert.equal(rows[99].draggable, false); assert.equal(rows[99].classList.locked, true);
  h.state.documentRevision++; h.context.renderBuildList();
  assert.notEqual(h.els.buildList.children[0], rows[0], 'document edits rebuild row content');
});

test('rapid slider input performs one update at the latest selected step', () => {
  const h = setup(); h.context.renderBuildList();
  for (let step = 1; step <= 100; step++) {
    h.els.buildSlider.value = String(step); h.context.selectBuildStepFromSlider();
  }
  assert.equal(h.callbacks.length, 1);
  h.callbacks.shift()();
  assert.deepEqual(h.selections, [99]);
  assert.equal(h.state.scrubPending, false);
});

test('right-click preserves a multi-step selection and locks/unlocks all selected positions', () => {
  const h = setup(); h.context.renderBuildList();
  h.state.selected = new Set(['f:1:0', 'f:2:0']);
  const event = {clientX: 20, clientY: 20, preventDefault() {}, stopPropagation() {}};
  h.context.openBuildContextMenu(event, 2);
  assert.equal(h.get('castleContextMerge').disabled, false);
  assert.equal(h.get('castleContextLock').textContent, 'Lock positions');
  assert.deepEqual([...h.state.selected], ['f:1:0', 'f:2:0']);
  h.get('castleContextLock').onclick();
  assert.ok(h.doc.frames[1].locked && h.doc.frames[2].locked);
  assert.equal(h.get('castleBuildContextMenu').hidden, true);
  h.context.openBuildContextMenu(event, 1);
  assert.equal(h.get('castleContextLock').textContent, 'Unlock positions');
  assert.equal(h.get('castleContextMerge').disabled, true);
  h.get('castleContextLock').onclick();
  assert.ok(!h.doc.frames[1].locked && !h.doc.frames[2].locked);
  h.context.openBuildContextMenu(event, 4);
  assert.deepEqual([...h.state.selected], ['f:4:0'], 'right-click outside selection targets only that step');
  assert.equal(h.get('castleContextMerge').disabled, true);
});
