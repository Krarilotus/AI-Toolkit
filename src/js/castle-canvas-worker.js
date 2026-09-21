"use strict";
let canvas,
  ctx,
  scene,
  images = new Map(),
  future,
  futureCtx;
function replay(context, range) {
  const tape = scene.commands, args = [];
  for (let at = range[0]; at < range[1];) {
    const [kind, name] = scene.operations[tape[at++]], count = tape[at++];
    args.length = 0;
    for (let i = 0; i < count; i++) {
      const value = tape[at++];
      args.push(Number.isNaN(value) ? scene.values[tape[at++]] : value);
    }
    if (!kind) context[name] = args[0];
    else {
      if (name === 'drawImage') args[0] = images.get(args[0]);
      context[name](...args);
    }
  }
}
onmessage = ({ data }) => {
  try {
    if (data.canvas) {
      canvas = data.canvas;
      ctx = canvas.getContext("2d", { alpha: false });
      future = new OffscreenCanvas(1, 1);
      futureCtx = future.getContext("2d");
      return;
    }
    if (data.scene) {
      for (const image of images.values()) image.close();
      scene = data.scene;
      images = new Map(scene.images);
      canvas.width = future.width = scene.width;
      canvas.height = future.height = scene.height;
    }
    const { step, selected, moving } = data.frame,
      selection = new Set(selected),
      excluded = new Set(moving);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(images.get(0), 0, 0);
    ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
    futureCtx.setTransform(1, 0, 0, 1, 0, 0);
    futureCtx.clearRect(0, 0, future.width, future.height);
    futureCtx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
    let hasFuture = false;
    for (const row of scene.rows) {
      if (row.unit || excluded.has(row.ref)) continue;
      if (step != null && row.fi > step) {
        replay(futureCtx, row.normal);
        hasFuture = true;
      } else replay(ctx, selection.has(row.ref) ? row.selected : row.normal);
    }
    if (hasFuture) {
      futureCtx.save();
      futureCtx.globalCompositeOperation = "source-atop";
      futureCtx.fillStyle = scene.tint;
      futureCtx.fillRect(
        0,
        0,
        scene.width / scene.dpr,
        scene.height / scene.dpr,
      );
      futureCtx.restore();
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = scene.opacity;
      ctx.filter = scene.filter;
      ctx.drawImage(future, 0, 0);
      ctx.restore();
    }
    if (hasFuture)
      for (const row of scene.rows)
        if (!row.unit && row.fi > step && selection.has(row.ref) && !excluded.has(row.ref))
          replay(ctx, row.outline);
    for (const row of scene.rows)
      if (!data.frame.foreground && row.unit && !excluded.has(row.ref)) replay(ctx, selection.has(row.ref) ? row.selected : row.normal);
    if (!data.frame.foreground && !moving.length) replay(ctx, scene.markers || []);
    postMessage({ done: true });
  } catch (error) {
    postMessage({ error: String(error.stack || error) });
  }
};
