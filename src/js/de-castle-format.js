(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../shared/lossless-json'));
  else root.deCastleFormat = factory(root.losslessJson);
})(typeof globalThis !== 'undefined' ? globalThis : this, json => {
  'use strict';

  if (!json) throw new Error('losslessJson must be loaded before deCastleFormat');
  function freeze(value) {
    // CST nodes are already deeply immutable. Do not walk their subtrees again
    // for every overlay reference (especially the root/array references).
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  }
  // One source of contract data for CommonJS and browser scripts. No generated
  // schema, renderer catalogue or second inventory is needed for these 9 fields.
  const CONTRACT = freeze({
    id: 'de-aivjson-ordered-d2a-v1',
    gameSource: '7e199e6f0818173794bdeeb0c4c32d74500b0eec',
    managedSha256: 'bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789',
    nativeSha256: 'fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2',
    loaderSource: 'a90f96c176e9c8981af83534f5a8bb444838ae0a',
    root: ['pauseDelayAmount', 'frames', 'miscItems'],
    frame: ['itemType', 'tilePositionOfsets', 'shouldPause'],
    misc: ['positionOfset', 'itemType', 'number'],
    fixesAssignmentClasses: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28],
    fixesClass29: 'vanilla-fallback',
  });
  class CastleError extends Error {
    constructor(code, message) { super(message); this.name = 'CastleError'; this.code = code; }
  }
  const fail = (code, message) => { throw new CastleError(code, message); };
  function int32(node) {
    if (node.type !== 'number') return { status: 'wrong-type', value: null };
    if (!/^-?(?:0|[1-9][0-9]*)$/.test(node.lexeme)) return { status: 'unverified-spelling', value: null };
    const negative = node.lexeme[0] === '-', digits = negative ? node.lexeme.slice(1) : node.lexeme;
    const bound = negative ? '2147483648' : '2147483647';
    if (digits.length > bound.length || (digits.length === bound.length && digits > bound)) {
      return { status: 'overflow', value: null };
    }
    // Only a lexically checked, bounded known integer is converted.
    return { status: 'int32', value: Number(node.lexeme) };
  }
  function targetOptions(target) {
    if (target == null) return { policy: null, profileId: null, guardingSpotsPerUnitType: null };
    if (!target || typeof target !== 'object' || Array.isArray(target) ||
        Object.keys(target).some(key => !['policy', 'profileId', 'guardingSpotsPerUnitType'].includes(key))) {
      throw new TypeError('Expected explicit castle target policy options');
    }
    const { policy, profileId = null, guardingSpotsPerUnitType = null } = target;
    if (!['vanilla', 'fixes-a90f96c'].includes(policy) ||
        (profileId !== null && (typeof profileId !== 'string' || !profileId.length)) ||
        (guardingSpotsPerUnitType !== null && (!Number.isInteger(guardingSpotsPerUnitType) ||
          guardingSpotsPerUnitType < 10 || guardingSpotsPerUnitType > 30)) ||
        (policy !== 'fixes-a90f96c' && guardingSpotsPerUnitType !== null)) {
      throw new TypeError('Unknown target policy or invalid 10..30 Fixes preference; no default is inferred');
    }
    return { policy, profileId, guardingSpotsPerUnitType };
  }
  function inspect(document, requestedTarget) {
    json.find(document, []);
    const selected = targetOptions(requestedTarget), root = document.root, diagnostics = [];
    let typedIssue = false, ambiguous = false, wireIssue = false, capabilityIssue = false;
    const rootNames = root.type === 'object' ? root.members.map(m => m.key.value) : [];
    const castleCandidate = rootNames.some(name => CONTRACT.root.includes(name));
    const lordCandidate = rootNames.includes('lord');
    const competing = castleCandidate && lordCandidate;
    function issue(layer, code, path, node, message, extra = {}) {
      diagnostics.push({ layer, code, path, span: (node || root).span,
        severity: ['interpretation', 'representation', 'capability'].includes(layer) ? 'error' : 'unverified', message, ...extra });
      if (layer === 'interpretation') typedIssue = true;
      if (layer === 'representation') wireIssue = true;
      if (layer === 'capability') capabilityIssue = true;
    }
    function members(node, names, path) {
      const map = new Map();
      if (node.type !== 'object') {
        issue('interpretation', 'object-required', path, node, 'Expected an object; the source entry is retained');
        return map;
      }
      for (const member of node.members) {
        const name = member.key.value;
        if (!map.has(name)) map.set(name, []);
        map.get(name).push(member);
        if (!names.includes(name)) issue('preservation', 'unknown-member', [...path, name], member.value,
          'Extension retained without interpretation or default filling');
      }
      return map;
    }
    function field(map, name, type, path, parent) {
      const occurrences = map.get(name) || [], location = [...path, name];
      const result = { path: location, status: occurrences.length === 0 ? 'missing' : occurrences.length === 1 ? 'unique' : 'ambiguous',
        occurrences: occurrences.map(m => ({ keySpan: m.key.span, valueSpan: m.value.span })), node: null, integer: null };
      if (occurrences.length !== 1) {
        ambiguous ||= occurrences.length > 1;
        issue('interpretation', occurrences.length ? 'ambiguous-member' : 'missing-member', location, parent,
          'A present unique known member is required; no occurrence or default is selected', { occurrences: result.occurrences });
        return result;
      }
      const node = result.node = occurrences[0].value;
      if (type === 'int32') {
        const numeric = int32(node); result.integerStatus = numeric.status; result.integer = numeric.value;
        if (numeric.status !== 'int32') issue('interpretation', 'int32-' + numeric.status, location, node,
          'Expected an exact decimal signed Int32 token; no coercion or exponent expansion');
      } else if (node.type !== type) issue('interpretation', type + '-required', location, node,
        'Expected ' + type + '; missing/null/other values are retained distinctly');
      return result;
    }
    function short(value, path, node, code) {
      if (value !== null && (value < -32768 || value > 32767)) issue('representation', code, path, node,
        'The pinned managed writer narrows this value to signed Int16');
    }
    function coordinate(value, path, node) {
      if (value !== null && (value < 0 || value > 9999)) issue('representation', 'coordinate-out-of-bounds', path, node,
        'Local file coordinates must be exactly 0..9999; wrapping is not an edit');
    }
    const map = members(root, CONTRACT.root, []);
    const pauseDelay = field(map, 'pauseDelayAmount', 'int32', [], root);
    const framesField = field(map, 'frames', 'array', [], root);
    const miscField = field(map, 'miscItems', 'array', [], root);
    short(pauseDelay.integer, pauseDelay.path, pauseDelay.node, 'pause-delay-narrowing');
    const frames = framesField.node?.type === 'array' ? [] : null;
    let pauseCount = 0;
    if (frames) {
      short(framesField.node.elements.length, ['frames'], framesField.node, 'frame-count-narrowing');
      framesField.node.elements.forEach((node, jsonIndex) => {
        const path = ['frames', jsonIndex], known = members(node, CONTRACT.frame, path);
        const itemType = field(known, 'itemType', 'int32', path, node);
        const offsets = field(known, 'tilePositionOfsets', 'array', path, node);
        const shouldPause = field(known, 'shouldPause', 'boolean', path, node);
        const offsetTokens = offsets.node?.type === 'array' ? offsets.node.elements.map((token, i) => {
          const numeric = int32(token), offsetPath = [...offsets.path, i];
          if (numeric.status !== 'int32') issue('interpretation', 'int32-' + numeric.status, offsetPath, token,
            'Expected a decimal Int32 coordinate; the raw token is retained');
          coordinate(numeric.value, offsetPath, token);
          return { node: token, path: offsetPath, integer: numeric.value, integerStatus: numeric.status };
        }) : null;
        if (itemType.integer !== null) {
          if (itemType.integer < 0) issue('representation', 'negative-frame-id', itemType.path, itemType.node,
            'A negative JSON ID changes the native single/counted branch');
          short(itemType.integer, itemType.path, itemType.node, 'frame-id-narrowing');
          if (itemType.integer !== 0) issue('semantics', 'footprint-unverified', itemType.path, itemType.node,
            'Mapper semantics, footprint and special blocked areas need the later catalogue/fit owner');
        }
        if (offsetTokens) {
          short(offsetTokens.length, offsets.path, offsets.node, 'offset-count-narrowing');
          if (itemType.integer === 0 && offsetTokens.length !== 1) issue('representation',
            offsetTokens.length ? 'zero-counted-ambiguous' : 'zero-empty-clear', path, node,
            offsetTokens.length ? 'Negative zero cannot encode a counted clear' : 'Zero plus [] writes a clear at file offset 0 (native index 9900)');
          if (itemType.integer > 0 && !offsetTokens.length) issue('semantics', 'empty-step-timing-unverified', path, node,
            'The positive empty step is retained, including its pause; construction timing is unverified');
        }
        const pauseWireIndex = jsonIndex + 2;
        if (shouldPause.node?.type === 'boolean' && shouldPause.node.value) {
          pauseCount++;
          if (pauseCount > 49) issue('representation', 'pause-limit-loss', shouldPause.path, shouldPause.node,
            'Only the first 49 true flags are emitted, plus sentinel 0');
          else short(pauseWireIndex, shouldPause.path, shouldPause.node, 'pause-index-narrowing');
        }
        frames.push({ node, jsonIndex, buildIndex: jsonIndex + 1, pauseWireIndex, itemType, offsets, offsetTokens, shouldPause });
      });
    }
    const misc = miscField.node?.type === 'array' ? [] : null;
    const vanillaAddresses = new Map(), effectiveSlots = new Map();
    if (misc) {
      short(miscField.node.elements.length, ['miscItems'], miscField.node, 'misc-count-narrowing');
      miscField.node.elements.forEach((node, jsonIndex) => {
        const path = ['miscItems', jsonIndex], known = members(node, CONTRACT.misc, path);
        const position = field(known, 'positionOfset', 'int32', path, node);
        const itemType = field(known, 'itemType', 'int32', path, node);
        const number = field(known, 'number', 'int32', path, node);
        coordinate(position.integer, position.path, position.node);
        short(number.integer, number.path, number.node, 'marker-slot-narrowing');
        const effectiveClass = itemType.integer === null ? null : itemType.integer > 9000 ? itemType.integer - 9000 : itemType.integer;
        short(effectiveClass, itemType.path, itemType.node, 'marker-class-narrowing');
        // Address arithmetic describes the non-narrowed wire only. An overflow
        // diagnostic must not present a pre-narrowing value as a native address.
        const vanillaAddress = effectiveClass === null || number.integer === null ||
          effectiveClass < -32768 || effectiveClass > 32767 || number.integer < -32768 || number.integer > 32767 ?
          null : effectiveClass * 10 + number.integer;
        if (vanillaAddress !== null) {
          const slot = effectiveClass + ':' + number.integer;
          if (effectiveSlots.has(slot)) issue('semantics', 'marker-effective-slot-collision', path, node,
            'Ordered entries share the same effective class and slot; no entry is removed', { previousIndex: effectiveSlots.get(slot) });
          if (vanillaAddresses.has(vanillaAddress)) issue('semantics', 'vanilla-address-collision', path, node,
            'class*10+number aliases an earlier entry; all entries remain ordered', { previousIndex: vanillaAddresses.get(vanillaAddress), vanillaAddress });
          effectiveSlots.set(slot, jsonIndex); vanillaAddresses.set(vanillaAddress, jsonIndex);
        }
        if (selected.policy) {
          if (effectiveClass !== null && (effectiveClass < 0 || effectiveClass > 31)) issue('capability', 'marker-class-unverified', itemType.path, itemType.node,
            'Buffer arithmetic does not establish assignment for this class');
          if (number.integer !== null && number.integer < 0) issue('capability', 'negative-marker-slot', number.path, number.node, 'Negative slots are not a supported target');
          if (selected.policy === 'vanilla' && number.integer >= 10) issue('capability', 'vanilla-slot-alias', number.path, number.node,
            'Slot 10 or higher aliases another vanilla class; it is not an independent guarding spot');
          if (selected.policy === 'fixes-a90f96c') {
            const expanded = CONTRACT.fixesAssignmentClasses.includes(effectiveClass);
            if (number.integer >= 30) issue('capability', 'fixes-slot-limit', number.path, number.node, 'The pinned extended store requires slot <30');
            if (effectiveClass === 29) issue(number.integer >= 10 ? 'capability' : 'semantics', 'fixes-class29-vanilla-fallback', itemType.path, itemType.node,
              'Class29 fails IsSupportedClass at this pin and takes original get/create and movement hooks; vanilla runtime assignment is unverified');
            else if (number.integer >= 10 && !expanded) issue('capability', 'fixes-assignment-class-unsupported', itemType.path, itemType.node,
              'This pin takes original get/create and movement hooks for this class; expanded assignment is unsupported');
            if (number.integer !== null && selected.guardingSpotsPerUnitType !== null && number.integer >= selected.guardingSpotsPerUnitType) {
              issue('capability', 'fixes-capacity-exceeded', number.path, number.node, 'Slot exceeds the explicitly supplied per-lord capacity');
            }
          }
        }
        misc.push({ node, jsonIndex, itemType, position, number, effectiveClass, vanillaAddress });
      });
    }
    diagnostics.push(...document.diagnostics.map(d => ({ ...d, layer: 'preservation' })));
    if (competing) issue('interpretation', 'competing-document-formats', [], root,
      'LORD and castle signatures coexist; the castle commands require an explicit unambiguous document');
    if (!castleCandidate) issue('interpretation', lordCandidate ? 'lordjson-candidate' : 'not-castle', [], root,
      'Content is not identified as an ordered DE castle program; hints/extensions do not select a codec');
    if (selected.policy === 'fixes-a90f96c' && selected.guardingSpotsPerUnitType === null) {
      issue('semantics', 'fixes-preference-required', [], root,
        'GuardingSpotsPerUnitType lives in Override/Fixes/preferences.json; loader/game/config identities require separate verification');
    }
    const kind = competing ? 'ambiguous-document' : castleCandidate ? (ambiguous ? 'ambiguous-aivjson' : 'de-aivjson') : lordCandidate ? 'lordjson-candidate' : 'generic-json';
    return freeze({
      syntax: { status: 'preserved-json', spanUnit: json.SPAN_UNIT, byteLength: document.byteLength },
      interpretation: { kind, status: competing || ambiguous ? 'ambiguous' : !castleCandidate ? 'not-castle' : typedIssue ? 'invalid-shape' : 'interpretable' },
      program: { root, pauseDelay, framesField, miscField, frames, misc, pauseCount },
      target: { contractId: CONTRACT.id, ...selected, typedShape: typedIssue ? 'not-certified' : 'complete-int32-shape',
        representability: typedIssue || wireIssue ? 'blocked' : 'representable', capabilityStatus: selected.policy ? capabilityIssue ? 'blocked' : 'unverified' : 'not-assessed',
        semanticStatus: 'unverified', runtimeAcceptance: 'unverified' },
      diagnostics,
    });
  }
  function classifyDocument(document, target) {
    const assessment = inspect(document, target);
    return Object.freeze({ kind: assessment.interpretation.kind, document, assessment });
  }
  function classify(input, options) {
    let document;
    try { document = json.parse(input, options); }
    catch (error) {
      if (!(error instanceof json.DocumentError)) throw error;
      return Object.freeze({ kind: 'unparsed', error });
    }
    return classifyDocument(document);
  }
  function planCommand(document, command) {
    json.find(document, []);
    if (!command || typeof command !== 'object') fail('invalid-command', 'Expected an explicit existing-scalar command');
    const root = document.root;
    if (root.type !== 'object' || root.members.some(m => m.key.value === 'lord') ||
        !root.members.some(m => CONTRACT.root.includes(m.key.value))) {
      fail('unsupported-interpretation', 'Castle commands require castle content without a competing LORD signature');
    }
    function index(value) {
      if (!Number.isSafeInteger(value) || value < 0) fail('invalid-index', 'Expected an explicit nonnegative array index');
      return value;
    }
    function scalar(path, value, coordinate = false, boolean = false) {
      const node = json.find(document, path);
      if (boolean ? node.type !== 'boolean' : int32(node).status !== 'int32') fail('unsupported-scalar', 'The present member must have its pinned scalar type');
      if (boolean ? typeof value !== 'boolean' : !Number.isInteger(value) || value < -2147483648 || value > 2147483647) {
        fail('invalid-value', 'Expected a Boolean or exact signed Int32 command value');
      }
      if (coordinate && (value < 0 || value > 9999)) fail('coordinate-out-of-bounds', 'Local coordinates must be exactly 0..9999');
      return Object.freeze({ handle: json.handle(document, path), value });
    }
    let edits;
    switch (command.type) {
      case 'set-pause-delay': edits = [scalar(['pauseDelayAmount'], command.value)]; break;
      case 'set-frame-pause': edits = [scalar(['frames', index(command.frameIndex), 'shouldPause'], command.value, false, true)]; break;
      case 'set-offset': edits = [scalar(['frames', index(command.frameIndex), 'tilePositionOfsets', index(command.offsetIndex)], command.value, true)]; break;
      case 'set-offsets':
        if (!Array.isArray(command.edits)) fail('invalid-command', 'Expected an explicit offset batch');
        edits = command.edits.map(edit => {
          if (!edit || typeof edit !== 'object') fail('invalid-command', 'Expected an offset selection');
          return scalar(['frames', index(edit.frameIndex), 'tilePositionOfsets', index(edit.offsetIndex)], edit.value, true);
        });
        break;
      case 'set-marker-position': edits = [scalar(['miscItems', index(command.miscIndex), 'positionOfset'], command.value, true)]; break;
      case 'set-marker-slot': edits = [scalar(['miscItems', index(command.miscIndex), 'number'], command.value)]; break;
      case 'set-item-id':
        if (!['frame', 'misc'].includes(command.scope)) fail('invalid-command', 'Select frame or misc explicitly');
        edits = [scalar([command.scope === 'frame' ? 'frames' : 'miscItems', index(command.index), 'itemType'], command.value)]; break;
      default: fail('unsupported-command', 'Only present-member scalar commands are implemented; structural edits belong to D2B');
    }
    return Object.freeze(edits);
  }
  return Object.freeze({ CONTRACT, CastleError, inspect, classify, classifyDocument, planCommand });
});
