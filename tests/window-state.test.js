'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {restoreBounds}=require('../src/node/window-state');
test('window restore preserves valid bounds and brings disconnected-monitor windows back onscreen',()=>{
  const area={x:0,y:0,width:1920,height:1040};
  assert.deepEqual(restoreBounds({x:30,y:40,width:1500,height:950},area),{x:30,y:40,width:1500,height:950});
  assert.deepEqual(restoreBounds({x:3000,y:2000,width:2500,height:1500},area),{x:0,y:0,width:1920,height:1040});
  assert.deepEqual(restoreBounds({x:-1920,y:10,width:1000,height:700},{x:-1920,y:0,width:1920,height:1080}),{x:-1920,y:10,width:1000,height:700});
  assert.equal(restoreBounds({x:0,y:0,width:NaN,height:5},area),null);
  assert.equal(restoreBounds({x:0,y:0,width:-1,height:5},area),null);
});
