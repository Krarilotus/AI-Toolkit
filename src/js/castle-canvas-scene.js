"use strict";
// Capture existing placement drawing once; the worker replays it at any step.
window.castleCanvasScene = {
  create(canvas, onError) {
    const layer = document.createElement("canvas");
    layer.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    const worker = new Worker(
      new URL("js/castle-canvas-worker.js", location.href),
    );
    const offscreen = layer.transferControlToOffscreen();
    worker.postMessage({ canvas: offscreen }, [offscreen]);
    let lastFrame, lastFrameKey;
    let busy = false,
      pending = null,
      scene = null,
      sentScene = null,
      generation = 0,
      closed = false;
    function pump() {
      if (busy || !pending || !scene || closed) return;
      const frame = pending;
      pending = null;
      busy = true;
      const model = sentScene !== scene ? scene : null;
      sentScene = scene;
      worker.postMessage(
        { frame, scene: model },
        model ? model.images.map(([, image]) => image) : [],
      );
    }
    worker.onmessage = ({ data }) => {
      busy = false;
      if (data.error) {
        onError(new Error(data.error));
        return;
      }
      pump();
    };
    worker.onerror = (event) => onError(new Error(event.message));
    return {
      async setScene(background, placements, draw, measure, options) {
        const token = ++generation,
          resources = new Map([[background, 0]]),
          images = [];
        const state = { font: "10px sans-serif" };
        const record = (action) => {
          const commands = [];
          const context = new Proxy(
            {},
            {
              set(_target, name, value) {
                state[name] = value;
                commands.push([0, name, value]);
                return true;
              },
              get(_target, name) {
                if (name === "measureText")
                  return (text) => {
                    measure.font = state.font;
                    return measure.measureText(text);
                  };
                if (name === "drawImage")
                  return (image, ...args) => {
                    if (!resources.has(image))
                      resources.set(image, resources.size);
                    commands.push([1, name, resources.get(image), ...args]);
                  };
                return (...args) => commands.push([1, name, ...args]);
              },
            },
          );
          action(context);
          return commands;
        };
        const rows = [];
        // Snapshot the background before its scratch canvas is reused.
        images.push([0, await createImageBitmap(background)]);
        for (let i = 0; i < placements.length; i++) {
          const p = placements[i];
          rows.push({
            ref: p.ref,
            fi: p.fi,
            normal: record((c) => draw(c, p, false)),
            selected: record((c) => draw(c, p, true)),
            outline: record((c) => draw(c, p, "outline")),
          });
          if (i % 128 === 127) {
            await scheduler.yield();
            if (token !== generation || closed) break;
          }
        }
        for (const [image, id] of resources) {
          if (token !== generation || closed) break;
          if (id) images.push([id, await createImageBitmap(image)]);
        }
        if (token !== generation || closed) {
          for (const [, image] of images) image.close();
          return;
        }
        if (scene && scene !== sentScene)
          for (const [, image] of scene.images) image.close();
        scene = { rows, images, ...options };
        pending = lastFrame;
        pump();
      },
      render(frame) {
        if (layer.parentNode !== canvas.parentNode) {
          canvas.before(layer);
          canvas.style.position = "relative";
          canvas.parentNode.style.position = "relative";
        }
        layer.hidden = false;
        const key = [frame.step, frame.selected.join(','), frame.moving.join(',')].join('/');
        lastFrame = frame;
        if (key === lastFrameKey) return;
        lastFrameKey = key;
        pending = frame;
        pump();
      },
      hide() {
        layer.hidden = true;
      },
      destroy() {
        closed = true;
        generation++;
        worker.terminate();
        layer.remove();
        if (scene && scene !== sentScene)
          for (const [, image] of scene.images) image.close();
      },
    };
  },
};
