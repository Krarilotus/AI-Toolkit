(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./document-session'), require('../js/de-castle-format'));
  } else root.deCastleSession = factory(root.documentSession, root.deCastleFormat);
})(typeof globalThis !== 'undefined' ? globalThis : this, (engine, castle) => {
  'use strict';

  if (!engine || !castle) throw new Error('documentSession and deCastleFormat must be loaded before deCastleSession');
  function createSession(raw, ownerId, { historyLimits, target = null } = {}) {
    // Capture caller options once. Target policy is not authenticated game or
    // loader identity, and never gates preservation Save As.
    const selected = target === null ? null : Object.freeze({ ...target });
    const session = engine.createSession(raw, ownerId, document => castle.classifyDocument(document, selected), { historyLimits });
    function applyCommand(expectedRevision, command) {
      const state = session.read();
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== state.revision) {
        throw new engine.SessionError('stale-revision', 'Expected the current session revision');
      }
      return session.replaceScalars(expectedRevision, castle.planCommand(state.document, command));
    }
    return Object.freeze({ ...session, applyCommand });
  }
  return Object.freeze({ createSession, SessionError: engine.SessionError, DEFAULT_HISTORY_LIMITS: engine.DEFAULT_HISTORY_LIMITS });
});
