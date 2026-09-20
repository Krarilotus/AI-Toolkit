"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const flush = () => new Promise((resolve) => setImmediate(resolve));
function harness(file) {
  const workers = [],
    bitmaps = [];
  const parent = { style: {} };
  const canvas = () => ({
    style: {},
    parentNode: null,
    transferControlToOffscreen() {
      return {};
    },
    remove() {
      this.parentNode = null;
    },
  });
  class Worker {
    constructor() {
      this.messages = [];
      workers.push(this);
    }
    postMessage(data, transfer) {
      this.messages.push({ data, transfer });
      if (data.init)
        queueMicrotask(() => this.onmessage({ data: { ready: true } }));
    }
    finish(data = { done: true }) {
      this.onmessage({ data });
    }
    terminate() {
      this.terminated = true;
    }
  }
  const context = vm.createContext({
    window: {},
    Worker,
    URL,
    location: { href: "file:///test/src/index.html" },
    document: { currentScript: null, createElement: canvas },
    scheduler: { yield: async () => {} },
    createImageBitmap: async (image) => {
      const bitmap = {
        image,
        close() {
          this.closed = true;
        },
      };
      bitmaps.push(bitmap);
      return bitmap;
    },
  });
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../src/js", file), "utf8"),
    context,
  );
  const target = {
    style: {},
    parentNode: parent,
    before(layer) {
      layer.parentNode = parent;
    },
  };
  return { api: context.window, workers, bitmaps, target };
}
function command(id) {
  return {
    key: String(id),
    imageId: 1,
    image: { width: 2, height: 2 },
    args: [id, 0, 2, 2],
    order: { gx: id, gy: 0, tiles: 1 },
  };
}

test("GPU worker retains terrain/assets and replaces pending scenes with the latest request", async () => {
  const h = harness("castle-gpu-stage.js"),
    stage = await h.api.castleGpuStage.create(() => {}),
    worker = h.workers[0];
  const terrain = [command(0)],
    first = command(1),
    last = command(901);
  stage.setScene(terrain, [first], 1);
  stage.render(100, 100, 1, 0, 0);
  await flush();
  assert.equal(worker.messages.length, 2);
  stage.setScene(terrain, [command(100)], 1);
  stage.render(100, 100, 1, 0, 0);
  stage.setScene(terrain, [last], 1);
  stage.render(100, 100, 1, 0, 0);
  assert.equal(
    worker.messages.length,
    2,
    "one in-flight render, no queue of old steps",
  );
  worker.finish({ id: 1 });
  await flush();
  const next = worker.messages.at(-1).data;
  assert.equal(next.terrain, undefined);
  assert.equal(next.assets.length, 0);
  assert.equal(next.records.length, 1);
  assert.equal(next.records[0][1].key, "901");
  assert.equal(
    h.bitmaps.length,
    1,
    "asset uploaded once across arbitrary steps",
  );
  worker.finish({ id: next.id });
  stage.render(100, 100, 1, 0, 0);
  await flush();
  assert.equal(
    worker.messages.length,
    3,
    "presentation does not cause a render feedback loop",
  );
  stage.setScene(terrain, [last], 2);
  stage.render(100, 100, 1, 0, 0);
  await flush();
  assert.equal(
    worker.messages.at(-1).data.reset,
    true,
    "document revision resets retained commands",
  );
  stage.destroy();
  assert.equal(worker.terminated, true);
});

test("2D worker captures placement commands once and sends only the latest step while busy", async () => {
  const h = harness("castle-canvas-scene.js"),
    scene = h.api.castleCanvasScene.create(h.target, assert.fail),
    worker = h.workers[0];
  let draws = 0;
  await scene.setScene(
    {},
    [{ ref: "f:0:0", fi: 0 }],
    (ctx, _p, selected) => {
      draws++;
      ctx.fillStyle = selected ? "red" : "blue";
      ctx.fillRect(0, 0, 2, 2);
    },
    {},
    { width: 10, height: 10, dpr: 1 },
  );
  scene.render({ step: 100, selected: [], moving: [] });
  scene.render({ step: 900, selected: [], moving: [] });
  scene.render({ step: 101, selected: [], moving: [] });
  assert.equal(worker.messages.length, 2);
  assert.equal(
    draws,
    3,
    "normal, selected and outline variants captured only at scene construction",
  );
  worker.finish();
  assert.equal(worker.messages.length, 3);
  assert.equal(worker.messages.at(-1).data.frame.step, 101);
  assert.equal(
    worker.messages.at(-1).data.scene,
    null,
    "no full scene serialization on scrubs",
  );
  scene.destroy();
  assert.equal(worker.terminated, true);
});

test("discarded 2D scene preparations release their bitmaps", async () => {
  const h = harness("castle-canvas-scene.js"),
    scene = h.api.castleCanvasScene.create(h.target, assert.fail);
  const a = scene.setScene({}, [], () => {}, {}, {});
  const b = scene.setScene({}, [], () => {}, {}, {});
  await Promise.all([a, b]);
  assert.equal(h.bitmaps[0].closed, true);
  scene.destroy();
  assert.equal(
    h.bitmaps[1].closed,
    true,
    "unsent scene is released on disposal",
  );
});
