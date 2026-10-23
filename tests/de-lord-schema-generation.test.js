'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const repo = path.resolve(__dirname, '..');
const script = path.join(repo, 'scripts/generate-de-lord-schema.mjs');
const schemaPath = path.join(repo, 'config/de-lord-schema.json');
const pinPath = path.join(repo, 'src/shared/generated/de-lord-pin.js');
function temporaryRoot(t) {
  const scratch = process.env.AI_TOOLKIT_TEST_SCRATCH || os.tmpdir();
  fs.mkdirSync(scratch, { recursive: true });
  const dir = fs.mkdtempSync(path.join(scratch, 'de-lord-generation-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function frozen(value) {
  if (value && typeof value === 'object') { assert.ok(Object.isFrozen(value)); Object.values(value).forEach(frozen); }
}

test('generation is deterministic; check rejects missing/stale scratch artifacts and source changes without production writes', async t => {
  const dir = temporaryRoot(t);
  const source = path.join(dir, 'schema.json'), output = path.join(dir, 'pin.js');
  const originalSchema = fs.readFileSync(schemaPath), originalPin = fs.readFileSync(pinPath);
  fs.writeFileSync(source, originalSchema);
  const { generate, renderPin } = await import(pathToFileURL(script).href);
  const options = { schemaPath: source, outputPath: output };
  await assert.rejects(generate({ ...options, check: true }), /Stale or missing/);
  await generate(options);
  const first = fs.readFileSync(output);
  assert.deepEqual(first, Buffer.from(renderPin(originalSchema)));
  assert.equal(first.toString('utf8'), originalPin.toString('utf8').replace(/\r\n/g, '\n'));
  await generate(options);
  assert.deepEqual(fs.readFileSync(output), first);
  await generate({ ...options, check: true });
  fs.writeFileSync(output, first.toString('utf8').replace(/\n/g, '\r\n'));
  await generate({ ...options, check: true }); // Windows Git checkout parity.
  await generate(options);
  fs.appendFileSync(output, '// stale\n');
  await assert.rejects(generate({ ...options, check: true }), /Stale or missing/);
  assert.ok(fs.readFileSync(output, 'utf8').endsWith('// stale\n')); // Check did not repair it.
  await generate(options);
  const changed = JSON.parse(originalSchema.toString('utf8'));
  changed.provenance.managedSha256 = '0'.repeat(64);
  fs.writeFileSync(source, JSON.stringify(changed));
  await assert.rejects(generate({ ...options, check: true }), /Stale or missing/);
  const cli = spawnSync(process.execPath, [script, '--schema', source, '--output', output, '--check'], { cwd: repo, encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stderr, /Stale or missing LORD pin/);
  const write = spawnSync(process.execPath, [script, '--schema', source, '--output', output], { cwd: repo, encoding: 'utf8' });
  assert.equal(write.status, 0, write.stderr);
  await generate({ ...options, check: true });
  assert.deepEqual(fs.readFileSync(schemaPath), originalSchema);
  assert.deepEqual(fs.readFileSync(pinPath), originalPin);
});

test('generated CJS/browser data is frozen and both overlays use it, with a clear missing-pin failure', () => {
  const pin = require(pinPath);
  assert.equal(pin.schema.id, JSON.parse(fs.readFileSync(schemaPath, 'utf8')).id);
  assert.match(fs.readFileSync(pinPath, 'utf8'), /GENERATED.*DO NOT EDIT/);
  frozen(pin);
  const context = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, ArrayBuffer });
  const load = relative => vm.runInContext(fs.readFileSync(path.join(repo, relative), 'utf8'), context);
  load('src/shared/lossless-json.js');
  assert.throws(() => load('src/js/de-lord-format.js'), /Generated deLordPin must be loaded/);
  load('src/shared/generated/de-lord-pin.js');
  load('src/js/de-lord-format.js');
  frozen(context.deLordPin);
  assert.deepEqual(JSON.parse(JSON.stringify(context.deLordPin)), pin);
  const cjs = require('../src/js/de-lord-format');
  const fixture = new Uint8Array(fs.readFileSync(path.join(__dirname, 'fixtures/de-documents/complete-synthetic.lordjson')));
  assert.deepEqual(JSON.parse(JSON.stringify(context.deLordFormat.inspect(context.deLordFormat.parse(fixture)))),
    JSON.parse(JSON.stringify(cjs.inspect(cjs.parse(fixture)))));
  // The reviewed independent oracle remains in de-lord-format.test.js.
  const schema = structuredClone(cjs.schema);
  schema.fields.reverse(); schema.description = { extra: true };
  schema.fields[0].description = 'Allowed descriptive extension';
  assert.doesNotThrow(() => context.deLordFormat.create(schema));
});
