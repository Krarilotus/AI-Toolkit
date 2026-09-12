const test=require('node:test');
const assert=require('node:assert/strict');
const patches=require('../src/js/scene-patches');
const sprite=(key,image,x,y)=>({key,...patches.capture(ctx=>ctx.drawImage(image,x,y,30,60))});
test('step removal damages old sprite pixels and unchanged steps damage nothing',()=>{
  const image={width:30,height:60},one=sprite('one',image,20,30),two=sprite('two',image,90,40);
  assert.equal(patches.damage([one],[sprite('one',image,20,30)]),null);
  assert.deepEqual(patches.damage([one,two],[one]),two.bounds);
  assert.ok(patches.damage([one],[sprite('one',image,40,30)]).left<=20);
});
test('neighbour sprite variants invalidate pixels even if their placement did not move',()=>{
  const old=sprite('wall',{},20,30),next=sprite('wall',{},20,30);
  assert.deepEqual(patches.damage([old],[next]),old.bounds);
});
test('foreground scenery retains depth order when replaying an overlapping region',()=>{
  const terrain=[{key:'ground',depth:1},{key:'rock',depth:3}];
  const buildings=[{key:'house',depth:2}];
  assert.deepEqual(patches.merge(terrain,buildings,(a,b)=>a.depth-b.depth).map(x=>x.key),['ground','house','rock']);
  assert.ok(patches.intersects({left:0,top:0,right:10,bottom:10},{left:9,top:9,right:20,bottom:20}));
});
test('recorded sprite source rectangles replay unchanged with exact destination bounds',()=>{
  const image={},calls=[];
  const draw=patches.capture(ctx=>ctx.drawImage(image,3,4,8,9,20,30,16,18));
  patches.replay({drawImage:(...args)=>calls.push(args)},draw);
  assert.deepEqual(calls,[[image,3,4,8,9,20,30,16,18]]);
  assert.deepEqual(draw.bounds,{left:18,top:28,right:38,bottom:50});
});
