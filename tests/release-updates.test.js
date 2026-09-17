'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { newer, releaseAsset, createReleaseChecker } = require('../src/node/release-updates');
test('official releases compare numerically and never offer an older PR version', () => {
  assert.equal(newer('v0.5.2', '0.10.0'), false);
  assert.equal(newer('0.10.1', '0.10.0'), true);
  assert.equal(newer('0.10.0', '0.10.0'), false);
  assert.equal(newer('0.10.0', '0.10.0-rc.1'), true);
  assert.equal(newer('0.11.0-beta', '0.10.0'), false);
  assert.equal(newer('nonsense', '0.10.0'), false);
});
test('download asset is pinned to upstream and requires checksum and one Windows ZIP', () => {
  const release={tag_name:'0.11.0',assets:[{name:'AI-Toolkit-0.11.0-x64.zip',size:100,digest:'sha256:'+'a'.repeat(64),browser_download_url:'https://evil.invalid/file'}]};
  assert.match(releaseAsset(release).url,/^https:\/\/github.com\/Schlossgespensty\/AI-Toolkit\/releases\/download\//);
  assert.equal(releaseAsset({...release,assets:[{...release.assets[0],digest:null}]}),null);
  assert.equal(releaseAsset({...release,assets:[...release.assets,...release.assets]}),null);
});
test('startup and hourly checks share requests across windows', async () => {
  let time=1000,calls=0;
  const check=createReleaseChecker('0.10.0',async url=>{calls++;assert.match(url,/Schlossgespensty\/AI-Toolkit\/releases\/latest$/);return {ok:true,json:async()=>({tag_name:'0.11.0'})};},()=>time);
  const results=await Promise.all([check(),check()]);assert.equal(calls,1);assert.equal(results[0].status,'available');
  time=3599999;await check();assert.equal(calls,1);
  time=3600000;await check();assert.equal(calls,2);
});
test('offline checks retry quietly with backoff and reject prereleases', async () => {
  let time=0,calls=0;
  const check=createReleaseChecker('0.10.0',async()=>{calls++;throw Error('offline');},()=>time);
  assert.equal((await check()).status,'error');await check();assert.equal(calls,1);
  time=61000;await check();assert.equal(calls,2);
  const preview=createReleaseChecker('0.10.0',async()=>({ok:true,json:async()=>({tag_name:'0.11.0',prerelease:true})}));
  assert.equal((await preview()).status,'error');
  const empty=createReleaseChecker('0.10.0',async()=>({status:404}));assert.equal((await empty()).status,'current');
});
