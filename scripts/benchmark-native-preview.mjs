// Development-only CDP test: actual pointer drags in the loaded, maximized editor.
import fs from "node:fs";
const port = Number(process.env.AI_TOOLKIT_DEBUG_PORT || 9241);
const targets = await (
  await fetch(`http://127.0.0.1:${port}/json/list`)
).json();
const target = targets.find(
  (t) => t.type === "page" && t.url.includes("src/index.html"),
);
if (!target)
  throw new Error(
    "Open an isolated native preview with a loaded castle first.",
  );
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => (socket.onopen = resolve));
let serial = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  const waiter = pending.get(message.id);
  if (waiter) {
    pending.delete(message.id);
    message.error
      ? waiter.reject(message.error)
      : waiter.resolve(message.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  const ready = await evaluate(
    `({dirty:castleEditor.isDirty()||characterEditor.isDirty(),steps:castleEditor.getDocument().frames.length,tiles:isoView.hasMapTiles()})`,
  );
  if (ready.dirty || ready.steps < 901 || !ready.tiles)
    throw new Error(
      "Use an unchanged castle with at least 901 steps and a loaded game map.",
    );
  await evaluate(
    `(async()=>{await __TAURI__.window.getCurrentWindow().maximize();${process.argv.includes('--fit') ? 'isoView.fit();' : ''}return true;})()`,
  );
  await delay(600);
  const context = await evaluate(
    `(()=>{const e=document.getElementById('castleBuildSlider'),r=e.getBoundingClientRect();return{viewport:[innerWidth,innerHeight],view:isoView.viewInfo(),map:isoView.gameMapInfo(),steps:castleEditor.getDocument().frames.length,slider:{x:r.x,y:r.y,width:r.width,height:r.height,min:+e.min,max:+e.max},canvas:[...document.querySelectorAll('canvas')].filter(c=>c.getClientRects().length).map(c=>({width:c.width,height:c.height,css:[c.clientWidth,c.clientHeight]}))}})()`,
  );
  await evaluate(
    `(()=>{const data=window.previewMeasurement={frames:[],inputToFrame:[],longTasks:[],inputValues:[],alive:true};let last=performance.now();function tick(now){if(!data.alive)return;data.frames.push(now-last);last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);data.observer=new PerformanceObserver(list=>data.longTasks.push(...list.getEntries().map(e=>e.duration)));data.observer.observe({type:'longtask'});data.handler=()=>{const time=performance.now();data.inputValues.push(+document.getElementById('castleBuildSlider').value);requestAnimationFrame(()=>data.inputToFrame.push(performance.now()-time));};document.getElementById('castleBuildSlider').addEventListener('input',data.handler);return true;})()`,
  );
  const rect = context.slider;
  if (context.canvas.length < 4)
    throw new Error(
      "Both GPU surfaces must be active; refusing to benchmark a silent fallback.",
    );
  const profileRequested = process.argv.includes("--profile");
  if (profileRequested) {
    await send("Profiler.enable");
    await send("Profiler.start");
  }
  // Account for the thumb width, just as the native range control does.
  const x = (value) =>
    rect.x +
    8 +
    ((rect.width - 16) * (value - rect.min)) / (rect.max - rect.min);
  const y = rect.y + rect.height / 2;
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: x(100),
    y,
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  const started = performance.now(),
    events = [];
  for (let i = 0; i < 60; i++) {
    await delay(Math.max(0, started + i * 100 - performance.now()));
    const value =
      i % 4 === 0 ? 900 : i % 4 === 1 ? 101 : i % 4 === 2 ? 899 : 100;
    const start = performance.now();
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: x(value),
      y,
      button: "left",
      buttons: 1,
    });
    events.push({
      target: value,
      dispatchMs: performance.now() - start,
      atMs: start - started,
    });
  }
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: x(100),
    y,
    button: "left",
    buttons: 0,
    clickCount: 1,
  });
  await delay(200);
  const profile = profileRequested ? await send("Profiler.stop") : null;
  const measured = await evaluate(
    `(()=>{const d=previewMeasurement;d.alive=false;d.observer.disconnect();document.getElementById('castleBuildSlider').removeEventListener('input',d.handler);return{frames:d.frames,inputToFrame:d.inputToFrame,longTasks:d.longTasks,inputValues:d.inputValues,dirty:castleEditor.isDirty(),selected:castleEditor.getActiveBuildStep()};})()`,
  );
  const stats = (values) => {
    const sorted = values.slice().sort((a, b) => a - b);
    return {
      samples: values.length,
      median: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      max: sorted.at(-1),
    };
  };
  const output = {
    context,
    stats: {
      frames: stats(measured.frames),
      inputToFrame: stats(measured.inputToFrame),
      dispatch: stats(events.map((e) => e.dispatchMs)),
      longTasks: measured.longTasks,
    },
    events,
    measured,
  };
  const filename =
    process.argv.slice(2).find((argument) => !argument.startsWith("--")) ||
    "native-preview-performance.json";
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  if (profile)
    fs.writeFileSync(filename + ".cpuprofile", JSON.stringify(profile.profile));
  console.log(
    JSON.stringify({
      file: filename,
      context,
      stats: output.stats,
      values: measured.inputValues.length,
      dirty: measured.dirty,
    }),
  );
} finally {
  socket.close();
}
