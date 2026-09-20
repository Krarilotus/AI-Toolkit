'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { cachedAtlas } = require('../src/node/map-atlas-cache');

test('derived atlas reuses exact image bytes and invalidates changed provenance', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'atlas-cache-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  let builds = 0;
  const build = () => { builds++; return {nativeRenderer:true,cameras:Array.from({length:4},()=>({atlas:'original pixels',grid:Buffer.from([1,2,3])}))}; };
  const first = cachedAtlas(dir,['map','game','schema'],build);
  const second = cachedAtlas(dir,['map','game','schema'],build);
  assert.deepEqual(second,first); assert.equal(builds,1);
  for (const key of [['changed-map','game','schema'],['changed-map','changed-game','schema']]) cachedAtlas(dir,key,build);
  assert.equal(builds,3);
  assert.deepEqual(fs.readdirSync(dir),['derived-atlas.bin']);
  fs.writeFileSync(path.join(dir,'derived-atlas.bin'),'broken');
  assert.deepEqual(cachedAtlas(dir,['map','game','schema'],build),first);
  assert.equal(builds,4);
});

test('unwritable atlas cache does not prevent map loading or hide build errors', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'atlas-cache-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file = path.join(dir,'file'); fs.writeFileSync(file,'keep');
  const value = {nativeRenderer:true,cameras:[1,2,3,4]};
  assert.equal(cachedAtlas(file,'key',()=>value),value);
  assert.throws(()=>cachedAtlas(dir,'key',()=>{throw Error('bad map')}),/bad map/);
  assert.equal(fs.readFileSync(file,'utf8'),'keep');
});
