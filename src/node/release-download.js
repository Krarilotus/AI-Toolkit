'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
async function prepareRelease(release, { root, cache, baseline }) {
  if (!release.asset) throw new Error('This release has no supported Windows ZIP with a published checksum.');
  const stage = fs.mkdtempSync(path.join(cache, 'release-'));
  const script = path.join(stage, 'install.ps1');
  fs.copyFileSync(path.join(__dirname, 'release-install.ps1'), script);
  fs.writeFileSync(path.join(stage, 'config-baseline.json'), JSON.stringify(baseline));
  const response = await fetch(release.asset.url, { signal: AbortSignal.timeout(300000) });
  if (!response.ok || !response.body) throw new Error('Release download failed. Please retry.');
  let bytes = 0;
  const hash = crypto.createHash('sha256');
  const verify = new Transform({ transform(chunk, _encoding, done) {
    bytes += chunk.length;
    if (bytes > release.asset.size || bytes > 600000000) return done(new Error('Unexpected release size.'));
    hash.update(chunk); done(null, chunk);
  } });
  await pipeline(Readable.fromWeb(response.body), verify, fs.createWriteStream(path.join(stage, 'release.zip')));
  if (bytes !== release.asset.size || hash.digest('hex') !== release.asset.sha256) throw new Error('Release checksum did not match. Nothing was installed.');
  await promisify(execFile)('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script,
    '-Mode', 'Prepare', '-Stage', stage, '-InstallRoot', root], { windowsHide: true, timeout: 120000 });
  return { stage, script, root };
}
async function launchInstaller(prepared) {
  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', prepared.script,
    '-Mode', 'Install', '-Stage', prepared.stage, '-InstallRoot', prepared.root, '-WaitPid', String(process.pid)],
  { detached: true, stdio: 'ignore', windowsHide: true });
  await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
  child.unref();
}
module.exports = { prepareRelease, launchInstaller };
