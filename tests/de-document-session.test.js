'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto, createHash } = require('node:crypto');
const cjs = require('../src/shared/de-document-session');
const json = require('../src/shared/lossless-json');
const fixture = new Uint8Array(fs.readFileSync(path.join(__dirname, 'fixtures/de-documents/complete-synthetic.lordjson')));
const bytes = text => new Uint8Array(Buffer.from(text, 'utf8'));
const buffer = raw => Buffer.from(raw);
const scalar = ['lord', 'opponent_type'];
function browser(crypto = webcrypto) {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, crypto });
  for (const file of ['../src/shared/lossless-json', '../src/shared/document-session', '../src/shared/generated/de-lord-pin', '../src/js/de-lord-format', '../src/shared/de-document-session']) {
    vm.runInContext(fs.readFileSync(require.resolve(file), 'utf8'), context);
  }
  return { api: context.deDocumentSession, json: context.losslessJson };
}
const raw = (data = fixture) => ({ documentId: 'document-7', path: 'input.lordjson', formatHint: 'de-lordjson', bytes: data });
const receipt = (snapshot, status = 'committed', changes = {}) => ({
  saveId: snapshot.saveId, documentId: snapshot.documentId, ownerId: snapshot.ownerId,
  revision: snapshot.revision, destination: snapshot.destination, sha256: snapshot.sha256,
  byteLength: snapshot.byteLength, status, ...changes,
});
const hasCode = code => error => error.code === code;
const environments = [['CommonJS', { api: cjs, json }], ['browser VM', browser()]];

for (const [name, { api, json: codec }] of environments) {
  const create = data => api.createSession(raw(data), 'opaque-context-A-epoch-1');
  test(`${name}: captures immutable ownership/raw metadata; hints never certify format; input/parse failures retain source`, () => {
    const source = raw(fixture.slice()), session = api.createSession(source, 'owner-A');
    const original = session.read().document;
    source.bytes.fill(0); source.path = 'changed'; source.documentId = 'changed'; source.formatHint = 'changed';
    const state = session.read();
    assert.ok(Object.isFrozen(session)); assert.ok(Object.isFrozen(state));
    assert.equal(state.ownerId, 'owner-A'); assert.equal(state.documentId, 'document-7');
    assert.equal(state.path, 'input.lordjson'); assert.equal(state.formatHint, 'de-lordjson');
    assert.equal(state.originalDocument, original); assert.equal(state.document, original);
    assert.equal(state.savedDocument, original); assert.equal(state.dirty, false);
    const copy = original.serialize(); copy.fill(0);
    assert.deepEqual(buffer(original.serialize()), buffer(fixture));
    assert.throws(() => api.createSession(raw(), { id: 'owner-A' }), /ownerId/);
    const generic = create(bytes('{"frames":[],"aic":{"x":1}}')).read();
    assert.equal(generic.kind, 'generic-json'); assert.equal(generic.assessment.target.canonicalStructure, 'blocked');
    assert.equal(state.assessment.target.runtimeAcceptance, 'unverified');
    assert.equal(Object.hasOwn(state, 'validForGame'), false);
    const invalid = bytes('{"lord":');
    assert.throws(() => create(invalid), error => error.category === 'syntax' && buffer(error.serializeOriginal()).equals(buffer(invalid)));
    assert.deepEqual(buffer(invalid), Buffer.from('{"lord":'));
  });

  test(`${name}: no-op identity, exact scalar patches and atomic stale/missing/ambiguous/structural failures`, () => {
    const session = create(), before = session.read();
    const noOp = session.replaceScalar(0, scalar, codec.numberToken('1.000e0'));
    assert.equal(noOp.document, before.document); assert.equal(noOp.revision, 0);
    assert.equal(noOp.canUndo, false); assert.equal(noOp.dirty, false);
    const node = before.document.find(scalar), next = session.replaceScalar(0, scalar, -2147483648);
    const expected = Buffer.concat([buffer(fixture).subarray(0, node.span.start), Buffer.from('-2147483648'), buffer(fixture).subarray(node.span.end)]);
    assert.deepEqual(buffer(next.document.serialize()), expected);
    assert.deepEqual(buffer(next.originalDocument.serialize()), buffer(fixture));
    assert.equal(next.revision, 1); assert.equal(next.dirty, true);
    for (const action of [
      () => session.replaceScalar(0, scalar, 4),
      () => session.replaceScalar(1, ['lord', 'missing'], 4),
      () => session.replaceScalar(1, ['lord'], 4),
      () => session.replaceScalar(1, scalar, Number.MAX_SAFE_INTEGER + 1),
      () => session.undo(0), () => session.redo(0),
    ]) {
      assert.throws(action); assert.deepEqual(session.read(), next);
    }
    const duplicate = create(bytes('{"lord":{"opponent_type":1,"opponent\\u005ftype":2,"keep":-0},"x":1e400,"x":9007199254740993}'));
    assert.throws(() => duplicate.replaceScalar(0, scalar, 5));
    assert.equal(duplicate.read().revision, 0);
    duplicate.replaceScalar(0, ['lord', 'keep'], 7);
    assert.equal(buffer(duplicate.read().document.serialize()).toString(), '{"lord":{"opponent_type":1,"opponent\\u005ftype":2,"keep":7},"x":1e400,"x":9007199254740993}');
  });

  test(`${name}: undo/redo preserves saved content; session revisions do not alias D1 branches`, async () => {
    const session = create();
    assert.equal(session.undo(0).revision, 0); assert.equal(session.redo(0).revision, 0);
    const a = session.replaceScalar(0, scalar, 2), b = session.replaceScalar(1, scalar, 3);
    const saved = await session.snapshotForSave(2, 'saved.lordjson');
    session.acknowledgeSave(saved, receipt(saved));
    assert.equal(session.read().dirty, false);
    assert.equal(session.undo(2).document, a.document); assert.equal(session.read().dirty, true);
    assert.equal(session.redo(3).document, b.document); assert.equal(session.read().dirty, false);
    session.undo(4); session.undo(5);
    assert.equal(session.read().document, session.read().originalDocument);
    assert.equal(session.read().dirty, true); // The saved destination contains b.
    const originalNoOp = session.replaceScalar(6, scalar, 1);
    assert.equal(originalNoOp.revision, 6); assert.equal(originalNoOp.canRedo, true);
    const branch = session.replaceScalar(6, scalar, 4);
    assert.equal(branch.document.revision, a.document.revision); // D1-local revisions repeat.
    assert.equal(branch.revision, 7); assert.equal(branch.canRedo, false);
    assert.throws(() => session.replaceScalar(a.revision, scalar, 6), hasCode('stale-revision'));
    assert.equal(session.read().revision, 7);
    const unsaved = create(); unsaved.replaceScalar(0, scalar, 2);
    assert.equal(unsaved.undo(1).dirty, false); // Original open bytes are initially saved.
    const equalContent = create(); equalContent.replaceScalar(0, scalar, 2); equalContent.replaceScalar(1, scalar, 1);
    assert.equal(equalContent.read().dirty, false); // Content, not document identity or revision equality.
  });

  test(`${name}: snapshots protect private bytes/identity, and mismatched/replayed receipts cannot change saved state`, async () => {
    const session = create(); session.replaceScalar(0, scalar, 8);
    await assert.rejects(session.snapshotForSave(0, 'out.lordjson'), hasCode('stale-revision'));
    await assert.rejects(session.snapshotForSave(1, ''), /destination/);
    const promise = session.snapshotForSave(1, 'out.lordjson');
    assert.equal(session.read().save.status, 'preparing');
    await assert.rejects(session.snapshotForSave(1, 'other'), hasCode('save-in-flight'));
    const snapshot = await promise, before = session.read();
    assert.ok(Object.isFrozen(snapshot));
    const expected = snapshot.serialize(), publicCopy = snapshot.serialize(); publicCopy.fill(0);
    assert.deepEqual(buffer(snapshot.serialize()), buffer(expected));
    assert.equal(snapshot.sha256, createHash('sha256').update(expected).digest('hex'));
    assert.equal(snapshot.byteLength, expected.length);
    assert.throws(() => session.acknowledgeSave({ ...snapshot }, receipt(snapshot)), hasCode('foreign-snapshot'));
    const other = create(), otherSnapshot = await other.snapshotForSave(0, 'out.lordjson');
    assert.throws(() => session.acknowledgeSave(otherSnapshot, receipt(otherSnapshot)), hasCode('foreign-snapshot'));
    for (const changes of [
      { saveId: snapshot.saveId + 1 }, { documentId: 'foreign' }, { ownerId: 'foreign' }, { revision: 0 },
      { destination: 'other' }, { sha256: '0'.repeat(64) }, { byteLength: 0 }, { status: 'success' },
    ]) {
      assert.throws(() => session.acknowledgeSave(snapshot, receipt(snapshot, 'committed', changes)), hasCode('receipt-mismatch'));
      assert.deepEqual(session.read(), before);
    }
    session.acknowledgeSave(snapshot, receipt(snapshot));
    assert.equal(session.read().path, 'out.lordjson'); assert.equal(session.read().dirty, false);
    assert.throws(() => session.acknowledgeSave(snapshot, receipt(snapshot)), hasCode('foreign-snapshot'));
    const second = await session.snapshotForSave(1, 'again');
    assert.ok(second.saveId > snapshot.saveId);
    assert.throws(() => session.acknowledgeSave(second, receipt(snapshot)), hasCode('receipt-mismatch'));
    assert.equal(session.read().path, 'out.lordjson');
  });

  test(`${name}: older successful save retains later edits; undo/redo remains valid across Save As`, async () => {
    const session = create(); const a = session.replaceScalar(0, scalar, 6);
    const saving = session.snapshotForSave(1, 'save-as.lordjson');
    const b = session.replaceScalar(1, scalar, 7); // Also races digest preparation.
    const snapshot = await saving;
    assert.deepEqual(buffer(snapshot.serialize()), buffer(a.document.serialize()));
    const c = session.replaceScalar(2, scalar, 8); // Edit after submission, before receipt.
    const state = session.acknowledgeSave(snapshot, receipt(snapshot));
    assert.equal(state.document, c.document); assert.equal(state.savedDocument, a.document);
    assert.equal(state.revision, 3); assert.equal(state.savedRevision, 1); assert.equal(state.dirty, true);
    assert.equal(state.path, 'save-as.lordjson'); assert.equal(state.sourcePath, 'input.lordjson');
    assert.equal(session.undo(3).document, b.document); assert.equal(session.read().dirty, true);
    assert.equal(session.undo(4).dirty, false);
    assert.equal(session.redo(5).dirty, true);
    const reopened = api.createSession({ ...raw(snapshot.serialize()), path: snapshot.destination }, state.ownerId);
    assert.deepEqual(buffer(reopened.read().document.serialize()), buffer(a.document.serialize()));
  });

  test(`${name}: failed/cancelled/unknown saves retain destination, bytes and history; unknown needs explicit reconciliation`, async () => {
    const session = create(); session.replaceScalar(0, scalar, 9);
    const committed = await session.snapshotForSave(1, 'first.lordjson');
    session.acknowledgeSave(committed, receipt(committed));
    const edited = session.replaceScalar(1, scalar, 10);
    for (const status of ['failed', 'cancelled', 'unknown']) {
      const snapshot = await session.snapshotForSave(2, 'attempt.lordjson');
      const state = session.acknowledgeSave(snapshot, receipt(snapshot, status));
      assert.equal(state.document, edited.document); assert.equal(state.savedDocument, edited.savedDocument);
      assert.equal(state.path, 'first.lordjson'); assert.equal(state.dirty, true);
      assert.equal(state.revision, 2); assert.equal(state.savedRevision, 1); assert.equal(state.canUndo, true);
      assert.equal(state.lastSave.status, status);
      if (status === 'unknown') {
        assert.equal(state.save.status, 'unknown');
        await assert.rejects(session.snapshotForSave(2, 'retry'), hasCode('save-in-flight'));
        session.replaceScalar(2, scalar, 11);
        session.acknowledgeSave(snapshot, receipt(snapshot, 'unknown')); // Repeated unknown is not success.
        const reconciled = session.acknowledgeSave(snapshot, receipt(snapshot));
        assert.equal(reconciled.path, 'attempt.lordjson'); assert.equal(reconciled.dirty, true);
        assert.equal(reconciled.savedRevision, 2); assert.equal(reconciled.revision, 3);
      } else assert.equal(state.save, null);
    }
    const save = await session.snapshotForSave(3, 'unknown-again');
    session.acknowledgeSave(save, receipt(save, 'unknown'));
    session.acknowledgeSave(save, receipt(save, 'failed')); // Backend proves no commit.
    assert.equal(session.read().path, 'attempt.lordjson'); assert.equal(session.read().save, null);
    assert.equal(session.undo(3).dirty, false);
  });

  test(`${name}: finite entry retention evicts oldest undo, keeps no-ops/failures unchanged and releases redo on a branch`, () => {
    assert.ok(Object.isFrozen(api.DEFAULT_HISTORY_LIMITS));
    assert.deepEqual(JSON.parse(JSON.stringify(api.DEFAULT_HISTORY_LIMITS)), { maxEntries: 32, maxBytes: 16 * 1024 * 1024 });
    const limits = { maxEntries: 3 };
    const session = api.createSession(raw(bytes('{"n":0}')), 'owner', { historyLimits: limits });
    limits.maxEntries = 1; // The session captures primitive limits, not the caller's object.
    for (const historyLimits of [
      { maxEntries: 0 }, { maxEntries: 33 }, { maxEntries: 1.5 }, { maxBytes: -1 },
      { maxBytes: Infinity }, { maxBytes: 16 * 1024 * 1024 + 1 }, { maxByets: 1 },
    ]) assert.throws(() => api.createSession(raw(), 'owner', { historyLimits }), /historyLimits/);
    for (let value = 1; value <= 9; value++) {
      const state = session.replaceScalar(session.read().revision, ['n'], value);
      assert.equal(state.history.entries, Math.min(value + 1, 3));
      assert.equal(state.history.byteLength, state.history.entries * 7);
    }
    assert.equal(session.undo(9).document.find(['n']).lexeme, '8');
    const before = session.read();
    assert.ok(Object.isFrozen(before.history)); assert.ok(Object.isFrozen(before.history.limits));
    assert.deepEqual(session.replaceScalar(before.revision, ['n'], 8), before);
    for (const action of [
      () => session.replaceScalar(before.revision, ['missing'], 1),
      () => session.replaceScalar(before.revision, ['n'], NaN),
      () => session.replaceScalar(before.revision - 1, ['n'], 1),
    ]) { assert.throws(action); assert.deepEqual(session.read(), before); }
    assert.equal(before.canRedo, true);
    assert.equal(session.redo(before.revision).document.find(['n']).lexeme, '9');
    session.undo(session.read().revision);
    const branch = session.replaceScalar(session.read().revision, ['n'], 5);
    assert.equal(branch.canRedo, false); assert.equal(branch.history.entries, 3);
    assert.equal(session.undo(branch.revision).document.find(['n']).lexeme, '8');
    const oldest = session.undo(session.read().revision);
    assert.equal(oldest.document.find(['n']).lexeme, '7'); assert.equal(oldest.canUndo, false);
    assert.deepEqual(session.undo(oldest.revision), oldest);
    assert.equal(oldest.originalDocument.find(['n']).lexeme, '0');
    assert.equal(oldest.savedDocument, oldest.originalDocument); assert.equal(oldest.dirty, true);
  });

  test(`${name}: byte retention includes current/redo once, honors exact boundaries and permits mandatory current above a tight cap`, () => {
    const session = api.createSession(raw(bytes('{"n":0}')), 'owner', { historyLimits: { maxBytes: 14 } });
    const first = session.replaceScalar(0, ['n'], 1);
    assert.equal(first.history.entries, 2); assert.equal(first.history.byteLength, 14);
    const second = session.replaceScalar(1, ['n'], 2);
    assert.equal(second.history.entries, 2); assert.equal(second.history.byteLength, 14);
    const undone = session.undo(2);
    assert.equal(undone.document.find(['n']).lexeme, '1'); assert.equal(undone.canUndo, false);
    assert.equal(undone.canRedo, true); assert.equal(undone.history.byteLength, 14);
    assert.deepEqual(session.replaceScalar(3, ['n'], 1), undone);
    const branched = session.replaceScalar(3, ['n'], 3);
    assert.equal(branched.history.entries, 2); assert.equal(branched.history.byteLength, 14);
    assert.equal(branched.canUndo, true); assert.equal(branched.canRedo, false);
    const larger = session.replaceScalar(4, ['n'], 11);
    assert.equal(larger.history.entries, 1); assert.equal(larger.history.byteLength, 8);
    assert.equal(larger.canUndo, false); assert.equal(larger.canRedo, false);
    for (const historyLimits of [{ maxBytes: 0 }, { maxEntries: 1 }]) {
      const tiny = api.createSession(raw(bytes('{"n":0}')), 'owner', { historyLimits });
      const edited = tiny.replaceScalar(0, ['n'], 'longer');
      assert.equal(edited.history.entries, 1); assert.equal(edited.canUndo, false);
      assert.equal(buffer(edited.document.serialize()).toString(), '{"n":"longer"}');
      assert.equal(buffer(edited.originalDocument.serialize()).toString(), '{"n":0}');
      assert.equal(edited.savedDocument, edited.originalDocument);
      assert.deepEqual(tiny.replaceScalar(1, ['n'], 'longer'), edited);
    }
  });

  test(`${name}: eviction preserves saved/original and preparing/pending/unknown content through later edits and reconciliation`, async () => {
    const session = api.createSession(raw(bytes('{"n":0}')), 'owner', { historyLimits: { maxEntries: 2, maxBytes: 14 } });
    const savedDocument = session.replaceScalar(0, ['n'], 1).document;
    const saved = await session.snapshotForSave(1, 'saved');
    session.acknowledgeSave(saved, receipt(saved));
    const submitted = session.replaceScalar(1, ['n'], 2).document;
    const saving = session.snapshotForSave(2, 'pending');
    assert.equal(session.read().save.status, 'preparing');
    for (let value = 3; value <= 5; value++) session.replaceScalar(session.read().revision, ['n'], value);
    const snapshot = await saving;
    assert.equal(session.read().save.status, 'pending');
    session.replaceScalar(session.read().revision, ['n'], 6);
    session.acknowledgeSave(snapshot, receipt(snapshot, 'unknown'));
    for (let value = 7; value <= 9; value++) session.replaceScalar(session.read().revision, ['n'], value);
    const before = session.read();
    assert.equal(before.history.entries, 2); assert.equal(before.history.byteLength, 14);
    assert.equal(before.originalDocument.find(['n']).lexeme, '0');
    assert.equal(before.savedDocument, savedDocument); assert.equal(before.savedRevision, 1);
    assert.equal(before.path, 'saved'); assert.equal(before.dirty, true);
    assert.equal(before.save.snapshot, snapshot); assert.equal(before.save.status, 'unknown');
    assert.equal(buffer(snapshot.serialize()).toString(), '{"n":2}');
    await assert.rejects(session.snapshotForSave(before.revision, 'retry'), hasCode('save-in-flight'));
    assert.throws(() => session.acknowledgeSave(snapshot, receipt(snapshot, 'committed', { sha256: 'mismatch' })), hasCode('receipt-mismatch'));
    assert.deepEqual(session.read(), before);
    const equalContent = session.replaceScalar(before.revision, ['n'], 2);
    assert.notEqual(equalContent.document, submitted); assert.equal(equalContent.dirty, true);
    const committed = session.acknowledgeSave(snapshot, receipt(snapshot));
    assert.equal(committed.document, equalContent.document); assert.equal(committed.savedDocument, submitted);
    assert.equal(committed.dirty, false); assert.equal(committed.savedRevision, 2);
    assert.equal(committed.revision, equalContent.revision); assert.equal(committed.path, 'pending');
    assert.equal(session.undo(committed.revision).document.find(['n']).lexeme, '9');
    assert.equal(session.read().dirty, true); assert.equal(session.read().savedDocument, submitted);
    assert.equal(session.redo(session.read().revision).dirty, false);
  });

  test(`${name}: receipt outcome accessors are consumed once; unknown retains reconciliation and invalid/mismatched outcomes are atomic`, async () => {
    for (const [initial, later] of [['failed', 'committed'], ['cancelled', 'committed'], ['unknown', 'committed'], ['unknown', 'unsupported']]) {
      const session = create(); session.replaceScalar(0, scalar, 9);
      const snapshot = await session.snapshotForSave(1, 'attempt'), before = session.read();
      let reads = 0;
      const envelope = receipt(snapshot);
      Object.defineProperty(envelope, 'status', { get: () => ++reads === 1 ? initial : later });
      const result = session.acknowledgeSave(snapshot, envelope);
      assert.equal(reads, 1); assert.equal(result.lastSave.status, initial);
      for (const key of ['document', 'originalDocument', 'savedDocument', 'revision', 'savedRevision', 'dirty', 'path', 'history']) {
        assert.deepEqual(result[key], before[key]);
      }
      if (initial === 'unknown') {
        assert.equal(result.save.snapshot, snapshot); assert.equal(result.save.status, 'unknown');
        await assert.rejects(session.snapshotForSave(1, 'retry'), hasCode('save-in-flight'));
        for (const invalid of ['unsupported', undefined, new String('committed')]) {
          const invalidReceipt = receipt(snapshot);
          let invalidReads = 0;
          Object.defineProperty(invalidReceipt, 'status', { get: () => ++invalidReads === 1 ? invalid : 'committed' });
          assert.throws(() => session.acknowledgeSave(snapshot, invalidReceipt), hasCode('receipt-mismatch'));
          assert.equal(invalidReads, 1); assert.deepEqual(session.read(), result);
        }
        assert.throws(() => session.acknowledgeSave(snapshot, receipt(snapshot, 'failed', { destination: 'wrong' })), hasCode('receipt-mismatch'));
        assert.deepEqual(session.read(), result);
        session.acknowledgeSave(snapshot, receipt(snapshot, 'failed'));
        assert.equal(session.read().save, null); assert.equal(session.read().dirty, true);
      } else assert.equal(result.save, null);
    }
  });

  test(`${name}: preservation save permits incomplete/generic/ambiguous/extra-tail input and no-op reopen`, async () => {
    const sources = [
      bytes('{"lord":{"opponent_type":1}}'),
      bytes('{"lord":{},"lord":{},"keep":1e400}'),
      bytes('{"frames":[],"number":9007199254740993}'),
      fixture,
    ];
    const doc = codec.parse(fixture), tail = doc.find(['lord', 'farm_types']);
    sources.push(new Uint8Array(Buffer.concat([buffer(fixture).subarray(0, tail.span.end - 1), Buffer.from(',99'), buffer(fixture).subarray(tail.span.end - 1)])));
    for (const source of sources) {
      const session = create(source), snapshot = await session.snapshotForSave(0, 'preserved.lordjson');
      assert.deepEqual(buffer(snapshot.serialize()), buffer(source));
      session.acknowledgeSave(snapshot, receipt(snapshot));
      assert.equal(session.read().dirty, false);
      assert.equal(session.read().assessment.target.runtimeAcceptance, 'unverified');
      const reopen = create(snapshot.serialize());
      assert.deepEqual(buffer(reopen.read().document.serialize()), buffer(source));
    }
  });
}

test('browser platform hashing failure releases preparation without marking saved or losing edits; missing crypto is explicit', async () => {
  let rejectDigest;
  const { api } = browser({ subtle: { digest: () => new Promise((resolve, reject) => { rejectDigest = reject; }) } });
  const session = api.createSession(raw(), 'owner', { historyLimits: { maxEntries: 1 } });
  const saving = session.snapshotForSave(0, 'out');
  session.replaceScalar(0, scalar, 12);
  rejectDigest(new Error('platform digest failed'));
  await assert.rejects(saving, /platform digest failed/);
  assert.equal(session.read().save, null); assert.equal(session.read().lastSave, null);
  assert.equal(session.read().revision, 1); assert.equal(session.read().dirty, true);
  assert.equal(session.read().canUndo, false); assert.equal(session.read().history.entries, 1);
  assert.equal(session.read().savedDocument, session.read().originalDocument);
  assert.equal(session.read().path, 'input.lordjson'); assert.equal(session.read().savedRevision, 0);
  await assert.rejects(browser(null).api.createSession(raw(), 'owner').snapshotForSave(0, 'out'), hasCode('crypto-unavailable'));
});
