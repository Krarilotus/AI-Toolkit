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
      this.layer = layer;
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

test('2D worker paints units and labels with the same scene as buildings, above future tint', () => {
  const draws=[];const ctx=new Proxy({}, {get:(_t,k)=> k==='drawImage'?()=>draws.push('image'):k==='fillText'?(x)=>draws.push(x):()=>{}});
  const context=vm.createContext({onmessage:null,postMessage(){},OffscreenCanvas:class{getContext(){return ctx;}}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/js/castle-canvas-worker.js'),'utf8'),context);
  context.onmessage({data:{canvas:{getContext:()=>ctx}}});
  const commands=[],values=[],operations=[[1,'fillText']];
  const normal=x=>{const start=commands.length;values.push(x);commands.push(0,3,NaN,values.length-1,0,0);return [start,commands.length];};
  const scene={commands,values,operations,images:[[0,{close(){}}]],width:100,height:100,dpr:1,
    rows:[{ref:'unit',unit:true,normal:normal('unit'),selected:normal('selected unit')},
      {ref:'future',fi:5,normal:normal('future'),outline:normal('outline')}],markers:normal('markers')};
  context.onmessage({data:{scene,frame:{step:0,selected:['unit'],moving:[]}}});
  assert.deepEqual(draws,['image','future','image','selected unit','markers']);
  draws.length=0;
  context.onmessage({data:{frame:{step:10,selected:[],moving:['unit']}}});
  assert.deepEqual(draws,['image','future'],'moving units and their old labels are excluded');
  draws.length=0;
  context.onmessage({data:{frame:{step:10,selected:[],moving:[],foreground:true}}});
  assert.deepEqual(draws,['image','future'],'analysis foreground owns units without duplicate drawing');
});

test('GPU fire masks discard stale results and release bitmaps on toggling off', async () => {
  const h=harness('castle-gpu-stage.js');let frames=0;
  const stage=await h.api.castleGpuStage.create(()=>frames++),worker=h.workers[0];
  stage.setScene([command(0)],[{...command(1),flammable:true}],1,[100,100]);
  stage.render(100,100,1,0,0);await flush();
  const first=worker.messages.at(-1).data;
  assert.equal(first.records[0][1].flammable,true);
  let closed=0;const bitmap={close(){closed++;}};
  worker.finish({mask:bitmap,sceneVersion:first.sceneVersion});
  assert.equal(stage.fireMask,bitmap);assert.equal(frames,1);
  stage.setScene([command(0)],[],1,null);
  assert.equal(closed,1);assert.equal(stage.fireMask,null);
  worker.finish({mask:{close(){closed++;}},sceneVersion:first.sceneVersion});
  assert.equal(closed,2);assert.equal(frames,1,'obsolete mask does not trigger a repaint');
  stage.destroy();
});


test('numeric 2D command transport preserves exact calls, strings, floats and images',async()=>{
 const h=harness('castle-canvas-scene.js'),stage=h.api.castleCanvasScene.create(h.target,assert.fail),sprite={};
 const draw=(ctx)=>{ctx.save();ctx.font='13px serif';ctx.fillStyle='rgba(1,2,3,0.7)';ctx.globalAlpha=0.123456789012345;
   ctx.drawImage(sprite,1.23456789012345,2,3,4,5,6,7,8);ctx.fillText('A \u65e5 \u0628',10.125,12.875);ctx.setLineDash([1,2]);ctx.restore();};
 await stage.setScene({},[{ref:'a',fi:0}],draw,{},{});stage.render({step:0,selected:[],moving:[]});
 const message=h.workers[0].messages.at(-1),scene=message.data.scene;
 assert.ok(message.transfer.includes(scene.commands.buffer),'command storage transfers instead of being structured-cloned');
 const actions=[];const target=new Proxy({}, {set:(_t,k,v)=>{actions.push(['set',k,v]);return true;},get:(_t,k)=>(...args)=>actions.push(['call',k,...args])});
 draw(target);const expected=actions.splice(0);expected.find(a=>a[1]==='drawImage')[2]=scene.images[1][1];
 const context=vm.createContext({onmessage:null,postMessage(){},sceneData:scene,Map});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/js/castle-canvas-worker.js'),'utf8'),context);
 vm.runInContext('scene=sceneData;images=new Map(scene.images);',context);
 context.replay(target,scene.rows[0].normal);
 assert.deepEqual(actions,expected);
 stage.destroy();
});

test('worker surfaces retain intrinsic aspect ratio while their host resizes', async () => {
  const h = harness('castle-canvas-scene.js');
  const stage = h.api.castleCanvasScene.create(h.target, assert.fail);
  await stage.setScene({}, [], () => {}, {}, {width: 1000, height: 600, dpr: 2});
  stage.render({step: 0, selected: [], moving: []});
  assert.match(h.target.layer.style.cssText, /width:auto;height:auto/);
  assert.equal(h.target.layer.style.transform, 'scale(0.5)');
  // Resize while the previous worker frame is still in flight.
  await stage.setScene({}, [], () => {}, {}, {width: 600, height: 1000, dpr: 2});
  assert.equal(h.target.layer.style.transform, 'scale(0.5)');
  h.workers[0].finish();
  assert.equal(h.workers[0].messages.at(-1).data.scene.width, 600);
  assert.equal(h.target.layer.style.transform, 'scale(0.5)');
  stage.destroy();

  const gpu = harness('castle-gpu-stage.js');
  const gpuStage = await gpu.api.castleGpuStage.create(() => {});
  gpuStage.presentBehind(gpu.target, 2);
  assert.match(gpu.target.layer.style.cssText, /width:auto;height:auto/);
  assert.equal(gpu.target.layer.style.transform, 'scale(0.5)');
  gpuStage.presentBehind(gpu.target, 1);
  assert.equal(gpu.target.layer.style.transform, 'scale(1)');
  gpuStage.destroy();
});

test('dense command tape grows without mixing placement or selection ranges', async () => {
  const h = harness('castle-canvas-scene.js');
  const stage = h.api.castleCanvasScene.create(h.target, assert.fail);
  const placements = Array.from({length: 1000}, (_, fi) => ({ref: String(fi), fi}));
  await stage.setScene({}, placements, (ctx, p, selected) => {
    ctx.fillStyle = selected === 'outline' ? 'red' : selected ? 'blue' : 'green';
    ctx.fillRect(p.fi + 0.125, -0, 1, 2);
  }, {}, {});
  stage.render({step: 999, selected: [], moving: []});
  const scene = h.workers[0].messages.at(-1).data.scene;
  const original = scene.commands;
  scene.commands = structuredClone(original, {transfer: [original.buffer]});
  assert.equal(original.byteLength, 0);
  const context = vm.createContext({onmessage: null, postMessage() {}, sceneData: scene});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/castle-canvas-worker.js'), 'utf8'), context);
  vm.runInContext('scene=sceneData;', context);
  for (const row of scene.rows) {
    for (const [variant, color] of [['normal', 'green'], ['selected', 'blue'], ['outline', 'red']]) {
      const target = {fillRect(x, y, w, h) {
        assert.deepEqual([this.fillStyle, x, y, w, h], [color, row.fi + 0.125, -0, 1, 2]);
      }};
      context.replay(target, row[variant]);
    }
  }
  stage.destroy();
});
