'use strict';
(() => {
  const button = document.getElementById('releaseUpdateButton');
  const source = document.getElementById('releaseSourceSelect');
  const dialog = document.getElementById('releaseSourceDialog');
  const api = window.electronAPI;
  if (!button || !api?.checkReleaseUpdate) return;
  const OFFICIAL = 'Schlossgespensty/AI-Toolkit';
  let build = null, busy = false, serial = 0, selected = OFFICIAL;
  function showSource(repo) {
    selected = repo;
    if (!source) return;
    if (![...source.options].some(option => option.value === repo)) {
      const option = document.createElement('option'); option.value = repo;
      option.textContent = repo.toLowerCase() === OFFICIAL.toLowerCase() ? 'Official releases' : `Experimental: ${repo.split('/')[0]}`;
      option.title = repo; source.add(option, source.querySelector('[value="other"]'));
    }
    source.value = repo; source.title = `Update source: ${repo}`;
  }
  async function check(force = false) {
    if (busy) return;
    const request = ++serial;
    button.disabled = true; button.textContent = 'Checking updates...';
    try {
      const result = await api.checkReleaseUpdate(force);
      if (request !== serial) return;
      showSource(result.repo || selected); build = result;
      const available = result.status === 'available';
      button.classList.toggle('releaseAvailable', available);
      button.classList.toggle('releaseCurrent', result.status === 'current');
      button.textContent = available ? `Install ${result.latest}` : result.status === 'current' ? 'Up to date'
        : result.status === 'empty' ? 'No published builds' : result.status === 'unsupported' ? 'No compatible build' : 'Retry updates';
      button.title = available ? `${result.experimental ? 'Experimental snapshot' : 'Official release'} from ${result.repo}: ${result.latest}. Download, install and restart. Installed: ${result.installed}.`
        : result.status === 'current' ? `Installed ${result.repo} ${result.latest}. Checked on startup and hourly.`
        : result.message || `No installable Windows ZIP with a checksum found in ${result.repo}.`;
    } catch (error) {
      if (request !== serial) return;
      build = null; button.classList.remove('releaseAvailable', 'releaseCurrent');
      button.textContent = 'Retry updates'; button.title = error.message;
    } finally { if (request === serial) button.disabled = false; }
  }
  async function choose(repo) {
    ++serial; build = null; source.disabled = true; button.disabled = true;
    try { showSource(await api.setUpdateSource(repo)); await check(); }
    finally { source.disabled = false; button.disabled = false; }
  }
  source?.addEventListener('change', async () => {
    const repo = source.value; source.value = selected;
    if (repo === 'other') { dialog.showModal(); document.getElementById('releaseSourceRepo').focus(); return; }
    try { await choose(repo); } catch (error) { button.title = error.message; button.textContent = 'Retry updates'; }
  });
  document.getElementById('releaseSourceCancel')?.addEventListener('click', () => dialog.close());
  document.getElementById('releaseSourceForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = event.submitter; submit.disabled = true;
    try { await choose(document.getElementById('releaseSourceRepo').value.trim()); dialog.close(); }
    catch (error) { document.getElementById('releaseSourceError').textContent = error.message; }
    finally { submit.disabled = false; }
  });
  api.onUpdateSourceChanged?.(repo => { showSource(repo); check(); });
  button.addEventListener('click', async () => {
    if (busy) return;
    if (build?.status !== 'available') return check(true);
    busy = true; ++serial; button.disabled = true; if (source) source.disabled = true;
    button.textContent = 'Downloading update...';
    try {
      const release = await api.prepareReleaseUpdate(build.key);
      if (!await window.unsavedChanges.confirmAll('installing the selected build and restarting Toolkit')) {
        button.textContent = `Install ${release.version}`; return;
      }
      button.textContent = 'Restarting...';
      await api.installReleaseUpdate();
    } catch (error) {
      button.textContent = 'Retry update';
      button.title = error.message.replace(/^Error invoking remote method '[^']+': Error: /, '');
      window.appWorkspace?.setStatus(button.title);
    } finally { busy = false; button.disabled = false; if (source) source.disabled = false; }
  });
  async function initialize() {
    try {
      const {selected:repo, repos} = await api.listUpdateSources();
      for (const entry of repos) showSource(entry);
      showSource(repo);
    } catch { /* Official checks still work if fork discovery is unavailable. */ }
    if (source) { const option = document.createElement('option'); option.value = 'other'; option.textContent = 'Other fork...'; source.add(option); source.value = selected; }
    check();
  }
  function hourly() { setTimeout(() => { check(); hourly(); }, 3600000 - Date.now() % 3600000 + 100); }
  initialize(); hourly();
})();
