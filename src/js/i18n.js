(function (root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(root, node ? require('i18next').createInstance() : root.i18next.createInstance(),
    node ? { registry: require('../locales/registry.json'), resources: require('../locales/en.json') } : root.toolkitLocaleBootstrap);
  root.toolkitI18n = api;
  if (node) module.exports = api;
})(typeof globalThis === 'undefined' ? this : globalThis, (root, engine, bootstrap) => {
  'use strict';
  const { registry, resources } = bootstrap;
  let preference = 'system', generation = 0;
  const loaded = new Set(['en']);
  const listeners = new Set();
  const documents = new Set();
  const ownedText = new Map();
  const textCache = new Map();
  const numberFormats = new Map();
  engine.init({ lng: 'en', fallbackLng: 'en', supportedLngs: registry.languages.map(item => item.id),
    resources: { en: resources }, defaultNS: 'common', ns: Object.keys(resources), nsSeparator: ':', keySeparator: '.',
    initImmediate: false, initAsync: false, interpolation: { escapeValue: false }, returnNull: false });
  /** @param {import('./i18n-keys').TranslationKey} key @param {Record<string, unknown>} [options] */
  function t(key, options) {
    if (options) return engine.t(key, options);
    if (!textCache.has(key)) textCache.set(key, engine.t(key));
    return textCache.get(key);
  }
  function resolveLanguage(value, system = root.navigator?.language || 'en') {
    const requested = value === 'system' ? system : value;
    const normalized = String(requested || 'en').toLowerCase();
    return registry.languages.find(item => [item.id, ...(item.aliases || [])].some(alias => alias.toLowerCase() === normalized))?.id
      || registry.languages.find(item => [item.id, ...(item.aliases || [])].some(alias => alias.toLowerCase() === normalized.split('-')[0]))?.id || 'en';
  }
  /** Dynamic content belongs to its editor, never to an initial HTML fallback. */
  function bindText(element, value) {
    if (!element) return;
    if (element.dataset) delete element.dataset.i18n;
    if (typeof value === 'function') ownedText.set(element, value);
    else ownedText.delete(element);
    element.textContent = typeof value === 'function' ? value() : value;
  }
  function applyBindings(container = root.document) {
    if (!container?.querySelectorAll) return;
    const nodes = [...(container.matches?.('[data-i18n], [data-i18n-attrs]') ? [container] : []), ...container.querySelectorAll('[data-i18n], [data-i18n-attrs]')];
    for (const element of nodes) {
      if (element.dataset.i18n) element.textContent = t(element.dataset.i18n);
      for (const binding of (element.dataset.i18nAttrs || '').split(';').filter(Boolean)) {
        const colon = binding.indexOf('=');
        if (colon !== -1) element.setAttribute(binding.slice(0, colon), t(binding.slice(colon + 1)));
      }
    }
  }
  function updateDocument(document, locale) {
    if (!document) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = registry.languages.find(item => item.id === locale)?.dir || 'ltr';
    applyBindings(document);
  }
  async function changeLanguage(value, { persist = true } = {}) {
    const revision = ++generation, locale = resolveLanguage(value);
    if (!loaded.has(locale)) {
      const response = await fetch(new URL(`../locales/${locale}.json`, scriptUrl));
      if (!response.ok) throw new Error(`Could not load interface language ${locale}: ${response.status}`);
      const namespaces = await response.json();
      for (const [namespace, values] of Object.entries(namespaces)) engine.addResourceBundle(locale, namespace, values, true, true);
      loaded.add(locale);
    }
    if (revision !== generation) return;
    await engine.changeLanguage(locale);
    if (revision !== generation) return;
    textCache.clear();
    numberFormats.clear();
    preference = value;
    updateDocument(root.document, locale);
    for (const win of documents) {
      if (win.closed) { documents.delete(win); continue; }
      updateDocument(win.document, locale);
    }
    for (const [element, render] of ownedText) {
      if (element.isConnected === false) { ownedText.delete(element); continue; }
      element.textContent = render();
    }
    for (const listener of listeners) listener(locale);
    root.dispatchEvent?.(new CustomEvent('toolkit-language-changed', { detail: { language: preference, locale } }));
    if (persist) await root.electronAPI?.setLanguage?.(value);
  }
  const scriptUrl = root.document?.currentScript?.src || 'http://localhost/src/js/i18n.js';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
  function number(value, options) {
    const key = options ? JSON.stringify(options) : '';
    if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat(engine.resolvedLanguage || 'en', options));
    return numberFormats.get(key).format(value);
  }
  function attachWindow(win) {
    documents.add(win);
    updateDocument(win.document, api.locale);
    const detach = () => documents.delete(win);
    win.addEventListener('unload', detach, { once: true });
    return detach;
  }
  const api = { t, html: (key, options) => escapeHtml(t(key, options)), resolveLanguage, applyBindings, changeLanguage,
    attachWindow, bindText,
    get locale() { return engine.resolvedLanguage || 'en'; },
    get language() { return engine.resolvedLanguage || 'en'; },
    get preference() { return preference; },
    languages: registry.languages, number,
    onChange(listener) { listeners.add(listener); return () => listeners.delete(listener); }, engine };
  api.ready = (async () => {
    if (!root.document) return;
    if (root.document.readyState === 'loading') await new Promise(resolve => root.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    const settings = await root.electronAPI?.getInterfaceSettings?.();
    await changeLanguage(settings?.language || 'system', { persist: false });
    root.electronAPI?.onLanguageChanged?.(settings => changeLanguage(typeof settings === 'string' ? settings : settings.language, { persist: false }));
  })();
  return api;
});
