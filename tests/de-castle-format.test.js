'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto, createHash } = require('node:crypto');
const json = require('../src/shared/lossless-json');
const format = require('../src/js/de-castle-format');
const sessionApi = require('../src/shared/de-castle-session');
const bytes = text => new Uint8Array(Buffer.from(text, 'utf8'));
const fixtureOnDisk = new Uint8Array(fs.readFileSync('tests/fixtures/de-documents/asymmetric-ordered.aivjson'));
// Exercise actual CRLF bytes independently of Git checkout newline policy.
const fixture = bytes(Buffer.from(fixtureOnDisk).toString('utf8').replace(/\r?\n/g, '\r\n'));
const buffer = data => Buffer.from(data);
const source = (overrides = {}) => bytes(JSON.stringify({ pauseDelayAmount: 137,
  frames: [{ itemType: 25, tilePositionOfsets: [2113, 2114, 2113], shouldPause: false }],
  miscItems: [{ itemType: 6, positionOfset: 927, number: 9 }], ...overrides }));
const raw = (data = fixture) => ({ bytes: data, documentId: 'castle-open-3', path: 'original.aivjson', formatHint: null });
const receipt = (s, status = 'committed', changes = {}) => ({ saveId: s.saveId, ownerId: s.ownerId, documentId: s.documentId,
  revision: s.revision, destination: s.destination, sha256: s.sha256, byteLength: s.byteLength, status, ...changes });
const hasCode = code => e => e.code === code;
function browser() {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, crypto: webcrypto });
  for (const file of ['src/shared/lossless-json.js', 'src/shared/document-session.js', 'src/js/de-castle-format.js', 'src/shared/de-castle-session.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  }
  return { json: context.losslessJson, format: context.deCastleFormat, sessionApi: context.deCastleSession };
}
function expectedPatch(data, document, changes) {
  const selected = changes.map(([path, value]) => ({ span: document.find(path).span, value })).sort((a, b) => a.span.start - b.span.start);
  let offset = 0; const pieces = [];
  for (const { span, value } of selected) { pieces.push(buffer(data).subarray(offset, span.start), Buffer.from(String(value))); offset = span.end; }
  pieces.push(buffer(data).subarray(offset)); return Buffer.concat(pieces);
}
for (const [name, api] of [['CommonJS', { json, format, sessionApi }], ['browser VM', browser()]]) {
  const create = (data, options) => api.sessionApi.createSession(raw(data), 'owned-context-1', options);
  const codes = assessment => assessment.diagnostics.map(d => d.code);
  test(`${name}: authored BOM/CRLF program retains every ordered/repeated/empty operation and extension token`, () => {
    const state = create().read(), view = state.assessment.program;
    assert.equal(state.kind, 'de-aivjson'); assert.equal(state.assessment.interpretation.status, 'interpretable');
    assert.equal(state.assessment.target.policy, null); assert.equal(state.assessment.target.capabilityStatus, 'not-assessed');
    assert.equal(state.assessment.target.runtimeAcceptance, 'unverified'); assert.equal(state.dirty, false);
    assert.deepEqual(buffer(state.document.serialize()), buffer(fixture));
    assert.deepEqual(buffer(create(fixtureOnDisk).read().document.serialize()), buffer(fixtureOnDisk));
    assert.ok(state.document.bomSpan); assert.ok(buffer(fixture).toString().includes('Grüße 🏰'));
    assert.equal(view.frames.length, 8); assert.equal(view.misc.length, 6);
    assert.equal(view.frames[1].offsetTokens.map(o => o.integer).join(','), '2113,2114,2113');
    assert.equal(view.frames[4].offsetTokens.length, 0); assert.equal(view.frames[4].shouldPause.node.value, true);
    assert.equal(view.frames[7].itemType.node.lexeme, '32767');
    assert.equal(view.frames[5].jsonIndex, 5); assert.equal(view.frames[5].buildIndex, 6); assert.equal(view.frames[5].pauseWireIndex, 7);
    assert.ok(Object.isFrozen(view)); assert.ok(Object.isFrozen(view.frames)); assert.ok(Object.isFrozen(view.frames[1].offsetTokens));
    assert.equal(view.misc[3].effectiveClass, 22); assert.equal(view.misc[3].number.integer, 29);
    assert.equal(state.document.root.members.filter(m => m.key.value === 'unknown').length, 2);
    assert.ok(codes(state.assessment).includes('duplicate-name'));
    assert.ok(codes(state.assessment).includes('vanilla-address-collision'));
    assert.ok(codes(state.assessment).includes('footprint-unverified'));
    const trace = []; let selected;
    for (const frame of view.frames) {
      for (const offset of frame.offsetTokens) if (offset.integer === 2113) selected = frame.itemType.integer;
      trace.push(selected);
    }
    assert.equal(trace.join(','), ',25,25,25,25,0,46,46'); // Ordered one-cell analysis, no raster serializer.
  });
  test(`${name}: every existing-scalar command changes only its selected token slices`, () => {
    const commands = [
      [{ type: 'set-pause-delay', value: 32767 }, [[['pauseDelayAmount'], 32767]]],
      [{ type: 'set-frame-pause', frameIndex: 2, value: true }, [[['frames', 2, 'shouldPause'], true]]],
      [{ type: 'set-offset', frameIndex: 1, offsetIndex: 2, value: 99 }, [[['frames', 1, 'tilePositionOfsets', 2], 99]]],
      [{ type: 'set-offsets', edits: [{ frameIndex: 1, offsetIndex: 0, value: 100 }, { frameIndex: 1, offsetIndex: 2, value: 0 }] },
        [[['frames', 1, 'tilePositionOfsets', 0], 100], [['frames', 1, 'tilePositionOfsets', 2], 0]]],
      [{ type: 'set-marker-position', miscIndex: 3, value: 9999 }, [[['miscItems', 3, 'positionOfset'], 9999]]],
      [{ type: 'set-marker-slot', miscIndex: 2, value: 29 }, [[['miscItems', 2, 'number'], 29]]],
      [{ type: 'set-item-id', scope: 'frame', index: 2, value: 145 }, [[['frames', 2, 'itemType'], 145]]],
      [{ type: 'set-item-id', scope: 'misc', index: 0, value: 9022 }, [[['miscItems', 0, 'itemType'], 9022]]],
    ];
    for (const [command, changes] of commands) {
      const session = create(), before = session.read(), expected = expectedPatch(fixture, before.document, changes);
      const next = session.applyCommand(0, command);
      assert.deepEqual(buffer(next.document.serialize()), expected);
      assert.deepEqual(buffer(before.document.serialize()), buffer(fixture));
      assert.equal(next.revision, 1); assert.equal(next.history.entries, 2);
      assert.equal(session.undo(1).document, before.document);
      assert.equal(session.read().dirty, false); assert.equal(session.redo(2).document, next.document);
    }
  });
  test(`${name}: no-op identity, branch dirty state and stale revision/handle rules use the one engine`, () => {
    const session = create(), initial = session.read();
    for (const command of [{ type: 'set-pause-delay', value: 137 },
      { type: 'set-offset', frameIndex: 1, offsetIndex: 2, value: 2113 }, { type: 'set-frame-pause', frameIndex: 0, value: false }]) {
      assert.deepEqual(session.applyCommand(0, command), initial);
    }
    const plan = api.format.planCommand(initial.document, { type: 'set-pause-delay', value: 99 });
    assert.ok(Object.isFrozen(plan)); assert.ok(Object.isFrozen(plan[0]));
    session.replaceScalars(0, plan); session.undo(1);
    const undone = session.read(); assert.equal(undone.canRedo, true);
    assert.deepEqual(session.applyCommand(2, { type: 'set-pause-delay', value: 137 }), undone);
    session.applyCommand(2, { type: 'set-pause-delay', value: 138 });
    const before = session.read(); assert.equal(before.canRedo, false);
    assert.throws(() => session.replaceScalars(before.revision, plan), hasCode('stale-handle'));
    assert.throws(() => session.applyCommand(0, { type: 'set-pause-delay', value: 139 }), hasCode('stale-revision'));
    assert.deepEqual(session.read(), before);
  });
  test(`${name}: missing/null/wrong/ambiguous members retain shape diagnostics and unrelated unique edits`, () => {
    for (const data of [bytes('null'), bytes('[]'), bytes('{}'), source({ frames: null }), source({ miscItems: {} }),
      source({ pauseDelayAmount: null }), source({ frames: [null, {}, { shouldPause: true }] }),
      source({ miscItems: [null, {}, { number: 10 }] }), source({ frames: [{ itemType: '25', tilePositionOfsets: null, shouldPause: 1 }] })]) {
      const session = create(data, { target: { policy: 'fixes-a90f96c' } });
      assert.equal(session.read().assessment.target.typedShape, 'not-certified');
      assert.deepEqual(buffer(session.read().document.serialize()), buffer(data));
    }
    const duplicates = bytes('{"pauseDelayAmount":137,"pause\\u0044elayAmount":2,"frames":[{"itemType":25,"item\\u0054ype":46,"tilePositionOfsets":[2113],"shouldPause":false}],"miscItems":[{"itemType":6,"number":9,"num\\u0062er":10,"positionOfset":927}]}');
    const session = create(duplicates), before = session.read();
    assert.equal(before.kind, 'ambiguous-aivjson');
    assert.equal(before.assessment.program.pauseDelay.status, 'ambiguous');
    assert.equal(before.assessment.program.frames[0].itemType.occurrences.length, 2);
    assert.equal(before.assessment.program.misc[0].number.occurrences.length, 2);
    for (const command of [{ type: 'set-pause-delay', value: 1 }, { type: 'set-item-id', scope: 'frame', index: 0, value: 145 },
      { type: 'set-marker-slot', miscIndex: 0, value: 1 }]) {
      assert.throws(() => session.applyCommand(0, command), hasCode('ambiguous-path')); assert.deepEqual(session.read(), before);
    }
    const next = session.applyCommand(0, { type: 'set-offset', frameIndex: 0, offsetIndex: 0, value: 100 });
    assert.deepEqual(buffer(next.document.serialize()), expectedPatch(duplicates, before.document, [[['frames', 0, 'tilePositionOfsets', 0], 100]]));
  });
  test(`${name}: wrong type/path/index/Int32/coordinate and late batch failures retain all state atomically`, async () => {
    const session = create(), snapshot = await session.snapshotForSave(0, 'owned.aivjson');
    session.acknowledgeSave(snapshot, receipt(snapshot, 'unknown'));
    const before = session.read();
    for (const command of [
      { type: 'set-offset', frameIndex: 999, offsetIndex: 0, value: 1 }, { type: 'set-offset', frameIndex: -1, offsetIndex: 0, value: 1 },
      { type: 'set-offset', frameIndex: 1, offsetIndex: 0, value: 10000 }, { type: 'set-marker-position', miscIndex: 0, value: -1 },
      { type: 'set-marker-position', miscIndex: 0, value: '99' }, { type: 'set-frame-pause', frameIndex: 0, value: 1 },
      { type: 'set-pause-delay', value: 2147483648 }, { type: 'set-pause-delay', value: -2147483649 },
      { type: 'set-marker-slot', miscIndex: 0, value: 1.5 }, { type: 'set-item-id', scope: 'auto', index: 0, value: 25 },
      { type: 'set-offsets', edits: [{ frameIndex: 1, offsetIndex: 0, value: 99 }, { frameIndex: 1, offsetIndex: 2, value: 10000 }] },
      { type: 'set-offsets', edits: [{ frameIndex: 1, offsetIndex: 0, value: 99 }, { frameIndex: 1, offsetIndex: 0, value: 100 }] },
      { type: 'insert-frame' },
    ]) { assert.throws(() => session.applyCommand(0, command)); assert.deepEqual(session.read(), before); }
    for (const value of [0, 99, 100, 9999]) {
      const fresh = create(); assert.equal(fresh.applyCommand(0, { type: 'set-offset', frameIndex: 1, offsetIndex: 0, value })
        .assessment.program.frames[1].offsetTokens[0].integer, value);
    }
    const wrong = create(source({ pauseDelayAmount: '137' })), wrongBefore = wrong.read();
    assert.throws(() => wrong.applyCommand(0, { type: 'set-pause-delay', value: 1 }), hasCode('unsupported-scalar'));
    assert.deepEqual(wrong.read(), wrongBefore);
    session.acknowledgeSave(snapshot, receipt(snapshot, 'failed'));
  });
  test(`${name}: every known decoded-name duplicate blocks only the affected semantic path`, () => {
    const text = Buffer.from(source()).toString(), document = api.json.parse(source());
    const selections = [[[], api.format.CONTRACT.root], [['frames', 0], api.format.CONTRACT.frame], [['miscItems', 0], api.format.CONTRACT.misc]];
    for (const [scope, keys] of selections) for (const key of keys) {
      const quoted = '"' + key + '":', escaped = '"' + key.slice(0, -1) + '\\u' + key.charCodeAt(key.length - 1).toString(16).padStart(4, '0') + '":';
      assert.ok(text.includes(quoted));
      const member = document.find(scope).members.find(m => m.key.value === key);
      const data = bytes(text.slice(0, member.key.span.start) + escaped + 'null,' + text.slice(member.key.span.start));
      const state = create(data).read();
      assert.equal(state.assessment.interpretation.status, 'ambiguous');
      const issue = state.diagnostics.find(d => d.code === 'ambiguous-member');
      assert.equal(issue.occurrences.length, 2);
      assert.throws(() => state.document.find(issue.path), hasCode('ambiguous-path'));
      assert.deepEqual(buffer(state.document.serialize()), buffer(data));
    }
  });
  test(`${name}: typed integers, Int16 representability, empty/clear and raw numeric spelling remain separate`, () => {
    for (const [itemType, offsets, expected] of [[25, [], 'empty-step-timing-unverified'], [0, [], 'zero-empty-clear'],
      [0, [713, 927], 'zero-counted-ambiguous'], [-25, [713], 'negative-frame-id'], [32768, [713], 'frame-id-narrowing']]) {
      const state = create(source({ frames: [{ itemType, tilePositionOfsets: offsets, shouldPause: false }] })).read();
      assert.ok(codes(state.assessment).includes(expected));
      assert.equal(state.assessment.target.typedShape, 'complete-int32-shape');
      assert.equal(state.assessment.target.representability, itemType === 25 ? 'representable' : 'blocked');
    }
    for (const token of ['2147483648', '-2147483649', '1e400', '1.2300E+02', '9007199254740993']) {
      const data = bytes('{"pauseDelayAmount":' + token + ',"frames":[],"miscItems":[]}'), state = create(data).read();
      assert.equal(state.assessment.program.pauseDelay.integer, null);
      assert.equal(state.assessment.program.pauseDelay.node.lexeme, token);
      assert.equal(state.assessment.target.typedShape, 'not-certified');
      assert.deepEqual(buffer(state.document.serialize()), buffer(data));
    }
    for (const value of [-2147483648, 2147483647]) {
      const state = create().applyCommand(0, { type: 'set-pause-delay', value });
      assert.equal(state.assessment.program.pauseDelay.integer, value);
      assert.equal(state.assessment.target.typedShape, 'complete-int32-shape');
      assert.ok(codes(state.assessment).includes('pause-delay-narrowing'));
    }
    const negativeZero = create(bytes('{"pauseDelayAmount":-0,"frames":[],"miscItems":[]}'));
    const before = negativeZero.read(); assert.deepEqual(negativeZero.applyCommand(0, { type: 'set-pause-delay', value: 0 }), before);
    assert.equal(before.assessment.program.pauseDelay.node.lexeme, '-0');
  });
  test(`${name}: source-pinned marker transforms and selected capabilities do not infer loader/config/runtime support`, () => {
    const data = source({ miscItems: [9000, 9001, 9022, 18022].map(itemType => ({ itemType, positionOfset: 927, number: 9 })) });
    assert.equal(create(data).read().assessment.program.misc.map(m => m.effectiveClass).join(','), '9000,1,22,9022');
    const vanilla = create(fixture, { target: { policy: 'vanilla', profileId: 'chosen-profile' } }).read().assessment;
    assert.ok(codes(vanilla).includes('vanilla-slot-alias')); assert.equal(vanilla.target.capabilityStatus, 'blocked');
    const selected = { policy: 'fixes-a90f96c', guardingSpotsPerUnitType: 30 };
    const session = create(fixture, { target: selected }); selected.guardingSpotsPerUnitType = 10;
    const fixes = session.read().assessment;
    assert.equal(fixes.target.guardingSpotsPerUnitType, 30);
    assert.ok(codes(fixes).includes('fixes-slot-limit')); assert.ok(codes(fixes).includes('fixes-class29-vanilla-fallback'));
    assert.equal(api.format.CONTRACT.fixesClass29, 'vanilla-fallback');
    const class29 = create(source({ miscItems: [{ itemType: 29, positionOfset: 927, number: 9 }] }),
      { target: { policy: 'fixes-a90f96c', guardingSpotsPerUnitType: 30 } }).read().assessment;
    assert.equal(class29.diagnostics.find(d => d.code === 'fixes-class29-vanilla-fallback').layer, 'semantics');
    assert.equal(class29.target.capabilityStatus, 'unverified');
    const lacking = create(source(), { target: { policy: 'fixes-a90f96c' } }).read().assessment;
    assert.ok(codes(lacking).includes('fixes-preference-required'));
    assert.equal(lacking.target.runtimeAcceptance, 'unverified');
    const capacity = create(source({ miscItems: [{ itemType: 6, positionOfset: 927, number: 10 }] }),
      { target: { policy: 'fixes-a90f96c', guardingSpotsPerUnitType: 10 } }).read().assessment;
    assert.ok(codes(capacity).includes('fixes-capacity-exceeded'));
    for (const target of [{ policy: 'latest' }, { policy: 'fixes-a90f96c', guardingSpotsPerUnitType: 31 },
      { policy: 'vanilla', guardingSpotsPerUnitType: 10 }, { policy: 'vanilla', guessedLordField: 30 }]) {
      assert.throws(() => create(source(), { target }));
    }
  });
  test(`${name}: explicit content classification distinguishes competing LORD, generic JSON and opaque binary errors`, () => {
    for (const [text, kind] of [['{"lord":{}}', 'lordjson-candidate'], ['{"aic":{"Type":1}}', 'generic-json'], ['17', 'generic-json'],
      ['{"lord":{},"frames":[]}', 'ambiguous-document'], ['{"frames":[]}', 'de-aivjson']]) {
      const session = api.sessionApi.createSession({ ...raw(bytes(text)), path: 'misleading.aivjson', formatHint: 'de-lordjson' }, 'owner');
      assert.equal(session.read().kind, kind);
      if (kind !== 'de-aivjson') assert.throws(() => session.applyCommand(0, { type: 'set-pause-delay', value: 1 }), hasCode('unsupported-interpretation'));
    }
    for (const data of [new Uint8Array(1508), bytes('BAIV\u0000'), bytes('{"frames":')]) {
      const classification = api.format.classify(data);
      assert.equal(classification.kind, 'unparsed'); assert.deepEqual(buffer(classification.error.serializeOriginal()), buffer(data));
    }
  });
  test(`${name}: exact preservation Save As/reopen and unknown reconciliation retain ownership, edits and history`, async () => {
    const session = create(fixture, { historyLimits: { maxEntries: 2 }, target: { policy: 'vanilla' } });
    session.applyCommand(0, { type: 'set-pause-delay', value: 138 });
    const submitted = session.read(), saving = session.snapshotForSave(1, 'owned-castle.aivjson');
    assert.equal(session.read().save.status, 'preparing');
    session.applyCommand(1, { type: 'set-offset', frameIndex: 1, offsetIndex: 0, value: 100 });
    const snapshot = await saving; session.acknowledgeSave(snapshot, receipt(snapshot, 'unknown'));
    const before = session.read(); assert.equal(before.save.status, 'unknown');
    for (const changes of [{ ownerId: 'foreign' }, { documentId: 'foreign' }, { revision: 2 }, { destination: 'foreign' },
      { saveId: 99 }, { sha256: 'wrong' }, { byteLength: 0 }]) {
      assert.throws(() => session.acknowledgeSave(snapshot, receipt(snapshot, 'committed', changes)), hasCode('receipt-mismatch'));
      assert.deepEqual(session.read(), before);
    }
    const foreign = await create().snapshotForSave(0, 'owned-castle.aivjson');
    assert.throws(() => session.acknowledgeSave(foreign, receipt(foreign)), hasCode('foreign-snapshot'));
    await assert.rejects(session.snapshotForSave(2, 'retry'), hasCode('save-in-flight'));
    const publicBytes = snapshot.serialize(); publicBytes.fill(0);
    assert.equal(snapshot.sha256, createHash('sha256').update(snapshot.serialize()).digest('hex'));
    const accepted = session.acknowledgeSave(snapshot, receipt(snapshot));
    assert.equal(accepted.sourcePath, 'original.aivjson'); assert.equal(accepted.path, 'owned-castle.aivjson');
    assert.equal(accepted.savedDocument, submitted.document); assert.equal(accepted.savedRevision, 1);
    assert.equal(accepted.revision, 2); assert.equal(accepted.dirty, true); assert.equal(accepted.history.entries, 2);
    assert.equal(session.undo(2).dirty, false); assert.equal(session.redo(3).dirty, true);
    const reopened = create(snapshot.serialize()).read();
    assert.equal(reopened.kind, 'de-aivjson'); assert.deepEqual(buffer(reopened.document.serialize()), buffer(submitted.document.serialize()));
  });
}
test('49/50/51 flags, late pause words and variable array counts retain source and diagnose exact narrowing', () => {
  const frame = { itemType: 25, tilePositionOfsets: [], shouldPause: true };
  for (const count of [49, 50, 51]) {
    const document = json.parse(source({ frames: Array.from({ length: count }, () => frame) }));
    const assessment = format.inspect(document);
    assert.equal(assessment.program.frames.length, count); assert.equal(assessment.program.pauseCount, count);
    assert.equal(assessment.diagnostics.filter(d => d.code === 'pause-limit-loss').length, Math.max(count - 49, 0));
  }
  for (const [count, expected] of [[32767, false], [32768, true]]) {
    const assessment = format.inspect(json.parse(source({ frames: [{ ...frame, tilePositionOfsets: Array(count).fill(713) }] })));
    assert.equal(assessment.program.frames[0].offsetTokens.length, count);
    assert.equal(assessment.diagnostics.some(d => d.code === 'offset-count-narrowing'), expected);
  }
  const late = Array(32767).fill(null); late[32766] = frame;
  const lateAssessment = format.inspect(json.parse(source({ frames: late })));
  assert.equal(lateAssessment.program.frames[32766].buildIndex, 32767);
  assert.equal(lateAssessment.program.frames[32766].pauseWireIndex, 32768);
  assert.ok(lateAssessment.diagnostics.some(d => d.code === 'pause-index-narrowing'));
  assert.equal(lateAssessment.diagnostics.some(d => d.code === 'frame-count-narrowing'), false);
  const wrapped = format.inspect(json.parse(source({ frames: Array(32768).fill(null) })));
  assert.ok(wrapped.diagnostics.some(d => d.code === 'frame-count-narrowing'));
  const misc = format.inspect(json.parse(source({ miscItems: Array(32768).fill(null) })));
  assert.ok(misc.diagnostics.some(d => d.code === 'misc-count-narrowing'));
});
