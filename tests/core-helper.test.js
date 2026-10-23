'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const { CoreClient, FrameReader, frame, resourcePaths } = require('../src/node/core-client');
const spec = require('../src/desktop/generated/core/contract.json');
const { output: base } = require('../src/node/core-build-paths').coreBuildPaths();
const resources = resourcePaths(path.resolve(base, 'resources'));
function directory(t) { const dir = fs.mkdtempSync(path.join(path.resolve(base), 'helper-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true })); return dir; }
function decode(bytes) { const result = [], reader = new FrameReader(v => result.push(v)); reader.push(bytes); reader.finish(); return result; }

test('real executable hello matches packaged manifest and output contains no nonprotocol text', () => {
  const child = spawnSync(resources.helperPath, [], { shell: false, windowsHide: true, input: Buffer.alloc(0) });
  assert.equal(child.status, 0); assert.equal(child.stderr.length, 0);
  assert.deepEqual(decode(child.stdout), [{ kind: 'hello', hello: JSON.parse(fs.readFileSync(resources.manifestPath)).hello }]);
});
test('real helper safely rejects truncated/oversized/invalid/duplicate frames and arbitrary operations', () => {
  const large = Buffer.alloc(4); large.writeUInt32LE(spec.maxFrameBytes + 1);
  const invalid = source => { const b = Buffer.from(source), h = Buffer.alloc(4); h.writeUInt32LE(b.length); return Buffer.concat([h, b]); };
  for (const input of [Buffer.from([1]), Buffer.from([10, 0, 0, 0, 123]), large, Buffer.alloc(4),
    invalid('{"kind":"request","id":1,"id":2,"operation":{"op":"probe","path":null}}'),
    invalid('{"kind":"request","id":1,"operation":{"op":"arbitraryInvoke","path":"ignored"}}'), Buffer.from([1, 0, 0, 0, 255])]) {
    const child = spawnSync(resources.helperPath, [], { shell: false, windowsHide: true, input });
    assert.equal(child.status, 2, child.stderr.toString()); assert.match(child.stderr.toString(), /protocol/);
    assert.equal(decode(child.stdout)[0].kind, 'hello');
  }
});
test('oversized existing repository returns the canonical typed diagnostic and connection remains usable', async t => {
  const dir = directory(t); fs.writeFileSync(path.join(dir, spec.storeName), JSON.stringify({ ...spec.emptyStore, extension: 'x'.repeat(spec.maxFrameBytes) }));
  const client = await CoreClient.connect(resources); t.after(() => client.close());
  assert.deepEqual(await client.request({ op: 'read', directory: dir }), { kind: 'store', value: {
    status: 'metadata-too-large', sizeLimit: { representation: 'persisted', maxBytes: spec.maxMetadataBytes,
      actualBytes: fs.statSync(path.join(dir, spec.storeName)).size } } });
  assert.equal((await client.request({ op: 'probe', path: null })).value.status, 'unknown');
});
test('independent helper hosts serialize actual repository CAS without lost revisions', async t => {
  const dir = directory(t), hosts = await Promise.all([CoreClient.connect(resources), CoreClient.connect(resources)]);
  t.after(() => Promise.all(hosts.map(host => host.close())));
  assert.equal((await hosts[0].request({ op: 'compareAndSwap', directory: dir, expectedRevision: null, store: spec.emptyStore })).value.status, 'committed');
  await Promise.all(hosts.map(async host => {
    let commits = 0;
    for (let attempt = 0; attempt < 1000 && commits < 8; attempt++) {
      const read = (await host.request({ op: 'read', directory: dir })).value;
      if (read.status === 'busy') { await delay(3); continue; }
      assert.equal(read.status, 'ready'); const store = read.store, revision = store.revision; store.revision++;
      const write = (await host.request({ op: 'compareAndSwap', directory: dir, expectedRevision: revision, store })).value;
      if (write.status === 'committed') commits++; else assert.ok(['busy', 'stale-revision'].includes(write.status), JSON.stringify(write));
    }
    assert.equal(commits, 8);
  }));
  assert.equal((await hosts[0].request({ op: 'read', directory: dir })).value.store.revision, 16);
});
test('helper queue remains bounded under real pipe backpressure and cancels queued EOF work', async t => {
  const dir = directory(t); fs.writeFileSync(path.join(dir, spec.storeName), JSON.stringify({ ...spec.emptyStore, extension: 'x'.repeat(2 * 1024 * 1024) }));
  const child = spawn(resources.helperPath, [], { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const closed = new Promise(resolve => child.once('close', resolve));
  const frames = [frame({ kind: 'request', id: 1, operation: { op: 'read', directory: dir } })];
  for (let id = 2; id <= 32; id++) frames.push(frame({ kind: 'request', id, operation: { op: 'probe', path: null } }));
  child.stdin.end(Buffer.concat(frames));
  // A large real result blocks stdout while the independent reader admits/cancels work.
  await delay(100);
  const messages = [], reader = new FrameReader(v => messages.push(v)); child.stdout.on('data', data => reader.push(data));
  child.stderr.resume(); assert.equal(await closed, 0); reader.finish();
  const replies = messages.filter(v => v.kind === 'reply'); assert.equal(replies.length, 32);
  assert.ok(replies.some(v => v.result.kind === 'queueFull'));
  assert.ok(replies.some(v => v.result.kind === 'cancelled'));
});
