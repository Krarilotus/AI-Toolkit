'use strict';
(() => {
  const button = document.getElementById('releaseUpdateButton');
  if (!button || !window.electronAPI?.checkReleaseUpdate) return;
  let available = false, busy = false;
  async function check() {
    if (busy) return;
    busy = true; button.disabled = true;
    button.textContent = 'Checking updates...';
    try {
      const result = await window.electronAPI.checkReleaseUpdate();
      available = result.status === 'available';
      button.classList.toggle('releaseAvailable', available);
      button.classList.toggle('releaseCurrent', result.status === 'current');
      button.textContent = available ? `Update ${result.latest}` : result.status === 'error' ? 'Retry updates' : 'Up to date';
      button.title = available ? `Download and install official ${result.latest}, then restart Toolkit (installed ${result.installed}).`
        : result.status === 'error' ? 'Could not check GitHub. Click to retry; automatic checks continue hourly.'
        : `Installed ${result.installed}. No newer official release${result.latest ? ` (latest ${result.latest})` : ''}. Checks on startup and hourly.`;
    } catch {
      available = false; button.classList.remove('releaseAvailable', 'releaseCurrent');
      button.textContent = 'Retry updates'; button.title = 'Could not check releases. Click to retry.';
    } finally { busy = false; button.disabled = false; }
  }
  button.addEventListener('click', async () => {
    if (!available) return check();
    if (busy) return;
    busy = true; button.disabled = true; button.textContent = 'Downloading update...';
    try {
      const release = await window.electronAPI.prepareReleaseUpdate();
      if (!await window.unsavedChanges.confirmAll('installing the update and restarting Toolkit')) {
        button.textContent = `Install ${release.version}`; return;
      }
      button.textContent = 'Restarting...';
      await window.electronAPI.installReleaseUpdate();
    } catch (error) {
      button.textContent = 'Retry update';
      button.title = error.message.replace(/^Error invoking remote method '[^']+': Error: /, '');
      window.appWorkspace?.setStatus(button.title);
    } finally { busy = false; button.disabled = false; }
  });
  function hourly() {
    setTimeout(() => { check(); hourly(); }, 3600000 - Date.now() % 3600000 + 100);
  }
  check(); hourly();
})();
