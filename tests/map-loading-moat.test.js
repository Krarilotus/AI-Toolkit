const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const geo = require('../src/js/iso-geometry');
const catalogue = require('../assets/aiv/iso/verzeichnis.json').gegenstaende;
const source = fs.readFileSync(require.resolve('../src/js/iso-view'), 'utf8');

function loader() {
  const images = [], state = {}; let selected = {path:'map'}, refreshes = 0;
  class Image {
    constructor() { images.push(this); this.promise = new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;}); }
    decode() { return this.promise; }
  }
  const context = vm.createContext({state, Image, Uint16Array, Uint8Array, Map, Promise,
    gameMap:()=>selected, releaseMapImages(){}, refresh(){refreshes++;},
    ausBase64:()=>new Uint16Array([1]), KARTE_FELDER:400, handDrehung:0, mapTilesRequest:0});
  vm.runInContext(source.slice(source.indexOf('  async function setMapTiles('), source.indexOf('  function hasMapTiles(')),context);
  return {context,state,images,select(map){selected=map;},get refreshes(){return refreshes;}};
}
const payload = () => ({path:'map',atlas:'same-url',plaetze:'AA==',upper:{dataUrl:'upper-url'}});
test('map commit waits for every atlas; reloading the same URL decodes fresh images',async()=>{
  const s=loader(), first=s.context.setMapTiles(payload());
  s.images[0].resolve(); await Promise.resolve(); assert.equal(s.state.kachelVorrat,undefined);
  s.images[1].resolve(); assert.equal(await first,true);
  const old=s.state.kachelVorrat, next=s.context.setMapTiles(payload());
  assert.equal(s.state.kachelVorrat,old); assert.equal(s.images.length,4);
  s.images[2].resolve(); s.images[3].resolve(); assert.equal(await next,true);
  assert.notEqual(s.state.kachelVorrat.bild,old.bild);
});
test('out-of-order map decodes and mismatched responses cannot replace the latest map',async()=>{
  const s=loader(), old=s.context.setMapTiles(payload()), latest=s.context.setMapTiles(payload());
  assert.equal(await s.context.setMapTiles({...payload(),path:'other'}),false);
  s.images[2].resolve();s.images[3].resolve();assert.equal(await latest,true);
  const stock=s.state.kachelVorrat;
  s.images[0].resolve();s.images[1].resolve();assert.equal(await old,false);
  assert.equal(s.state.kachelVorrat,stock);
  const removed=s.context.setMapTiles(payload());s.select(null);
  s.images[4].resolve();s.images[5].resolve();assert.equal(await removed,false);
});
test('failed atlas decode is reported and a later retry can succeed',async()=>{
 const s=loader(),failed=s.context.setMapTiles(payload());
 s.images[0].reject(new Error('bad PNG'));s.images[1].resolve();
 await assert.rejects(failed,/bad PNG/);assert.equal(s.state.kachelVorrat,undefined);
 const retry=s.context.setMapTiles(payload());s.images[2].resolve();s.images[3].resolve();assert.equal(await retry,true);
});
const directions=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
test('moat variants match the native seven-entry edge/corner lookup, using the unshadowed bank',()=>{
 for(const [mask,index] of [[160,236],[40,237],[10,238],[130,239],[128,268],[2,300],[1,332],[0,204],[255,204]]) {
   const connected=(x,y)=>{const d=directions.findIndex(([dx,dy])=>dx===x&&dy===y);return !(mask&(128>>d));};
   assert.equal(geo.moatPicture(0,0,connected),index,`mask ${mask}`);
   assert.ok(catalogue[106].moatVariants[index]);
 }
});
const tile=(x,y)=>({itemType:106,gx:x,gy:y,tiles:1,entry:catalogue[106]});
test('moat cache retains unchanged sprite identities and only updates neighbours of edited tiles',()=>{
 const items=Array.from({length:10000},(_,i)=>tile(i%100,Math.floor(i/100))),cache={};
 const first=geo.resolveMoats(items,cache);assert.equal(cache.evaluated,10000);
 const second=geo.resolveMoats(items,cache);assert.equal(cache.evaluated,0);
 assert.ok(second.every((item,i)=>item===first[i]));
 const removed=geo.resolveMoats(items.slice(0,-1),cache);assert.ok(cache.evaluated<=8);
 assert.equal(removed[0],first[0]);
 geo.resolveMoats(items,cache);assert.ok(cache.evaluated<=9);
});
test('future moat tiles do not leak into an earlier build step; stepping back restores edge',()=>{
 const items=[tile(0,0),tile(1,0),tile(0,1)],cache={};
 const early=geo.resolveMoats(items.slice(0,1),cache)[0].entry;
 geo.resolveMoats(items,cache);
 assert.equal(geo.resolveMoats(items.slice(0,1),cache)[0].entry,early);
});
