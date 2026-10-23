import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import asar from '@electron/asar';
import { generate, run, root, scratch } from './generate-core-contracts.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const packagedSources = ['src/node/core-client.js', 'src/node/game-profiles.js', 'src/node/core-build-paths.js',
  'src/shared/document-session.js',
  'src/desktop/generated/core/types.ts', 'src/desktop/generated/core/contract.json'];
export function build() {
  const generated = generate(true);
  const contractHash = sha(Buffer.concat([...generated.values()].map(value => Buffer.from(value))));
  const rustc = run('rustc', ['-vV']);
  const target = rustc.match(/^host: (.+)$/m)?.[1]?.trim();
  if (!target) throw new Error('Cannot determine Rust host target.');
  const inputs = [];
  function add(file, label = path.relative(root, file).replaceAll('\\', '/')) {
    if (fs.existsSync(file)) inputs.push({ path: label, sha256: sha(fs.readFileSync(file)) });
  }
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'target') continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file); else add(file);
    }
  }
  walk(path.join(root, 'crates/toolkit-core')); walk(path.join(root, 'crates/toolkit-host-helper'));
  for (const name of ['scripts/build-core.mjs', 'scripts/generate-core-contracts.mjs', ...packagedSources,
    'package.json', 'package-lock.json', 'src-tauri/Cargo.toml', 'src-tauri/Cargo.lock',
    'rust-toolchain', 'rust-toolchain.toml']) add(path.join(root, name));
  let ancestor = root;
  for (;;) {
    add(path.join(ancestor, '.cargo/config.toml'), `${ancestor}/.cargo/config.toml`);
    add(path.join(ancestor, '.cargo/config'), `${ancestor}/.cargo/config`);
    const parent = path.dirname(ancestor); if (ancestor === parent) break; ancestor = parent;
  }
  const cargoHome = process.env.CARGO_HOME || path.join(process.env.USERPROFILE || process.env.HOME, '.cargo');
  add(path.join(cargoHome, 'config.toml'), 'cargo-home/config.toml'); add(path.join(cargoHome, 'config'), 'cargo-home/config');
  const sourceId = sha(JSON.stringify(inputs));
  const buildEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    /^(RUSTFLAGS|CARGO_ENCODED_RUSTFLAGS|RUSTC|RUSTC_WRAPPER|RUSTC_WORKSPACE_WRAPPER|CC|CXX|AR|CARGO_PROFILE_RELEASE_.*|CARGO_TARGET_.*_(RUSTFLAGS|LINKER))$/.test(key)).sort());
  const buildId = sha(JSON.stringify({ sourceId, contractHash, target, rustc, cargo: run('cargo', ['-V']), profile: 'release', buildEnvironment }));
  const env = { ...process.env, CARGO_TARGET_DIR: path.join(scratch, 'target'), TOOLKIT_CONTRACT_HASH: contractHash,
    TOOLKIT_SOURCE_ID: sourceId, TOOLKIT_BUILD_ID: buildId, TOOLKIT_TARGET: target };
  const manifestPath = path.join(root, 'crates/toolkit-host-helper/Cargo.toml');
  run('cargo', ['build', '--offline', '--locked', '--release', '--target', target, '--manifest-path', manifestPath], { env, stdio: 'inherit' });
  const executable = process.platform === 'win32' ? 'toolkit-host-helper.exe' : 'toolkit-host-helper';
  const directory = path.join(scratch, 'resources/core'); fs.mkdirSync(directory, { recursive: true });
  const helperPath = path.join(directory, executable);
  fs.copyFileSync(path.join(scratch, 'target', target, 'release', executable), helperPath);
  const output = run(helperPath, [], { input: Buffer.alloc(0), encoding: null });
  if (output.length < 4 || output.readUInt32LE() !== output.length - 4) throw new Error('Helper did not produce exactly one valid hello at EOF.');
  const hello = JSON.parse(output.subarray(4).toString('utf8')).hello;
  if (hello?.sourceId !== sourceId || hello.buildId !== buildId || hello.contractHash !== contractHash || hello.target !== target) throw new Error('Built helper identity mismatch.');
  const metadata = JSON.parse(run('cargo', ['metadata', '--offline', '--locked', '--format-version=1', '--filter-platform', target, '--manifest-path', manifestPath], { env }));
  const tauri = JSON.parse(run('cargo', ['metadata', '--offline', '--locked', '--format-version=1', '--filter-platform', target,
    '--manifest-path', path.join(root, 'src-tauri/Cargo.toml')], { env }));
  for (const pkg of metadata.packages.filter(pkg => pkg.source)) {
    if (!tauri.packages.some(peer => peer.name === pkg.name && peer.version === pkg.version && peer.source === pkg.source)) throw new Error(`Tauri/helper lock graph differs for ${pkg.name}@${pkg.version}.`);
  }
  const dependencies = metadata.packages.filter(pkg => pkg.source).sort((a, b) => a.name.localeCompare(b.name));
  const notices = ['Toolkit helper third-party dependencies. Project code has no selected license.'];
  for (const pkg of dependencies) {
    const folder = path.dirname(pkg.manifest_path);
    notices.push(`\n${pkg.name} ${pkg.version}\nLicense: ${pkg.license || 'see license file'}\n${pkg.repository || pkg.source}`);
    const licenseFiles = fs.readdirSync(folder).filter(name => /^(LICENSE|COPYING|NOTICE)([.-]|$)/i.test(name) && fs.statSync(path.join(folder, name)).isFile());
    if (!licenseFiles.length && !pkg.license_file) throw new Error(`No license/notice text found for ${pkg.name}.`);
    if (pkg.license_file && !licenseFiles.includes(pkg.license_file)) licenseFiles.push(pkg.license_file);
    for (const file of licenseFiles) notices.push(`\n--- ${file} ---\n${fs.readFileSync(path.join(folder, file), 'utf8')}`);
  }
  fs.writeFileSync(path.join(directory, 'THIRD-PARTY-NOTICES.txt'), `${notices.join('\n')}\n`);
  const manifest = { executable, sha256: sha(fs.readFileSync(helperPath)), hello, inputs,
    buildEnvironmentHash: sha(JSON.stringify(buildEnvironment)),
    dependencies: dependencies.map(pkg => ({ name: pkg.name, version: pkg.version, license: pkg.license, source: pkg.source })) };
  fs.writeFileSync(path.join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Core resources built and verified. Helper: ${fs.statSync(helperPath).size} bytes.`);
  return { directory, manifest };
}
export function verifyDirectoryPackage(output = path.join(scratch, 'electron-package')) {
  const directory = path.join(output, 'win-unpacked/resources/core');
  for (const name of ['toolkit-host-helper.exe', 'manifest.json', 'THIRD-PARTY-NOTICES.txt']) {
    if (!fs.readFileSync(path.join(directory, name)).equals(fs.readFileSync(path.join(scratch, 'resources/core', name)))) throw new Error(`Packaged core resource differs: ${name}`);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const cargoHome = process.env.CARGO_HOME || path.join(process.env.USERPROFILE || process.env.HOME, '.cargo');
  for (const input of manifest.inputs) {
    const file = input.path.startsWith('cargo-home/') ? path.join(cargoHome, input.path.slice('cargo-home/'.length)) : path.resolve(root, input.path);
    if (sha(fs.readFileSync(file)) !== input.sha256) throw new Error(`Core input changed after build: ${input.path}`);
  }
  const archive = path.join(directory, '../app.asar');
  for (const name of packagedSources) {
    if (!asar.extractFile(archive, name.replaceAll('/', path.sep)).equals(fs.readFileSync(path.join(root, name)))) throw new Error(`Packaged core source differs: ${name}`);
  }
  console.log('Packaged core resources verified.');
}
export async function packageElectron(packaging = 'dir') {
  if (process.platform !== 'win32' || process.arch !== 'x64' || !['dir', 'portable'].includes(packaging)) throw new Error('Electron artifact gate currently requires Windows x64 and dir/portable. Other targets are unverified.');
  const { build: packageApp, Platform, Arch } = await import('electron-builder');
  await packageApp({ projectDir: root, targets: Platform.WINDOWS.createTarget(packaging, Arch.x64), publish: 'never',
    config: { directories: { output: path.join(scratch, 'electron-package') },
      // Resolve resources before electron-builder sees them. Its env macros expand
      // after path resolution, which corrupts absolute paths across Windows drives.
      extraResources: [{ from: path.join(scratch, 'resources/core'), to: 'core',
        filter: ['toolkit-host-helper.exe', 'manifest.json', 'THIRD-PARTY-NOTICES.txt'] }] } });
  verifyDirectoryPackage();
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
  const packaging = process.argv.find(arg => arg.startsWith('--package='))?.split('=')[1];
  if (packaging) {
    if (!process.env.npm_execpath) throw new Error('Run packaging through npm run package:electron or npm run dist:electron.');
    run(process.execPath, [process.env.npm_execpath, 'run', 'check'], { stdio: 'inherit' });
    await packageElectron(packaging);
  }
}
