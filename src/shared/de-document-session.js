(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../js/de-lord-format'), root.crypto && root.crypto.subtle);
  } else root.deDocumentSession = factory(root.deLordFormat, root.crypto && root.crypto.subtle);
})(typeof globalThis !== 'undefined' ? globalThis : this, (lord, subtle) => {
  'use strict';

  if (!lord || !lord.classify) throw new Error('deLordFormat with its generated pin must be loaded before deDocumentSession');
  class SessionError extends Error {
    constructor(code, message) { super(message); this.name = 'SessionError'; this.code = code; }
  }
  const fail = (code, message) => { throw new SessionError(code, message); };
  function identity(value, label) {
    if (typeof value !== 'string' || !value.length) throw new TypeError(`${label} must be a nonempty opaque string`);
    return value;
  }
  const equalBytes = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
  const DEFAULT_HISTORY_LIMITS = Object.freeze({ maxEntries: 32, maxBytes: 16 * 1024 * 1024 });
  function historyLimitsFor(overrides = {}) {
    const limits = { ...DEFAULT_HISTORY_LIMITS, ...overrides };
    for (const key of Object.keys(limits)) {
      if (!Object.hasOwn(DEFAULT_HISTORY_LIMITS, key) || !Number.isSafeInteger(limits[key]) ||
          limits[key] < (key === 'maxEntries' ? 1 : 0) || limits[key] > DEFAULT_HISTORY_LIMITS[key]) {
        throw new TypeError('historyLimits must tighten the finite maxEntries/maxBytes defaults');
      }
    }
    return Object.freeze(limits);
  }

  // ownerId is supplied by the authenticated host/core. It is not a root,
  // edition selector or authority token verified by this module.
  function createSession(raw, ownerId, { historyLimits: overrides } = {}) {
    const historyLimits = historyLimitsFor(overrides);
    ownerId = identity(ownerId, 'ownerId');
    const documentId = identity(raw.documentId, 'documentId');
    const sourcePath = identity(raw.path, 'path');
    const formatHint = raw.formatHint;
    if (formatHint !== null && typeof formatHint !== 'string') throw new TypeError('formatHint must be a string or null');
    const classification = lord.classify(raw.bytes);
    if (classification.kind === 'unparsed') throw classification.error;
    const original = classification.document, kind = classification.kind;
    let document = original, assessment = classification.assessment;
    let revision = 0, savedRevision = 0, savedDocument = original, savedBytes = original.serialize();
    let path = sourcePath, dirty = false, history = [original], position = 0;
    let historyBytes = original.byteLength;
    let saveSequence = 0, pending = null, lastSave = null;

    function checkRevision(expected) {
      if (!Number.isSafeInteger(expected) || expected !== revision) fail('stale-revision', 'Expected the current session revision');
    }
    function nextRevision() {
      if (revision === Number.MAX_SAFE_INTEGER) fail('revision-exhausted', 'Session revision limit reached');
      return revision + 1;
    }
    function read() {
      return Object.freeze({
        // D1 recognition stays stable: scalar edits cannot change container/key structure.
        documentId, ownerId, sourcePath, path, formatHint, kind,
        originalDocument: original, document, savedDocument, assessment, diagnostics: assessment.diagnostics,
        revision, savedRevision, dirty, canUndo: position > 0, canRedo: position < history.length - 1,
        history: Object.freeze({ limits: historyLimits, entries: history.length, byteLength: historyBytes }),
        save: pending ? Object.freeze({ status: pending.status, snapshot: pending.snapshot }) : null,
        lastSave,
      });
    }
    function publish(next, nextPosition, nextHistory) {
      const newRevision = nextRevision(), nextAssessment = lord.inspect(next);
      const nextDirty = !equalBytes(next.serialize(), savedBytes);
      document = next; assessment = nextAssessment; revision = newRevision; dirty = nextDirty;
      position = nextPosition; history = nextHistory;
      historyBytes = history.reduce((sum, item) => sum + item.byteLength, 0);
      return read();
    }
    function replaceScalar(expectedRevision, targetPath, value) {
      checkRevision(expectedRevision);
      const next = lord.patch(document, [{ path: targetPath, value }]);
      if (next === document) return read();
      // A new edit releases redo, then evicts oldest undo entries. Source-byte
      // cost is not a JS heap measurement; D1 also bounds each document's tree.
      // Always keep current, even when it alone exceeds a caller's tighter cap.
      const retained = [...history.slice(0, position + 1), next];
      let cost = retained.reduce((sum, item) => sum + item.byteLength, 0);
      while (retained.length > 1 && (retained.length > historyLimits.maxEntries || cost > historyLimits.maxBytes)) {
        cost -= retained.shift().byteLength;
      }
      return publish(next, retained.length - 1, retained);
    }
    function undo(expectedRevision) {
      checkRevision(expectedRevision);
      return position ? publish(history[position - 1], position - 1, history) : read();
    }
    function redo(expectedRevision) {
      checkRevision(expectedRevision);
      return position < history.length - 1 ? publish(history[position + 1], position + 1, history) : read();
    }
    async function snapshotForSave(expectedRevision, destination) {
      checkRevision(expectedRevision);
      destination = identity(destination, 'destination');
      if (pending) fail('save-in-flight', 'Resolve the pending save before creating another snapshot');
      if (!subtle) fail('crypto-unavailable', 'Saving requires platform WebCrypto SHA-256');
      if (saveSequence === Number.MAX_SAFE_INTEGER) fail('save-sequence-exhausted', 'Save sequence limit reached');
      const bytes = document.serialize();
      // Reserve before the asynchronous digest. Edits may continue while it runs.
      const entry = { status: 'preparing', snapshot: null, document, bytes };
      const submittedRevision = revision, saveId = ++saveSequence;
      pending = entry;
      try {
        const digest = new Uint8Array(await subtle.digest('SHA-256', bytes.slice()));
        const sha256 = Array.from(digest, value => value.toString(16).padStart(2, '0')).join('');
        entry.snapshot = Object.freeze({
          saveId, documentId, ownerId, revision: submittedRevision, destination, sha256, byteLength: bytes.length,
          // Never expose the retained TypedArray: freezing it would not protect its bytes.
          serialize: () => bytes.slice(),
        });
        entry.status = 'pending';
        return entry.snapshot;
      } catch (error) {
        pending = null; // No write was submitted by this domain module.
        throw error;
      }
    }
    function acknowledgeSave(snapshot, receipt) {
      if (!pending || !snapshot || pending.snapshot !== snapshot) fail('foreign-snapshot', 'Expected this session\'s pending snapshot');
      const keys = ['saveId', 'documentId', 'ownerId', 'revision', 'destination', 'sha256', 'byteLength'];
      const status = receipt && receipt.status;
      if (!receipt || keys.some(key => receipt[key] !== snapshot[key]) ||
          !['committed', 'failed', 'cancelled', 'unknown'].includes(status)) {
        fail('receipt-mismatch', 'Receipt must identify the exact submitted snapshot and outcome');
      }
      if (status === 'committed') {
        // Compute before publication; an older accepted save never discards current edits.
        const nextDirty = !equalBytes(document.serialize(), pending.bytes);
        savedDocument = pending.document; savedBytes = pending.bytes; savedRevision = snapshot.revision;
        path = snapshot.destination; dirty = nextDirty;
      }
      lastSave = Object.freeze({ status, snapshot });
      if (status === 'unknown') pending.status = 'unknown';
      else pending = null;
      return read();
    }
    return Object.freeze({ read, replaceScalar, undo, redo, snapshotForSave, acknowledgeSave });
  }
  return Object.freeze({ createSession, SessionError, DEFAULT_HISTORY_LIMITS });
});
