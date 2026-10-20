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
    bodenHoehe:()=>geo.viewHeight(48,state.flatView,state.peekView),
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

test('V toggles lowered view with an elevated round trip and retains the independent Space state', () => {
  const {state,context} = view();
  const original = {...state.view};
  context.togglePeekView();
  assert.equal(state.peekView,true);
  assert.equal(state.view.panY,original.panY-35);
  context.togglePeekView();
  assert.equal(state.peekView,false);
  assert.deepEqual(state.view,original);
  context.toggleFlatView();
  context.togglePeekView();
  context.togglePeekView();
  assert.equal(state.flatView,true);
  context.isMounted=()=>false;
  context.togglePeekView();
  assert.equal(state.peekView,false,'a hidden viewport does not consume its shortcut');
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
    const expected=mode==='peekView'?17:0;
    assert.equal(context.bodenHoehe(43,43),expected);
    const point=geo.isoPoint(43.5,43.5,state.view,expected);
    assert.deepEqual(geo.tileFromPoint(...point,state.view,context.bodenHoehe),{gx:43,gy:43});
    state[mode]=false;
    assert.equal(height[200*400+200],64);
  }
});

test('lowered view uses the native height table, independently from flat view', () => {
  for(let height=0;height<256;height++) {
    assert.equal(geo.viewHeight(height,false,true),(height>>2)+1);
    assert.equal(geo.viewHeight(height,true,true),0);
    assert.equal(geo.viewHeight(height),height);
  }
  const {state,context}=view(),original={...state.view};
  context.togglePeekView();
  context.toggleFlatView();
  assert.equal(state.view.panY,original.panY-48);
  context.toggleFlatView();
  assert.equal(state.view.panY,original.panY-35);
  context.togglePeekView();
  assert.deepEqual(state.view,original,'switching between lowered and flat preserves the centre');
});

test('V preserves native building-part pixels and its isometric footprint', () => {
  const state={view:{zoom:2,panX:0,panY:0},peekView:true},calls=[];
  const context=vm.createContext({geo,state});
  vm.runInContext(source.slice(source.indexOf('  function drawNativePart('),source.indexOf('  function drawSprite(')),context);
  context.drawNativePart({drawImage:(...args)=>calls.push(args)},{gx:0,gy:0,sx:4,sy:6,breite:30,hoehe:90,dx:-15,dy:-74},{},17);
  assert.deepEqual(calls[0].slice(1),[4,6,30,90,-30,-182,60,180]);
});

test('lowered map keeps ground diamonds and scenery at native proportions and shortens cliff columns', () => {
  const draws=[],image={complete:true,naturalWidth:100};
  const places=new Uint16Array(400*400).fill(0xffff);places[0]=0;
  const heights=new Uint8Array(400*400);heights[0]=64;
  const cliffs=new Uint16Array(400*400);cliffs[0]=2;
  const stock={bild:image,plaetze:places,hoehen:heights,kw:30,kh:16,spalten:64,cliffSprites:cliffs,
    upperImages:[image],upperEntries:[{x:0,y:0,width:30,height:80,dx:0,dy:-64},
      {x:30,y:0,width:30,height:71,dx:0,dy:9},{x:60,y:0,width:36,height:64}],
    treeSprites:new Map([[0,[0,0,2,-3,-48]]])};
  const state={view:{zoom:1,panX:0,panY:0},peekView:true};
  const context=vm.createContext({state,geo:{...geo,mapTileForView:(gx,gy)=>({mx:gx===0&&gy===0?0:-1,my:0})},
    vorrat:()=>stock,gameMap:()=>({}),currentKeep:()=>({x:0,y:0}),viewRotation:()=>0,
    KARTE_FELDER:400,MAP_MARGIN:5,kartenFeld:(x,y)=>x<0?-1:y*400+x,cacheTerrainCommands(){}});
  vm.runInContext(source.slice(source.indexOf('  function paintMapTiles('),source.indexOf('  function paintGround(')),context);
  const recorder={drawImage:(...args)=>draws.push(args)};
  context.paintMapTiles(recorder,1,1);
  for(const item of state.mapScenery)item.draw(recorder);
  assert.equal(draws.length,4);
  assert.deepEqual(draws[0].slice(1),[30,0,30,24,-15,-8,30,24]);
  assert.deepEqual(draws[1].slice(-2),[30,16]);
  assert.deepEqual(draws[2].slice(-2),[30,80]);
  assert.deepEqual(draws[3].slice(-2),[36,64]);
});

test('V crops a wall pillar while preserving the full sixteen-pixel roof diamond', () => {
  const state={peekView:true,view:{zoom:1,panX:0,panY:0}},draws=[];
  const variant={bild:'wall',breite:30,hoehe:106,sx:4,sy:6};
  const context=vm.createContext({state,geo:{...geo,variantFor:()=>variant},
    image:()=>({complete:true,naturalWidth:30}),bodenHoehe:(_x,_y,native)=>native?64:17,
    bauHoehe:()=>17,wallFootDepth:()=>[0,0],drawWallFoot(){}});
  vm.runInContext(source.slice(source.indexOf('  function drawSprite('),source.indexOf('  function wallFootDepth(')),context);
  context.drawSprite({drawImage:(...args)=>draws.push(args)},{mauer:{hoehe:90}},0,0,1);
  assert.deepEqual(draws[0].slice(1),[4,6,30,38,-15,-39,30,38]);
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
