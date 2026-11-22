'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = () => import('../scripts/ci-scope.mjs');

test('documentation needs no checks, renderer changes skip the native build', async () => {
  const { scope } = await load();
  assert.deepEqual(scope(['README.md', 'docs/notes.md']), { shared: false, native: false });
  assert.deepEqual(scope(['src/js/castle-editor.js', 'locales/de/interface.yaml', 'tests/castle-picture.test.js']), { shared: true, native: false });
  assert.deepEqual(scope(['README.md', 'src-tauri/src/updates.rs']), { shared: true, native: true });
  assert.deepEqual(scope(['src\\desktop\\bridge.ts']), { shared: true, native: true });
  assert.deepEqual(scope(['package-lock.json']), { shared: true, native: true });
});

test('every file outside src-tauri that the native build reads counts as native', async () => {
  const { scope } = await load();
  const native = file => scope([file]).native;
  const crate = path.join(root, 'src-tauri');
  const outside = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'target' && entry.name !== 'gen') visit(file); continue; }
      if (!file.endsWith('.rs')) continue;
      const source = fs.readFileSync(file, 'utf8');
      for (const [, relative] of source.matchAll(/include_(?:str|bytes)!\(\s*"([^"]+)"/g)) outside.push(path.resolve(path.dirname(file), relative));
      for (const [, relative] of source.matchAll(/CARGO_MANIFEST_DIR"\)\)\s*\.join\("([^"]+)"\)/g)) outside.push(path.resolve(crate, relative));
    }
  };
  visit(path.join(crate, 'src'));
  const config = JSON.parse(fs.readFileSync(path.join(crate, 'tauri.conf.json'), 'utf8'));
  for (const file of [...Object.keys(config.bundle.resources), ...config.bundle.icon]) outside.push(path.resolve(crate, file));
  const files = outside.map(file => path.relative(root, file).replace(/\\/g, '/')).filter(file => !file.startsWith('src-tauri/'));
  assert.ok(files.length >= 8, `found ${files.length} native inputs`);
  for (const file of files) assert.ok(native(file), `${file} is read by the native build but not listed in scripts/ci-scope.mjs`);
});

test('the local check runs the same commands as Native CI', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/native-ci.yml'), 'utf8');
  const verify = fs.readFileSync(path.join(root, 'scripts/verify.mjs'), 'utf8');
  for (const command of ['npm run check:locales', 'node scripts/package-policy.mjs', 'npx tsc --project tsconfig.desktop.json --noEmit',
    'npm run check', 'node scripts/build-desktop.mjs', 'npx electron scripts/render-smoke.cjs',
    'cargo fmt --manifest-path src-tauri/Cargo.toml --check', 'cargo test --locked --all-targets --manifest-path src-tauri/Cargo.toml',
    'cargo build --locked --bins --manifest-path src-tauri/Cargo.toml']) {
    assert.ok(workflow.includes(command), `Native CI runs ${command}`);
    assert.ok(verify.includes(command), `npm run verify runs ${command}`);
  }
  assert.match(workflow, /node scripts\/ci-scope\.mjs/);
  assert.match(workflow, /needs\.scope\.outputs\.native == 'true'/);
});
