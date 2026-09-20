'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {OFFICIAL, repository, releaseAsset, readInstalledBuild, createReleaseChecker} = require('../src/node/release-updates');
const fork='Krarilotus/AI-Toolkit';
const release=(id,tag,date,prerelease=false)=>({id,tag_name:tag,published_at:date,prerelease,assets:[{id:id*10,name:`AI.toolkit.${tag}.zip`,size:100,digest:'sha256:'+'a'.repeat(64)}]});
const stable=release(1,'0.7.2','2026-09-19T12:00:00Z');
const snapshot=release(2,'snapshot-abc123','2026-09-20T12:00:00Z',true);
function api(releases, seen=[]) { return async url=> {seen.push(url);return {ok:true,json:async()=>url.includes('/releases?')?(url.includes('/'+OFFICIAL+'/') ? (releases.includes(stable) || !releases.some(r=>r.prerelease) ? releases : [stable]) : releases):{fork:true,full_name:fork,source:{full_name:OFFICIAL}}};}; }
test('published official build is offered despite an inflated local package version',async()=>{
 const result=await createReleaseChecker('0.10.0',api([snapshot,stable]))();
 assert.equal(result.status,'available');assert.equal(result.latest,'0.7.2');assert.equal(result.experimental,false);
 assert.equal(result.installed,'Untracked local build');
});
test('fork snapshots use publish date, support non-semver tags, and ignore drafts',async()=>{
 const old=release(3,'99.0.0','2026-09-18T12:00:00Z');
 const result=await createReleaseChecker(null,api([old,{...snapshot,id:99,draft:true},snapshot]))({repo:fork});
 assert.equal(result.latest,snapshot.tag_name);assert.equal(result.experimental,true);
 const installed={key:result.key,repo:fork,tag:result.latest};
 assert.equal((await createReleaseChecker(installed,api([snapshot]))({repo:fork})).status,'current');
 assert.equal((await createReleaseChecker(installed,api([stable]))()).status,'available','switching to official may lower package version');
 const replaced={...snapshot,assets:[{...snapshot.assets[0],digest:'sha256:'+'b'.repeat(64)}]};
 assert.equal((await createReleaseChecker(installed,api([replaced]))({repo:fork})).status,'available');
});
test('assets accept dots, spaces and hyphens but require one compatible verified ZIP',()=>{
 for(const name of ['AI.toolkit.0.7.2.zip','AI-Toolkit-x64.zip','AI Toolkit.zip']) assert.ok(releaseAsset({...stable,assets:[{...stable.assets[0],name}]}));
 assert.equal(releaseAsset({...stable,assets:[{...stable.assets[0],digest:null}]}),null);
 assert.equal(releaseAsset({...stable,assets:[...stable.assets,...stable.assets]}),null);
 assert.equal(releaseAsset({...stable,assets:[{...stable.assets[0],name:'AI-Toolkit-arm64.zip'}]}),null);
 const asset=releaseAsset({...stable,assets:[{...stable.assets[0],browser_download_url:'https://evil.invalid'}]},fork);
 assert.ok(asset.url.startsWith('https://github.com/'+fork+'/releases/download/'));
 assert.throws(()=>repository('https://evil.invalid/repo'));
});
test('unrelated repositories are refused and unavailable builds are not up to date',async()=>{
 const wrong=async()=>({ok:true,json:async()=>({fork:true,full_name:'Other/Repo',source:{full_name:'Other/Root'}})});
 assert.equal((await createReleaseChecker(null,wrong)({repo:'Other/Repo'})).status,'error');
 assert.equal((await createReleaseChecker(null,api([]))()).status,'empty');
 assert.equal((await createReleaseChecker(null,api([{...stable,assets:[]}]))()).status,'unsupported');
});
test('pagination uses publication time across pages rather than GitHub response order',async()=>{
 const old=release(4,'4.0','2020-01-01T00:00:00Z');let calls=0;
 const request=async url=>{calls++;return {ok:true,json:async()=>url.endsWith('page=1')?Array(100).fill(old):[stable]};};
 assert.equal((await createReleaseChecker(null,request)()).latest,'0.7.2');assert.equal(calls,2);
});
test('hourly cache is per source; forced refresh and network backoff work',async()=>{
 let time=1000;const calls=[];const check=createReleaseChecker(null,api([stable],calls),()=>time);
 await Promise.all([check(),check()]);assert.equal(calls.length,1);
 await check();assert.equal(calls.length,1);await check({force:true});assert.equal(calls.length,2);
 await check({repo:fork});assert.equal(calls.length,4);await check();assert.equal(calls.length,4);
 time=3600000;await check();assert.equal(calls.length,5);
 let failures=0;const offline=createReleaseChecker(null,async()=>{failures++;throw Error('offline');},()=>time);
 assert.equal((await offline()).status,'error');await offline();assert.equal(failures,1);
 time+=61000;await offline();assert.equal(failures,2);
});
test('fork discovery hides snapshots at or before the latest stable release',async()=>{
 const oldFork='Older/AI-Toolkit'; let time=1000;
 let latest=stable;
 const request=async url=>({ok:true,json:async()=>{
   if(url.includes('/forks?'))return [{full_name:fork},{full_name:oldFork}];
   if(url.includes('/releases?'))return url.includes(OFFICIAL)?[latest]:url.includes(oldFork)?[{...snapshot,published_at:stable.published_at}]:[snapshot];
   return {fork:true,full_name:url.includes(oldFork)?oldFork:fork,source:{full_name:OFFICIAL}};
 }});
 const check=createReleaseChecker(null,request,()=>time);
 assert.deepEqual(await check.listSources(),[OFFICIAL,fork]);
 await assert.rejects(check.select(oldFork),/newer than/);
 assert.equal(await check.select(fork),fork);
 latest={...stable,published_at:'2026-09-21T00:00:00Z'};time=3600000;
 assert.deepEqual(await check.listSources(),[OFFICIAL]);
 assert.equal((await check({repo:fork})).status,'empty');
});
test('experimental checks fail closed when the official release cannot be checked',async()=>{
 const request=async url=>{if(url.includes(OFFICIAL+'/releases'))throw Error('offline');return api([snapshot])(url);};
 assert.equal((await createReleaseChecker(null,request)({repo:fork})).status,'error');
});
test('installed receipt is used only while its application hash still matches',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'toolkit-receipt-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'resources'));fs.writeFileSync(path.join(root,'resources/app.asar'),'app');
 const receipt={repo:OFFICIAL,key:'build-key',tag:'0.7.2',asarSha256:crypto.createHash('sha256').update('app').digest('hex')};
 fs.writeFileSync(path.join(root,'.toolkit-release.json'),'\uFEFF'+JSON.stringify(receipt));
 assert.deepEqual(readInstalledBuild(root),receipt);
 fs.writeFileSync(path.join(root,'resources/app.asar'),'different');assert.equal(readInstalledBuild(root),null);
});
