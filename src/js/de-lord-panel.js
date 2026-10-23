(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../shared/lossless-json'), require('../shared/generated/de-lord-pin'));
  } else root.deLordPanel = factory(root.losslessJson, root.deLordPin);
})(typeof globalThis !== 'undefined' ? globalThis : this, (json, pin) => {
  'use strict';

  const mounts = new WeakMap();
  let sequence = 0;

  /** Mount only in a DE-owned container. Controller callbacks own dialogs,
   * session adoption, snapshots, authenticated writes and real receipts.
   * They receive {session}; return values are deliberately not interpreted.
   * Call refresh() after intermediate save transitions, setSession() after open.
   * t(key, {defaultValue}) can be the existing toolkitI18n.t adapter.
   */
  function mount(container, { session = null, controller = {}, t = (_key, options) => options.defaultValue } = {}) {
    if (!json || !pin) throw new Error('Load losslessJson and the generated deLordPin before deLordPanel');
    mounts.get(container)?.dispose();
    const doc = container.ownerDocument, listeners = [], bindings = [], diagnosticRows = [];
    let disposed = false, generation = 0, busy = null, state = null;
    let choices = new Map(), choiceSignature = '', renderedDocument = null, renderedAssessment = null;
    let renderedLexeme = '', editorRevision = 0, draft = null;
    let messageKey = null, messageDetail = '', messageInvalidInput = false;
    const tr = (key, fallback) => t(`deLordPanel.${key}`, { defaultValue: fallback });
    function element(tag, className, parent, text) {
      const node = doc.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      if (parent) parent.append(node);
      return node;
    }
    function bind(node, key, fallback) {
      bindings.push({ node, key, fallback });
      node.textContent = tr(key, fallback);
      return node;
    }
    function listen(node, event, handler) {
      node.addEventListener(event, handler);
      listeners.push(() => node.removeEventListener(event, handler));
    }
    function button(parent, key, label, handler) {
      const node = bind(element('button', '', parent), key, label);
      node.type = 'button';
      listen(node, 'click', handler);
      return node;
    }
    function text(node, value) { if (node.textContent !== value) node.textContent = value; }
    const panel = element('section', 'deLordPanel', container);
    const heading = bind(element('h2', '', panel), 'title', 'DE LORDJSON');
    heading.id = `deLordPanel-${++sequence}`;
    panel.setAttribute('aria-labelledby', heading.id);
    const toolbar = element('div', 'deLordPanel__toolbar', panel);
    const open = button(toolbar, 'open', 'Open…', () => invoke('open'));
    const save = button(toolbar, 'save', 'Save', () => invoke('save'));
    const saveAs = button(toolbar, 'saveAs', 'Save As…', () => invoke('saveAs'));
    const check = button(toolbar, 'reconcile', 'Check save result', () => invoke('reconcile'));
    const source = element('div', 'deLordPanel__source', panel);
    bind(element('span', 'deLordPanel__eyebrow', source), 'file', 'File');
    const path = element('bdi', 'deLordPanel__path', source);
    const status = element('p', 'deLordPanel__status', panel);
    status.setAttribute('role', 'status');
    const form = element('form', 'deLordPanel__edit', panel);
    const fieldLabel = element('label', 'deLordPanel__field', form);
    bind(element('span', '', fieldLabel), 'field', 'Existing numeric field');
    const select = element('select', '', fieldLabel);
    const tokenLabel = element('div', 'deLordPanel__token', form);
    bind(element('span', 'deLordPanel__eyebrow', tokenLabel), 'currentToken', 'Exact current token');
    const token = element('code', '', tokenLabel);
    token.dir = 'ltr';
    const inputLabel = element('label', 'deLordPanel__field', form);
    bind(element('span', '', inputLabel), 'replacement', 'Replacement number token');
    const input = element('input', '', inputLabel);
    input.type = 'text'; input.dir = 'ltr'; input.autocomplete = 'off'; input.spellcheck = false;
    const help = bind(element('p', 'deLordPanel__hint', form), 'editHelp',
      'Commit changes this existing scalar only. Equivalent numbers keep their original spelling.');
    help.id = `${heading.id}-help`;
    input.setAttribute('aria-describedby', help.id);
    const editButtons = element('div', 'deLordPanel__toolbar', form);
    const commit = bind(element('button', '', editButtons), 'commit', 'Commit scalar');
    commit.type = 'submit';
    const reset = button(editButtons, 'reset', 'Reset input', () => { updateEditor(true); setMessage(null, '', false); controls(); });
    const undo = button(editButtons, 'undo', 'Undo', () => command('undo'));
    const redo = button(editButtons, 'redo', 'Redo', () => command('redo'));
    const notice = element('p', 'deLordPanel__notice', panel);
    notice.setAttribute('role', 'status');
    const certification = element('div', 'deLordPanel__certification', panel);
    bind(element('h3', '', certification), 'preservationTitle', 'Preservation and game export');
    const preservation = element('p', '', certification);
    const target = element('p', '', certification);
    bind(element('p', 'deLordPanel__hint', certification), 'runtime',
      'Game behavior is unverified. This panel does not certify a playable lord or install a package.');
    const details = element('details', 'deLordPanel__diagnostics', panel);
    const summary = element('summary', '', details);
    const diagnosticList = element('ul', '', details);

    function setMessage(key, detail = '', invalidInput = messageInvalidInput) {
      messageKey = key; messageDetail = detail; messageInvalidInput = invalidInput;
      const defaults = {
        changed: 'Scalar committed.', noop: 'No content change; original token spelling retained.',
        error: 'Action did not finish.', stale: 'The document changed. Reset input and review the current token before committing.',
      };
      text(notice, key ? `${tr(key, defaults[key])}${detail ? ` ${detail}` : ''}` : '');
      notice.dataset.error = String(key === 'error' || key === 'stale');
      input.setAttribute('aria-invalid', String(invalidInput));
    }
    function hasDraft() { return draft !== null; }
    function controls() {
      const pending = !!state?.save, draft = hasDraft(), editable = !!choices.get(select.value);
      open.disabled = !!busy || pending || draft || typeof controller.open !== 'function';
      save.disabled = !session || !!busy || pending || draft || typeof controller.save !== 'function';
      saveAs.disabled = !session || !!busy || pending || draft || typeof controller.saveAs !== 'function';
      check.hidden = !pending;
      check.disabled = !!busy || !pending || state.save.status === 'preparing' || typeof controller.reconcile !== 'function';
      select.disabled = !choices.size || draft;
      input.disabled = !editable;
      commit.disabled = !editable;
      reset.disabled = !draft;
      undo.disabled = !state?.canUndo || draft;
      redo.disabled = !state?.canRedo || draft;
      panel.setAttribute('aria-busy', String(!!busy));
      let label = !state ? tr('noDocument', 'No document open') : state.dirty ? tr('dirty', 'Unsaved changes') : tr('clean', 'No unsaved changes');
      if (draft) label += ` · ${tr('draft', 'Number input is not committed')}`;
      if (state?.save) {
        const saveLabels = { preparing: ['preparing', 'Preparing save…'], pending: ['pending', 'Save result pending — check before saving again.'], unknown: ['unknown', 'Save outcome unknown — check the existing operation before saving again.'] };
        label += ` · ${tr(...saveLabels[state.save.status])}`;
      } else if (state?.lastSave) {
        const outcomes = { committed: ['committed', 'Backend confirmed the submitted bytes saved'], failed: ['failed', 'Save failed; content retained'], cancelled: ['cancelled', 'Save cancelled; content retained'] };
        if (outcomes[state.lastSave.status]) label += ` · ${tr(...outcomes[state.lastSave.status])}`;
      }
      if (busy) label += ` · ${tr('working', 'Controller action in progress…')}`;
      text(status, label);
    }
    function scalarReasons() {
      const assessments = new Map((state?.assessment.interpretation.fields || []).map(field => [field.name, field.status]));
      const nonnumeric = new Set((state?.diagnostics || []).filter(item => item.code === 'int32-type' && item.path.length === 2).map(item => item.path[1]));
      return pin.schema.fields.filter(field => field.type === 'signedInt32').map(field => ({
        name: field.name, reason: nonnumeric.has(field.name) ? 'nonnumeric' : assessments.get(field.name) || 'missing',
      }));
    }
    function buildChoices(reasons = scalarReasons()) {
      const selected = draft?.field || select.value;
      choices = new Map(); select.replaceChildren();
      choiceSignature = reasons.map(field => field.reason).join(',');
      const available = element('optgroup', '', select), unavailable = element('optgroup', '', select);
      available.label = tr('available', 'Unique numeric scalars');
      unavailable.label = tr('unavailable', 'Unavailable scalars — retained without repair');
      for (const field of reasons) { // Array/structural editing is a later consumer.
        const { reason } = field;
        const option = element('option', '', reason === 'unique' ? available : unavailable);
        option.value = field.name;
        option.textContent = reason === 'unique' ? field.name : `${field.name} — ${tr(reason, { missing: 'missing / no unique lord object', ambiguous: 'ambiguous', nonnumeric: 'not a number token' }[reason])}`;
        option.disabled = reason !== 'unique';
        if (!option.disabled) choices.set(field.name, ['lord', field.name]);
      }
      if (!available.children.length) available.remove();
      if (!unavailable.children.length) unavailable.remove();
      if (choices.size) select.value = choices.keys().next().value;
      else { const option = element('option', '', select, tr('noFields', 'No unique numeric schema scalar is available')); option.value = ''; select.value = ''; }
      // A captured draft keeps its field selected even when that option becomes
      // unavailable. Only explicit Reset or caller-authorized adoption releases it.
      if (draft || choices.has(selected)) select.value = selected;
    }
    function updateEditor(resetDraft = false) {
      if (resetDraft) {
        draft = null;
        if (!choices.has(select.value)) select.value = choices.keys().next().value || '';
      }
      const fieldPath = choices.get(select.value);
      renderedLexeme = fieldPath ? json.find(state.document, fieldPath).lexeme : '';
      text(token, fieldPath ? renderedLexeme : tr('noToken', 'No editable token'));
      if (draft) input.value = draft.text;
      else { input.value = renderedLexeme; editorRevision = state?.revision || 0; }
    }
    function diagnostics() {
      const assessment = state?.assessment;
      text(preservation, assessment ? tr('preserved', 'Valid JSON is preservable. Unedited bytes and extensions remain with the document session.') : tr('openHint', 'Open raw bytes through the DE controller to begin.'));
      let interpretation = tr('noInterpretation', 'No LORD interpretation');
      if (assessment) {
        const shapes = { interpretable: ['lordShape', 'LORD object recognized'], ambiguous: ['ambiguousShape', 'Ambiguous LORD structure'], 'invalid-shape': ['invalidShape', 'LORD field types are not certified'], 'not-lord': ['genericShape', 'Generic JSON; no LORD object recognized'] };
        interpretation = tr(...shapes[assessment.interpretation.status]);
        interpretation += assessment.target.canonicalStructure === 'blocked' ? ` · ${tr('blocked', 'Canonical game export blocked')}` : ` · ${tr('complete', 'Pinned structural checks complete; game export unverified')}`;
      }
      text(target, interpretation);
      const items = assessment?.diagnostics || [];
      text(summary, `${tr('diagnostics', 'Document diagnostics')} (${items.length})`);
      // Bound DOM work for extension-heavy inputs. The canonical assessment,
      // never a second validator, remains available from the caller's session.
      const visible = items.slice(0, 40);
      const count = visible.length + (items.length > 40 ? 1 : 0);
      while (diagnosticRows.length > count) diagnosticRows.pop().li.remove();
      for (let i = 0; i < count; i++) {
        if (!diagnosticRows[i]) {
          const li = element('li', '', diagnosticList);
          diagnosticRows.push({ li, where: element('bdi', 'deLordPanel__diagnosticPath', li), message: element('span', '', li) });
        }
        const row = diagnosticRows[i], item = visible[i];
        text(row.where, item ? item.path?.length ? item.path.map(String).join(' / ') : tr('root', 'document') : '');
        text(row.message, item ? ` — ${t(`deLordPanel.diagnostic.${item.code}`, { defaultValue: item.message })}` : tr('moreDiagnostics', 'Showing the first 40 diagnostics. The controller can inspect the complete session assessment.'));
      }
    }
    function refresh() {
      if (disposed) return;
      state = session ? session.read() : null;
      text(path, state?.path || tr('noPath', 'No file selected'));
      path.title = state?.path || '';
      if (state?.document !== renderedDocument) {
        const reasons = scalarReasons();
        if (reasons.map(field => field.reason).join(',') !== choiceSignature) {
          buildChoices(reasons);
        }
        updateEditor(); renderedDocument = state?.document || null;
      }
      // Undo can restore the same document object at a newer session revision.
      // Only a clean editor follows it; a captured draft keeps its base revision.
      if (!draft) editorRevision = state?.revision || 0;
      else if (draft.revision !== state?.revision) setMessage('stale');
      if (state?.assessment !== renderedAssessment) { diagnostics(); renderedAssessment = state?.assessment || null; }
      controls();
    }
    function setSession(next) {
      if (disposed) return;
      session = next; generation++; state = session ? session.read() : null; draft = null;
      renderedDocument = null; renderedAssessment = null;
      select.value = '';
      buildChoices(); updateEditor(true); setMessage(null, '', false); diagnostics(); refresh();
    }
    function command(name) {
      if (!session || hasDraft()) return;
      try {
        session[name](state.revision); refresh(); updateEditor(true); setMessage(null, '', false); controls();
      } catch (error) { setMessage(error.code === 'stale-revision' ? 'stale' : 'error', error.code === 'stale-revision' ? '' : error.message); refresh(); }
    }
    async function invoke(name) {
      if (disposed || busy || (hasDraft() && name !== 'reconcile') || typeof controller[name] !== 'function') return;
      if (name !== 'reconcile' && state?.save) return;
      if (name === 'reconcile' && (!state?.save || state.save.status === 'preparing')) return;
      if (name !== 'open' && !session) return;
      const captured = session, epoch = generation, action = {};
      busy = action;
      if (name !== 'reconcile') setMessage(null, '', false);
      controls();
      try {
        const result = controller[name]({ session: captured });
        refresh(); // Observe synchronous preparation without polling.
        await result;
      } catch (error) {
        if (!disposed && epoch === generation) setMessage('error', error instanceof Error ? error.message : tr('callbackFailed', 'Controller callback failed. Review the document and save status.'));
      } finally {
        if (!disposed && busy === action) { busy = null; refresh(); }
      }
    }
    listen(form, 'submit', event => {
      event.preventDefault();
      if (!session || !choices.has(select.value)) return;
      try {
        const before = state.document;
        session.replaceScalar(draft?.revision ?? editorRevision, draft?.path || choices.get(select.value), json.numberToken(input.value));
        draft = null; // Successful Commit explicitly resolves the captured input before refresh.
        refresh(); updateEditor(true); setMessage(state.document === before ? 'noop' : 'changed', '', false); controls();
      } catch (error) {
        setMessage(error.code === 'stale-revision' ? 'stale' : 'error', error.code === 'stale-revision' ? '' : error.message, true);
        refresh();
      }
    });
    listen(select, 'change', () => { updateEditor(true); setMessage(null, '', false); controls(); });
    listen(input, 'input', () => {
      if (!draft && choices.has(select.value) && input.value !== renderedLexeme) {
        draft = { field: select.value, path: choices.get(select.value), revision: editorRevision, text: input.value };
      } else if (draft) {
        draft.text = input.value;
        // Typing back to the current token can clear a current draft, but cannot
        // silently rebase one captured before an external content change.
        if (draft.revision === state?.revision && input.value === renderedLexeme) draft = null;
      }
      setMessage(null, '', false); controls();
    }); // No parse, hash, IPC or full refresh while typing.
    function dispose() {
      if (disposed) return;
      disposed = true; generation++;
      listeners.forEach(remove => remove());
      listeners.length = 0; bindings.length = 0; diagnosticRows.length = 0;
      panel.remove(); choices.clear(); session = null; state = null; draft = null; renderedDocument = null; renderedAssessment = null;
      if (mounts.get(container) === api) mounts.delete(container);
    }
    function refreshTranslations() {
      if (disposed) return;
      bindings.forEach(({ node, key, fallback }) => text(node, tr(key, fallback)));
      buildChoices(); updateEditor(); diagnostics(); setMessage(messageKey, messageDetail, messageInvalidInput); refresh();
    }
    const api = Object.freeze({ setSession, refresh, refreshTranslations, dispose });
    mounts.set(container, api);
    setSession(session);
    return api;
  }
  return Object.freeze({ mount });
});
