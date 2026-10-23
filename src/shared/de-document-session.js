(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./document-session'), require('../js/de-lord-format'));
  } else root.deDocumentSession = factory(root.documentSession, root.deLordFormat);
})(typeof globalThis !== 'undefined' ? globalThis : this, (engine, lord) => {
  'use strict';

  if (!engine || !lord || !lord.classifyDocument) {
    throw new Error('documentSession and deLordFormat with its generated pin must be loaded before deDocumentSession');
  }
  // Compatibility factory; bytes, revision/history and save state live only in engine.
  const createSession = (raw, ownerId, options) => engine.createSession(raw, ownerId, lord.classifyDocument, options);
  return Object.freeze({ createSession, SessionError: engine.SessionError, DEFAULT_HISTORY_LIMITS: engine.DEFAULT_HISTORY_LIMITS });
});
