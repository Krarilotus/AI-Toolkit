'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
async function prepareRelease(release, { root, cache, baseline }) {
  if (!release.asset || !release.key || !release.repo) throw new Error('This build has no supported Windows ZIP with a published checksum.');
  const stage = fs.mkdtempSync(path.join(cache, 'release-'));
  const script = path.join(stage, 'install.ps1');
  fs.copyFileSync(path.join(__dirname, 'release-install.ps1'), script);
  fs.writeFileSync(path.join(stage, 'config-baseline.json'), JSON.stringify(baseline));
  fs.writeFileSync(path.join(stage, 'release.json'), JSON.stringify({repo:release.repo, key:release.key, tag:release.latest}));
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
  const ready = path.join(prepared.stage, `ready-${crypto.randomUUID()}.txt`);
  const logPath = path.join(prepared.stage, 'installer.log');
  const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
  const encode = value => Buffer.from(value, 'utf16le').toString('base64');
  const powershell = path.join(process.env.SystemRoot || 'C:/Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const install = `$ProgressPreference='SilentlyContinue'; & ${quote(prepared.script)} -Mode Install -Stage ${quote(prepared.stage)} -InstallRoot ${quote(prepared.root)} -WaitPid ${process.pid} -ReadyFile ${quote(ready)} *> ${quote(logPath)}`;
  // Give the helper its own hidden Windows console. Node's detached+hidden
  // combination can exit without running PowerShell; a normal direct child can
  // instead be terminated with the editor's console. Start-Process avoids both.
  const bootstrap = `$p = Start-Process -FilePath ${quote(powershell)} -ArgumentList '-NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ${encode(install)}' -WindowStyle Hidden -PassThru; $p.Id`;
  const {stdout} = await promisify(execFile)(powershell, ['-NoProfile', '-NonInteractive', '-EncodedCommand', encode(bootstrap)], {windowsHide:true, timeout:15000});
  const pid = Number(stdout.trim());
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error(`Installer did not start. See ${logPath}`);
  try {
    const deadline = Date.now() + 15000;
    while (!fs.existsSync(ready)) {
      try { process.kill(pid, 0); } catch { throw new Error(`Installer exited before starting. See ${logPath}`); }
      if (Date.now() >= deadline) throw new Error(`Installer did not confirm startup. See ${logPath}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } catch (error) {
    try { process.kill(pid); } catch { /* The failed helper already exited. */ }
    throw error;
  }
}

module.exports = { prepareRelease, launchInstaller };
