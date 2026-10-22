'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const json = require('../src/shared/lossless-json');
const bytes = text => new Uint8Array(Buffer.from(text, 'utf8'));
const text = raw => Buffer.from(raw).toString('utf8');

function preserved(source, options) {
  const original = typeof source === 'string' ? bytes(source) : source;
  const document = json.parse(original, options);
  assert.deepEqual(document.serialize(), original);
  return document;
}
function failure(source, category, code, options) {
  const original = typeof source === 'string' ? bytes(source) : source;
  let caught;
  assert.throws(() => json.parse(original, options), error => {
    caught = error;
    return error instanceof json.DocumentError && error.category === category && (!code || error.code === code);
  });
  assert.equal(caught.spanUnit, 'utf8-byte');
  assert.ok(Number.isSafeInteger(caught.offset));
  assert.equal(caught.root, undefined);
  assert.deepEqual(caught.serializeOriginal(), original);
  caught.serializeOriginal().fill(0);
  assert.deepEqual(caught.serializeOriginal(), original);
}
function exactEdit(document, path, value, replacement) {
  const before = document.serialize(), node = document.find(path);
  const expected = Buffer.concat([before.subarray(0, node.span.start), Buffer.from(replacement), before.subarray(node.span.end)]);
  const result = document.edit(path, value);
  assert.deepEqual(Buffer.from(result.serialize()), expected);
  assert.deepEqual(document.serialize(), before);
  assert.deepEqual(preserved(result.serialize()).serialize(), result.serialize());
  return result;
}

test('group 7: every generic root is preserved, including no final newline', () => {
  for (const source of ['null', '[]', '17', '{}', 'true', 'false', '"x"', '[null,{},[],false]']) preserved(source);
});

test('group 5: token/trivia spans partition exact UTF-8 bytes, including BOM and astral text', () => {
  const source = '\ufeff \r\n{\t"ä🦊": "🏰\\/\\u0061",\n"n": -0}\r \t';
  const document = preserved(source);
  assert.equal(document.spanUnit, 'utf8-byte');
  assert.deepEqual(document.bomSpan, { start: 0, end: 3, unit: 'utf8-byte' });
  assert.equal(document.find(['ä🦊']).value, '🏰/a');
  let cursor = 0;
  for (const token of document.tokens) {
    assert.equal(token.span.start, cursor);
    assert.equal(token.span.unit, 'utf8-byte');
    cursor = token.span.end;
  }
  assert.equal(cursor, bytes(source).length);
  assert.ok(document.tokens.some(t => t.kind === 'trivia' && text(document.slice(t.span)) === '\r \t'));
  const node = document.find(['n']);
  assert.equal(node.span.start, Buffer.from(source).indexOf('-0'));
  exactEdit(document, ['n'], 98765, '98765');
});

test('immutable bytes, frozen nodes and ordered duplicate occurrences', () => {
  const input = bytes('{"a":1,"a":2,"constructor":3}');
  const document = preserved(input);
  input.fill(0);
  document.serialize().fill(0);
  document.slice(document.root.span).fill(0);
  assert.equal(text(document.serialize()), '{"a":1,"a":2,"constructor":3}');
  assert.ok(Object.isFrozen(document));
  assert.ok(Object.isFrozen(document.root.members[0].value.span));
  assert.throws(() => document.root.members.push(null), TypeError);
  assert.deepEqual(document.root.members.map(m => m.value.lexeme), ['1', '2', '3']);
});

test('group 3: decoded duplicate names and ambiguous ancestors block semantic lookup', () => {
  const document = preserved(String.raw`{"a":1,"\u0061":2,"tree":{"x":0},"tree":{"x":1},"ok":7}`);
  for (const path of [['a'], ['tree', 'x']]) {
    assert.throws(() => document.find(path), { code: 'ambiguous-path' });
    assert.throws(() => document.edit(path, 3), { code: 'ambiguous-path' });
  }
  assert.equal(document.diagnostics.filter(d => d.code === 'duplicate-name').length, 2);
  assert.equal(document.diagnostics[0].occurrences.length, 2);
  exactEdit(document, ['ok'], 8, '8');
});

test('group 4: unknown number lexemes stay lexical next to edits', () => {
  const numbers = ['9007199254740993', '9'.repeat(4000), '1e400', '1e-9999', '-0', '1.2300E+02', '1e' + '9'.repeat(2000)];
  const document = preserved('{"known":1,"unknown":[' + numbers.join(',') + ']}');
  assert.deepEqual(document.find(['unknown']).elements.map(n => n.lexeme), numbers);
  const edited = exactEdit(document, ['known'], -999, '-999');
  assert.deepEqual(edited.find(['unknown']).elements.map(n => n.lexeme), numbers);
  assert.equal(Object.hasOwn(document.find(['unknown', 0]), 'value'), false);
});

test('groups 4/8: numeric no-ops preserve negative zero, exponent and fractional spellings exactly', () => {
  for (const [source, value] of [['-0', 0], ['1.0', 1], ['1e0', 1], ['1.2300E+02', 123], ['100e-2', 1],
    ['1e+0003', 1000], ['1e-0003', 0.001], ['9007199254740993', 9007199254740993n],
    ['0e' + '9'.repeat(2000), 0]]) {
    const document = preserved(source);
    assert.equal(document.edit([], value), document);
  }
  const hugeExponent = '9'.repeat(2000), oneLess = '9'.repeat(1999) + '8';
  const document = preserved('1e' + hugeExponent);
  assert.equal(document.edit([], json.numberToken('10e' + oneLess)), document);
  exactEdit(preserved('1e-9999'), [], 0, '0'); // No binary64 underflow equality.
  exactEdit(preserved('9007199254740993'), [], 9007199254740992n, '9007199254740992');
});

test('D1-R1-03: valid scalar no-ops ignore unused spelling limits and retain revision and bytes', () => {
  for (const [source, value, maxTokenBytes] of [
    [String.raw`"\n"`, '\n', 4], [String.raw`"\t"`, '\t', 4],
    ['1', json.numberToken('1.0'), 1], ['1', json.numberToken('100e-2'), 1],
    ['0', json.numberToken('-0.000e999999999999999999999999'), 1],
  ]) {
    const document = preserved(source, { limits: { maxTokenBytes, maxBytes: bytes(source).length } });
    const original = document.serialize(), revision = document.revision;
    assert.equal(document.edit([], value), document);
    assert.equal(json.patch(document, [{ handle: document.handle([]), value }]), document);
    assert.equal(document.revision, revision);
    assert.deepEqual(document.serialize(), original);
  }
});

test('D1-R1-03: default cap accepts a 200000 escaped-newline string no-op without emitting its longer spelling', () => {
  const source = '"' + '\\n'.repeat(200000) + '"';
  const document = preserved(source), original = document.serialize();
  assert.equal(original.length, 400002);
  assert.equal(document.root.value.length, 200000);
  assert.ok(document.root.value.length * 6 + 2 > json.DEFAULT_LIMITS.maxTokenBytes);
  assert.equal(document.edit([], document.root.value), document);
  assert.equal(document.revision, 0);
  assert.deepEqual(document.serialize(), original);
});

test('D1-R1-03: tight/default-cap no-ops coexist with real edits in one exact atomic batch', () => {
  for (const [source, options] of [
    [String.raw`{"s":"\n","n":1,"e":0}`, { limits: { maxTokenBytes: 4 } }],
    ['{"s":"' + '\\n'.repeat(200000) + '","n":1,"e":0}', undefined],
  ]) {
    const document = preserved(source, options), original = document.serialize();
    const noops = [{ path: ['s'], value: document.find(['s']).value }, { path: ['n'], value: json.numberToken('1.00000') }];
    assert.equal(json.patch(document, noops), document);
    assert.equal(document.revision, 0);
    const node = document.find(['e']);
    const expected = Buffer.concat([original.subarray(0, node.span.start), Buffer.from('2'), original.subarray(node.span.end)]);
    const next = json.patch(document, [...noops, { path: ['e'], value: 2 }]);
    assert.equal(next.revision, 1);
    assert.deepEqual(Buffer.from(next.serialize()), expected);
    assert.deepEqual(next.slice(next.find(['s']).span), document.slice(document.find(['s']).span));
    assert.deepEqual(next.slice(next.find(['n']).span), bytes('1'));
    assert.deepEqual(document.serialize(), original);
  }
});

test('D1-R1-03: real token/UTF-8/document limits still fail atomically beside no-ops', () => {
  const document = preserved(String.raw`{"e":0,"s":"\n","n":1}`, { limits: { maxTokenBytes: 4 } });
  const original = document.serialize();
  for (const [path, value, category] of [
    [['s'], '\n\n', 'edit'], [['n'], json.numberToken('2.00000'), 'edit'], [['s'], '🦊', 'limit'],
  ]) {
    assert.throws(() => json.patch(document, [
      { path: ['e'], value: 2 }, { path, value },
      { path: path[0] === 's' ? ['n'] : ['s'], value: path[0] === 's' ? json.numberToken('1.00000') : '\n' },
    ]), { category, code: 'max-token-bytes' });
    assert.deepEqual(document.serialize(), original);
    assert.equal(document.revision, 0);
  }
  const bounded = preserved(String.raw`{"s":"\n","n":1}`, { limits: { maxBytes: 16 } });
  assert.equal(bounded.byteLength, 16);
  assert.throws(() => json.patch(bounded, [{ path: ['s'], value: '\n' }, { path: ['n'], value: 12 }]), { category: 'limit', code: 'max-bytes' });
  assert.deepEqual(bounded.serialize(), bytes(String.raw`{"s":"\n","n":1}`));
  assert.equal(bounded.revision, 0);
  const large = preserved('"' + '\\n'.repeat(200000) + '"');
  assert.throws(() => large.edit([], large.root.value + 'x'), { category: 'edit', code: 'max-token-bytes' });
  assert.deepEqual(large.serialize(), bytes('"' + '\\n'.repeat(200000) + '"'));
});

test('D1-R1-03: no-op recognition still rejects lone-surrogate arguments and unsafe numeric Numbers', () => {
  const document = preserved(String.raw`{"ok":"\n","bad":"\uD800","n":9007199254740992,"e":0}`);
  const original = document.serialize();
  assert.throws(() => document.edit(['bad'], document.find(['bad']).value), /lone surrogates/);
  assert.throws(() => document.edit(['n'], 9007199254740992), { category: 'edit', code: 'invalid-value' });
  for (const invalid of [{ path: ['bad'], value: '\ud800' }, { path: ['n'], value: 9007199254740992 }]) {
    assert.throws(() => json.patch(document, [
      { path: ['e'], value: 1 }, { path: ['ok'], value: '\n' }, invalid,
    ]));
    assert.deepEqual(document.serialize(), original);
    assert.equal(document.revision, 0);
  }
});

test('group 5: untouched escapes, Unicode forms and escaped lone surrogates remain exact', () => {
  for (const source of [String.raw`"\/\"\\\b\f\n\r\t\u0061\uD83E\uDD8A"`, '"Grüße 🦊\ufeff"',
    String.raw`"\uD800"`, String.raw`"\uDC00"`, String.raw`"\uD800x"`]) {
    const document = preserved(source);
    const lone = /D800|DC00/.test(source);
    assert.equal(document.diagnostics.some(d => d.code === 'escaped-lone-surrogate'), lone);
  }
  const document = preserved(String.raw`{"s":"\u0061\/\uD83E\uDD8A","bad":"\uD800","n":1}`);
  assert.equal(document.edit(['s'], 'a/🦊'), document);
  exactEdit(document, ['n'], 22, '22');
});

test('group 5: new strings escape controls, quotes and backslashes and reject lone surrogates', () => {
  const original = preserved('"old"');
  const value = 'ä🦊"\\\u0000\b\f\n\r\t\ufeff';
  const expectedToken = '"ä🦊' + String.raw`\"\\\u0000\u0008\u000c\u000a\u000d\u0009` + '\ufeff"';
  const result = exactEdit(original, [], value, expectedToken);
  assert.equal(result.root.value, value);
  assert.ok(text(result.serialize()).includes('\\u0000'));
  preserved(result.serialize());
  for (const value of ['\ud800', '\udc00', '\ud800x']) assert.throws(() => original.edit([], value), /lone surrogates/);
  assert.equal(text(original.serialize()), '"old"');
});

test('group 8: length-changing revisions rebase spans after multibyte text; stale handles fail atomically', () => {
  const original = preserved('{"text":"🦊ä","a":12345,"b":[2,3],"x":0,"x":1}');
  const old = original.handle(['b', 1]);
  let next = exactEdit(original, ['a'], 1, '1');
  assert.equal(next.revision, 1);
  assert.throws(() => json.patch(next, [{ path: ['a'], value: 2 }, { handle: old, value: 9 }]), { code: 'stale-handle' });
  assert.equal(text(next.serialize()), '{"text":"🦊ä","a":1,"b":[2,3],"x":0,"x":1}');
  next = exactEdit(next, ['b', 1], -987654321, '-987654321');
  assert.equal(next.revision, 2);
  assert.equal(next.diagnostics.filter(d => d.code === 'duplicate-name').length, 1);
  const reparsed = preserved(next.serialize());
  assert.throws(() => json.patch(reparsed, [{ handle: next.handle(['a']), value: 9 }]), { code: 'stale-handle' });
});

test('group 8: batch edits are exact, overlapping selections and invalid values are atomic', () => {
  const document = preserved('{"a":1,"b":[2,3],"s":"z"}');
  const original = document.serialize();
  const next = json.patch(document, [{ path: ['s'], value: 'long' }, { path: ['b', 0], value: 7 }]);
  assert.deepEqual(next.serialize(), bytes('{"a":1,"b":[7,3],"s":"long"}'));
  preserved(next.serialize());
  for (const edits of [
    [{ path: ['a'], value: 1 }, { handle: document.handle(['a']), value: 2 }],
    [{ path: ['b'], value: 0 }, { path: ['b', 0], value: 2 }],
  ]) assert.throws(() => json.patch(document, edits), { code: 'overlapping-edits' });
  assert.throws(() => json.patch(document, [{ path: ['a'], value: 5 }, { path: ['s'], value: {} }]), { code: 'invalid-value' });
  assert.deepEqual(document.serialize(), original);
  for (const edits of [[{ path: ['a'], value: 0, operation: 'delete' }], [{ path: ['b'], value: [] }],
    [{ path: ['missing'], value: 0 }], [{ path: ['b', 2], value: 0 }]]) assert.throws(() => json.patch(document, edits));
  assert.equal(json.patch(document, []), document);
});

test('new exact numbers require valid numeric tokens / BigInt, and reject unsafe Number inputs', () => {
  const document = preserved('0');
  exactEdit(document, [], json.numberToken('1e400'), '1e400');
  exactEdit(document, [], 999999999999999999999999999999999n, '999999999999999999999999999999999');
  for (const invalid of ['01', '1\n', '+1', 'NaN', 'Infinity', '1e', '--1', '1.', ' 1']) {
    assert.throws(() => json.numberToken(invalid), TypeError);
  }
  for (const invalid of [Infinity, NaN, 9007199254740992, undefined, {}, []]) assert.throws(() => document.edit([], invalid), { code: 'invalid-value' });
  assert.throws(() => json.parse('0'), TypeError);
});

test('group 6: fatal UTF-8 rejects invalid, overlong, surrogate and out-of-range sequences', () => {
  for (const data of [[192,175], [128], [226,130], [237,160,128], [240,128,128,128], [244,144,128,128], [245,128,128,128], [239,187]]) {
    failure(new Uint8Array(data), 'encoding', 'invalid-utf8');
  }
  // Valid root followed by invalid encoding is still an encoding failure.
  failure(new Uint8Array([48, 255]), 'encoding', 'invalid-utf8');
});

test('group 6: UTF-16/32 BOMs are unsupported; extra UTF-8 BOMs are syntax errors', () => {
  for (const data of [[255,254,123,0], [254,255,0,123], [255,254,0,0], [0,0,254,255]]) {
    failure(new Uint8Array(data), 'unsupported-encoding', 'unsupported-encoding');
  }
  for (const source of ['\ufeff\ufeff{}', ' \ufeff{}', '{}\ufeff', '{\ufeff"a":1}']) failure(source, 'syntax');
  preserved('\ufeff{"data":"\ufeff"}');
});

const syntaxFailures = [String.raw`"\x20"`, String.raw`"\u0x00"`, '"a\u0001b"', '"a\nb"', '01', '+1', 'NaN', 'Infinity',
  '-', '1.', '1e+', '[1', '{"x":', '{"x" 0}', '{}{}', 'null false', '[1,]', '{"a":1,}', '// hi\n{}', '/*x*/{}', '"x'];
for (const [i, source] of syntaxFailures.entries()) {
  test(`group 6: malformed grammar ${i + 1} retains opaque original bytes`, () => failure(source, 'syntax'));
}

test('group 9: dangerous-looking names are data, with no object prototype effects', () => {
  const document = preserved('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"toString":1}');
  assert.equal({}.polluted, undefined);
  assert.equal(document.find(['__proto__', 'polluted']).value, true);
  exactEdit(document, ['constructor', 'prototype', 'polluted'], false, 'false');
  assert.equal({}.polluted, undefined);
});

test('group 9: exact resource boundaries and deterministic bounded failures expose no partial document', () => {
  const cases = [
    ['[0]', { maxBytes: 3 }, { maxBytes: 2 }, 'max-bytes'],
    ['[[0]]', { maxDepth: 2 }, { maxDepth: 1 }, 'max-depth'],
    ['[0]', { maxNodes: 2 }, { maxNodes: 1 }, 'max-nodes'],
    ['[0]', { maxTokens: 3 }, { maxTokens: 2 }, 'max-tokens'],
    ['"ä"', { maxTokenBytes: 4 }, { maxTokenBytes: 3 }, 'max-token-bytes'],
  ];
  for (const [source, good, bad, code] of cases) {
    preserved(source, { limits: good });
    failure(source, 'limit', code, { limits: bad });
  }
  failure('['.repeat(300) + '0' + ']'.repeat(300), 'limit', 'max-depth', { limits: { maxDepth: 256 } });
  failure('0', 'limit', 'max-nodes', { limits: { maxNodes: 0 } });
  assert.throws(() => preserved('0', { limits: { maxDepth: 100000 } }), RangeError);
  assert.throws(() => preserved('0', { limits: { unknown: 1 } }), TypeError);
  const bounded = preserved('0', { limits: { maxBytes: 1 } });
  assert.throws(() => bounded.edit([], 12), { category: 'limit', code: 'max-bytes' });
  assert.equal(text(bounded.serialize()), '0');
});

test('browser global convention uses the same byte-preserving implementation without Node APIs', () => {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer });
  vm.runInContext(fs.readFileSync(require.resolve('../src/shared/lossless-json'), 'utf8'), context);
  const document = context.losslessJson.parse(bytes('{"ä":1,"x":9007199254740993}'));
  assert.equal(text(document.serialize()), '{"ä":1,"x":9007199254740993}');
  assert.deepEqual(context.losslessJson.patch(document, [{ path: ['ä'], value: 2 }]).serialize(), bytes('{"ä":2,"x":9007199254740993}'));
});
