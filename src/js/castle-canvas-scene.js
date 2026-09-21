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
        model ? [model.commands.buffer, ...model.images.map(([, image]) => image)] : [],
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
      async setScene(background, placements, draw, measure, options, drawMarkers) {
        const token = ++generation,
          resources = new Map([[background, 0]]),
          images = [];
        const state = { font: "10px sans-serif" },
          values = [], valueIds = new Map(),
          operations = [], operationIds = new Map(),
          methods = new Map();
        // Float64 preserves Canvas coordinates exactly. NaN escapes non-numeric
        // arguments into the shared values table; each row stores tape ranges.
        let tape = new Float64Array(4096), used = 0;
        const push = value => {
          if (used === tape.length) {
            const next = new Float64Array(tape.length * 2);
            next.set(tape);
            tape = next;
          }
          tape[used++] = value;
        };
        const argument = value => {
          if (typeof value === 'number' && !Number.isNaN(value)) {
            push(value);
            return;
          }
          if (!valueIds.has(value)) {
            valueIds.set(value, values.length);
            values.push(value);
          }
          push(NaN);
          push(valueIds.get(value));
        };
        const operation = (kind, name) => {
          const key = kind + ':' + name;
          if (!operationIds.has(key)) {
            operationIds.set(key, operations.length);
            operations.push([kind, name]);
          }
          return operationIds.get(key);
        };
        const context = new Proxy({}, {
          set(_target, name, value) {
            state[name] = value;
            push(operation(0, name));
            push(1);
            argument(value);
            return true;
          },
          get(_target, name) {
            if (!methods.has(name)) {
              const opcode = operation(1, name);
              methods.set(name, name === 'measureText' ? text => {
                measure.font = state.font;
                return measure.measureText(text);
              } : (...args) => {
                if (name === 'drawImage') {
                  const image = args[0];
                  if (!resources.has(image)) resources.set(image, resources.size);
                  args[0] = resources.get(image);
                }
                push(opcode);
                push(args.length);
                for (const arg of args) argument(arg);
              });
            }
            return methods.get(name);
          }
        });
        const record = action => {
          const start = used;
          action(context);
          return [start, used];
        };
        const rows = [];
        // Snapshot the background before its scratch canvas is reused.
        images.push([0, await createImageBitmap(background)]);
        for (let i = 0; i < placements.length; i++) {
          const p = placements[i];
          rows.push({
            ref: p.ref,
            fi: p.fi,
            unit: p.kind === "unit",
            normal: record((c) => draw(c, p, false)),
            selected: record((c) => draw(c, p, true)),
            outline: record((c) => draw(c, p, "outline")),
          });
          if (i % 128 === 127) {
            await scheduler.yield();
            if (token !== generation || closed) break;
          }
        }
        const markers = drawMarkers ? record(drawMarkers) : [];
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
        scene = { rows, images, markers, commands: tape.slice(0, used), operations, values, ...options };
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
        const key = [frame.step, frame.selected.join(','), frame.moving.join(','),!!frame.foreground].join('/');
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
