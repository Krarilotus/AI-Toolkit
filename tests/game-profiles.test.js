/* F1 policy is exercised through the real bundled helper. Native fault injection
 * and process-crash cases moved with the canonical implementation to toolkit-core. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const fixture = require('./fixtures/de-mode/foundation.json');
const api = require('../src/node/game-profiles');
test.after(() => api.close());
const { output } = require('../src/node/core-build-paths').coreBuildPaths();
const scratch = process.env.AI_TOOLKIT_PROFILE_TEST_ROOT || path.join(output, 'node-tests');
function temporary(t) {
  fs.mkdirSync(scratch, { recursive: true });
  const directory = fs.mkdtempSync(path.join(scratch, 'profiles-'));
  t.after(() => { assert.ok(directory.startsWith(`${path.resolve(scratch)}${path.sep}`)); fs.rmSync(directory, { recursive: true, force: true }); });
  return directory;
}
function tree(directory, entries) {
  for (const [relative, kind] of Object.entries(entries)) {
    const file = path.join(directory, relative);
    fs.mkdirSync(kind === 'directory' ? file : path.dirname(file), { recursive: true });
    if (kind !== 'directory') fs.writeFileSync(file, kind === 'text' ? 'synthetic asset marker' : Buffer.from(fixture.binaries[kind].base64, 'base64'));
  }
}
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function snapshot(root) {
  const out = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, name), stat = fs.lstatSync(file);
      out.push([path.relative(root, file), stat.isDirectory() ? 'dir' : sha(fs.readFileSync(file))]);
      if (stat.isDirectory()) walk(file);
    }
  }
  walk(root); return out;
}
function next(store) { const value = structuredClone(store); value.revision++; return value; }
function journal(repository, before, after, pending) {
  const directory = pending ? repository.transaction : repository.backup;
  fs.mkdirSync(directory);
  for (const [name, bytes] of [['before.json', before], ['after.json', after], ['displaced.json', before], ['restore.json', Buffer.from('retained evidence')]]) fs.writeFileSync(path.join(directory, name), bytes);
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify({ protocol: 1, beforeSha256: sha(before), afterSha256: sha(after) }));
}

// Load the actual facade with an observed real client. Only hello delivery is
// gated; resource checks, serialization, pipes and backend policy stay real.
function observedFacade(t, { pendingHello = false, handshakeTimeoutMs = 10000 } = {}) {
  const transport = require('../src/node/core-client'), Original = transport.CoreClient;
  const file = require.resolve('../src/node/game-profiles'), cached = require.cache[file];
  let client, release, received;
  const held = new Promise(resolve => { received = resolve; });
  class Observed extends Original {
    constructor(options) {
      super({ ...options, handshakeTimeoutMs }); client = this;
      if (pendingHello) {
        const receive = this.receive.bind(this);
        this.receive = message => {
          release = () => { this.receive = receive; try { receive(message); } catch (error) { this.fail(error); } };
          received();
        };
      }
    }
  }
  let facade;
  try { transport.CoreClient = Observed; delete require.cache[file]; facade = require(file); }
  finally { transport.CoreClient = Original; require.cache[file] = cached; }
  t.after(() => facade.close());
  return { api: facade, get client() { return client; }, held, release: () => release() };
}
function drained(client) {
  assert.equal(client.admissions.size, 0); assert.equal(client.admittedBytes, 0);
  assert.equal(client.pending.size, 0); assert.equal(client.pendingBytes, 0);
}

test('actual facade captures ordinary metadata and raw byte contents synchronously on warm and pending hello', async t => {
  for (const pendingHello of [false, true]) {
    const observed = observedFacade(t, { pendingHello }), facade = observed.api;
    if (!pendingHello) await facade.probeInstallation(null);
    const store = { ...facade.emptyStore(), extension: ['original'] };
    const ordinary = facade.validateStore(store); store.extension[0] = 'changed';
    const binary = fixture.binaries.managed, pe = Buffer.from(binary.base64, 'base64');
    const inspected = facade.inspectPe(pe); pe.fill(0);
    const metadata = Buffer.from(JSON.stringify({ ...facade.emptyStore(), extension: 'original' }));
    const parsed = facade.parseMetadata(metadata); metadata.fill(0);
    const proposal = { ...facade.emptyStore(), extension: ['original'] };
    const repository = new facade.ProfileRepository(temporary(t));
    const written = repository.compareAndSwap(null, proposal); proposal.extension[0] = 'changed';
    assert.equal(observed.client.admissions.size, 4); assert.equal(observed.client.pending.size, 0);
    if (pendingHello) { await observed.held; observed.release(); }
    assert.deepEqual((await ordinary).extension, ['original']);
    assert.deepEqual(await inspected, binary.expected);
    assert.equal((await parsed).extension, 'original');
    const receipt = await written; assert.equal(receipt.status, 'committed');
    assert.deepEqual(receipt.store.extension, ['original']);
    assert.deepEqual((await repository.read()).store, receipt.store); drained(observed.client);
  }
});

test('actual facade rejects warm and pending-hello overflow before observing byte payloads', async t => {
  for (const pendingHello of [false, true]) {
    const observed = observedFacade(t, { pendingHello }), facade = observed.api;
    if (!pendingHello) await facade.probeInstallation(null);
    let hooks = 0;
    const bytes = Buffer.alloc(256 * 1024);
    Object.defineProperty(bytes, Symbol.iterator, { get() { hooks++; throw Error('iterator must not run'); } });
    const jobs = Array.from({ length: 17 }, () => facade.inspectPe(bytes));
    const client = observed.client, before = client.admittedBytes;
    const payload = new Proxy(bytes, { get() { hooks++; throw Error('overflow payload observed'); },
      ownKeys() { hooks++; throw Error('overflow payload enumerated'); }, getPrototypeOf() { hooks++; throw Error('overflow prototype observed'); } });
    const overflow = Array.from({ length: 47 }, (_, i) => assert.rejects(
      i % 2 ? facade.inspectPe(payload) : facade.parseMetadata(payload), { code: 'queue-full' }));
    assert.equal(hooks, 0); assert.equal(client.admissions.size, 17);
    assert.equal(client.pending.size, 0); assert.equal(client.admittedBytes, before);
    if (pendingHello) { await observed.held; observed.release(); }
    assert.deepEqual(await Promise.all(jobs), Array(17).fill(null)); await Promise.all(overflow);
    drained(client); assert.equal(hooks, 0);
  }
});

test('actual facade byte vectors share the aggregate frame budget and leave control capacity', async t => {
  const observed = observedFacade(t, { pendingHello: true }), facade = observed.api;
  const bytes = Buffer.alloc(2 * 1024 * 1024 - 256, 255);
  const jobs = Array.from({ length: 3 }, () => facade.inspectPe(bytes));
  const client = observed.client, before = client.admittedBytes;
  assert.ok(before > 23 * 1024 * 1024 && before < 24 * 1024 * 1024);
  await assert.rejects(facade.parseMetadata(bytes), { code: 'queue-full' });
  assert.equal(client.admittedBytes, before); assert.equal(client.admissions.size, 3);
  const control = facade.probeInstallation(null);
  await observed.held; observed.release();
  await Promise.all(jobs); assert.equal((await control).status, 'unknown'); drained(client);
});

test('actual facade invalid, aborted and closing preparation releases each reservation once without hooks', async t => {
  const observed = observedFacade(t, { pendingHello: true }), facade = observed.api;
  let hooks = 0;
  const getter = Object.defineProperty({}, 'value', { enumerable: true, get() { hooks++; return 1; } });
  const proxy = new Proxy(Buffer.alloc(1), { get() { hooks++; return 1; }, ownKeys() { hooks++; return []; } });
  const accessorArray = Object.defineProperty([0], '0', { enumerable: true, get() { hooks++; return 0; } });
  for (const bytes of [proxy, accessorArray, Array(1), new Set([0]), new Uint16Array([0]),
    new (class extends Uint8Array {})(1), new Uint8Array(new SharedArrayBuffer(1))]) {
    await assert.rejects(facade.inspectPe(bytes), { code: 'invalid-wire-value' }); drained(observed.client);
  }
  await assert.rejects(facade.validateStore({ ...facade.emptyStore(), extension: getter }), { code: 'invalid-wire-value' }); drained(observed.client);
  await assert.rejects(facade.inspectPe(Buffer.alloc(7 * 1024 * 1024)), { code: 'frame-too-large' }); drained(observed.client);
  const signal = new AbortController(); signal.abort();
  await assert.rejects(facade.parseMetadata(proxy, { signal: signal.signal }), { code: 'cancelled' }); drained(observed.client);
  const waiting = new AbortController(), cancelled = facade.inspectPe(Buffer.alloc(128), { signal: waiting.signal });
  const reservation = [...observed.client.admissions][0]; waiting.abort();
  await assert.rejects(cancelled, { code: 'cancelled' }); drained(observed.client);
  assert.equal(reservation.buffer, null);
  // Late settlement cannot release the same reservation twice.
  observed.client.settle(reservation, new Error('late')); drained(observed.client);
  const closing = assert.rejects(facade.inspectPe(Buffer.alloc(128)), { code: 'unavailable' });
  await facade.close(); await closing; drained(observed.client);
  await assert.rejects(facade.parseMetadata(proxy), { code: 'unavailable' }); drained(observed.client);
  assert.equal(hooks, 0);
});

test('actual facade pending-hello failure drains snapshots without replay or double release', async t => {
  for (const action of ['mismatch', 'eof', 'timeout']) {
    const observed = observedFacade(t, { pendingHello: true, handshakeTimeoutMs: action === 'timeout' ? 500 : 10000 });
    const job = assert.rejects(observed.api.parseMetadata(Buffer.from(JSON.stringify(api.emptyStore()))), { code: 'unavailable' });
    const client = observed.client, reservation = [...client.admissions][0];
    await observed.held;
    if (action === 'mismatch') { client.expectedHello = {}; observed.release(); }
    else if (action === 'eof') client.child.stdin.end();
    await job; drained(client); assert.equal(reservation.buffer, null);
    client.settle(reservation, new Error('late')); drained(client);
  }
});

test('post-preservation metadata budget rejects without changing canonical or retained backup, then cross-reads accepted data', async t => {
  const spec = require('../src/desktop/generated/core/contract.json');
  const repository = new api.ProfileRepository(temporary(t)), length = 6 * 1024 * 1024 + 128;
  const initial = { ...spec.emptyStore, retained: 'a'.repeat(length) };
  assert.equal((await repository.compareAndSwap(null, initial)).status, 'committed');
  const before = snapshot(repository.directory);
  const rejected = await repository.compareAndSwap(0, { ...spec.emptyStore, revision: 1, added: 'b'.repeat(length) });
  assert.equal(rejected.status, 'metadata-too-large');
  assert.equal(rejected.sizeLimit.representation, 'persisted');
  assert.equal(rejected.sizeLimit.maxBytes, spec.maxMetadataBytes);
  assert.equal(rejected.sizeLimit.actualBytes, 12583316);
  assert.deepEqual(snapshot(repository.directory), before);
  assert.deepEqual((await repository.read()).store, initial);
  const committed = await repository.compareAndSwap(0, { ...spec.emptyStore, revision: 1, added: '\0'.repeat(1024) });
  assert.equal(committed.status, 'committed'); assert.equal(committed.store.retained.length, length);
  assert.equal(committed.store.added, '\0'.repeat(1024));
  assert.deepEqual((await repository.read()).store, committed.store);
});

test('existing oversized metadata and recovery sources remain exact with explicit size diagnostics', async t => {
  const spec = require('../src/desktop/generated/core/contract.json');
  const oversized = Buffer.from(JSON.stringify({ ...spec.emptyStore, retained: 'x'.repeat(spec.maxMetadataBytes) }));
  for (const mode of ['canonical', 'pending-before', 'committed-after', 'pending-unused-after', 'committed-unused-before']) {
    const repository = new api.ProfileRepository(temporary(t));
    if (mode === 'canonical') fs.writeFileSync(repository.file, oversized);
    else {
      const small = Buffer.from(JSON.stringify(spec.emptyStore));
      journal(repository, mode === 'pending-unused-after' ? small : oversized,
        mode === 'committed-unused-before' ? small : oversized, mode.startsWith('pending'));
    }
    const before = snapshot(repository.directory);
    if (mode === 'canonical') {
      for (const result of [await repository.read(), await repository.compareAndSwap(0, { ...spec.emptyStore, revision: 1 }),
        await repository.migrateLegacy(path.join(repository.directory, 'missing-legacy'))]) {
        assert.equal(result.status, 'metadata-too-large'); assert.equal(result.sizeLimit.maxBytes, spec.maxMetadataBytes);
      }
    }
    const recovered = await repository.recover(); assert.equal(recovered.status, 'metadata-too-large');
    assert.equal(recovered.sizeLimit.actualBytes, oversized.length);
    assert.deepEqual(snapshot(repository.directory), before);
  }
});

test('real helper inspects bounded PE/CLR evidence', async () => {
  for (const binary of Object.values(fixture.binaries)) assert.deepEqual(await api.inspectPe(Buffer.from(binary.base64, 'base64')), binary.expected);
  assert.equal(await api.inspectPe(Buffer.alloc(128)), null);
});
test('helper probes the shared layout matrix read-only, with unknown version support', async t => {
  for (const sample of fixture.cases) await t.test(sample.name, async t => {
    const directory = temporary(t); tree(directory, sample.entries); const before = snapshot(directory);
    const probe = await api.probeInstallation(directory);
    assert.equal(probe.status, sample.status);
    if (probe.status === 'recognized') {
      assert.equal(probe.profile.edition, sample.edition); assert.equal(probe.ucpLibraryAvailable, sample.ucp); assert.equal(probe.versionStatus, 'unknown');
    }
    assert.deepEqual(snapshot(directory), before);
  });
  assert.deepEqual(await api.probeInstallation(null), { status: 'unknown', diagnostics: ['no-selection'] });
});
test('helper rejects independently malformed CLR declarations', async t => {
  for (const mutation of fixture.managedMutations) await t.test(mutation.name, async t => {
    const directory = temporary(t); tree(directory, fixture.cases.find(c => c.name === 'de-only').entries);
    const bytes = Buffer.from(fixture.binaries.managed.base64, 'base64');
    const number = Buffer.alloc(4); number.writeUInt32LE(mutation.value); number.copy(bytes, mutation.offset, 0, mutation.width);
    fs.writeFileSync(path.join(directory, api.DE_FILES[1]), bytes); const before = snapshot(directory);
    assert.equal(await api.inspectPe(bytes), null);
    assert.deepEqual(await api.probeInstallation(directory), { status: 'incomplete', diagnostics: ['de-pe-invalid'] });
    assert.deepEqual(snapshot(directory), before);
  });
});
test('raw duplicate/escaped/Unicode/depth metadata cannot mutate canonical or retained backup bytes', async t => {
  const classic = temporary(t); tree(classic, fixture.cases.find(c => c.name === 'classic-ucp').entries);
  for (const sample of fixture.metadataDomain.rawStoreCases) await t.test(sample.name, async t => {
    const bytes = Buffer.from(sample.source);
    if (sample.valid) assert.deepEqual(await api.parseMetadata(bytes), JSON.parse(sample.source));
    else await assert.rejects(api.parseMetadata(bytes), { code: 'corrupt' });
    for (const retained of [false, true]) {
      const directory = temporary(t), repository = new api.ProfileRepository(directory);
      if (retained) assert.equal((await repository.compareAndSwap(null, api.emptyStore())).status, 'committed');
      fs.writeFileSync(repository.file, bytes);
      const legacy = path.join(directory, 'settings.json'); fs.writeFileSync(legacy, JSON.stringify({ ucpInstallation: classic }));
      const before = snapshot(directory), status = sample.valid ? 'ready' : 'corrupt';
      assert.equal((await repository.read()).status, status);
      assert.equal((await repository.migrateLegacy(legacy)).status, status);
      if (!sample.valid) assert.equal((await repository.compareAndSwap(0, next(api.emptyStore()))).status, 'corrupt');
      assert.deepEqual(snapshot(directory), before);
    }
  });
});
test('malformed before/after restoration authority refuses rollback and retains every journal byte', async t => {
  const goodBefore = Buffer.from(JSON.stringify(api.emptyStore())), goodAfter = Buffer.from(JSON.stringify(next(api.emptyStore())));
  for (const sample of fixture.metadataDomain.rawStoreCases.filter(c => !c.valid)) {
    for (const pending of [true, false]) {
      const directory = temporary(t), repository = new api.ProfileRepository(directory), bad = Buffer.from(sample.source);
      journal(repository, pending ? bad : goodBefore, pending ? goodAfter : bad, pending);
      const before = snapshot(directory);
      for (const operation of [() => repository.read(), () => repository.recover(), () => repository.compareAndSwap(null, api.emptyStore()), () => repository.migrateLegacy(path.join(directory, 'absent'))]) {
        assert.equal((await operation()).status, 'recovery-required', sample.name); assert.deepEqual(snapshot(directory), before);
      }
    }
  }
});
test('helper enforces metadata wrappers and scalar Unicode without changing accepted JSON', async t => {
  for (const sample of fixture.metadataDomain.jsonCases) {
    if (sample.valid) assert.deepEqual(await api.parseMetadata(Buffer.from(sample.source)), JSON.parse(sample.source));
    else await assert.rejects(api.parseMetadata(Buffer.from(sample.source)), { code: 'corrupt' });
  }
  for (const kind of ['object', 'array']) {
    let value = null;
    for (let i = 0; i < api.MAX_JSON_DEPTH - 1; i++) value = kind === 'object' ? { child: value } : [value];
    const store = api.emptyStore(); store.extension = value;
    const repository = new api.ProfileRepository(temporary(t));
    assert.deepEqual((await repository.compareAndSwap(null, store)).store, store);
    assert.deepEqual((await repository.read()).store, store);
    const tooDeep = next(store); tooDeep.extension = { child: value };
    assert.equal((await repository.compareAndSwap(0, tooDeep)).status, 'corrupt');
    assert.deepEqual((await repository.read()).store, store);
  }
});
test('repository statuses distinguish missing/corrupt/future/busy/IO and never fall back', async t => {
  const repository = new api.ProfileRepository(temporary(t));
  assert.equal((await repository.read()).status, 'missing');
  fs.writeFileSync(repository.file, '{'); assert.equal((await repository.read()).status, 'corrupt');
  fs.writeFileSync(repository.file, JSON.stringify({ ...api.emptyStore(), schemaVersion: 2 })); assert.equal((await repository.read()).status, 'future-schema');
  fs.mkdirSync(repository.lock); assert.equal((await repository.read()).status, 'busy'); fs.rmdirSync(repository.lock);
  fs.unlinkSync(repository.file); fs.mkdirSync(repository.file); assert.equal((await repository.read()).status, 'io-error');
  assert.equal((await new api.ProfileRepository(path.join(repository.directory, 'absent')).read()).status, 'io-error');
});
test('CAS retains unknown values, rejects stale revisions, and returns durable state', async t => {
  const repository = new api.ProfileRepository(temporary(t));
  const store = structuredClone(fixture.store); fs.writeFileSync(repository.file, JSON.stringify(store));
  const proposal = next(store); delete proposal.futureStore;
  assert.equal((await repository.compareAndSwap(store.revision - 1, proposal)).status, 'stale-revision');
  const written = await repository.compareAndSwap(store.revision, proposal);
  assert.equal(written.status, 'committed'); assert.deepEqual(written.store, (await repository.read()).store);
  assert.deepEqual(written.store.futureStore, store.futureStore);
});
test('legacy migration is inactive, idempotent and preserves legacy/history/skin bytes', async t => {
  const directory = temporary(t), game = temporary(t); tree(game, fixture.cases.find(c => c.name === 'classic-ucp').entries);
  const legacy = path.join(directory, 'settings.json');
  fs.writeFileSync(legacy, `\uFEFF{\r\n "ucpInstallation": ${JSON.stringify(game)}, "unsafe":9007199254740993}\r\n`);
  fs.writeFileSync(path.join(directory, 'history.json'), 'legacy history'); fs.writeFileSync(path.join(directory, 'skin.json'), 'legacy skin');
  const preserved = ['settings.json', 'history.json', 'skin.json'].map(name => [name, fs.readFileSync(path.join(directory, name))]);
  const repository = new api.ProfileRepository(directory), migrated = await repository.migrateLegacy(legacy);
  assert.equal(migrated.status, 'committed'); assert.equal(migrated.store.defaultProfileId, null); assert.deepEqual(migrated.store.selectedByEdition, {});
  assert.equal((await repository.migrateLegacy(legacy)).status, 'ready');
  for (const [name, bytes] of preserved) assert.deepEqual(fs.readFileSync(path.join(directory, name)), bytes);
});
