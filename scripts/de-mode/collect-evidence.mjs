// Read-only identity probe. Never copies or modifies installed game files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
let gameRoot, output;
const sources = [];
const classic = [];
for (let i = 0; i < args.length; i += 1) {
  const option = args[i];
  const value = args[++i];
  if (!value) throw new Error(`Missing value for ${option}`);
  if (option === '--game') gameRoot = path.resolve(value);
  else if (option === '--output') output = path.resolve(value);
  else if (option === '--classic') classic.push(path.resolve(value));
  else if (option === '--source') {
    const split = value.indexOf('=');
    if (split < 1) throw new Error('--source expects ID=PATH');
    sources.push({ id: value.slice(0, split), root: path.resolve(value.slice(split + 1)) });
  } else throw new Error(`Unknown option: ${option}`);
}
if (!gameRoot) throw new Error('Usage: node scripts/de-mode/collect-evidence.mjs --game PATH [--classic EXE] [--source ID=PATH] [--output PATH]');

function peIdentity(bytes) {
  if (bytes.length < 64 || bytes.toString('ascii', 0, 2) !== 'MZ') return null;
  const pe = bytes.readUInt32LE(0x3c);
  if (pe + 26 > bytes.length || bytes.toString('ascii', pe, pe + 4) !== 'PE\0\0') return null;
  const optional = pe + 24;
  const magic = bytes.readUInt16LE(optional);
  const directory = optional + (magic === 0x20b ? 112 : 96);
  const optionalSize = bytes.readUInt16LE(pe + 20);
  const hasClrDirectory = directory + 15 * 8 <= optional + optionalSize &&
    directory + 15 * 8 <= bytes.length && bytes.readUInt32LE(directory + 14 * 8) !== 0;
  return {
    machine: `0x${bytes.readUInt16LE(pe + 4).toString(16).padStart(4, '0')}`,
    format: magic === 0x20b ? 'PE32+' : magic === 0x10b ? 'PE32' : `0x${magic.toString(16)}`,
    managed: hasClrDirectory,
    // A managed PE32 image alone does not establish an x86-only process.
  };
}

const data = 'Stronghold Crusader Definitive Edition_Data';
const files = [
  'Stronghold Crusader Definitive Edition.exe',
  'UnityPlayer.dll',
  `${data}/Managed/Assembly-CSharp.dll`,
  `${data}/Plugins/x86_64/CrusaderDE.dll`,
].map(relativePath => {
  const bytes = fs.readFileSync(path.join(gameRoot, relativePath));
  return { relativePath, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), pe: peIdentity(bytes) };
});
const classicBinaries = classic.map(filePath => {
  const bytes = fs.readFileSync(filePath);
  return { path: filePath, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), pe: peIdentity(bytes) };
});

function git(root, ...command) {
  return execFileSync('git', command, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
}
const repositories = sources.map(source => ({
  ...source,
  head: git(source.root, 'rev-parse', 'HEAD'),
  refs: git(source.root, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/remotes/origin/main', 'refs/remotes/origin/develop')
    .split('\n').filter(Boolean).map(line => {
      const [ref, commit] = line.split(' ');
      return { ref, commit };
    }),
}));
const manifestPath = path.resolve(gameRoot, '../../appmanifest_3024040.acf');
let steam = null;
if (fs.existsSync(manifestPath)) {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const field = key => manifest.match(new RegExp(`"${key}"\\s+"([^"\\r\\n]*)"`))?.[1] ?? null;
  steam = { appId: field('appid'), buildId: field('buildid') };
}
const result = { schemaVersion: 1, observedAt: new Date().toISOString(), gameRoot, steam, files, classicBinaries, repositories };
const json = `${JSON.stringify(result, null, 2)}\n`;
if (output) fs.writeFileSync(output, json, 'utf8');
else process.stdout.write(json);
