(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.losslessJson = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  // All spans are half-open UTF-8 BYTE offsets into this revision, including BOM.
  // Bytes are private; every public byte view is a copy. No object projection is
  // used as a serialization source. Container/member order includes duplicates.
  const SPAN_UNIT = 'utf8-byte';
  const DEFAULT_LIMITS = Object.freeze({
    maxBytes: 8 * 1024 * 1024, maxDepth: 128, maxNodes: 200000,
    maxTokens: 500000, maxTokenBytes: 1024 * 1024,
  });
  const HARD_LIMITS = Object.freeze({
    maxBytes: 64 * 1024 * 1024, maxDepth: 256, maxNodes: 1000000,
    maxTokens: 2000000, maxTokenBytes: 64 * 1024 * 1024,
  });
  const states = new WeakMap();
  const handles = new WeakMap();
  const numericTokens = new WeakSet();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
  const span = (start, end) => Object.freeze({ start, end, unit: SPAN_UNIT });
  const numberPattern = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?(?![\s\S])/;

  class DocumentError extends Error {
    constructor(category, code, message, offset, bytes, details = {}) {
      super(message);
      this.name = 'LosslessJsonError';
      this.category = category;
      this.code = code;
      this.offset = offset;
      this.spanUnit = SPAN_UNIT;
      this.details = Object.freeze(details);
      // Recovery is opaque: failures never contain a partially editable tree.
      this.serializeOriginal = () => bytes.slice();
    }
  }
  function fail(bytes, category, code, message, offset, details) {
    throw new DocumentError(category, code, message, offset, bytes, details);
  }
  function limitsFor(overrides = {}) {
    for (const key of Object.keys(overrides)) {
      if (!Object.hasOwn(DEFAULT_LIMITS, key)) throw new TypeError(`Unknown limit: ${key}`);
    }
    const limits = { ...DEFAULT_LIMITS, ...overrides };
    for (const key of Object.keys(limits)) {
      if (!Number.isSafeInteger(limits[key]) || limits[key] < 0 || limits[key] > HARD_LIMITS[key]) {
        throw new RangeError(`${key} must be in [0, ${HARD_LIMITS[key]}]`);
      }
    }
    return Object.freeze(limits);
  }
  function copyInput(input) {
    if (input instanceof Uint8Array) return new Uint8Array(input);
    if (input instanceof ArrayBuffer) return new Uint8Array(input.slice(0));
    throw new TypeError('Expected UTF-8 bytes (Uint8Array or ArrayBuffer), not decoded text');
  }
  function validateEncoding(bytes) {
    const starts = (...prefix) => prefix.every((b, i) => bytes[i] === b);
    if (starts(0, 0, 254, 255) || starts(255, 254, 0, 0) ||
        starts(255, 254) || starts(254, 255)) {
      fail(bytes, 'unsupported-encoding', 'unsupported-encoding', 'UTF-16/32 is not supported', 0);
    }
    // Validate before parsing, so an invalid suffix cannot be hidden by an early
    // grammar error. Reject overlong, surrogate and >U+10FFFF encodings fatally.
    for (let i = 0; i < bytes.length;) {
      const b = bytes[i];
      if (b < 128) { i++; continue; }
      const n = b >= 194 && b <= 223 ? 2 : b >= 224 && b <= 239 ? 3 : b >= 240 && b <= 244 ? 4 : 0;
      let good = n && i + n <= bytes.length;
      for (let j = 1; good && j < n; j++) good = bytes[i + j] >= 128 && bytes[i + j] <= 191;
      if (good && ((b === 224 && bytes[i + 1] < 160) || (b === 237 && bytes[i + 1] > 159) ||
                   (b === 240 && bytes[i + 1] < 144) || (b === 244 && bytes[i + 1] > 143))) good = false;
      if (!good) fail(bytes, 'encoding', 'invalid-utf8', 'Invalid UTF-8 sequence', i);
      i += n;
    }
  }
  function hasLoneSurrogate(value) {
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff) {
        const next = value.charCodeAt(++i);
        if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      } else if (c >= 0xdc00 && c <= 0xdfff) return true;
    }
    return false;
  }

  function parseRevision(bytes, limits, revision) {
    const error = (category, code, message, offset = pos, details) => fail(bytes, category, code, message, offset, details);
    let pos = 0, nodeCount = 0;
    if (bytes.length > limits.maxBytes) error('limit', 'max-bytes', 'Document byte limit exceeded', 0);
    validateEncoding(bytes);
    const tokens = [], diagnostics = [], nodes = new WeakSet();
    function token(kind, start, end) {
      if (end - start > limits.maxTokenBytes) error('limit', 'max-token-bytes', 'Token byte limit exceeded', start);
      if (tokens.length >= limits.maxTokens) error('limit', 'max-tokens', 'Token count limit exceeded', start);
      const result = Object.freeze({ kind, span: span(start, end) });
      tokens.push(result);
      return result;
    }
    const bom = bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191;
    if (bom) { token('bom', 0, 3); pos = 3; }
    function trivia() {
      const start = pos;
      while ([32, 9, 10, 13].includes(bytes[pos])) pos++;
      if (pos !== start) token('trivia', start, pos);
    }
    function punct(c) {
      if (bytes[pos] !== c.charCodeAt(0)) error('syntax', 'expected-token', `Expected ${c}`);
      return token(c, pos, ++pos).span;
    }
    function finish(type, start, id, extra) {
      const node = Object.freeze({ id, type, span: span(start, pos), ...extra });
      nodes.add(node);
      return node;
    }
    function string(start, id) {
      pos++;
      let segment = pos, value = '';
      while (pos < bytes.length) {
        if (pos - start >= limits.maxTokenBytes) error('limit', 'max-token-bytes', 'String token byte limit exceeded', start);
        const c = bytes[pos];
        if (c === 34) {
          value += decoder.decode(bytes.subarray(segment, pos));
          pos++;
          token('string', start, pos);
          const node = finish('string', start, id, { value });
          if (hasLoneSurrogate(value)) diagnostics.push(Object.freeze({
            code: 'escaped-lone-surrogate', severity: 'unverified', span: node.span,
            message: 'Escaped lone surrogate retained; interoperability is unverified',
          }));
          return node;
        }
        if (c < 32) error('syntax', 'unescaped-control', 'Unescaped control character in string');
        if (c !== 92) { pos++; continue; }
        value += decoder.decode(bytes.subarray(segment, pos));
        pos++;
        const escape = bytes[pos++];
        const escapes = new Map([[34, '"'], [92, '\\'], [47, '/'], [98, '\b'], [102, '\f'], [110, '\n'], [114, '\r'], [116, '\t']]);
        if (escape === 117) {
          let code = 0;
          for (let i = 0; i < 4; i++) {
            const h = bytes[pos++];
            const digit = h >= 48 && h <= 57 ? h - 48 : h >= 65 && h <= 70 ? h - 55 : h >= 97 && h <= 102 ? h - 87 : -1;
            if (digit < 0) error('syntax', 'bad-unicode-escape', 'Expected four hexadecimal escape digits', Math.min(pos - 1, bytes.length));
            code = code * 16 + digit;
          }
          value += String.fromCharCode(code);
        } else if (escapes.has(escape)) value += escapes.get(escape);
        else error('syntax', 'bad-escape', 'Invalid JSON string escape', Math.min(pos - 1, bytes.length));
        segment = pos;
      }
      error('syntax', 'unterminated-string', 'Unterminated string', bytes.length);
    }
    const digit = b => b >= 48 && b <= 57;
    function value(depth) {
      if (depth > limits.maxDepth) error('limit', 'max-depth', 'Syntax depth limit exceeded');
      if (nodeCount >= limits.maxNodes) error('limit', 'max-nodes', 'Syntax node limit exceeded');
      const id = nodeCount++, start = pos, c = bytes[pos];
      if (c === 34) return string(start, id);
      if (c === 123 || c === 91) {
        const object = c === 123, entries = [];
        const openSpan = punct(object ? '{' : '[');
        trivia();
        const close = object ? '}' : ']';
        if (bytes[pos] !== close.charCodeAt(0)) {
          while (true) {
            if (object) {
              if (bytes[pos] !== 34) error('syntax', 'expected-key', 'Expected object member name');
              const key = value(depth + 1);
              trivia();
              const colonSpan = punct(':');
              trivia();
              const child = value(depth + 1);
              entries.push(Object.freeze({ key, value: child, colonSpan, span: span(key.span.start, child.span.end) }));
            } else entries.push(value(depth + 1));
            trivia();
            if (bytes[pos] === close.charCodeAt(0)) break;
            punct(',');
            trivia();
          }
        }
        const closeSpan = punct(close);
        return finish(object ? 'object' : 'array', start, id, {
          [object ? 'members' : 'elements']: Object.freeze(entries), openSpan, closeSpan,
        });
      }
      if (c === 45 || digit(c)) {
        if (bytes[pos] === 45) pos++;
        if (bytes[pos] === 48) pos++;
        else {
          if (!(bytes[pos] >= 49 && bytes[pos] <= 57)) error('syntax', 'bad-number', 'Expected integer digits');
          while (digit(bytes[pos])) pos++;
        }
        if (bytes[pos] === 46) {
          pos++;
          if (!digit(bytes[pos])) error('syntax', 'bad-number', 'Expected fractional digits');
          while (digit(bytes[pos])) pos++;
        }
        if (bytes[pos] === 69 || bytes[pos] === 101) {
          pos++;
          if (bytes[pos] === 43 || bytes[pos] === 45) pos++;
          if (!digit(bytes[pos])) error('syntax', 'bad-number', 'Expected exponent digits');
          while (digit(bytes[pos])) pos++;
        }
        token('number', start, pos);
        return finish('number', start, id, { lexeme: decoder.decode(bytes.subarray(start, pos)) });
      }
      for (const [word, type, decoded] of [['true', 'boolean', true], ['false', 'boolean', false], ['null', 'null', null]]) {
        if (c !== word.charCodeAt(0)) continue;
        for (let i = 0; i < word.length; i++) {
          if (bytes[pos] !== word.charCodeAt(i)) error('syntax', 'bad-literal', `Expected ${word}`);
          pos++;
        }
        token(type, start, pos);
        return finish(type, start, id, { value: decoded });
      }
      error('syntax', 'expected-value', 'Expected JSON value');
    }
    trivia();
    const root = value(0);
    trivia();
    if (pos !== bytes.length) error('syntax', 'trailing-content', 'Unexpected content after root');

    const pending = [{ node: root, path: [] }];
    while (pending.length) {
      const { node, path } = pending.pop();
      if (node.type === 'object') {
        const names = new Map();
        for (const member of node.members) {
          const name = member.key.value;
          if (!names.has(name)) names.set(name, []);
          names.get(name).push(member);
          pending.push({ node: member.value, path: [...path, name] });
        }
        for (const [name, occurrences] of names) {
          if (occurrences.length > 1) diagnostics.push(Object.freeze({
            code: 'duplicate-name', severity: 'unverified', name, path: Object.freeze([...path, name]),
            scopeSpan: node.span, span: occurrences[0].key.span,
            occurrences: Object.freeze(occurrences.map(m => Object.freeze({ keySpan: m.key.span, valueSpan: m.value.span }))),
          }));
        }
      } else if (node.type === 'array') {
        node.elements.forEach((child, i) => pending.push({ node: child, path: [...path, i] }));
      }
    }
    const document = Object.freeze({
      root, revision, spanUnit: SPAN_UNIT, byteLength: bytes.length, limits,
      bomSpan: bom ? span(0, 3) : null,
      tokens: Object.freeze(tokens), diagnostics: Object.freeze(diagnostics),
      serialize: () => bytes.slice(),
      slice: range => {
        if (!range || range.unit !== SPAN_UNIT || !Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end) ||
            range.start < 0 || range.end < range.start || range.end > bytes.length) throw new RangeError('Invalid byte span');
        return bytes.slice(range.start, range.end);
      },
      find: path => find(document, path),
      handle: path => handle(document, path),
      edit: (path, newValue) => patch(document, [{ path, value: newValue }]),
    });
    states.set(document, { bytes, nodes });
    return document;
  }
  function parse(input, options = {}) {
    return parseRevision(copyInput(input), limitsFor(options.limits), 0);
  }
  function stateFor(document) {
    const state = states.get(document);
    if (!state) throw new TypeError('Expected lossless JSON document');
    return state;
  }
  function editError(document, code, message, node = document.root, details) {
    fail(stateFor(document).bytes, 'edit', code, message, node.span.start, details);
  }
  function find(document, path) {
    stateFor(document);
    if (!Array.isArray(path)) throw new TypeError('Path must be an array of decoded keys / numeric array indices');
    let node = document.root;
    for (const part of path) {
      if (node.type === 'object' && typeof part === 'string') {
        const matches = node.members.filter(m => m.key.value === part);
        if (matches.length > 1) editError(document, 'ambiguous-path', 'Path crosses duplicate member names', node, {
          name: part, occurrences: Object.freeze(matches.map(m => m.span)),
        });
        if (!matches.length) editError(document, 'missing-path', 'Path member is absent', node);
        node = matches[0].value;
      } else if (node.type === 'array' && Number.isSafeInteger(part) && part >= 0 && part < node.elements.length) node = node.elements[part];
      else editError(document, 'invalid-path', 'Path does not address an existing value', node);
    }
    return node;
  }
  function handle(document, path) {
    const node = find(document, path);
    const result = Object.freeze({ revision: document.revision, nodeId: node.id, type: node.type, span: node.span });
    handles.set(result, { document, node });
    return result;
  }
  function numberToken(lexeme) {
    if (typeof lexeme !== 'string' || !numberPattern.test(lexeme)) throw new TypeError('Expected a JSON number token');
    if (lexeme.length > HARD_LIMITS.maxTokenBytes) throw new RangeError('Number token byte limit exceeded');
    const result = Object.freeze({ type: 'json-number', lexeme });
    numericTokens.add(result);
    return result;
  }

  // Decimal exponent arithmetic is on digit strings. Even a million-digit
  // exponent never becomes a Number, BigInt, or an expanded power of ten.
  function addExponent(raw, delta) {
    const neg = raw[0] === '-', magnitude = raw.replace(/^[+-]?0*/, '') || '0';
    if (!delta) return (neg && magnitude !== '0' ? '-' : '') + magnitude;
    const other = String(Math.abs(delta)), otherNeg = delta < 0;
    if (neg === otherNeg) {
      let carry = 0, output = [];
      for (let a = magnitude.length - 1, b = other.length - 1; a >= 0 || b >= 0 || carry; a--, b--) {
        const n = (a >= 0 ? +magnitude[a] : 0) + (b >= 0 ? +other[b] : 0) + carry;
        output.push(String(n % 10)); carry = Math.floor(n / 10);
      }
      return (neg ? '-' : '') + output.reverse().join('');
    }
    const cmp = magnitude.length - other.length || (magnitude > other ? 1 : magnitude < other ? -1 : 0);
    if (!cmp) return '0';
    const large = cmp > 0 ? magnitude : other, small = cmp > 0 ? other : magnitude;
    let borrow = 0, output = [];
    for (let a = large.length - 1, b = small.length - 1; a >= 0; a--, b--) {
      let n = +large[a] - (b >= 0 ? +small[b] : 0) - borrow;
      borrow = n < 0 ? 1 : 0;
      if (borrow) n += 10;
      output.push(String(n));
    }
    return ((cmp > 0 ? neg : otherNeg) ? '-' : '') + output.reverse().join('').replace(/^0+/, '');
  }
  function decimalIdentity(raw) {
    const [mantissa, exponent = '0'] = raw.toLowerCase().split('e');
    const negative = mantissa[0] === '-';
    const unsigned = negative ? mantissa.slice(1) : mantissa;
    const point = unsigned.indexOf('.');
    const fraction = point < 0 ? 0 : unsigned.length - point - 1;
    const digits = unsigned.replace('.', '').replace(/^0+/, '');
    if (!digits) return 'zero';
    const significant = digits.replace(/0+$/, '');
    return `${negative ? '-' : ''}${significant}e${addExponent(exponent, digits.length - significant.length - fraction)}`;
  }
  function quote(value) {
    let output = '"';
    for (const char of value) {
      const code = char.codePointAt(0);
      if (char === '"' || char === '\\') output += '\\' + char;
      else if (code < 32) output += '\\u' + code.toString(16).padStart(4, '0');
      else output += char;
    }
    return output + '"';
  }
  function replacement(document, node, value) {
    if (node.type === 'array' || node.type === 'object') editError(document, 'unsupported-operation', 'Only existing scalar value replacement is supported', node);
    let type, raw;
    if (typeof value === 'string') {
      // Validate even no-ops: an existing escaped lone surrogate is preservable,
      // but its decoded value is still not an admissible new string argument.
      if (hasLoneSurrogate(value)) throw new TypeError('New strings must contain Unicode scalar values (no lone surrogates)');
      if (node.type === 'string' && value === node.value) return null;
      type = 'string'; raw = quote(value);
    }
    else if (value === null) { type = 'null'; raw = 'null'; }
    else if (typeof value === 'boolean') { type = 'boolean'; raw = String(value); }
    else if (typeof value === 'bigint' || numericTokens.has(value)) {
      type = 'number'; raw = typeof value === 'bigint' ? String(value) : value.lexeme;
    } else if (typeof value === 'number') {
      if (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value))) {
        editError(document, 'invalid-value', 'Use numberToken or BigInt for exact numbers outside safe integers', node);
      }
      type = 'number'; raw = Object.is(value, -0) ? '-0' : String(value);
    } else editError(document, 'invalid-value', 'Expected a scalar value or numberToken', node);
    const equal = type === node.type && (type === 'number' ? decimalIdentity(raw) === decimalIdentity(node.lexeme) : value === node.value);
    // Limits apply to emitted tokens. An equal scalar retains its original
    // bytes, even when a proposed spelling would be longer than the token cap.
    if (equal) return null;
    if (raw.length > document.limits.maxTokenBytes) editError(document, 'max-token-bytes', 'Replacement token byte limit exceeded', node);
    return encoder.encode(raw);
  }
  function patch(document, edits) {
    const { bytes } = stateFor(document);
    if (!Array.isArray(edits)) throw new TypeError('Edits must be an array');
    const selected = edits.map(edit => {
      if (!edit || Object.hasOwn(edit, 'path') === Object.hasOwn(edit, 'handle') ||
          (edit.operation !== undefined && edit.operation !== 'replace')) {
        editError(document, 'unsupported-operation', 'Provide exactly one path or handle for scalar replacement');
      }
      let node;
      if (Object.hasOwn(edit, 'handle')) {
        const entry = handles.get(edit.handle);
        if (!entry || entry.document !== document) editError(document, 'stale-handle', 'Handle belongs to a different document revision');
        node = entry.node;
      } else node = find(document, edit.path);
      return { node, value: edit.value };
    }).sort((a, b) => a.node.span.start - b.node.span.start);
    for (let i = 1; i < selected.length; i++) {
      if (selected[i].node.span.start < selected[i - 1].node.span.end) {
        editError(document, 'overlapping-edits', 'Batch selections overlap', selected[i].node);
      }
    }
    const changes = selected.map(e => ({ node: e.node, bytes: replacement(document, e.node, e.value) })).filter(e => e.bytes !== null);
    if (!changes.length) return document;
    const size = changes.reduce((n, c) => n + c.bytes.length - (c.node.span.end - c.node.span.start), bytes.length);
    if (size > document.limits.maxBytes) fail(bytes, 'limit', 'max-bytes', 'Patched document byte limit exceeded', 0);
    const output = new Uint8Array(size);
    let oldPos = 0, newPos = 0;
    for (const change of changes) {
      const prefix = bytes.subarray(oldPos, change.node.span.start);
      output.set(prefix, newPos); newPos += prefix.length;
      output.set(change.bytes, newPos); newPos += change.bytes.length;
      oldPos = change.node.span.end;
    }
    output.set(bytes.subarray(oldPos), newPos);
    // Parse before publishing: every limit/encoding/edit failure is atomic.
    return parseRevision(output, document.limits, document.revision + 1);
  }
  return Object.freeze({ parse, patch, find, handle, numberToken, DocumentError, SPAN_UNIT, DEFAULT_LIMITS, HARD_LIMITS });
});
