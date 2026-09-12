'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const a=require('../src/js/castle-analysis');
const rect=(left,bottom,right=left,top=bottom)=>({left,bottom,right,top});
const p=(type,r,extra={})=>({type,rects:[r],...extra});
test('fire fades smoothly from exact footprints with 2 and 7 tile stages',()=>{
  assert.equal(a.fireStrength(7),0);
  assert.equal(a.fireStrength(8),0);
  assert.ok(a.fireStrength(6)>0);
  assert.ok(a.fireStrength(1)>a.fireStrength(2));
  assert.ok(Math.abs(a.fireStrength(1.999)-a.fireStrength(2.001))<.001);
  assert.ok(a.fireStrength(6.999)<.000001);
  for(const n of [3,4,5,9,10,11]) {
    const heat=a.fireExposure([p(54,rect(20,20,19+n,19+n),{name:'Hovel'})]);
    assert.equal(heat[20*100+12],0);
    assert.ok(heat[20*100+13]>0);
    assert.equal(heat[20*100+13],heat[20*100+26+n]);
  }
  assert.ok(a.fireExposure([p(52,rect(10,10,14,14),{name:'Stockpile'})]).every(v=>v===0));
});
test('stockpile mapper tiles are walkable without depending on a translated name',()=>{
  const g=a.routeTopology([p(52,rect(3,3,7,7))],12);
  assert.equal(g.surfaces[5*12+5][0].height,0);
  const ps=[p(null,rect(0,0,14,14)),p(52,rect(1,5,8,5)),p(50,rect(9,5),{worker:true})];
  assert.ok(a.routes(ps,15)[0].path.length);
});
test('stairs, wall walks and directly attached towers form a route',()=>{
  const ps=[p(null,rect(0,0,14,14)),p(52,rect(1,5)),p(186,rect(2,5)),
    p(110,rect(3,4,5,6),{ref:'left'}),p(25,rect(6,5)),
    p(110,rect(7,4,9,6),{ref:'right'}),p(186,rect(10,5)),p(50,rect(11,5,12,6),{worker:true})];
  assert.ok(a.routes(ps,15)[0].path.some(t=>t.x===6 && t.y===5 && t.height===90));
  assert.equal(a.routes(ps.filter(t=>t.type!==186),15)[0].path.length,0);
});
test('all gate orientations have separate open passages and roofs',()=>{
  for(const type of [144,145,146,147]) {
    const g=a.routeTopology([p(type,rect(2,2,6,6))],10);
    const passage=g.surfaces[4*10+4].find(n=>n.kind==='passage');
    assert.equal(g.links[passage.id].length,2);
    assert.ok(g.links[passage.id].every(e=>g.nodes[e.to].height===0));
  }
});
test('diagonal ordinary corners work but wall/fear gaps and water do not',()=>{
  const linked=(placements,terrain)=>{
    const g=a.routeTopology(placements,6,terrain),x=g.surfaces[2*6+2][0],y=g.surfaces[3*6+3][0];
    return g.links[x.id].some(e=>e.to===y.id);
  };
  assert.equal(linked([p(54,rect(2,3)),p(54,rect(3,2))]),true);
  assert.equal(linked([p(25,rect(2,3)),p(176,rect(3,2))]),false);
  const blocked=new Uint8Array(36);blocked[3*6+2]=blocked[2*6+3]=1;
  assert.equal(linked([],{blocked}),false);
});
test('six stair levels connect, while ordinary ground cannot climb a high wall',()=>{
  const ps=[181,182,183,184,185,186].map((type,i)=>p(type,rect(i+1,4)));
  ps.push(p(25,rect(0,4)));
  const g=a.routeTopology(ps,10),at=(x,y)=>g.surfaces[y*10+x][0];
  const linked=(one,two)=>g.links[one.id].some(e=>e.to===two.id);
  for(let x=0;x<6;x++) assert.ok(linked(at(x,4),at(x+1,4)));
  assert.equal(linked(at(0,3),at(0,4)),false);
  assert.ok(linked(at(6,4),at(7,4)));
});
test('full adjacent wall turns a 4x4 workshop entrance to the opposite side',()=>{
  const ps=[p(50,rect(5,5,8,8),{worker:true}),p(25,rect(5,9,8,9)),p(52,rect(1,1,3,3))];
  const route=a.routes(ps,15)[0];
  assert.equal(route.entry.y,4);
});
test('stockpiles cannot erase map obstacles and cliffs prevent ground shortcuts',()=>{
  const blocked=new Uint8Array(100);blocked[55]=1;
  const g=a.routeTopology([p(52,rect(5,5))],10,{blocked});
  assert.equal(g.surfaces[55].length,0);
  const heights=new Uint8Array(100);heights[55]=100;
  const cliff=a.routeTopology([],10,{heights});
  assert.equal(cliff.links[cliff.surfaces[55][0].id].length,0);
});
