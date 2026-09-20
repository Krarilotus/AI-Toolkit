'use strict';

/** Restore a normal window inside a connected monitor's usable area. */
function restoreBounds(saved, area) {
  if (!saved || !['x','y','width','height'].every(key=>Number.isFinite(saved[key])) || saved.width<1 || saved.height<1) return null;
  const width=Math.min(area.width,Math.max(900,Math.round(saved.width)));
  const height=Math.min(area.height,Math.max(600,Math.round(saved.height)));
  return {width,height,x:Math.round(Math.max(area.x,Math.min(saved.x,area.x+area.width-width))),
    y:Math.round(Math.max(area.y,Math.min(saved.y,area.y+area.height-height)))};
}
module.exports={restoreBounds};
