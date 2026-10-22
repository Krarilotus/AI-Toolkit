'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const json = require('../src/shared/lossless-json');
const lord = require('../src/js/de-lord-format');
const fixture = new Uint8Array(fs.readFileSync(path.join(__dirname, 'fixtures/de-documents/complete-synthetic.lordjson')));
const bytes = text => new Uint8Array(Buffer.from(text, 'utf8'));
const text = raw => Buffer.from(raw).toString('utf8');

function browserOverlay() {
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer });
  vm.runInContext(fs.readFileSync(require.resolve('../src/shared/lossless-json'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(require.resolve('../src/js/de-lord-format'), 'utf8'), context);
  return context.deLordFormat;
}
function assertFrozenTree(value) {
  if (value && typeof value === 'object') {
    assert.ok(Object.isFrozen(value));
    Object.values(value).forEach(assertFrozenTree);
  }
}

function preserved(source) {
  const original = typeof source === 'string' ? bytes(source) : source;
  const document = lord.parse(original);
  assert.deepEqual(document.serialize(), original);
  lord.inspect(document);
  assert.deepEqual(document.serialize(), original);
  return document;
}
function has(assessment, code, targetPath) {
  return assessment.diagnostics.some(d => d.code === code && (!targetPath || JSON.stringify(d.path) === JSON.stringify(targetPath)));
}
function exactEdit(document, targetPath, value, raw) {
  const before = document.serialize(), node = document.find(targetPath);
  const expected = Buffer.concat([before.subarray(0, node.span.start), Buffer.from(raw), before.subarray(node.span.end)]);
  const result = lord.patch(document, [{ path: targetPath, value }]);
  assert.deepEqual(Buffer.from(result.serialize()), expected);
  assert.deepEqual(document.serialize(), before);
  preserved(result.serialize());
  return result;
}

// Independent inventory from the reviewed 118-field contract. Assertions do not
// derive the required names or lengths from the module's schema.
const expectedNames = `opponent_type opponent_type_for_speech lord_gfx_type flag_type use_of_religion use_of_ale
vlow_popularity low_popularity high_popularity min_tax max_tax farm_types people_to_farm_ratio extract_wood_ratio
extract_stone_ratio extract_iron_ratio extract_pitch_ratio max_quarries max_mines max_woodcutters max_pitch_dugouts
max_farms build_rate crushed_building_delay sell_food_at buy_apples_at buy_cheese_at buy_bread_at buy_wheat_at
buy_hops_at buy_food_amount buy_weapons pester_for_goods_delay send_goods_margin ration_boost trade_wood_at
trade_stone_at trade_resources_at trade_flour_at trade_weapons_at trade_ale_at trade_pitch_at trade_minimum
base_gold_reserves blacksmiths_make fletchers_make poleturners_make sell_all move_mobile_defenders max_mobile_groups
buy_defense_machines_at buy_defense_machines_delay dog_release_timing dog_points_count chance_of_defensive
chance_of_harrasment chance_of_seiging economy_protection_number economy_protection_type bodyguard_number bodyguard_type
moat_diggers moat_digger_type troop_production_rate defense_patrol_trigger_level defense_patrols defense_patrol_style
defense_patrol_delay defensive_trigger_level defensive_troops harrasment_trigger_level harrasment_trigger_variance
harrasment_troops harrasment_machines max_harrasment_machines harrass_delay siege_trigger_level siege_trigger_variance
siege_troops_before_will_come_to_rescue siege_troops_on_site_percent siege_troops_at_home_percent siege_soften_up_delay
siege_victory_delay percent_chance_waiting_for_joint_attack siege_machines siege_cow_timer siege_eng_amount siege_moat_troop
siege_moat_amount siege_herring_troop siege_herring_amount siege_assasin_amount siege_ladder_amount siege_tunnel_amount
siege_storm_troop siege_storm_amount siege_storm_tribes siege_cover_troop siege_cover_amount siege_cover_tribes siege_shock_troop
siege_shock_amount siege_reserve_troop siege_reserve_amount siege_reserve_tribes siege_wall_troops siege_wall_amount siege_wall_tribes who_to_pick_on use_improved_sieging
starting_troops_normal starting_troops_deathmatch starting_troops_crusader lord_power_display_level lord_hps_percent
siege_max_troops siege_normal_wave_multiplier siege_high_gold_wave_multiplier`.trim().split(/\s+/);
const expectedArrays = new Map([
  ['farm_types', 8], ['sell_all', 15], ['chance_of_defensive', 3], ['chance_of_harrasment', 3], ['chance_of_seiging', 3],
  ['troop_production_rate', 3], ['defensive_troops', 8], ['harrasment_troops', 8], ['harrasment_machines', 8],
  ['siege_machines', 8], ['siege_wall_troops', 24], ['starting_troops_normal', 28], ['starting_troops_deathmatch', 28],
  ['starting_troops_crusader', 28],
]);

test('game schema pins exact reviewed 118 names / 14 arrays / 279 words and source provenance', () => {
  const schema = lord.schema;
  assert.equal(expectedNames.length, 118);
  assert.deepEqual(schema.fields.map(f => f.name), expectedNames);
  assert.deepEqual(new Map(schema.fields.filter(f => f.type === 'signedInt32Array').map(f => [f.name, f.length])), expectedArrays);
  assert.equal(schema.fields.reduce((n, f) => n + (f.length || 1), 0), 279);
  assert.equal(schema.provenance.commit, '7e199e6f0818173794bdeeb0c4c32d74500b0eec');
  assert.equal(schema.provenance.schemaSource.path, '_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs');
  assert.deepEqual(schema.provenance.schemaSource.lines, [157, 400]);
  assert.deepEqual(schema.provenance.transferSource.lines, [4303, 4586]);
  assert.equal(schema.provenance.managedSha256, 'bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789');
  assert.equal(schema.provenance.nativeSha256, 'fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2');
  for (const [i, f] of schema.fields.entries()) {
    assert.equal(f.sourceLine, 165 + i * 2);
    assert.equal(f.runtimeMissingFieldDefault, 'unverified');
    assert.equal(f.type, expectedArrays.has(f.name) ? 'signedInt32Array' : 'signedInt32');
  }
  for (const [name, value] of [['siege_max_troops', 200], ['siege_normal_wave_multiplier', 5], ['siege_high_gold_wave_multiplier', 7]]) {
    assert.deepEqual(schema.fields.find(f => f.name === name).declarationInitializer, { kind: 'explicit-scalar', value });
  }
  assert.ok(Object.isFrozen(schema.fields[0]));
});

const schemaFailures = [
  ['null input', () => null],
  ['missing fields', s => { delete s.fields; }],
  ['short inventory', s => { s.fields.pop(); }],
  ['null descriptor', s => { s.fields[0] = null; }],
  ['duplicate name', s => { s.fields[1].name = s.fields[0].name; }],
  ['renamed speech', s => { s.fields[1].name = 'invented_speech'; }],
  ['renamed speech without provenance', s => { s.fields[1].name = 'invented_speech'; delete s.provenance; }],
  ['zero and 23 length swap (279 words)', s => { s.fields[11].length = 0; s.fields[47].length = 23; }],
  ['negative and 24 length swap (279 words)', s => { s.fields[11].length = -1; s.fields[47].length = 24; }],
  ['fractional length', s => { s.fields[11].length = 7.5; }],
  ['string length', s => { s.fields[11].length = '8'; }],
  ['missing length', s => { delete s.fields[11].length; }],
  ['nonfinite length', s => { s.fields[11].length = NaN; }],
  ['wrong scalar type', s => { s.fields[0].type = 'unsignedInt32'; }],
  ['array changed to scalar', s => { s.fields[11].type = 'signedInt32'; }],
  ['scalar given array length', s => { s.fields[0].length = 1; }],
  ['wrong schema id', s => { s.id = 'other'; }],
  ['wrong format', s => { s.format = 'ucp-character'; }],
  ['wrong version', s => { s.version = 2; }],
  ['wrong field count', s => { s.fieldCount = 117; }],
  ['wrong array count', s => { s.arrayCount = 13; }],
  ['wrong transferred word count', s => { s.transferredInt32Words = 278; }],
  ['missing provenance', s => { delete s.provenance; }],
  ['wrong repository', s => { s.provenance.repository += '/other'; }],
  ['wrong commit', s => { s.provenance.commit = '0'.repeat(40); }],
  ['wrong managed hash', s => { s.provenance.managedSha256 = '0'.repeat(64); }],
  ['wrong native hash', s => { s.provenance.nativeSha256 = '0'.repeat(64); }],
  ['missing declaration source', s => { delete s.provenance.schemaSource; }],
  ['wrong declaration source path', s => { s.provenance.schemaSource.path = 'editor.cs'; }],
  ['wrong declaration source lines', s => { s.provenance.schemaSource.lines[0]++; }],
  ['wrong declaration source blob', s => { s.provenance.schemaSource.gitBlob = '0'.repeat(40); }],
  ['missing transfer source', s => { delete s.provenance.transferSource; }],
  ['wrong transfer source path', s => { s.provenance.transferSource.path = 'converter.cs'; }],
  ['wrong transfer source lines', s => { s.provenance.transferSource.lines[1]--; }],
  ['wrong transfer source blob', s => { s.provenance.transferSource.gitBlob = '0'.repeat(40); }],
  ['missing target policy', s => { delete s.targetPolicy; }],
  ['wrong target policy type', s => { s.targetPolicy = []; }],
  ['wrong target policy id', s => { s.targetPolicy.id = 'incomplete'; }],
  ['optional fields policy', s => { s.targetPolicy.allFieldsRequired = false; }],
  ['optional exact arrays policy', s => { s.targetPolicy.exactArrayLengthsRequired = false; }],
  ['wrong integer policy', s => { s.targetPolicy.integerTokenPolicy = 'coerce'; }],
  ['invented verified semantics', s => { s.targetPolicy.semantics = 'verified'; }],
  ['wrong field source line', s => { s.fields[0].sourceLine++; }],
  ['invented runtime default', s => { s.fields[0].runtimeMissingFieldDefault = 0; }],
  ['wrong declaration initializer', s => { s.fields[11].declarationInitializer.length = 0; }],
  ['cyclic schema', s => { s.cycle = s; }],
  ['sparse field array', s => { delete s.fields[0]; }],
  ['accessor metadata', s => { Object.defineProperty(s, 'id', { enumerable: true, get() { throw new Error('Accessor must not run'); } }); }],
];
for (const [environment, factory] of [['CommonJS', lord], ['browser', browserOverlay()]]) {
  for (const [label, mutate] of schemaFailures) {
    test(`schema ${environment}: rejects ${label} at creation with a schema error`, () => {
      const source = structuredClone(lord.schema), candidate = mutate(source);
      const generic = json.parse(bytes('{"lord":{"farm_types":[]},"keep":9007199254740993}'));
      const before = generic.serialize();
      assert.throws(() => factory.create(candidate === undefined ? source : candidate), error =>
        error.name === 'TypeError' && /^Invalid pinned LORD schema at schema/.test(error.message));
      assert.deepEqual(generic.serialize(), before);
    });
  }
  for (const mode of ['unfrozen', 'outer frozen', 'nested parents frozen']) {
    test(`schema ${environment}: immutable private snapshot survives caller mutation (${mode})`, () => {
      const source = structuredClone(lord.schema);
      if (mode === 'outer frozen') Object.freeze(source);
      if (mode === 'nested parents frozen') {
        for (const parent of [source.fields, source.fields[11], source.provenance, source.provenance.schemaSource, source.targetPolicy]) Object.freeze(parent);
      }
      const api = factory.create(source), document = api.parse(fixture);
      const farm = document.find(['lord', 'farm_types']), original = document.serialize();
      const shortened = api.parse(new Uint8Array(Buffer.concat([original.subarray(0, farm.span.start), Buffer.from('[]'), original.subarray(farm.span.end)])));
      const completeBefore = api.inspect(document), shortBefore = api.inspect(shortened);
      assert.equal(completeBefore.target.canonicalStructure, 'complete-exact-arrays');
      assert.equal(shortBefore.target.typedShape, 'not-certified');
      assert.equal(shortBefore.target.canonicalStructure, 'blocked');
      assert.notEqual(api.schema, source);
      assert.notEqual(api.schema.fields, source.fields);
      assert.notEqual(api.schema.fields[11], source.fields[11]);
      assert.notEqual(api.schema.provenance.schemaSource.lines, source.provenance.schemaSource.lines);
      assertFrozenTree(api.schema);
      // Creation must neither retain nor freeze the caller's descendants.
      assert.equal(Object.isFrozen(source.fields[11].declarationInitializer), false);
      source.fields[11].declarationInitializer.length = 0;
      source.fields[47].length = 23;
      source.provenance.schemaSource.lines[0] = 0;
      if (mode !== 'nested parents frozen') {
        source.fields[11].length = 0;
        source.targetPolicy.id = 'mutated';
        source.fields[1].name = 'invented_speech';
      }
      assert.equal(api.schema.fields[11].length, 8);
      assert.equal(api.schema.fields[11].declarationInitializer.length, 8);
      assert.equal(api.schema.fields[47].length, 15);
      assert.equal(api.schema.provenance.schemaSource.lines[0], 157);
      assert.throws(() => { api.schema.fields[11].length = 0; }, TypeError);
      assert.deepEqual(api.inspect(document), completeBefore);
      assert.deepEqual(api.inspect(shortened), shortBefore);
      assert.deepEqual(document.serialize(), original);
    });
  }
}

test('group 1: complete synthetic fixture preserves distinct speech, every array position, extensions and exact edits', () => {
  let document = preserved(fixture);
  assert.deepEqual(fixture.subarray(0, 3), new Uint8Array([239, 187, 191]));
  assert.ok(document.find(['note']).value.includes('not a playable AI. Grüße 🏰'));
  assert.equal(document.find(['lord', 'futureLord', 'inner', 'text']).value, 'a/ä🦊');
  const assessment = lord.inspect(document);
  assert.equal(assessment.interpretation.status, 'interpretable');
  assert.equal(assessment.target.typedShape, 'complete-int32-shape');
  assert.equal(assessment.target.canonicalStructure, 'complete-exact-arrays');
  assert.equal(assessment.target.runtimeAcceptance, 'unverified');
  assert.equal(Object.hasOwn(assessment, 'validForGame'), false);
  assert.equal(document.find(['lord', 'opponent_type']).lexeme, '1');
  assert.equal(document.find(['lord', 'opponent_type_for_speech']).lexeme, '29');
  for (const [name, length] of expectedArrays) {
    const values = document.find(['lord', name]).elements.map(n => n.lexeme);
    assert.equal(values.length, length);
    assert.equal(new Set(values).size, length);
    assert.ok(values.every(v => Number(v) !== 0));
  }
  for (const name of ['blacksmiths_make', 'fletchers_make', 'poleturners_make']) assert.equal(document.find(['lord', name]).lexeme, '-999');
  assert.ok(has(assessment, 'unknown-root-field', ['futureRoot']));
  assert.ok(has(assessment, 'unknown-lord-field', ['lord', 'futureLord']));
  document = exactEdit(document, ['lord', 'opponent_type'], 7, '7');
  document = exactEdit(document, ['lord', 'starting_troops_deathmatch', 27], -999, '-999');
  assert.equal(document.find(['lord', 'opponent_type_for_speech']).lexeme, '29');
  assert.equal(document.find(['futureRoot', 'precise']).lexeme, '9007199254740993');
  assert.equal(document.find(['lord', 'futureLord', 'scientific']).lexeme, '1.2300E+02');
});

test('group 7: generic roots and absent/null/wrong-type lord stay generic with explicit diagnostics', () => {
  for (const source of ['null', '[]', '17', '{}', '{"lord":null}', '{"lord":[]}', '{"lord":3}', '{"lord":"x"}']) {
    const document = preserved(source), result = lord.inspect(document);
    assert.equal(result.syntax.status, 'preserved-json');
    assert.equal(result.interpretation.status, 'not-lord');
    assert.equal(result.target.canonicalStructure, 'blocked');
    assert.equal(lord.classify(bytes(source)).kind, 'generic-json');
  }
  const document = preserved('{"lord":{"opponent_type":4}}');
  assert.equal(document.root.members[0].value.members.length, 1);
  assert.ok(has(lord.inspect(document), 'field-missing', ['lord', 'opponent_type_for_speech']));
  assert.throws(() => document.find(['lord', 'opponent_type_for_speech']), { code: 'missing-path' });
});

const arrayCases = [
  ['missing', '', 'field-missing'], ['null', 'null', 'array-type'], ['object', '{}', 'array-type'],
  ['empty', '[]', 'array-short'], ['short', '[1,2]', 'array-short'], ['exact', '[1,2,3,4,5,6,7,8]', null],
  ['long', '[1,2,3,4,5,6,7,8,2147483647]', 'array-ignored-tail'],
];
for (const [label, token, code] of arrayCases) {
  test(`group 2: ${label} array is preserved, diagnosed without padding/clamping/trimming`, () => {
    const source = '{"lord":{' + (token ? '"farm_types":' + token : '') + '}}';
    const document = preserved(source), assessment = lord.inspect(document);
    assert.equal(has(assessment, 'array-type', ['lord', 'farm_types']), code === 'array-type');
    if (code) assert.ok(has(assessment, code, ['lord', 'farm_types']));
    if (token.startsWith('[')) assert.equal(document.find(['lord', 'farm_types']).elements.length, token === '[]' ? 0 : token.split(',').length);
    if (code === 'array-ignored-tail') {
      const diagnostic = assessment.diagnostics.find(d => d.code === code);
      assert.equal(diagnostic.ignoredByPinnedTransfer, true);
      assert.equal(diagnostic.runtimeLossless, false);
      assert.equal(diagnostic.span.unit, 'utf8-byte');
      assert.equal(text(document.slice(diagnostic.span)), token);
    }
  });
}

const integerCases = [
  ['-2147483648', null], ['2147483647', null], ['-0', null], ['-999', null],
  ['2147483648', 'int32-overflow'], ['-2147483649', 'int32-overflow'], ['9'.repeat(500), 'int32-overflow'],
  ['"1"', 'int32-type'], ['true', 'int32-type'], ['null', 'int32-type'], ['{}', 'int32-type'], ['[]', 'int32-type'],
  ['1.5', 'int32-spelling-unverified'], ['1.0', 'int32-spelling-unverified'], ['1e0', 'int32-spelling-unverified'],
  ['1e400', 'int32-spelling-unverified'], ['1e-9999', 'int32-spelling-unverified'],
];
for (const [i, [token, code]] of integerCases.entries()) {
  test(`group 2: Int32 spelling/type case ${i + 1} is exact for scalar and ignored tail`, () => {
    const source = '{"lord":{"opponent_type":' + token + ',"farm_types":[1,2,3,4,5,6,7,8,' + token + ']}}';
    const document = preserved(source), assessment = lord.inspect(document);
    const scalarPath = ['lord', 'opponent_type'], tailPath = ['lord', 'farm_types', 8];
    for (const p of [scalarPath, tailPath]) {
      const diagnostic = assessment.diagnostics.find(d => JSON.stringify(d.path) === JSON.stringify(p) && d.code.startsWith('int32'));
      if (code) {
        assert.equal(diagnostic.code, code);
        assert.equal(text(document.slice(diagnostic.span)), token);
      } else assert.equal(diagnostic, undefined);
    }
    assert.ok(has(assessment, 'array-ignored-tail', ['lord', 'farm_types']));
    assert.equal(assessment.target.canonicalStructure, 'blocked');
    if (code === 'int32-type') assert.equal(assessment.interpretation.status, 'invalid-shape');
  });
}

test('group 2: all known array lengths and all tails are checked; complete long input is preserved but noncanonical', () => {
  const base = preserved(fixture);
  // Test-source surgery creates fixtures only. The production edit API never
  // inserts, deletes or reorders arrays/members.
  const n = base.find(['lord', 'farm_types']);
  const long = Buffer.concat([fixture.subarray(0, n.span.end - 1), Buffer.from(',9]'), fixture.subarray(n.span.end)]);
  const document = preserved(new Uint8Array(long)), assessment = lord.inspect(document);
  assert.equal(assessment.target.typedShape, 'complete-int32-shape');
  assert.equal(assessment.target.canonicalStructure, 'blocked');
  assert.equal(document.find(['lord', 'farm_types']).elements.length, 9);
  exactEdit(document, ['lord', 'farm_types', 8], -999, '-999');
  for (const [name, length] of expectedArrays) {
    const short = preserved('{"lord":{"' + name + '":[' + Array(length - 1).fill('1').join(',') + ']}}');
    assert.ok(has(lord.inspect(short), 'array-short', ['lord', name]));
  }
});

test('group 3: escaped-equivalent duplicate root lord is ambiguous and preserves every occurrence', () => {
  const document = preserved(String.raw`{"lord":{"opponent_type":1},"lo\u0072d":{"opponent_type":2},"other":3}`);
  const assessment = lord.inspect(document);
  assert.equal(assessment.interpretation.status, 'ambiguous');
  assert.equal(assessment.target.canonicalStructure, 'blocked');
  assert.equal(assessment.diagnostics.find(d => d.code === 'ambiguous-lord').occurrences.length, 2);
  assert.equal(lord.classify(document.serialize()).kind, 'ambiguous-lordjson');
  assert.throws(() => document.edit(['lord', 'opponent_type'], 4), { code: 'ambiguous-path' });
  exactEdit(document, ['other'], 4, '4');
});

test('group 3: duplicate known scalar/array and unknown subtree preserve ambiguity while unique edits work', () => {
  const source = String.raw`{"lord":{"opponent_type":1,"opponent\u005ftype":2,"farm_types":[],"farm_types":[1],"x":{"k":1},"x":{"k":2},"build_rate":3}}`;
  const document = preserved(source), assessment = lord.inspect(document);
  assert.equal(assessment.interpretation.status, 'ambiguous');
  for (const p of [['lord', 'opponent_type'], ['lord', 'farm_types'], ['lord', 'x', 'k']]) {
    assert.throws(() => document.edit(p, 9), { code: 'ambiguous-path' });
  }
  assert.ok(has(assessment, 'ambiguous-field', ['lord', 'opponent_type']));
  assert.ok(has(assessment, 'ambiguous-field', ['lord', 'farm_types']));
  assert.equal(assessment.diagnostics.filter(d => d.code === 'duplicate-name').length, 3);
  const edited = exactEdit(document, ['lord', 'build_rate'], 77, '77');
  assert.equal(lord.inspect(edited).diagnostics.filter(d => d.code === 'duplicate-name').length, 3);
});

test('group 3: unknown root/lord duplicates block canonical package by review policy; nested duplicates remain unverified', () => {
  const base = preserved(fixture);
  for (const p of [[], ['lord']]) {
    const n = base.find(p), data = base.serialize();
    const modified = Buffer.concat([data.subarray(0, n.span.end - 1), Buffer.from(',"unknownDup":1,"unknownDup":2}'), data.subarray(n.span.end)]);
    const document = preserved(new Uint8Array(modified)), assessment = lord.inspect(document);
    assert.equal(assessment.interpretation.status, 'interpretable');
    assert.equal(assessment.target.canonicalStructure, 'blocked');
    const duplicate = assessment.diagnostics.find(d => d.code === 'duplicate-name');
    assert.equal(duplicate.scope, p.length ? 'lord' : 'root');
    assert.equal(duplicate.severity, 'error');
  }
  const source = text(fixture).replace('"inner": {', '"inner": {"z":1,"z":2,');
  const document = preserved(source), assessment = lord.inspect(document);
  assert.equal(assessment.target.canonicalStructure, 'complete-exact-arrays');
  assert.equal(assessment.diagnostics.find(d => d.code === 'duplicate-name').scope, 'nested');
  exactEdit(document, ['lord', 'build_rate'], 777, '777');
});

test('groups 5/6: UTF-8/BOM/trivia/string variants preserve bytes, lone surrogates block canonical structure', () => {
  const original = text(fixture), literal = 'Grüße 🏰';
  assert.ok(original.includes(literal), 'Unicode replacement target must be real fixture text');
  assert.ok(Buffer.from(fixture).includes(Buffer.from(literal, 'utf8')));
  const escaped = original.replace(literal, String.raw`Gr\u00fc\u00dfe \uD83C\uDFF0`);
  assert.notEqual(escaped, original);
  assert.notDeepEqual(bytes(escaped), fixture);
  const variants = [original, original.slice(1), original.replace(/\r\n/g, '\n'), escaped];
  assert.equal(new Set(variants).size, 4, 'Each advertised byte variant must differ');
  for (const source of variants) {
    const document = preserved(source);
    assert.ok(document.find(['note']).value.includes(literal));
    assert.equal(document.find(['lord', 'futureLord', 'inner', 'text']).value, 'a/ä🦊');
    exactEdit(document, ['lord', 'build_rate'], -999, '-999');
  }
  const document = preserved(text(fixture).replace('SELF-AUTHORED', String.raw`\uD800 SELF-AUTHORED`));
  const assessment = lord.inspect(document);
  assert.ok(has(assessment, 'escaped-lone-surrogate'));
  assert.equal(assessment.target.canonicalStructure, 'blocked');
  exactEdit(document, ['lord', 'build_rate'], 1, '1');
});

test('group 9: unknown prototype-like keys have no effects, and unknown IDs remain semantically unverified', () => {
  const document = preserved('{"__proto__":{"polluted":1},"lord":{"constructor":7,"opponent_type":2147483647,"farm_types":[999,30,0,31,32,33,0,0]}}');
  assert.equal({}.polluted, undefined);
  const assessment = lord.inspect(document);
  assert.equal(assessment.interpretation.fields.find(f => f.name === 'opponent_type').semanticStatus, 'unverified');
  assert.equal(assessment.target.semanticStatus, 'unverified');
  assert.equal(document.find(['lord', 'farm_types', 0]).lexeme, '999');
  exactEdit(document, ['lord', 'constructor'], 8, '8');
  assert.equal({}.polluted, undefined);
});

test('group 10: synthetic BAIC1508, wire1120, BAIV and classic AIV bytes never classify by length or extension', () => {
  const baic = new Uint8Array(1508), wire = new Uint8Array(1120);
  wire[0] = 2;
  const baiv = new Uint8Array([1,0,1,0,0,0,1,0,190,255,1,0,99,0]);
  const classic = new Uint8Array([0,0,0,0,200,0,0,0]);
  for (const source of [baic, wire, baiv, classic]) {
    const result = lord.classify(source, { fileName: 'Pretend.lordjson' });
    assert.equal(result.kind, 'unparsed');
    assert.ok(result.error instanceof json.DocumentError);
    assert.deepEqual(result.error.serializeOriginal(), source);
    assert.equal(result.document, undefined);
  }
  // Even JSON text padded to a binary's length is still only generic JSON.
  const padded = bytes('{}' + ' '.repeat(1506));
  const generic = lord.classify(padded, { fileName: 'Pretend.lordjson' });
  assert.equal(generic.kind, 'generic-json');
  assert.deepEqual(generic.document.serialize(), padded);
});

test('group 10: AIVJSON and UCP Character JSON stay generic, without normalization or inferred lord data', () => {
  for (const source of [
    '{"pauseDelayAmount":100,"frames":[{"itemType":0,"tilePositionOfsets":[1,1],"shouldPause":true},{}],"miscItems":[],"future":1e400}',
    '{"Name":"Synthetic","Personality":{"FarmTypes":[30,31,32]},"AI":{"opponent_type":4},"constructor":7}',
  ]) {
    const document = preserved(source), result = lord.classify(document.serialize(), { fileName: 'Misleading.lordjson' });
    assert.equal(result.kind, 'generic-json');
    assert.deepEqual(result.document.serialize(), document.serialize());
    assert.equal(result.assessment.interpretation.lordSpan, null);
  }
});

test('browser overlay accepts explicitly loaded pinned schema without require or Node dependencies', () => {
  const factory = browserOverlay();
  assert.equal(typeof factory.create, 'function');
  const api = factory.create(JSON.parse(fs.readFileSync(path.join(__dirname, '../config/de-lord-schema.json'), 'utf8')));
  const document = api.parse(fixture);
  assert.deepEqual(document.serialize(), fixture);
  assert.equal(api.inspect(document).target.runtimeAcceptance, 'unverified');
});
