(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../shared/lossless-json'), require('../../config/de-lord-schema.json'));
  } else root.deLordFormat = factory(root.losslessJson);
})(typeof globalThis !== 'undefined' ? globalThis : this, (json, defaultSchema) => {
  'use strict';

  // Browser callers load the pinned JSON themselves and call create(schema).
  // This additive overlay has no file-extension, Classic, AIV or converter path.
  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }

  // Independent of the caller's JSON (also in the browser). This is a pinned
  // shape/provenance check for accidental drift, not an authenticity signature.
  const pinnedNames = `opponent_type opponent_type_for_speech lord_gfx_type flag_type use_of_religion use_of_ale
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
siege_shock_amount siege_reserve_troop siege_reserve_amount siege_reserve_tribes siege_wall_troops siege_wall_amount siege_wall_tribes
who_to_pick_on use_improved_sieging starting_troops_normal starting_troops_deathmatch starting_troops_crusader
lord_power_display_level lord_hps_percent siege_max_troops siege_normal_wave_multiplier siege_high_gold_wave_multiplier`.split(/\s+/);
  const pinnedArrays = new Map([
    ['farm_types', 8], ['sell_all', 15], ['chance_of_defensive', 3], ['chance_of_harrasment', 3], ['chance_of_seiging', 3],
    ['troop_production_rate', 3], ['defensive_troops', 8], ['harrasment_troops', 8], ['harrasment_machines', 8],
    ['siege_machines', 8], ['siege_wall_troops', 24], ['starting_troops_normal', 28], ['starting_troops_deathmatch', 28],
    ['starting_troops_crusader', 28],
  ]);
  const sourceBase = '_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/';
  const pinnedMetadata = freeze({
    id: 'de-lord-game-bc8b6a39-v1', format: 'de-lordjson', version: 1,
    fieldCount: 118, arrayCount: 14, transferredInt32Words: 279,
    provenance: {
      repository: 'https://github.com/Serpens66/Stronghold-Crusader-DE-Mods',
      commit: '7e199e6f0818173794bdeeb0c4c32d74500b0eec',
      schemaSource: { path: sourceBase + 'CustomisationFileManager.cs', lines: [157, 400], gitBlob: '9cd4c4ad0a601aab1217bb786e741ef15a39f1be' },
      transferSource: { path: sourceBase + 'EngineInterface.cs', lines: [4303, 4586], gitBlob: '97bf5fcabdd626a6e80c1e17e546f357fc2d4874' },
      managedSha256: 'bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789',
      nativeSha256: 'fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2',
    },
    targetPolicy: {
      id: 'complete-canonical-v1', allFieldsRequired: true, exactArrayLengthsRequired: true,
      integerTokenPolicy: 'decimal integer spelling only; -0 accepted; fraction/exponent typed behavior unverified',
      semantics: 'unverified; no known-good template or enum substitutions',
    },
  });
  function schemaError(path, message) {
    throw new TypeError(`Invalid pinned LORD schema at ${path}: ${message}`);
  }
  function schemaSnapshot(value, path = 'schema', ancestors = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
        (typeof value === 'number' && Number.isFinite(value))) return value;
    if (!value || typeof value !== 'object') schemaError(path, 'expected JSON data');
    if (ancestors.has(value) || ancestors.size >= 32) schemaError(path, 'cyclic or excessively nested JSON data');
    const array = Array.isArray(value), keys = Reflect.ownKeys(value).filter(key => !(array && key === 'length'));
    if (array && (keys.length !== value.length || keys.some((key, i) => key !== String(i)))) {
      schemaError(path, 'expected a dense JSON array');
    }
    ancestors.add(value);
    const entries = keys.map(key => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
        schemaError(path, 'expected enumerable JSON data properties, without accessors');
      }
      return [key, schemaSnapshot(descriptor.value, `${path}.${key}`, ancestors)];
    });
    ancestors.delete(value);
    return array ? entries.map(entry => entry[1]) : Object.fromEntries(entries);
  }
  function requireSchema(actual, expected, path) {
    if (expected && typeof expected === 'object') {
      if (!actual || typeof actual !== 'object' || Array.isArray(actual) !== Array.isArray(expected) ||
          (Array.isArray(expected) && actual.length !== expected.length)) schemaError(path, 'missing or malformed required metadata');
      for (const [key, value] of Object.entries(expected)) {
        if (!Object.hasOwn(actual, key)) schemaError(`${path}.${key}`, 'missing required metadata');
        requireSchema(actual[key], value, `${path}.${key}`);
      }
    } else if (actual !== expected) schemaError(path, `expected ${JSON.stringify(expected)}`);
  }
  function validateSchema(schema) {
    requireSchema(schema, pinnedMetadata, 'schema');
    if (!Array.isArray(schema.fields) || schema.fields.length !== 118) schemaError('schema.fields', 'expected 118 fields');
    const names = new Set();
    for (const [i, field] of schema.fields.entries()) {
      const path = `schema.fields.${i}`, index = field && pinnedNames.indexOf(field.name);
      if (index == null || index < 0 || names.has(field.name)) schemaError(path, 'unknown or duplicate pinned field name');
      names.add(field.name);
      const length = pinnedArrays.get(field.name);
      const initializer = length ? { kind: 'allocated-zero-array', length, elementValue: 0, expression: `new int[${length}]` } :
        index >= 115 ? { kind: 'explicit-scalar', value: [200, 5, 7][index - 115] } : { kind: 'implicit-zero', value: 0 };
      requireSchema(field, { name: pinnedNames[index], type: length ? 'signedInt32Array' : 'signedInt32', sourceLine: 165 + index * 2,
        declarationInitializer: initializer, runtimeMissingFieldDefault: 'unverified' }, path);
      if (length) requireSchema(field.length, length, `${path}.length`);
      else if (Object.hasOwn(field, 'length')) schemaError(`${path}.length`, 'scalar fields have no array length');
    }
    if (schema.fields.filter(field => field.type === 'signedInt32Array').length !== 14 ||
        schema.fields.reduce((n, field) => n + (field.type === 'signedInt32Array' ? field.length : 1), 0) !== 279) {
      schemaError('schema.fields', 'expected 14 arrays and 279 transferred Int32 words');
    }
  }
  function create(inputSchema) {
    if (!json) throw new Error('losslessJson must be loaded first');
    const schema = schemaSnapshot(inputSchema);
    validateSchema(schema);
    freeze(schema);
    const byName = new Map(schema.fields.map(field => [field.name, field]));

    function inspect(document) {
      json.find(document, []); // Also verifies document identity; never project it.
      const root = document.root, diagnostics = [], fields = [];
      let lord = null, shape = 'not-lord', typedIssue = false, canonicalBlocked = false;
      function issue(code, severity, path, node, message, extra = {}, blocks = false, typed = false) {
        diagnostics.push(freeze({ code, severity, path: [...path], span: node.span, message, ...extra }));
        canonicalBlocked ||= blocks;
        typedIssue ||= typed;
      }
      if (root.type !== 'object') {
        issue('root-not-object', 'error', [], root, 'LORDJSON interpretation requires an object root', {}, true, true);
      } else {
        const matches = root.members.filter(m => m.key.value === 'lord');
        if (!matches.length) issue('lord-missing', 'error', ['lord'], root, 'No root lord member; nothing is manufactured', {}, true, true);
        else if (matches.length > 1) {
          shape = 'ambiguous';
          issue('ambiguous-lord', 'error', ['lord'], root, 'Duplicate decoded lord names; no occurrence selected', {
            occurrences: matches.map(m => ({ keySpan: m.key.span, valueSpan: m.value.span })),
          }, true, true);
        } else if (matches[0].value.type !== 'object') {
          issue('lord-not-object', 'error', ['lord'], matches[0].value, 'lord must be a non-null, non-array object', {}, true, true);
        } else { lord = matches[0].value; shape = 'interpretable'; }
        for (const member of root.members) {
          if (member.key.value !== 'lord') issue('unknown-root-field', 'unverified', [member.key.value], member.value,
            'Extension retained; game interpretation is unverified');
        }
      }
      for (const diagnostic of document.diagnostics) {
        if (diagnostic.code === 'duplicate-name') {
          const rootScope = diagnostic.scopeSpan === root.span;
          const lordScope = lord && diagnostic.scopeSpan === lord.span;
          const blocks = rootScope || lordScope;
          diagnostics.push(freeze({ ...diagnostic, severity: blocks ? 'error' : 'unverified',
            scope: rootScope ? 'root' : lordScope ? 'lord' : 'nested',
            message: blocks ? 'Unresolved duplicate names block the first canonical package by review policy' :
              'Nested duplicate retained; interoperability is unverified',
          }));
          canonicalBlocked ||= blocks;
        } else {
          diagnostics.push(diagnostic);
          canonicalBlocked = true; // Lone surrogate interoperability not certified.
        }
      }
      function integer(node, path) {
        if (node.type !== 'number') {
          issue('int32-type', 'error', path, node, 'Expected a number token; no coercion is performed', {}, true, true);
          if (shape !== 'ambiguous') shape = 'invalid-shape';
          return;
        }
        const raw = node.lexeme;
        if (!/^-?(?:0|[1-9][0-9]*)$/.test(raw)) {
          issue('int32-spelling-unverified', 'unverified', path, node,
            'Fraction/exponent spelling is preserved; Unity typed Int32 behavior is unverified', {}, true, true);
          return;
        }
        const negative = raw[0] === '-', digits = negative ? raw.slice(1) : raw;
        const bound = negative ? '2147483648' : '2147483647';
        // Compare exact decimal magnitude BEFORE any Number conversion. No
        // numeric conversion is needed by this diagnostic-only overlay.
        if (digits.length > bound.length || (digits.length === bound.length && digits > bound)) {
          issue('int32-overflow', 'error', path, node, 'Decimal magnitude exceeds signed Int32 bounds', {}, true, true);
        }
      }
      if (lord) {
        const members = new Map();
        for (const member of lord.members) {
          const name = member.key.value;
          if (!members.has(name)) members.set(name, []);
          members.get(name).push(member);
          if (!byName.has(name)) issue('unknown-lord-field', 'unverified', ['lord', name], member.value,
            'Extension retained; game interpretation is unverified');
        }
        for (const field of schema.fields) {
          const path = ['lord', field.name], occurrences = members.get(field.name) || [];
          fields.push(freeze({ name: field.name, status: occurrences.length === 0 ? 'missing' : occurrences.length === 1 ? 'unique' : 'ambiguous',
            semanticStatus: 'unverified', occurrences: occurrences.map(m => ({ keySpan: m.key.span, valueSpan: m.value.span })),
          }));
          if (!occurrences.length) {
            issue('field-missing', 'error', path, lord, 'Complete canonical input requires this field; no default is inserted',
              { spanRole: 'containing-lord' }, true, true);
            continue;
          }
          if (occurrences.length > 1) {
            shape = 'ambiguous';
            issue('ambiguous-field', 'error', path, lord, 'Duplicate decoded known field; no occurrence selected', {
              occurrences: occurrences.map(m => ({ keySpan: m.key.span, valueSpan: m.value.span })),
            }, true, true);
            continue;
          }
          const node = occurrences[0].value;
          if (field.type === 'signedInt32') { integer(node, path); continue; }
          if (node.type !== 'array') {
            if (shape !== 'ambiguous') shape = 'invalid-shape';
            issue('array-type', 'error', path, node, 'Expected an array; null/object/scalar is retained without padding', {}, true, true);
            continue;
          }
          if (node.elements.length < field.length) issue('array-short', 'error', path, node,
            'Transfer directly indexes all declared positions; short arrays are not certified',
            { expectedLength: field.length, actualLength: node.elements.length }, true, true);
          if (node.elements.length > field.length) issue('array-ignored-tail', 'unverified', path, node,
            'Tail retained and type-checked; current transfer reads only the declared prefix. Canonical package requires exact lengths',
            { expectedLength: field.length, actualLength: node.elements.length, ignoredByPinnedTransfer: true, runtimeLossless: false }, true);
          node.elements.forEach((child, i) => integer(child, [...path, i]));
        }
      }
      issue('runtime-semantics-unverified', 'unverified', lord ? ['lord'] : [], lord || root,
        'Numeric enum IDs and gameplay semantics are unverified; no substitutions or playable-template claim');
      return freeze({
        syntax: { status: 'preserved-json', spanUnit: json.SPAN_UNIT, byteLength: document.byteLength },
        interpretation: { status: shape, lordSpan: lord ? lord.span : null, fields },
        target: {
          schemaId: schema.id, profile: schema.targetPolicy.id,
          typedShape: typedIssue ? 'not-certified' : 'complete-int32-shape',
          canonicalStructure: canonicalBlocked ? 'blocked' : 'complete-exact-arrays',
          semanticStatus: 'unverified', runtimeAcceptance: 'unverified',
        },
        diagnostics,
      });
    }
    function classify(input, options) {
      let document;
      try { document = json.parse(input, options); }
      catch (error) {
        if (!(error instanceof json.DocumentError)) throw error;
        // No binary format detection by size/magic/extension is attempted here.
        return Object.freeze({ kind: 'unparsed', error });
      }
      const assessment = inspect(document);
      const status = assessment.interpretation.status;
      const kind = assessment.interpretation.lordSpan ? 'de-lordjson' : status === 'ambiguous' ? 'ambiguous-lordjson' : 'generic-json';
      return Object.freeze({ kind, document, assessment });
    }
    return Object.freeze({ schema, inspect, classify, parse: json.parse, patch: json.patch });
  }
  return Object.freeze({ create, ...(defaultSchema ? create(defaultSchema) : {}) });
});
