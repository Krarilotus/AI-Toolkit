const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../src/js/castle-editor.js'), 'utf8');
const start = source.indexOf('  function renderCastlePicture()');
const end = source.indexOf('\n  els.showBlueprint.addEventListener', start);
function setup(fail = false) {
  const state = {cell: 4, panX: -500, panY: 37, canvasWidth: 800, canvasHeight: 600, gesture: 'move', staticCacheDirty: true,
    skinImages: {25: {complete: true, naturalWidth: 40, naturalHeight: 40}}};
  const rendered = [];
  const original = {...state};
  const context = vm.createContext({state, GRID: 100, ctx: 'screen',
    placementRefs: () => [{type:25}], itemSize: () => [1,1], imageReady: () => true,
    document: {createElement: () => ({getContext: () => 'export', toDataURL: () => {if(fail) throw Error('encoding failed'); return 'png';}})},
    rebuildStaticCache: (target, future) => rendered.push({width: target.width, height: target.height, futureWidth:future.width, cell:state.cell, x:state.panX, y:state.panY}),
    drawUnitMarkers() {}, drawCompatibilityOriginMarker() {}, els: {showCompatibility:{checked:false}}
  });
  vm.runInContext(source.slice(start,end), context);
  return {context,state,original,rendered};
}
test('castle pictures render the whole grid at native sprite resolution regardless of viewport', () => {
  const r=setup();
  assert.equal(r.context.renderCastlePicture(),'png');
  assert.deepEqual(r.rendered[0],{width:4000,height:4000,futureWidth:4000,cell:40,x:0,y:0});
  assert.deepEqual(r.state,r.original);
  r.state.cell=19;r.state.panX=100;
  r.context.renderCastlePicture();
  assert.deepEqual(r.rendered[1],r.rendered[0]);
  assert.equal(r.context.ctx,'screen');
});
test('failed snapshot encoding restores the live viewport and rendering context', () => {
  const r=setup(true);
  assert.throws(()=>r.context.renderCastlePicture(),/encoding failed/);
  assert.deepEqual(r.state,r.original);
  assert.equal(r.context.ctx,'screen');
});
