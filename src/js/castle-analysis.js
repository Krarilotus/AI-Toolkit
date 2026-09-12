'use strict';
(() => {
  const game = typeof module !== 'undefined' ? require('./castle-game-data') : globalThis.castleGameData;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  // First-pass candidates from setupBuildingEntrancesOffset(size, 1, attempt, 0).
  // The game starts at a saved attempt and checks region/height flags. AIV has
  // neither; this planner starts at zero and accepts the first reachable tile.
  function entranceCandidates(rect, start = 0) {
    const size = rect.right - rect.left + 1;
    if (size !== rect.top - rect.bottom + 1) return [];
    const table = game.entrances[size];
    if (!table) return [];
    return table.map((_, i) => table[(i + start) % table.length])
      .map(([x, y]) => ({ x: rect.left + x, y: rect.top - y }));
  }
  // Static, intact, same-owner castle topology. AIV carries placement types,
  // not the runtime walk/height/damage layers. Keep ground gate passages and
  // elevated decks separate so an open gate never becomes a staircase.
  function routeTopology(placements, size = 100, terrain = null) {
    const count = size * size;
    const surfaces = Array.from({length: count}, (_,k) => terrain?.blocked?.[k] ? [] : [{ k, height:0, kind:'ground' }]);
    const inside = (x,y) => x >= 0 && y >= 0 && x < size && y < size;
    for (const p of placements) for (const r of p.rects) {
      const t = Number(p.type);
      const wall = [25,46].includes(t);
      const tower = t >= 110 && t <= 114;
      const gate = t >= 144 && t <= 147;
      const stair = t >= 181 && t <= 186;
      for (let y = Math.max(0,r.bottom); y <= Math.min(size-1,r.top); y++)
        for (let x = Math.max(0,r.left); x <= Math.min(size-1,r.right); x++) {
          const k = y*size+x, tile = { k, ref:p.ref };
          if (terrain?.blocked?.[k] && t !== 105) { surfaces[k]=[]; continue; }
          if (p.name === 'Stockpile' || t === 52 || r.part === 'stockpile' || [99,105,166,169,175,200].includes(t)) surfaces[k] = [{...tile,height:0,kind:'ground'}];
          else if (stair) surfaces[k] = [{...tile,height:(186-t)*16,kind:'stair'}];
          else if ([26,35].includes(t)) surfaces[k] = [];
          else if (wall) surfaces[k] = [{...tile,height:t===46?60:90,kind:'wall'}];
          else if (tower) surfaces[k] = [{...tile,height:[296,148,180,192,192][t-110],kind:'tower'}];
          else if (gate) {
            surfaces[k] = [{...tile,height:90,kind:'deck'}];
            // updatePathLinkageTileMapRelatedToGates (499FA0): the two
            // passage endpoints lie on the central row/column (size / 2).
            const ns = t === 144 || t === 146;
            const corridor = ns ? x === Math.floor((r.left+r.right)/2) : y === Math.floor((r.bottom+r.top)/2);
            if (corridor && !p.closed) surfaces[k].push({...tile,height:0,kind:'passage',axis:ns?'y':'x'});
          } else surfaces[k] = [];
        }
    }
    let id = 0;
    const nodes = surfaces.flat();
    for (const n of nodes) { n.id = id++; n.x = n.k%size; n.y = Math.floor(n.k/size); }
    const hardCorners = new Set();
    for (const p of placements) if ([25,26,35,46,176,177,301,305,306,307,308,310,311,312].includes(Number(p.type)))
      for (const r of p.rects) for(let y=r.bottom;y<=r.top;y++) for(let x=r.left;x<=r.right;x++)
        if(inside(x,y)) hardCorners.add(y*size+x);
    const isDeck = n => n.kind === 'tower' || n.kind === 'deck';
    const links = nodes.map(() => []);
    function connects(a,b,dx,dy) {
      for (const n of [a,b]) if (n.kind === 'passage') {
        if ((n.axis === 'x' && dy) || (n.axis === 'y' && dx) || b.height !== a.height) return false;
      }
      // The engine has explicit intact tower/wall/stair linkage. In
      // particular Stair 6 (zero height) may enter a tower directly.
      if (isDeck(a) || isDeck(b)) {
        const other = isDeck(a) ? b : a;
        if (!(isDeck(other) || other.kind === 'wall' || other.kind === 'stair')) return false;
      } else if (Math.abs(a.height-b.height) > 16) return false;
      if (a.height === 0 && b.height === 0 && terrain?.heights && Math.abs(terrain.heights[a.k]-terrain.heights[b.k]) > 8) return false;
      if (dx && dy) {
        // Elevated diagonal wall walks must remain connected. Do not let a
        // diagonal edge climb a tower from ordinary ground or skip a stair.
        if (a.kind === 'wall' && b.kind === 'wall') return true;
        if (isDeck(a) && isDeck(b) && a.ref != null && a.ref === b.ref) return true;
        if (a.height !== 0 || b.height !== 0) return false;
        const sideA = a.y*size+b.x, sideB=b.y*size+a.x;
        // Ordinary building corners are walkable; never squeeze diagonally
        // between walls, or a wall and a negative fear building.
        if (hardCorners.has(sideA) && hardCorners.has(sideB)) return false;
        if (terrain?.blocked?.[sideA] && terrain?.blocked?.[sideB]) return false;
      }
      return true;
    }
    for (const a of nodes) for (const [dx,dy] of [...directions,[-1,-1],[-1,1],[1,-1],[1,1]]) {
      const x=a.x+dx,y=a.y+dy;
      if (!inside(x,y)) continue;
      for (const b of surfaces[y*size+x]) if (connects(a,b,dx,dy))
        links[a.id].push({ to:b.id,cost:dx && dy ? Math.SQRT2 : 1 });
    }
    return { nodes,surfaces,links };
  }
  function routes(placements, size = 100, terrain = null) {
    const {nodes,surfaces,links} = routeTopology(placements,size,terrain);
    const inside = ({x,y}) => x >= 0 && y >= 0 && x < size && y < size;
    const goals = placements.filter(p => (p.name === 'Stockpile' || Number(p.type) === 52)).flatMap(p => p.rects.flatMap(r => {
      const cells=[];
      for (let y=r.bottom;y<=r.top;y++) for(let x=r.left;x<=r.right;x++)
        if(inside({x,y})) cells.push(...surfaces[y*size+x].filter(n=>n.height===0 && n.kind==='ground'));
      return cells;
    }));
    const distance = new Float64Array(nodes.length).fill(Infinity);
    const next = new Int32Array(nodes.length).fill(-1);
    // Dijkstra, because diagonal wall walks are sqrt(2) tiles long.
    const heap=[];
    function push(id,d) {
      let i=heap.length; heap.push({id,d});
      while(i) { const parent=(i-1)>>1; if(heap[parent].d<=d) break;heap[i]=heap[parent];i=parent; }
      heap[i]={id,d};
    }
    function pop() {
      const first=heap[0],last=heap.pop();
      if(heap.length) {
        let i=0;
        while(i*2+1<heap.length) {
          let c=i*2+1;if(c+1<heap.length && heap[c+1].d<heap[c].d)c++;
          if(heap[c].d>=last.d)break;heap[i]=heap[c];i=c;
        }
        heap[i]=last;
      }
      return first;
    }
    for(const g of goals)if(distance[g.id]!==0){distance[g.id]=0;push(g.id,0);}
    while(heap.length) {
      const {id,d}=pop();if(d!==distance[id])continue;
      for(const edge of links[id]) {
        const nd=d+edge.cost;
        if(nd>=distance[edge.to])continue;
        distance[edge.to]=nd;next[edge.to]=id;push(edge.to,nd);
      }
    }
    return placements.filter(p=>p.worker && p.name!=='Stockpile').map(p=>{
      let candidates=entranceCandidates(p.rects[0]);
      const r=p.rects[0];
      if(r.right-r.left===3 && r.top-r.bottom===3) {
        // A full adjacent wall turns a four-tile workshop entrance away.
        const wallAt=(x,y)=>inside({x,y}) && surfaces[y*size+x].some(n=>n.kind==='wall');
        const full=[
          [0,1,2,3].every(i=>wallAt(r.left+i,r.top+1)),
          [0,1,2,3].every(i=>wallAt(r.right+1,r.top-i)),
          [0,1,2,3].every(i=>wallAt(r.right-i,r.bottom-1)),
          [0,1,2,3].every(i=>wallAt(r.left-1,r.bottom+i))
        ].findIndex(Boolean);
        if(full>=0) {
          const opposite=(full+2)%4;
          const onSide=c=>[c.y>r.top,c.x>r.right,c.y<r.bottom,c.x<r.left][opposite];
          const index=candidates.findIndex(onSide);
          candidates=candidates.slice(index).concat(candidates.slice(0,index));
        }
      }
      let entry;
      for(const c of candidates) {
        if(!inside(c))continue;
        entry=surfaces[c.y*size+c.x].find(n=>n.height===0 && Number.isFinite(distance[n.id]));
        if(entry)break;
      }
      if(!entry)return {ref:p.ref,name:p.name,path:[],reason:!goals.length?'No stockpile':'No reachable first-pass entrance'};
      const path=[];
      for(let n=entry.id;n>=0;n=next[n])path.push({x:nodes[n].x,y:nodes[n].y,height:nodes[n].height});
      const direct=Math.min(...goals.map(g=>Math.hypot(g.x-entry.x,g.y-entry.y)));
      const d=distance[entry.id];
      return {ref:p.ref,name:p.name,entry:{x:entry.x,y:entry.y},path,distance:d,efficiency:d?direct/d:1};
    });
  }
  // User-selected planning ranges, not engine probabilities. Distance is from
  // the actual footprint boundary, so even-sized and multipart buildings do
  // not acquire a half-tile centre offset. Smoothstep has no hard outer edge.
  function fireStrength(distance) {
    const fade = radius => {
      const t = Math.max(0, Math.min(1, 1-distance/radius));
      return t*t*(3-2*t);
    };
    return .7*fade(2) + .3*fade(7);
  }
  function fireExposure(placements, size = 100) {
    const heat = new Float32Array(size*size);
    for (const p of placements) {
      if (!(game.flammability[p.name] > 0)) continue;
      for (const r of p.rects) {
        for(let y=Math.max(0,r.bottom-7);y<=Math.min(size-1,r.top+7);y++)
          for(let x=Math.max(0,r.left-7);x<=Math.min(size-1,r.right+7);x++) {
            const dx=Math.max(r.left-x-.5,0,x-r.right-.5);
            const dy=Math.max(r.bottom-y-.5,0,y-r.top-.5);
            const strength=fireStrength(Math.hypot(dx,dy));
            heat[y*size+x]=Math.max(heat[y*size+x],strength);
          }
      }
    }
    return heat;
  }
  const api = { entranceCandidates, routeTopology, routes, fireStrength, fireExposure };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.castleAnalysis = api;
})();
