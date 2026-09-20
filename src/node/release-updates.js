'use strict';
const OFFICIAL = 'Schlossgespensty/AI-Toolkit';
const API = 'https://api.github.com/repos/';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
/** @typedef {{repo:string, key:string, tag:string, asarSha256:string}} InstalledBuild */
function repository(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(value)) throw new Error('Enter a GitHub repository as owner/name.');
  return value;
}
function isOfficial(repo) { return repo.toLowerCase() === OFFICIAL.toLowerCase(); }
function releaseAsset(release, repo = OFFICIAL) {
  repository(repo);
  const assets = (release.assets || []).filter(a => /^AI[- .]toolkit.*\.zip$/i.test(a.name) && !/arm64|ia32/i.test(a.name));
  if (assets.length !== 1) return null;
  const asset = assets[0];
  if (!/^sha256:[a-f0-9]{64}$/.test(asset.digest) || !Number.isSafeInteger(asset.size) || asset.size <= 0 || asset.size > 600000000) return null;
  return { url: `https://github.com/${repo}/releases/download/${encodeURIComponent(release.tag_name)}/${encodeURIComponent(asset.name)}`,
    size: asset.size, sha256: asset.digest.slice(7), id: asset.id };
}
function readInstalledBuild(root) {
  try {
    const receipt = JSON.parse(fs.readFileSync(path.join(root, '.toolkit-release.json'), 'utf8').replace(/^\uFEFF/, ''));
    repository(receipt.repo);
    if (typeof receipt.key !== 'string' || typeof receipt.tag !== 'string' || !/^[a-f0-9]{64}$/i.test(receipt.asarSha256)) return null;
    const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'resources', 'app.asar'))).digest('hex');
    return actual === receipt.asarSha256.toLowerCase() ? receipt : null;
  } catch { return null; }
}
/** GitHub release identity, not package semver, determines the installed build. */
function createReleaseChecker(installed, request = fetch, now = Date.now) {
  if (!installed || typeof installed !== 'object' || typeof installed.key !== 'string') installed = null;
  const cache = new Map(), pending = new Map();
  let sources;
  async function json(url) {
    const response = await request(url, {headers: {Accept:'application/vnd.github+json', 'User-Agent':'AI-Toolkit-release-check', 'X-GitHub-Api-Version':'2022-11-28'}, signal:AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub rate limit reached. Try again later.' : 'Could not read GitHub builds.');
    return response.json();
  }
  async function pages(repo, endpoint) {
    const result = [];
    for (let page = 1; page <= 20; page++) {
      const entries = await json(`${API}${repo}/${endpoint}?per_page=100&page=${page}`);
      if (!Array.isArray(entries)) throw new Error('Invalid GitHub response.');
      result.push(...entries);
      if (entries.length < 100) return result;
    }
    throw new Error('Too many GitHub results to determine the newest build safely.');
  }
  async function validate(repo) {
    repository(repo);
    if (isOfficial(repo)) return OFFICIAL;
    const info = await json(API + repo);
    if (!info.fork || !isOfficial(info.source?.full_name || info.parent?.full_name || '')) throw new Error('Choose a fork of Schlossgespensty/AI-Toolkit.');
    return repository(info.full_name);
  }
  async function listSources() {
    const hour = Math.floor(now()/3600000);
    if (sources?.hour === hour) return sources.items;
    const forks = await pages(OFFICIAL, 'forks');
    const items = [OFFICIAL, ...forks.map(f => repository(f.full_name))];
    sources = {hour, items:[...new Set(items)]};
    return sources.items;
  }
  async function check({repo = OFFICIAL, force = false} = {}) {
    repository(repo);
    const cacheKey = repo.toLowerCase(), time = now(), hour = Math.floor(time/3600000);
    if (pending.has(cacheKey)) return pending.get(cacheKey);
    const old = cache.get(cacheKey);
    if (!force && old && (old.result.status === 'error' ? time < old.retryAt : old.hour === hour)) return old.result;
    const job = (async () => {
      try {
        repo = await validate(repo);
        const experimental = !isOfficial(repo);
        const releases = (await pages(repo, 'releases'))
          .filter(r => !r.draft && (experimental || !r.prerelease) && typeof r.tag_name === 'string' && Number.isSafeInteger(r.id) && Number.isFinite(Date.parse(r.published_at)))
          .sort((a,b) => Date.parse(b.published_at)-Date.parse(a.published_at) || b.id-a.id);
        const release = releases[0];
        if (!release) return {status:'empty', repo, experimental};
        const asset = releaseAsset(release, repo);
        const key = asset ? `${repo.toLowerCase()}:${release.id}:${asset.id}:${asset.sha256}` : null;
        return {status: !asset ? 'unsupported' : installed?.key === key ? 'current' : 'available',
          repo, experimental, key, latest:release.tag_name, publishedAt:release.published_at,
          installed: installed ? `${installed.repo} ${installed.tag}` : 'Untracked local build',
          url:`https://github.com/${repo}/releases/tag/${encodeURIComponent(release.tag_name)}`, asset};
      } catch (error) { return {status:'error', repo, message:error.message}; }
    })();
    pending.set(cacheKey,job);
    try {
      const result = await job; cache.set(cacheKey,{result,hour,retryAt:now()+60000}); return result;
    } finally { pending.delete(cacheKey); }
  }
  return Object.assign(check,{listSources,validate});
}
module.exports = { OFFICIAL, repository, releaseAsset, readInstalledBuild, createReleaseChecker };
