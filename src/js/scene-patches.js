(function(root, factory) {
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.scenePatches=api;
})(globalThis,()=>{
  'use strict';
  // Record existing sprite calls rather than duplicate their anchoring math.
  function capture(draw) {
    const commands=[];
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    const include=(x,y,w=0,h=0)=>{left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+w);bottom=Math.max(bottom,y+h);};
    const context=new Proxy({}, {
      set(_target,name,value){commands.push(['set',name,value]);return true;},
      get(_target,name){return (...args)=>{
        commands.push([name,...args]);
        if(name==='drawImage') {
          const [image,...rest]=args;
          const r=rest.length===8?rest.slice(4):rest;
          include(r[0],r[1],r[2]??image.width,r[3]??image.height);
        } else if(name==='moveTo'||name==='lineTo') include(args[0],args[1]);
        else if(name==='fillRect'||name==='strokeRect') include(...args);
      };}
    });
    draw(context);
    return {commands,bounds:Number.isFinite(left)?{left:Math.floor(left)-2,top:Math.floor(top)-2,right:Math.ceil(right)+2,bottom:Math.ceil(bottom)+2}:null};
  }
  function same(a,b) {
    return !!a && !!b && ['gx','gy','tiles','layer','flammable'].every(key=>a[key]===b[key]) && a.commands.length===b.commands.length && a.commands.every((c,i)=>
      c.length===b.commands[i].length && c.every((v,j)=>v===b.commands[i][j]));
  }
  function intersects(a,b) {return a && b && a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top;}
  function damage(before,after) {
    const previous=new Map(before.map(item=>[item.key,item]));
    const boxes=[];
    for(const item of after) {
      const old=previous.get(item.key);previous.delete(item.key);
      if(!same(old,item)) {if(old?.bounds)boxes.push(old.bounds);if(item.bounds)boxes.push(item.bounds);}
    }
    for(const item of previous.values())if(item.bounds)boxes.push(item.bounds);
    if(!boxes.length)return null;
    return {left:Math.min(...boxes.map(b=>b.left)),top:Math.min(...boxes.map(b=>b.top)),
      right:Math.max(...boxes.map(b=>b.right)),bottom:Math.max(...boxes.map(b=>b.bottom))};
  }
  function replay(ctx,item) {
    for(const [name,...args] of item.commands) {
      if(name==='set')ctx[args[0]]=args[1];else ctx[name](...args);
    }
  }
  function merge(terrain,buildings,compare) {
    const result=[];let i=0,j=0;
    while(i<terrain.length || j<buildings.length) {
      if(j===buildings.length || (i<terrain.length && compare(terrain[i],buildings[j])<=0))result.push(terrain[i++]);
      else result.push(buildings[j++]);
    }
    return result;
  }
  return {capture,same,damage,intersects,replay,merge};
});
