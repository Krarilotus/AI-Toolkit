import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultSchema = fileURLToPath(new URL('../config/de-lord-schema.json', import.meta.url));
const defaultOutput = fileURLToPath(new URL('../src/shared/generated/de-lord-pin.js', import.meta.url));
const pick = (source, keys) => Object.fromEntries(keys.map(key => {
  if (!Object.hasOwn(source, key)) throw new TypeError(`LORD schema is missing ${key}`);
  return [key, source[key]];
}));

// Select contract properties, never repeat inventory values or source-line rules.
// Descriptive extensions are intentionally not additional required guard values.
export function renderPin(bytes) {
  const source = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  const schema = pick(source, ['id', 'format', 'version', 'fieldCount', 'arrayCount', 'transferredInt32Words']);
  schema.provenance = pick(source.provenance, ['repository', 'commit', 'schemaSource', 'transferSource', 'managedSha256', 'nativeSha256']);
  for (const key of ['schemaSource', 'transferSource']) schema.provenance[key] = pick(schema.provenance[key], ['path', 'lines', 'gitBlob']);
  schema.targetPolicy = pick(source.targetPolicy, ['id', 'allFieldsRequired', 'exactArrayLengthsRequired', 'integerTokenPolicy', 'semantics']);
  schema.fields = source.fields.map(field => ({
    ...pick(field, ['name', 'type', 'sourceLine', 'declarationInitializer', 'runtimeMissingFieldDefault']),
    ...(Object.hasOwn(field, 'length') ? { length: field.length } : {}),
  }));
  const data = { schema };
  // JSON.parse keeps even prototype-like property names as data, not JS literals.
  const literal = JSON.stringify(JSON.stringify(data)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `// GENERATED from config/de-lord-schema.json. DO NOT EDIT.\n// Regenerate: node scripts/generate-de-lord-schema.mjs; verify with --check.\n(function (root, factory) {\n  if (typeof module === 'object' && module.exports) module.exports = factory();\n  else root.deLordPin = factory();\n})(typeof globalThis !== 'undefined' ? globalThis : this, () => {\n  'use strict';\n  function freeze(value) {\n    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }\n    return value;\n  }\n  return freeze(JSON.parse(${literal}));\n});\n`;
}

export async function generate({ schemaPath = defaultSchema, outputPath = defaultOutput, check = false } = {}) {
  const expected = Buffer.from(renderPin(await readFile(schemaPath)), 'utf8');
  if (check) {
    let actual;
    try { actual = await readFile(outputPath); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    // Git core.autocrlf is enabled in this checkout. Check generated code,
    // allowing its checkout line endings; write mode always emits LF.
    if (!actual || actual.toString('utf8').replace(/\r\n/g, '\n') !== expected.toString('utf8')) {
      throw new Error(`Stale or missing LORD pin: ${outputPath}; run node scripts/generate-de-lord-schema.mjs`);
    }
  } else {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, expected);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--check') options.check = true;
    else if ((arg === '--schema' || arg === '--output') && process.argv[i + 1]) options[arg === '--schema' ? 'schemaPath' : 'outputPath'] = resolve(process.argv[++i]);
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  await generate(options);
}
