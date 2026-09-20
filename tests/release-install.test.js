'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
test('Windows release installation preserves custom files, refuses locks and records build identity', {skip:process.platform!=='win32'},()=>{
 const output=execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'release-installer-smoke.ps1'),'-Installer',path.resolve(__dirname,'../src/node/release-install.ps1')],{encoding:'utf8',windowsHide:true,timeout:60000});
 assert.match(output,/PASS:/);
});
