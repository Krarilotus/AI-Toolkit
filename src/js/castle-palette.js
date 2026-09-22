(function (root, factory) {
  const palette = factory();
  if (typeof module === 'object' && module.exports) module.exports = palette;
  else root.castlePalette = palette;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  // The original village palette: stone, pale yellow food, cyan military /
  // weapons, white industry, yellow town, red bad things and lavender good
  // things. RGB values follow the bundled item artwork (see asset notes).
  const colors = {
    'Bad Things': '#f88080', Castle: '#a0a0a0', Food: '#f8f8c0',
    Gatehouses: '#808080', 'Good Things': '#c0c0f8', Industry: '#e0e0e0',
    Military: '#88b0b8', 'Walls, Moat & Pitch': '#505050', Stairs: '#505050',
    Town: '#f8f840', Arabians: '#a0a0a0', Europeans: '#a0a0a0', Bedouins: '#b4d7a0', Misk: '#a0a0a0'
  };
  function categoryStyle(category) {
    const background = colors[category] || '#505050';
    return { background, foreground: ['#505050', '#087080'].includes(background) ? '#ffffff' : '#151515' };
  }
  const localizedNames = new WeakMap();
  function itemName(constants, type) {
    const name = constants?.[String(type)]?.name;
    const i18n = globalThis.toolkitI18n || (typeof require === 'function' ? require('./i18n') : null);
    const fallback = typeof name === 'string' && name.trim() ? name.trim() : i18n?.t('feedback:item', {id:type}) || `Item ${type}`;
    if (!i18n || !constants || typeof constants !== 'object' || i18n.engine.getResource('en', 'items', String(type)) !== name) return fallback;
    let cached = localizedNames.get(constants);
    if (!cached || cached.locale !== i18n.locale) { cached = { locale: i18n.locale, names: new Map() }; localizedNames.set(constants, cached); }
    if (!cached.names.has(type)) cached.names.set(type, i18n.t(`items:${type}`, { defaultValue: fallback }));
    return cached.names.get(type);
  }
  return { colors, categoryStyle, itemName };
});
