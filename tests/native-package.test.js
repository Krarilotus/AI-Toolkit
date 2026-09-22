const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { unzipSync } = require('fflate');

const packaging = import('../scripts/package-native.mjs');
function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-package-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return { directory, write(name, data) {
    const file = path.join(directory, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data); return file;
  } };
}

test('portable artifact retains every config and exact original file bytes', async t => {
  const { archivePortable, portablePath } = await packaging, f = fixture(t);
  const expected = {
    'config/aiv.json': '{"extraCategory":111}',
    'config/user-values.json': '{"myCustomDefault":12}',
    'assets/aiv/iso/verzeichnis.json': '{"61":{"frames":2}}',
    'THIRD_PARTY_NOTICES.txt': 'Complete license notice',
  };
  for (const [name, text] of Object.entries(expected)) f.write(name, text);
  const executable = f.write('native.exe', Buffer.from([77, 90, 0, 255, 1, 2]));
  f.write('docs/native-preview-readme.txt', 'Native setup instructions');
  const destination = path.join(f.directory, 'preview.zip');
  const names = archivePortable(executable, destination, f.directory);
  const actual = unzipSync(fs.readFileSync(destination));
  assert.ok(names.every(portablePath));
  for (const [name, text] of Object.entries(expected)) assert.equal(Buffer.from(actual[name]).toString(), text);
  assert.deepEqual(Buffer.from(actual['AI Toolkit.exe']), fs.readFileSync(executable));
  assert.equal(Buffer.from(actual['README.txt']).toString(), 'Native setup instructions');
  for (const unsafe of ['../AI Toolkit.exe', 'resources/app.asar', 'node_modules/pixi.js/index.js', 'cache/map.png', 'config/../../outside.json']) assert.equal(portablePath(unsafe), false);
});

test('artwork audit rejects changed originals and bundled game sprites', async t => {
  const { auditFrontend } = await packaging, f = fixture(t);
  const png = Buffer.alloc(24); png.write('\x89PNG', 0, 'binary'); png.writeUInt32BE(96, 16); png.writeUInt32BE(64, 20);
  f.write('source/assets/themes/test/textures/control.png', png);
  const packaged = f.write('dist/assets/themes/test/textures/control.png', png);
  const result = auditFrontend(path.join(f.directory, 'dist'), path.join(f.directory, 'source'));
  assert.deepEqual([result[0].width, result[0].height], [96, 64]);
  const changed = Buffer.from(png); changed[12] = 1; fs.writeFileSync(packaged, changed);
  assert.throws(() => auditFrontend(path.join(f.directory, 'dist'), path.join(f.directory, 'source')), /Image bytes changed/);
  fs.writeFileSync(packaged, png);
  f.write('dist/assets/aiv/iso/tower.png', png);
  assert.throws(() => auditFrontend(path.join(f.directory, 'dist'), path.join(f.directory, 'source')), /Game artwork packaged/);
});

test('license inventory follows nested runtime dependencies but excludes development tools', async t => {
  const { javascriptPackages } = await packaging, f = fixture(t);
  const manifest = (name, data) => f.write(name + '/package.json', JSON.stringify(data));
  manifest('node_modules/renderer', { name: 'renderer', version: '1', license: 'MIT', dependencies: { color: '1', nested: '1' }, devDependencies: { unused: '1' } });
  manifest('node_modules/color', { name: 'color', version: '1', license: 'MIT' });
  manifest('node_modules/nested', { name: 'nested', version: '1', license: 'MIT', dependencies: { color: '2' } });
  manifest('node_modules/nested/node_modules/color', { name: 'color', version: '2', license: 'MIT' });
  assert.deepEqual(javascriptPackages(['renderer'], f.directory).map(p => p.name).sort(), [
    'JavaScript color 1', 'JavaScript color 2', 'JavaScript nested 1', 'JavaScript renderer 1',
  ]);
});
