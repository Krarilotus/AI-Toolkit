'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setImmediate: turn } = require('node:timers/promises');
const { CoreClient, FrameReader, frame, serializeWire, resourcePaths } = require('../src/node/core-client');
const spec = require('../src/desktop/generated/core/contract.json');
const { output: base } = require('../src/node/core-build-paths').coreBuildPaths();
const resources = resourcePaths(path.resolve(base, 'resources'));
function temporary(t) {
  fs.mkdirSync(base, { recursive: true });
  const dir = fs.mkdtempSync(path.join(path.resolve(base), 'client-'));
  t.after(() => { assert.ok(dir.startsWith(`${path.resolve(base)}${path.sep}`)); fs.rmSync(dir, { recursive: true, force: true }); }); return dir;
}
async function connect(t, options = resources) { const client = await CoreClient.connect(options); t.after(() => client.close()); return client; }
function started(client) {
  return new Promise(resolve => {
    const receive = client.receive.bind(client);
    client.receive = message => { receive(message); if (message.kind === 'started') { client.receive = receive; resolve(message.id); } };
  });
}

test('shared build resolver is portable, isolates checkouts and rejects outputs inside a checkout', t => {
  const { coreBuildPaths } = require('../src/node/core-build-paths');
  const parent = temporary(t), a = path.join(parent, 'a'), b = path.join(parent, 'b'), cache = path.join(parent, 'cache');
  fs.mkdirSync(a); fs.mkdirSync(b);
  const options = { environment: {}, temporaryRoot: cache };
  const first = coreBuildPaths({ ...options, checkoutRoot: a });
  assert.deepEqual(coreBuildPaths({ ...options, checkoutRoot: a }), first);
  assert.notEqual(coreBuildPaths({ ...options, checkoutRoot: b }).output, first.output);
  assert.ok(first.output.startsWith(`${cache}${path.sep}`));
  const alias = path.join(parent, 'alias'); fs.symlinkSync(a, alias, process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(coreBuildPaths({ ...options, checkoutRoot: alias }).output, first.output);
  for (const output of ['relative', a, path.join(a, '..looks-outside'), path.join(alias, 'nested')]) {
    assert.throws(() => coreBuildPaths({ ...options, checkoutRoot: a, environment: { TOOLKIT_CORE_OUTPUT: output } }));
  }
  const override = path.join(parent, 'explicit-output');
  assert.equal(coreBuildPaths({ ...options, checkoutRoot: a, environment: { TOOLKIT_CORE_OUTPUT: override } }).output, override);
  fs.mkdirSync(override);
  const outputAlias = path.join(parent, 'output-alias');
  fs.symlinkSync(override, outputAlias, process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(coreBuildPaths({ ...options, checkoutRoot: a, environment: {
    TOOLKIT_CORE_OUTPUT: path.join(outputAlias, 'not-yet-created') } }).output, path.join(override, 'not-yet-created'));
  const portable = coreBuildPaths({ checkoutRoot: a, environment: {} });
  assert.ok(portable.output.startsWith(`${fs.realpathSync.native(require('node:os').tmpdir())}${path.sep}`));
  assert.equal(coreBuildPaths({ checkoutRoot: alias, environment: {} }).output, portable.output);
  assert.equal(path.isAbsolute(portable.output), true);
});

test('generic serialization rejects JS-only and side-effecting values without invoking user code', () => {
  let calls = 0;
  const accessor = Object.defineProperty({}, 'value', { enumerable: true, get() { calls++; return 1; } });
  const proxy = new Proxy({}, { ownKeys() { calls++; return []; }, getPrototypeOf() { calls++; return Object.prototype; } });
  const hidden = Object.defineProperty({}, 'x', { value: 1 });
  const symbol = { [Symbol('x')]: 1 }, sparse = Array(1), cycle = {}; cycle.self = cycle;
  const extended = [1]; extended.extra = 2;
  const values = [new Map([['x', 1]]), new Set([1]), new Date(), new Uint8Array([1]), new Number(1),
    Object.create({}), accessor, proxy, hidden, symbol, sparse, extended, cycle, undefined, 1n, () => {},
    NaN, Infinity, -0, '\ud800', { toJSON() { calls++; return {}; } }];
  for (const value of values) assert.throws(() => serializeWire({ value }), { code: 'invalid-wire-value' });
  assert.equal(calls, 0);
  const record = Object.create(null); Object.defineProperty(record, '__proto__', { value: 'kept', enumerable: true });
  assert.deepEqual(JSON.parse(serializeWire(record)), JSON.parse('{"__proto__":"kept"}'));
});
test('framing handles every split, truncation, oversized length and invalid UTF-8', () => {
  const bytes = frame({ kind: 'cancel', id: 3 });
  const messages = [], reader = new FrameReader(v => messages.push(v));
  for (const byte of bytes) reader.push(Buffer.from([byte])); reader.finish(); assert.deepEqual(messages, [{ kind: 'cancel', id: 3 }]);
  for (const length of [1, 3, bytes.length - 1]) {
    const partial = new FrameReader(() => {}); partial.push(bytes.subarray(0, length)); assert.throws(() => partial.finish(), { code: 'protocol' });
  }
  const large = Buffer.alloc(4); large.writeUInt32LE(spec.maxFrameBytes + 1); assert.throws(() => new FrameReader(() => {}).push(large), { code: 'protocol' });
  assert.throws(() => new FrameReader(() => {}).push(Buffer.from([1, 0, 0, 0, 255])), { code: 'protocol' });
});
test('missing/wrong helper and every packaged handshake identity mismatch are actionable unavailable', async t => {
  await assert.rejects(CoreClient.connect({ ...resources, helperPath: path.join(temporary(t), 'missing.exe') }), { code: 'unavailable' });
  const manifest = JSON.parse(fs.readFileSync(resources.manifestPath));
  for (const key of ['protocolMajor', 'protocolMinor', 'schemaVersion', 'contractHash', 'sourceId', 'buildId', 'architecture', 'target', 'maxFrameBytes', 'maxRawBytes', 'maxMetadataBytes', 'maxMetadataResultBytes', 'queueCapacity']) {
    const changed = structuredClone(manifest); changed.hello[key] = typeof changed.hello[key] === 'number' ? changed.hello[key] + 1 : (['sourceId', 'buildId'].includes(key) ? 'a'.repeat(64) : 'wrong');
    const manifestPath = path.join(temporary(t), 'manifest.json'); fs.writeFileSync(manifestPath, JSON.stringify(changed));
    await assert.rejects(CoreClient.connect({ ...resources, manifestPath }), error => error.code === 'unavailable' && /matching|mismatch|Unsupported/.test(error.message));
  }
  const wrong = { ...manifest, sha256: 'a'.repeat(64) }, manifestPath = path.join(temporary(t), 'manifest.json'); fs.writeFileSync(manifestPath, JSON.stringify(wrong));
  await assert.rejects(CoreClient.connect({ ...resources, manifestPath }), { code: 'unavailable' });
});

function emptyAdmission(client) {
  assert.equal(client.admissions.size, 0); assert.equal(client.admittedBytes, 0);
  assert.equal(client.pending.size, 0); assert.equal(client.pendingBytes, 0);
}
function holdHello(t, options = resources) {
  const client = new CoreClient(options), receive = client.receive.bind(client);
  let release;
  const held = new Promise(resolve => {
    client.receive = message => { release = () => { client.receive = receive; try { receive(message); } catch (error) { client.fail(error); } }; resolve(); };
  });
  t.after(() => client.close());
  return { client, held, release: () => release() };
}

test('admitted byte vectors encode every u8 exactly, including views and empty vectors', async t => {
  const gate = holdHello(t), { client } = gate; await gate.held;
  const all = Uint8Array.from({ length: 256 }, (_, i) => i);
  const vectors = [all, Buffer.from(all), all.subarray(9, 102), new Uint8Array(), [0, 9, 10, 99, 100, 255]];
  const jobs = [];
  for (const bytes of vectors) {
    jobs.push(client.requestBytes('inspectPe', bytes));
    const reservation = [...client.admissions].at(-1), body = reservation.buffer.subarray(4);
    assert.equal(reservation.bytes, reservation.buffer.length);
    assert.equal(body.toString(), JSON.stringify({ kind: 'request', id: reservation.id,
      operation: { op: 'inspectPe', bytes: Array.from(bytes) } }));
  }
  all.fill(255); gate.release(); await Promise.all(jobs); emptyAdmission(client);
});
test('synchronous admission bounds serialization before ready and rejects overflow without examining payloads', async t => {
  for (const pendingHello of [false, true]) {
    const gate = holdHello(t), { client } = gate;
    await gate.held;
    if (!pendingHello) { gate.release(); await client.ready; }
    const operation = { op: 'validateStore', store: { ...spec.emptyStore, extension: 'x'.repeat(1024 * 1024) } };
    const jobs = Array.from({ length: spec.queueCapacity + 1 }, () => client.request(operation));
    const reserved = client.admittedBytes;
    assert.equal(client.admissions.size, spec.queueCapacity + 1);
    assert.equal(client.pending.size, 0);
    // This payload would be invalid-wire-value if it entered the serializer.
    const overflow = Array.from({ length: 47 }, () => assert.rejects(client.request(new Map()), { code: 'queue-full' }));
    assert.equal(client.admittedBytes, reserved);
    assert.ok(reserved < spec.maxFrameBytes * 2);
    if (pendingHello) gate.release();
    await Promise.all([...jobs, ...overflow]); emptyAdmission(client);
    assert.equal((await client.request({ op: 'probe', path: null })).value.status, 'unknown'); emptyAdmission(client);
  }
});
test('aggregate encoding budget is reserved before string copying, with room for control requests', async t => {
  const gate = holdHello(t), { client } = gate; await gate.held;
  const operation = { op: 'validateStore', store: { ...spec.emptyStore, extension: 'x'.repeat(7 * 1024 * 1024) } };
  const jobs = Array.from({ length: 3 }, () => client.request(operation));
  const before = client.admittedBytes;
  assert.ok(before > 21 * 1024 * 1024 && before < spec.maxFrameBytes * 2);
  // A shared serializer sink sees the byte charge before JSON.stringify runs.
  const stringify = JSON.stringify; let largeCopies = 0;
  JSON.stringify = value => { if (typeof value === 'string' && value.length > 1024) largeCopies++; return stringify(value); };
  const rejected = client.request(operation);
  JSON.stringify = stringify;
  await assert.rejects(rejected, { code: 'queue-full' });
  assert.equal(largeCopies, 0); assert.equal(client.admittedBytes, before); assert.equal(client.admissions.size, 3);
  jobs.push(client.request({ op: 'probe', path: null }));
  gate.release(); await Promise.all(jobs); emptyAdmission(client);
});
test('waiting snapshots are immutable and cancellation, invalid inputs and closing release every reservation', async t => {
  const gate = holdHello(t), { client } = gate; await gate.held;
  for (const operation of [{ op: 'validateStore', store: new Map() }, { op: 'validateStore', store: '\ud800' }]) {
    await assert.rejects(client.request(operation), { code: 'invalid-wire-value' }); emptyAdmission(client);
  }
  await assert.rejects(client.request({ op: 'validateStore', store: 'x'.repeat(spec.maxFrameBytes) }), { code: 'frame-too-large' }); emptyAdmission(client);
  const signal = new AbortController(), cancelled = client.request({ op: 'probe', path: null }, { signal: signal.signal });
  const reservation = [...client.admissions][0];
  signal.abort(); await assert.rejects(cancelled, { code: 'cancelled' });
  emptyAdmission(client); assert.equal(reservation.buffer, null);
  await assert.rejects(client.request(new Map(), { signal: signal.signal }), { code: 'cancelled' }); emptyAdmission(client);
  const operation = { op: 'validateStore', store: { ...spec.emptyStore, extension: ['original'] } };
  const job = client.request(operation); operation.op = 'recover'; operation.store.extension[0] = 'changed';
  gate.release(); assert.deepEqual((await job).value.extension, ['original']); emptyAdmission(client);
  client.nextId = spec.maxRequestId;
  await assert.rejects(client.request(new Map()), { code: 'unavailable' }); emptyAdmission(client);
  await client.close();
  await assert.rejects(client.request(new Map()), { code: 'unavailable' }); emptyAdmission(client);
});
test('pending hello cancellation, close, EOF and handshake failure do not leak prepared buffers', async t => {
  for (const action of ['close', 'eof', 'mismatch', 'timeout']) {
    const gate = holdHello(t, { ...resources, handshakeTimeoutMs: action === 'timeout' ? 500 : 10000 });
    const { client } = gate;
    // Attach rejection handlers immediately, before provoking any handshake failure.
    const ready = assert.rejects(client.ready, { code: 'unavailable' });
    const job = assert.rejects(client.request({ op: 'compareAndSwap', directory: temporary(t), expectedRevision: null,
      store: { ...spec.emptyStore, extension: 'x'.repeat(1024 * 1024) } }), { code: 'unavailable' });
    await gate.held;
    const reservation = [...client.admissions][0];
    if (action === 'close') await client.close();
    else if (action === 'eof') client.child.stdin.end();
    else if (action === 'mismatch') { client.expectedHello = {}; gate.release(); }
    await Promise.all([job, ready]); emptyAdmission(client); assert.equal(reservation.buffer, null);
  }
});
test('wire byte accounting includes Unicode and escapes exactly, without a decode/re-encode snapshot', () => {
  const value = { text: 'ascii\\\"\b\t\n\f\r\0\u001fäࠀ😀', values: [null, true, false, -1, 9007199254740991] };
  let charged = 0;
  const body = serializeWire(value, { charge: count => { charged += count; } });
  assert.equal(charged, body.length); assert.equal(body.toString(), JSON.stringify(value));
  assert.deepEqual(frame(value).subarray(4), body);
});
test('real helper enforces client queue bounds and rejects exotic CAS without artifacts', async t => {
  const client = await connect(t), directory = temporary(t);
  await assert.rejects(client.request({ op: 'compareAndSwap', directory, expectedRevision: null, store: { extension: new Map() } }), { code: 'invalid-wire-value' });
  assert.deepEqual(fs.readdirSync(directory), []);
  const jobs = Array.from({ length: spec.queueCapacity + 3 }, () => client.request({ op: 'probe', path: null }));
  const results = await Promise.allSettled(jobs);
  assert.equal(results.filter(v => v.status === 'rejected' && v.reason.code === 'queue-full').length, 2);
  assert.equal((await client.request({ op: 'probe', path: null })).value.status, 'unknown');
  emptyAdmission(client);
});
test('queued cancellation does not kill helper; accepted cancellation finishes the actual write', async t => {
  const client = await connect(t), directory = temporary(t), accepted = started(client), firstSignal = new AbortController();
  const store = structuredClone(spec.emptyStore); store.extension = 'x'.repeat(4 * 1024 * 1024);
  const first = client.request({ op: 'compareAndSwap', directory, expectedRevision: null, store }, { signal: firstSignal.signal });
  await accepted;
  const secondSignal = new AbortController();
  const queued = client.request({ op: 'compareAndSwap', directory, expectedRevision: 0, store: { ...store, revision: 1, extension: '' } }, { signal: secondSignal.signal });
  const queuedResult = assert.rejects(queued, { code: 'cancelled' });
  await turn(); secondSignal.abort(); firstSignal.abort();
  assert.equal((await first).value.status, 'committed'); await queuedResult;
  assert.equal((await client.request({ op: 'read', directory })).value.store.revision, 0);
  assert.equal((await client.request({ op: 'probe', path: null })).value.status, 'unknown');
});
test('EOF cancels queued write and drains accepted write to a real receipt', async t => {
  const client = await connect(t), directory = temporary(t), accepted = started(client);
  const store = { ...spec.emptyStore, extension: 'x'.repeat(4 * 1024 * 1024) };
  const signal = new AbortController();
  const first = client.request({ op: 'compareAndSwap', directory, expectedRevision: null, store }, { signal: signal.signal }); await accepted;
  const queued = client.request({ op: 'compareAndSwap', directory, expectedRevision: 0, store: { ...spec.emptyStore, revision: 1 } });
  const cancelled = assert.rejects(queued, { code: 'cancelled' });
  await turn(); const closed = client.close();
  signal.abort(); // EOF already carries cancellation; never write to the closed pipe.
  assert.equal((await first).value.status, 'committed'); await cancelled; await closed;
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, spec.storeName))).revision, 0);
  emptyAdmission(client);
});
test('helper termination after acceptance reports unknown-outcome and never replays a write', async t => {
  const client = await connect(t), directory = temporary(t), accepted = started(client);
  const result = client.request({ op: 'compareAndSwap', directory, expectedRevision: null, store: { ...spec.emptyStore, extension: 'x'.repeat(4 * 1024 * 1024) } });
  const unknown = assert.rejects(result, error => error.code === 'unknown-outcome' && error.cause && /not replayed/.test(error.message));
  await accepted;
  // Deliberate synthetic process failure, never the implementation's cancel path.
  client.child.kill(); await unknown; await client.exited;
  const inventory = fs.readdirSync(directory);
  assert.ok(!inventory.some(name => /retry|replay/.test(name)));
  await assert.rejects(client.request({ op: 'probe', path: null }), { code: 'unavailable' });
  emptyAdmission(client);
});
