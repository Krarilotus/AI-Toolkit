const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/js/castle-editor.js'), 'utf8');
const html = fs.readFileSync(require.resolve('../src/index.html'), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));

function editor(store = new Map()) {
  const state = {itemTools: Object.create(null), selected: new Set(), currentItemType: null};
  const context = vm.createContext({state, ITEM_TOOL_STORAGE_KEY: 'itemTools',
    localStorage: {getItem: key => store.get(key), setItem: (key, value) => store.set(key, value)},
    document: {getElementById: () => ({}), querySelectorAll: () => []}, els: {canvas: {classList: {toggle() {}}}},
    isLineSequence: type => type === 10001, isWallType: type => Number(type) === 25,
    updateToolAvailability() {}, updateBrushSizeUI() {}, updateSelectedItemInfo() {}, renderPalette() {},
    renderBuildList() {}, setStatus() {}, scheduleDraw() {}, toolLabel: tool => tool, itemName: type => String(type)});
  vm.runInContext(section('  function isPlacementTool(', '  // Was man ohne'), context);
  vm.runInContext(section('  function loadItemTools(', '  function normalizeShortcutKey('), context);
  vm.runInContext(section('  function selectItem(', '  function updateSelectedItemInfo('), context);
  context.loadItemTools();
  return {context, state, store};
}

test('placement tools are remembered independently for each item and across restarts', () => {
  const h = editor();
  h.context.selectItem(25); assert.equal(h.state.tool, 'line');
  h.context.setTool('brush');
  h.context.selectItem(54); assert.equal(h.state.tool, 'single');
  h.context.setTool('line');
  h.context.selectItem(25); assert.equal(h.state.tool, 'brush');
  h.context.selectItem(54); assert.equal(h.state.tool, 'line');
  h.context.setTool('delete'); h.context.setTool('select'); h.context.setTool('copy');
  h.context.selectItem(54); assert.equal(h.state.tool, 'line', 'editing modes do not replace placement preferences');
  const reopened = editor(h.store);
  reopened.context.selectItem(25); assert.equal(reopened.state.tool, 'brush');
  reopened.context.selectItem(54); assert.equal(reopened.state.tool, 'line');
  reopened.context.selectItem(99); reopened.context.setTool('bucket');
  reopened.context.selectItem(54); reopened.context.selectItem(99);
  assert.equal(reopened.state.tool, 'bucket');
});

test('tool preferences reject corrupt data and preserve line-only item constraints', () => {
  for (const value of ['null', '[]', '{broken', '{"__proto__":"brush","54":"delete","25":"brush"}']) {
    const h = editor(new Map([['itemTools', value]]));
    h.context.selectItem(54); assert.equal(h.state.tool, 'single');
    assert.equal(Object.hasOwn(h.state.itemTools, '__proto__'), false);
  }
  const h = editor(new Map([['itemTools', '{"10001":"brush"}']]));
  h.context.selectItem(10001); assert.equal(h.state.tool, 'line');
  h.context.setTool('single'); assert.equal(h.state.tool, 'line');
  h.context.localStorage.setItem = () => { throw new Error('Unavailable'); };
  h.context.selectItem(54); h.context.setTool('brush');
  h.context.selectItem(25); h.context.selectItem(54);
  assert.equal(h.state.tool, 'brush', 'in-memory preferences work without localStorage');
});

test('toolbar groups expose New and all existing overlay controls without duplicate shortcuts or Save As buttons', () => {
  assert.equal((html.match(/id="castleNewBtn"/g) || []).length, 1);
  assert.doesNotMatch(html, /id="castleSaveAsBtn"/);
  assert.doesNotMatch(source, /getElementById\('castleSaveAsBtn'\)/);
  const extras = fs.readFileSync(require.resolve('../src/js/editor-extras.js'), 'utf8');
  assert.doesNotMatch(extras, /castleShortcutsBtn/);
  assert.match(source, /showShortcutDialog,/);
  assert.match(source, /saveAs,/);
  const overlays = html.slice(html.indexOf('id="castleOverlayMenu"'), html.indexOf('</details>', html.indexOf('id="castleOverlayMenu"')));
  for (const id of ['castleShowNames', 'castleShowUnitNumbers', 'castleShowCompatibility', 'castleShowRoutes', 'castleShowFire']) {
    assert.ok(overlays.includes(`id="${id}"`), id);
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  }
  const deletion = html.slice(html.indexOf('id="castleDeleteMode"'), html.indexOf('</select>', html.indexOf('id="castleDeleteMode"')));
  assert.match(deletion, /value="flood">Flood fill<\/option>/);
  for (const group of ['toolbarFileGroup', 'castleViewGroup', 'castleProjectGroup', 'castlePlacementGroup', 'castleEditGroup', 'castleOverlayGroup']) {
    assert.ok(html.includes(group), group);
  }
});
