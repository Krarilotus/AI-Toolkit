const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const troops = require('../src/js/castle-troops');
const geo = require('../src/js/iso-geometry');
const marker = (type, offset=5050) => ({itemType:type, positionOfset:offset});
const defense = (names, total=80, walls=total) => Object.fromEntries([
  ['DefTotal',total],['DefWalls',walls],...names.map((name,i)=>['DefUnit'+(i+1),name])]);

test('defensive occupancy floors weighted recruitment slots over matching rally markers', () => {
  const names=['ArabArcher','EuropArcher','Crossbowman','Spearman','Pikeman','Maceman','Swordsman','Knight'];
  const plan=troops.plan(Array.from({length:4},()=>marker(16)),defense(names));
  assert.deepEqual(plan.map(p=>p.count),[2,2,2,2], '80 / 8 / 4 is floored to two');
  assert.deepEqual(troops.plan([marker(6),marker(7)],defense(['EuropArcher','EuropArcher','Crossbowman'],12)).map(p=>p.count),[8,4]);
  assert.equal(troops.plan([marker(6)],defense(['EuropArcher'],1000))[0].count,9);
  assert.equal(troops.plan([marker(6)],defense(['EuropArcher'],3,80))[0].count,3,'wall preview cannot exceed total defenders');
});

test('zero or unmatched defense produces no troops, while no character retains one marker preview', () => {
  for(const aic of [defense(['EuropArcher'],0),defense(['EuropArcher'],80,0),defense(['None']),defense(['ArabArcher'])])
    assert.equal(troops.plan([marker(6)],aic)[0].count,0);
  assert.equal(troops.plan([marker(6)],null)[0].count,1);
  assert.equal(troops.plan([marker(2)],defense(['None'],0))[0].count,1,'siege placement is independent of defense recruitment');
});

test('occupancy identity changes only for defense inputs or markers, never unrelated AIC edits', () => {
  const cached=troops.createPlanner(), markers=[marker(6)], aic=defense(['EuropArcher'],7);
  const first=cached(markers,aic);
  assert.equal(cached([{...markers[0]}],{...aic,MaxWood:500}),first);
  assert.equal(cached(markers,aic),first);
  assert.notEqual(cached(markers,{...aic,DefWalls:6}),first);
  assert.notEqual(cached([marker(6,5051)],aic),first);
  assert.ok(Object.isFrozen(first) && Object.isFrozen(first[0]));
});

test('troop supports use only visible walls, stairs, towers and gate decks above terrain', () => {
  const tower={gx:10,gy:12,tiles:3,itemType:110};
  assert.equal(troops.supports([],()=>30)(11,13),30);
  assert.equal(troops.supports([tower],()=>30)(11,13),326);
  assert.equal(troops.supports([tower],()=>30)(13,13),30);
  for(const [itemType,height] of [[25,90],[46,60],[181,80],[186,0],[144,90]])
    assert.equal(troops.supports([{gx:5,gy:8,tiles:1,itemType}],()=>7)(5,8),height+7);
});

test('idle draw commands preserve native anchors and identity across visible-step changes', () => {
  const source=fs.readFileSync(require.resolve('../src/js/iso-view.js'),'utf8');
  const sprite={path:'idle.png',width:20,height:36,dx:-10,dy:-32};
  const image={complete:true,naturalWidth:20};
  const doc={miscItems:[marker(6,geo.offsetFromGrid(10,12))]};
  const state={view:{zoom:1,panX:0,panY:0},unitAssets:{idleSprites:{6:sprite}},unitCommands:new Map(),troopAic:null};
  const context=vm.createContext({state,window:{castleTroops:troops},geo,currentDocument:()=>doc,
    bodenHoehe:()=>0,currentRotation:()=>0,image:()=>image});
  vm.runInContext(source.slice(source.indexOf('  function recordSceneCommands('),source.indexOf('  /** @param {SceneRect} a')),context);
  vm.runInContext(source.slice(source.indexOf('  function troopSceneCommands('),source.indexOf('  function paintScene(')),context);
  const ground=context.troopSceneCommands([])[0];
  const tower={gx:10,gy:12,tiles:3,itemType:110};
  const raised=context.troopSceneCommands([tower])[0];
  assert.equal(raised.y,ground.y-296);
  assert.equal(context.troopSceneCommands([tower])[0],raised);
  assert.equal(context.troopSceneCommands([])[0],ground,'returning before the tower restores cached ground command');
  assert.equal(ground.w,20); assert.equal(ground.h,36);
  const [x,y]=geo.isoPoint(10.5,12.5,state.view);
  assert.equal(ground.x,x-10);assert.equal(ground.y,y-32);
  state.troopAic=defense(['EuropArcher'],9);state.troopDocument=null;
  const formation=context.troopSceneCommands([tower]);
  assert.equal(formation.length,9);
  assert.ok(formation.every(c=>c.order.gx===10 && c.order.gy===12 && c.order.layer>3),
    'all micro-positions sort after the supporting roof tile');
  for(let height=0;height<100; height++) {
    context.bodenHoehe=()=>height;
    context.troopSceneCommands([tower]);
  }
  assert.ok(state.unitCommands.size<=state.unitCommandLimit+9,'cache stays bounded through changing terrain heights');
});

test('terrain, structures and troop commands share the same stable depth merge', () => {
  const source=fs.readFileSync(require.resolve('../src/js/iso-view.js'),'utf8');
  const context=vm.createContext({geo});
  vm.runInContext(source.slice(source.indexOf('  function* mergeSceneCommands('),source.indexOf('  function visibleSceneItems(')),context);
  const list=(prefix,layer)=>Array.from({length:100},(_,i)=>({key:prefix+i,order:{gx:i%10,gy:Math.floor(i/10),layer}}))
    .sort((a,b)=>geo.renderOrder(a.order,b.order));
  const terrain=list('terrain',0),buildings=list('building',2),units=list('troop',4);
  const expected=[...terrain,...buildings,...units].sort((a,b)=>geo.renderOrder(a.order,b.order));
  assert.deepEqual([...context.mergeSceneCommands(terrain,buildings,units)],expected);
});
