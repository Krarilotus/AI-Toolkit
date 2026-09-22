(function exposeTroops(root, factory) {
  const api = factory(typeof module === 'object' ? require('./castle-geometry') : root.castleGeometry);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.castleTroops = api;
})(globalThis, geometry => {
  'use strict';
  const types = Object.freeze({Engineer:1, EuropArcher:6, Crossbowman:7, Spearman:8,
    Pikeman:9, Maceman:10, Swordsman:11, Knight:12, Slave:13, Slinger:14,
    Assassin:15, ArabArcher:16, HorseArcher:17, ArabSwordsman:18, FireThrower:19});
  const fields = Object.freeze(['DefTotal', 'DefWalls', ...Array.from({length:8}, (_,i)=>'DefUnit'+(i+1))]);
  const defensiveTypes = new Set(Object.values(types));
  const nonnegative = value => Math.max(0, Math.floor(Number(value) || 0));
  // Micro-positions inside one tile: centre first, then south and neighbours.
  const formation = Object.freeze([[0,0],[0,1],[1,0],[-1,0],[0,-1],[-1,1],[1,1],[-1,-1],[1,-1]]
    .map(([x,y])=>Object.freeze([x/3,y/3])));
  const defenseKey = aic => aic ? JSON.stringify(fields.map(key=>aic[key])) : '';

  /** One immutable occupancy plan; repeated recruitment slots provide weights.
   * No character means one representative per marker, never an invented army.
   * @param {Array<{itemType:number,positionOfset:number}>} markers
   * @param {Record<string,unknown>|null} aic
   */
  function plan(markers, aic) {
    const counts = new Map(), slots = new Map();
    for (const marker of markers) counts.set(Number(marker.itemType), (counts.get(Number(marker.itemType)) || 0)+1);
    let totalSlots = 0;
    if (aic) for (let i=1;i<=8;i++) {
      const name = aic['DefUnit'+i];
      if (name && name !== 'None') {
        totalSlots++;
        const type = types[name];
        if (type) slots.set(type, (slots.get(type)||0)+1);
      }
    }
    const defenders = aic ? Math.min(nonnegative(aic.DefWalls), nonnegative(aic.DefTotal)) : 0;
    return Object.freeze(markers.map((marker, index) => {
      const type = Number(marker.itemType);
      const count = !aic || !defensiveTypes.has(type) ? 1
        : totalSlots ? Math.min(9, Math.floor(defenders * (slots.get(type)||0) / totalSlots / counts.get(type))) : 0;
      return Object.freeze({type, offset:Number(marker.positionOfset), count, ref:'u:'+index});
    }));
  }

  function createPlanner() {
    let previousKey, previous;
    return (markers, aic) => {
      const key = defenseKey(aic)+'|'+markers.map(m=>m.itemType+':'+m.positionOfset).join(',');
      if (key !== previousKey) { previous = plan(markers, aic); previousKey = key; }
      return previous;
    };
  }

  // Build-step-sensitive support map. Call only when scene content changes,
  // using visible placements; never use the complete future castle topology.
  function supports(items, terrainHeight) {
    const surface = new Map();
    for (const item of items) {
      const height = geometry.structureHeight(item.itemType);
      if (height === null) continue;
      const size = item.tiles || 1;
      const elevation = terrainHeight(item.gx+size-1, item.gy+size-1) + height;
      for (let y=item.gy;y<item.gy+size;y++) for(let x=item.gx;x<item.gx+size;x++) {
        const key=y*geometry.GRID_SIZE+x;
        surface.set(key, Math.max(surface.get(key) ?? -Infinity, elevation));
      }
    }
    return (x,y) => surface.get(y*geometry.GRID_SIZE+x) ?? terrainHeight(x,y);
  }
  return {types, fields, formation, defenseKey, plan, createPlanner, supports};
});
