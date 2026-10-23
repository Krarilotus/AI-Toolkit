'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const json = require('../src/shared/lossless-json');
const engine = require('../src/shared/document-session');
const lord = require('../src/shared/de-document-session');
const castle = require('../src/shared/de-castle-session');
const bytes = text => new Uint8Array(Buffer.from(text));
const raw = source => ({ bytes: bytes(source), documentId: 'open-1', path: 'source.json', formatHint: null });
const receipt = (s, status = 'committed') => ({ saveId: s.saveId, ownerId: s.ownerId, documentId: s.documentId,
  revision: s.revision, destination: s.destination, sha256: s.sha256, byteLength: s.byteLength, status });
const hasCode = code => e => e.code === code;
function browser() {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, crypto: webcrypto });
  for (const file of ['src/shared/lossless-json.js', 'src/shared/document-session.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  }
  return { engine: context.documentSession, json: context.losslessJson };
}
for (const [name, api] of [['CommonJS', { engine, json }], ['browser VM', browser()]]) {
  const assess = document => Object.freeze({ kind: document.find(['value']).type,
    assessment: Object.freeze({ diagnostics: Object.freeze([]), target: Object.freeze({ runtimeAcceptance: 'unverified' }) }) });
  test(`${name}: one assessment receives the parsed document; no-op skips reassessment; kind changes through history`, () => {
    const seen = [], session = api.engine.createSession(raw('{"value":null,"n":1}'), 'owner', d => { seen.push(d); return assess(d); });
    assert.equal(seen.length, 1); assert.equal(seen[0], session.read().document);
    assert.equal(session.read().kind, 'null');
    const initial = session.read(); session.replaceScalar(0, ['value'], null);
    assert.equal(seen.length, 1); assert.deepEqual(session.read(), initial);
    const changed = session.replaceScalars(0, [{ path: ['value'], value: true }, { path: ['n'], value: 12 }]);
    assert.equal(changed.kind, 'boolean'); assert.equal(changed.history.entries, 2); assert.equal(changed.revision, 1);
    assert.equal(seen.length, 2); assert.equal(seen[1], changed.document);
    assert.equal(session.undo(1).kind, 'null'); assert.equal(session.redo(2).kind, 'boolean');
    assert.equal(seen.length, 4);
    let reads = 0;
    const accessor = api.engine.createSession(raw('{"value":0}'), 'owner', () => ({ kind: 'generic-json', assessment: {
      get diagnostics() { if (++reads % 2 === 0) throw new Error('assessment getter reread'); return []; },
    } }));
    assert.equal(reads, 1); accessor.read(); accessor.read(); assert.equal(reads, 1);
    const before = accessor.read();
    assert.throws(() => accessor.replaceScalar(0, ['value'], 1), /assessment getter reread/);
    assert.deepEqual(accessor.read(), before);
  });
  test(`${name}: thrown and unsupported assessments are atomic with redo, saved and unknown snapshots`, async () => {
    let mode = 'ok';
    const session = api.engine.createSession(raw('{"value":0,"n":1}'), 'owner', d => {
      if (mode === 'throw') throw new Error('owned assessment refused');
      if (mode === 'unsupported') return { kind: 'unparsed', assessment: { diagnostics: [] } };
      return assess(d);
    }, { historyLimits: { maxEntries: 2 } });
    session.replaceScalar(0, ['value'], 1);
    const snapshot = await session.snapshotForSave(1, 'owned-save');
    session.acknowledgeSave(snapshot, receipt(snapshot, 'unknown'));
    session.replaceScalar(1, ['value'], 2); session.undo(2);
    for (mode of ['throw', 'unsupported']) {
      const before = session.read();
      for (const operation of [() => session.replaceScalars(before.revision, [{ path: ['value'], value: 3 }, { path: ['n'], value: 4 }]),
        () => session.redo(before.revision)]) {
        assert.throws(operation, mode === 'throw' ? /owned assessment refused/ : hasCode('unsupported-assessment'));
        assert.deepEqual(session.read(), before);
      }
    }
    mode = 'ok';
    session.acknowledgeSave(snapshot, receipt(snapshot));
    assert.equal(session.read().dirty, false); assert.equal(session.read().savedRevision, 1);
    assert.equal(session.read().canRedo, true);
    session.redo(session.read().revision);
    const before = session.read(); mode = 'throw';
    assert.throws(() => session.undo(before.revision), /owned assessment refused/);
    assert.deepEqual(session.read(), before);
  });
  test(`${name}: mixed, overlapping, foreign-handle and invalid batch failures publish no partial edit`, () => {
    const session = api.engine.createSession(raw('{"value":1,"n":2}'), 'owner', assess), before = session.read();
    const foreign = api.json.parse(bytes('{"value":1,"n":2}')).handle(['n']);
    for (const edits of [
      [{ path: ['value'], value: 3 }, { path: ['absent'], value: 4 }],
      [{ path: ['value'], value: 3 }, { path: ['n'], value: NaN }],
      [{ path: ['value'], value: 3 }, { handle: foreign, value: 4 }],
      [{ path: ['value'], value: 3 }, { path: ['value'], value: 4 }],
      [{ path: ['value'], value: 3 }, { path: ['n'], value: '\ud800' }],
    ]) { assert.throws(() => session.replaceScalars(0, edits)); assert.deepEqual(session.read(), before); }
    assert.throws(() => session.replaceScalars(-1, []), hasCode('stale-revision'));
    assert.deepEqual(session.replaceScalars(0, []), before);
    assert.throws(() => session.replaceScalars(0, [{ path: ['n'], value: 'x'.repeat(1024 * 1024 + 1) }]));
    assert.deepEqual(session.read(), before);
  });
}
test('both domain factories re-export the single engine error and history policy', () => {
  assert.equal(lord.SessionError, engine.SessionError); assert.equal(castle.SessionError, engine.SessionError);
  assert.equal(lord.DEFAULT_HISTORY_LIMITS, engine.DEFAULT_HISTORY_LIMITS);
  assert.equal(castle.DEFAULT_HISTORY_LIMITS, engine.DEFAULT_HISTORY_LIMITS);
  const session = lord.createSession(raw('{"lord":{"opponent_type":1},"value":0}'), 'owner');
  assert.equal(session.read().kind, 'de-lordjson');
  assert.equal(session.replaceScalar(0, ['lord', 'opponent_type'], null).assessment.interpretation.status, 'invalid-shape');
  assert.equal(session.undo(1).kind, 'de-lordjson');
});
test('instrumented browser boundary parses once on open, patches once per batch and does no work on read', () => {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, crypto: webcrypto });
  vm.runInContext(fs.readFileSync('src/shared/lossless-json.js', 'utf8'), context);
  const real = context.losslessJson; let parses = 0, patches = 0, assessments = 0;
  context.losslessJson = { ...real, parse: (...args) => { parses++; return real.parse(...args); },
    patch: (...args) => { patches++; return real.patch(...args); } };
  vm.runInContext(fs.readFileSync('src/shared/document-session.js', 'utf8'), context);
  const session = context.documentSession.createSession(raw('{"value":1,"n":2}'), 'owner', document => {
    assessments++; return { kind: 'generic-json', assessment: { diagnostics: [], document } };
  });
  assert.equal(parses, 1); assert.equal(assessments, 1);
  for (let i = 0; i < 30; i++) session.read();
  assert.equal(parses, 1); assert.equal(patches, 0); assert.equal(assessments, 1);
  session.replaceScalars(0, [{ path: ['value'], value: 3 }, { path: ['n'], value: 4 }]);
  assert.equal(parses, 1); assert.equal(patches, 1); assert.equal(assessments, 2);
  session.replaceScalar(1, ['value'], 3);
  assert.equal(parses, 1); assert.equal(patches, 2); assert.equal(assessments, 2);
});
