(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../shared/lossless-json'), require('../shared/generated/de-lord-pin'), require('../../config/de-lord-schema.json'));
  } else root.deLordFormat = factory(root.losslessJson, root.deLordPin, root.deLordPin && root.deLordPin.schema);
})(typeof globalThis !== 'undefined' ? globalThis : this, (json, pin, defaultSchema) => {
  'use strict';

  // Browser load order: lossless-json, generated/de-lord-pin, then this module.
  // create(schema) still accepts separately loaded JSON and retains its private copy.
  // This additive overlay has no file-extension, Classic, AIV or converter path.
  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }

  if (!pin) throw new Error('Generated deLordPin must be loaded before deLordFormat');
  const { fields: pinnedFields, ...pinnedMetadata } = pin.schema;
  const pinnedByName = new Map(pinnedFields.map(field => [field.name, field]));
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
    if (!Array.isArray(schema.fields) || schema.fields.length !== pinnedFields.length) {
      schemaError('schema.fields', `expected ${pinnedFields.length} fields`);
    }
    const names = new Set();
    for (const [i, field] of schema.fields.entries()) {
      const path = `schema.fields.${i}`, expected = field && pinnedByName.get(field.name);
      if (!expected || names.has(field.name)) schemaError(path, 'unknown or duplicate pinned field name');
      names.add(field.name);
      requireSchema(field, expected, path);
      if (!Object.hasOwn(expected, 'length') && Object.hasOwn(field, 'length')) {
        schemaError(`${path}.length`, 'scalar fields have no array length');
      }
    }
    if (schema.fields.filter(field => field.type === 'signedInt32Array').length !== pin.schema.arrayCount ||
        schema.fields.reduce((n, field) => n + (field.type === 'signedInt32Array' ? field.length : 1), 0) !== pin.schema.transferredInt32Words) {
      schemaError('schema.fields', `expected ${pin.schema.arrayCount} arrays and ${pin.schema.transferredInt32Words} transferred Int32 words`);
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
    function classifyDocument(document) {
      const assessment = inspect(document);
      const status = assessment.interpretation.status;
      const kind = assessment.interpretation.lordSpan ? 'de-lordjson' : status === 'ambiguous' ? 'ambiguous-lordjson' : 'generic-json';
      return Object.freeze({ kind, document, assessment });
    }
    function classify(input, options) {
      let document;
      try { document = json.parse(input, options); }
      catch (error) {
        if (!(error instanceof json.DocumentError)) throw error;
        // No binary format detection by size/magic/extension is attempted here.
        return Object.freeze({ kind: 'unparsed', error });
      }
      return classifyDocument(document);
    }
    return Object.freeze({ schema, inspect, classify, classifyDocument, parse: json.parse, patch: json.patch });
  }
  return Object.freeze({ create, ...(defaultSchema ? create(defaultSchema) : {}) });
});
