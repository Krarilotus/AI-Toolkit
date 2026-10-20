const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('./helpers/localized-vm');
const geo = require('../src/js/iso-geometry');
const source = fs.readFileSync(require.resolve('../src/js/iso-view'), 'utf8');

function view() {
  const state = {view:{zoom:1,panX:400,panY:-400},flatView:false,peekView:false};
  const statuses = [], refreshes = [];
  const context = vm.createContext({state,geo,VIERTEL:2,handDrehung:0,
    surface:()=>({width:800,height:600}),gameMap:()=>({path:'saved.map'}),
    hasMapTiles:()=>true,kartenSchluessel:()=> 'saved.map#200,200',
    bodenHoehe:()=>state.flatView || state.peekView ? 0 : 48,
    isMounted:()=>true,paint(){},refresh:()=>refreshes.push(true),
    setStatus:value=>statuses.push(value)});
  vm.runInContext(source.slice(source.indexOf('  function viewRotation()'), source.indexOf('  function currentRotation()')), context);
  return {state,context,statuses,refreshes};
}

test('saved map rotation needs a loaded atlas, without requiring legacy engine camera caches', () => {
  const {state,context,statuses} = view();
  const original = {...state.view};
  for (const expected of [2,4,6,0]) assert.equal(context.turnView(1),expected);
  assert.deepEqual(state.view,original,'four turns preserve the world-space centre');
  assert.deepEqual(statuses,[]);
  context.hasMapTiles=()=>false;
  state.mapLoadError='Atlas decoding failed';
  assert.equal(context.turnView(1),null);
  assert.deepEqual(statuses,['Atlas decoding failed'],'report the actual error, never an endless camera-cache wait');
});

test('Space toggles flat view once and preserves camera position through an elevated round trip', () => {
  const {state,context,refreshes} = view();
  const original = {...state.view};
  context.toggleFlatView();
  assert.equal(state.flatView,true);
  assert.equal(state.view.panY,original.panY-48);
  context.setViewMode('flat',true);
  assert.equal(refreshes.length,1,'idempotent mode assignment does not rebuild the scene');
  context.toggleFlatView();
  assert.deepEqual(state.view,original);
});

test('held peek releases by physical key after modifiers change, or on blur, retaining Space state', () => {
  const {state,context} = view();
  context.toggleFlatView();
  context.beginPeek({key:'v',code:'KeyV'});
  context.releasePeek({type:'keyup',key:'Shift',code:'ShiftLeft'});
  assert.equal(state.peekView,true);
  context.releasePeek({type:'keyup',key:'V',code:'KeyV',shiftKey:true});
  assert.equal(state.peekView,false);
  assert.equal(state.flatView,true);
  context.beginPeek({key:'v',code:'KeyV'});
  context.releasePeek();
  assert.equal(state.peekView,false);
  context.isMounted=()=>false;
  context.beginPeek({key:'v',code:'KeyV'});
  assert.equal(state.peekView,false,'a hidden viewport cannot retain a held key');
});

test('flat and peek heights share the same tile picking and keep the real height raster intact', () => {
  const height = new Uint8Array(400*400).fill(64);
  const state={view:{zoom:1,panX:0,panY:0}};
  const context=vm.createContext({geo,state,gameMap:()=>({}),currentKeep:()=>({x:200,y:200}),
    viewRotation:()=>0,vorrat:()=>({plaetze:[],bild:{complete:true,naturalWidth:1},hoehen:height})});
  vm.runInContext(source.slice(source.indexOf('  function bodenHoehe('),source.indexOf('  function gameMap()')),context);
  for(const mode of ['flatView','peekView']) {
    assert.equal(context.bodenHoehe(43,43),64);
    state[mode]=true;
    assert.equal(context.bodenHoehe(43,43),0);
    const point=geo.isoPoint(43.5,43.5,state.view);
    assert.deepEqual(geo.tileFromPoint(...point,state.view,context.bodenHoehe),{gx:43,gy:43});
    state[mode]=false;
    assert.equal(height[200*400+200],64);
  }
});

test('flat foundations emit image commands for the shared Canvas/GPU recorder and reuse their bitmap', () => {
  const state={flatView:true,view:{zoom:1,panX:0,panY:0}},draws=[];
  const context=vm.createContext({state,geo,document:{createElement:()=>({getContext:()=>({
    beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){}
  })})}});
  vm.runInContext(source.slice(source.indexOf('  function drawSprite('),source.indexOf('  function wallFootDepth(')),context);
  const recorder={drawImage:(...args)=>draws.push(args)};
  context.drawSprite(recorder,{},43,43,7);
  context.drawSprite(recorder,{},51,43,7);
  assert.equal(draws.length,2);
  assert.equal(draws[0][0],draws[1][0]);
  assert.equal(draws[0][3],224);
  assert.equal(draws[0][4],112);
});
