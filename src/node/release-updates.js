'use strict';
const API = 'https://api.github.com/repos/Schlossgespensty/AI-Toolkit/releases/latest';
const RELEASES = 'https://github.com/Schlossgespensty/AI-Toolkit/releases/tag/';
function version(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(String(value));
  if (!match) return null;
  const parts = match.slice(1, 4).map(Number);
  return parts.every(Number.isSafeInteger) ? { parts, preview: !!match[4] } : null;
}
function newer(tag, installed) {
  const a = version(tag), b = version(installed);
  if (!a || !b || a.preview) return false;
  for (let i = 0; i < 3; i++) if (a.parts[i] !== b.parts[i]) return a.parts[i] > b.parts[i];
  return b.preview;
}
function releaseAsset(release) {
  const assets = (release.assets || []).filter(a => /^AI[- ]toolkit.*\.zip$/i.test(a.name) && !/arm64|ia32/i.test(a.name));
  if (assets.length !== 1) return null;
  const asset = assets[0];
  if (!/^sha256:[a-f0-9]{64}$/.test(asset.digest) || !Number.isSafeInteger(asset.size) || asset.size <= 0 || asset.size > 600000000) return null;
  return { url: 'https://github.com/Schlossgespensty/AI-Toolkit/releases/download/' + encodeURIComponent(release.tag_name) + '/' + encodeURIComponent(asset.name),
    size: asset.size, sha256: asset.digest.slice(7) };
}
function createReleaseChecker(installed, request = fetch, now = Date.now) {
  let pending, cached, checkedHour = -1, retryAt = 0;
  return async function check() {
    const time = now(), hour = Math.floor(time / 3600000);
    if (pending) return pending;
    if (cached && (time < retryAt || (cached.status !== 'error' && checkedHour === hour))) return cached;
    pending = (async () => {
      try {
        const response = await request(API, {
          headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'AI-Toolkit-release-check', 'X-GitHub-Api-Version': '2022-11-28' },
          signal: AbortSignal.timeout(8000)
        });
        if (response.status === 404) return { status: 'current', installed, latest: null };
        if (!response.ok) throw new Error('Release check unavailable');
        const release = await response.json();
        if (release.draft || release.prerelease || !version(release.tag_name) || version(release.tag_name).preview) {
          throw new Error('Unsupported release metadata');
        }
        const latest = release.tag_name;
        return { status: newer(latest, installed) ? 'available' : 'current', installed, latest,
          url: RELEASES + encodeURIComponent(latest), asset: releaseAsset(release) };
      } catch { return { status: 'error', installed }; }
    })();
    try {
      cached = await pending;
      checkedHour = hour;
      retryAt = now() + (cached.status === 'error' ? 60000 : 0);
      return cached;
    } finally { pending = null; }
  };
}
module.exports = { newer, releaseAsset, createReleaseChecker };
