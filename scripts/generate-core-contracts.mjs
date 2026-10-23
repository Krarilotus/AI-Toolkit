import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import buildPaths from '../src/node/core-build-paths.js';

const resolved = buildPaths.coreBuildPaths();
export const root = resolved.checkoutRoot;
export const scratch = resolved.output;
export function run(program, args, options = {}) {
  const result = spawnSync(program, args, { cwd: root, windowsHide: true, encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${program} failed (${result.status})\n${result.stderr || result.stdout}`);
  return result.stdout;
}
export function generate(check = false) {
  const env = { ...process.env, CARGO_TARGET_DIR: path.join(scratch, 'target') };
  const args = ['run', '--offline', '--locked', '--quiet', '--manifest-path', path.join(root,
    'crates/toolkit-core/Cargo.toml'), '--features', 'export-types', '--example', 'export-contracts'];
  const types = run('cargo', args, { env }).replaceAll('\r\n', '\n');
  const spec = JSON.parse(run('cargo', [...args, '--', '--spec'], { env }));
  const files = new Map([['types.ts', types], ['contract.json', `${JSON.stringify(spec, null, 2)}\n`]]);
  const out = path.join(root, 'src/desktop/generated/core');
  if (check) {
    const regenerated = path.join(scratch, 'generated-check'); fs.mkdirSync(regenerated, { recursive: true });
    for (const [name, value] of files) fs.writeFileSync(path.join(regenerated, name), value);
    const names = fs.readdirSync(out).sort();
    if (JSON.stringify(names) !== JSON.stringify([...files.keys()].sort())) throw new Error('Obsolete core DTO output; regenerate core contracts.');
  } else fs.mkdirSync(out, { recursive: true });
  for (const [name, value] of files) {
    if (check) {
      if (fs.readFileSync(path.join(out, name), 'utf8').replaceAll('\r\n', '\n') !== value) {
        throw new Error(`Stale core contract: ${name}. Run npm run generate:core.`);
      }
    } else fs.writeFileSync(path.join(out, name), value);
  }
  return files;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generate(process.argv.includes('--check'));
  console.log('Core contracts verified.');
}
