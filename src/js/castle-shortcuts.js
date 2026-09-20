(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.castleShortcuts = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  // Order follows the toolbar, then its submenus and additional editing actions.
  const actions = [
    ['openCastle', 'Open castle', 'ctrl+o', 'castleOpenBtn'],
    ['saveCastle', 'Save castle', 'ctrl+s', 'castleSaveBtn'],
    ['newCastle', 'New castle', 'ctrl+n', 'castleNewBtn'],
    ['map', 'Map', 'alt+m', 'castleMapBtn'], ['iso', '2.5D view', 'alt+i', 'castleIsoBtn'],
    ['single', 'Single', '1'], ['line', 'Line', '6'], ['brush', 'Brush', '2'],
    ['brushSmaller', 'Smaller brush', '[', 'castleBrushMinus'],
    ['brushLarger', 'Larger brush', ']', 'castleBrushPlus'],
    ['bucket', 'Fill', '7'], ['select', 'Select / Move', '3'],
    ['replace', 'Replace', '8'], ['merge', 'Merge', 'm'], ['delete', 'Delete', '4'],
    ['overlays', 'Overlays menu', 'o'], ['groups', 'Groups', 'g'],
    ['paste', 'Clipboard / Paste', 'ctrl+v'], ['clearClipboard', 'Clear clipboard', 'ctrl+shift+delete', 'castleClipboardClearBtn'],
    ['names', 'Item names', 'n', 'castleShowNames'], ['units', 'Unit Order', 'u', 'castleShowUnitNumbers'],
    ['guides', 'Guide lines', 'h', 'castleShowCompatibility'], ['paths', 'Path map', 'p', 'castleShowRoutes'],
    ['fire', 'Firespread', 'f', 'castleShowFire'],
    ['ground', '2.5D: Ground', 'b', 'castleIsoGroundBtn'], ['tiled', '2.5D: Tiled', 't', 'castleIsoGroundFit'],
    ['resetGround', '2.5D: Reset ground', 'shift+b', 'castleIsoGroundReset'],
    ['gameMap', '2.5D: Game map', 'ctrl+m', 'castleIsoMapBtn'], ['resetMap', '2.5D: Remove game map', 'ctrl+shift+m', 'castleIsoMapReset'],
    ['rotateLeft', '2.5D: Rotate left', 'c'], ['rotateRight', '2.5D: Rotate right', 'x'],
    ['saveAs', 'Save As', 'ctrl+shift+s'], ['undo', 'Undo', 'ctrl+z'], ['redo', 'Redo', 'ctrl+y'],
    ['copy', 'Copy selection', 'ctrl+c'], ['cut', 'Cut selection', 'ctrl+x'],
    ['exportDe', 'Export DE', 'ctrl+shift+e', 'castleExportDeBtn'],
    ['pause', 'Pause step', '0', 'castlePauseBtn'],
    ['deleteSelected', 'Delete selected', 'delete'], ['deselect', 'Deselect', 'escape']
  ];
  const defaults = Object.fromEntries(actions.map(([id, , key]) => [id, [key]]));
  const reserved = new Set(['ctrl+1', 'ctrl+2', 'ctrl+3', 'ctrl+4', 'ctrl+shift+n', 'ctrl+shift+o',
    'ctrl+r', 'ctrl+shift+r', 'ctrl+shift+i', 'ctrl+0', 'ctrl+-', 'ctrl+=', 'ctrl+plus',
    'alt+f', 'alt+e', 'alt+v', 'alt+f4', 'f10', 'f11']);
  function normalize(value) {
    const parts = String(value || '').trim().toLowerCase().replace(/commandorcontrol|cmdorctrl|control|meta|cmd/g, 'ctrl').split('+');
    const key = parts.pop();
    if (!/^(?:[a-z0-9\[\],.\/;='`\\-]|f(?:[1-9]|1[0-2])|arrow(?:left|right|up|down)|delete|backspace|escape|enter|space|tab|plus)$/.test(key)) return '';
    if (parts.some(part => !['ctrl', 'alt', 'shift'].includes(part)) || new Set(parts).size !== parts.length) return '';
    return [...['ctrl', 'alt', 'shift'].filter(part => parts.includes(part)), key].join('+');
  }
  function fromEvent(event) {
    let key = String(event.key || '').toLowerCase();
    if (key === ' ') key = 'space';
    if (key === '+') key = 'plus';
    return normalize([...(event.ctrlKey || event.metaKey || event.control || event.meta ? ['ctrl'] : []),
      ...(event.altKey || event.alt ? ['alt'] : []), ...(event.shiftKey || event.shift ? ['shift'] : []), key].join('+'));
  }
  function validate(candidate) {
    const result = {}, used = new Set();
    for (const [id, label] of actions) {
      if (Object.hasOwn(candidate || {}, id) && !Array.isArray(candidate[id])) throw new Error(`Invalid shortcut for ${label}.`);
      const value = Object.hasOwn(candidate || {}, id) ? candidate[id]?.[0] : defaults[id][0];
      const key = normalize(value);
      if (value && !key) throw new Error(`Invalid shortcut for ${label}.`);
      if (key && reserved.has(key)) throw new Error(`${key.toUpperCase()} is reserved for application menus.`);
      if (key && used.has(key)) throw new Error(`${key.toUpperCase()} is assigned more than once.`);
      if (key) used.add(key);
      result[id] = [key];
    }
    return result;
  }
  function migrate(old) {
    const result = JSON.parse(JSON.stringify(defaults));
    const used = new Set(Object.values(result).flat().filter(Boolean));
    // Native File/Edit shortcuts take priority over old tool aliases.
    for (const id of ['single', 'line', 'brush', 'bucket', 'select', 'replace', 'merge', 'delete']) {
      const key = normalize(old?.[id]?.[0]);
      const previous = result[id][0];
      used.delete(previous);
      if (key && !reserved.has(key) && !used.has(key)) result[id] = [key];
      if (result[id][0]) used.add(result[id][0]);
    }
    return validate(result);
  }
  // Add formerly unassigned defaults without taking a user's existing key.
  function upgrade(saved, cameraKeys = []) {
    const result = Object.fromEntries(actions.map(([id]) => [id, saved?.[id] || ['']]));
    const checked = validate(result);
    const used = new Set([...Object.values(checked).flat(), ...cameraKeys].filter(Boolean));
    for (const [id] of actions) {
      const key = defaults[id][0];
      if (!checked[id][0] && key && !used.has(key)) { checked[id] = [key]; used.add(key); }
    }
    return checked;
  }
  function actionFor(event, bindings) {
    const key = typeof event === 'string' ? normalize(event) : fromEvent(event);
    return key ? actions.find(([id]) => bindings[id]?.[0] === key)?.[0] || null : null;
  }
  function accelerator(key) { return key ? key.split('+').map(part => part === 'ctrl' ? 'CmdOrCtrl' : part === 'space' ? 'Space' : part === 'plus' ? 'Plus' : part.toUpperCase()).join('+') : undefined; }
  return { actions, defaults, normalize, fromEvent, validate, migrate, upgrade, actionFor, accelerator, isReserved: key => reserved.has(key) };
});
