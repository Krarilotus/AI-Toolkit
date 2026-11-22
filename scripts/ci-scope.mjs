// Decides which Native CI jobs a change needs. Native CI and the local
// pre-push check (scripts/verify.mjs) share this list, so both skip the same work.
//
//   node scripts/ci-scope.mjs <base> <head>   prints shared=… and native=…, and
//                                             appends them to $GITHUB_OUTPUT if set
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Files the Rust crate compiles, embeds, bundles or reads in its tests, and
// the tooling that builds it. A path ending in '/' covers the whole directory.
// The embedded frontend is built by the shared job, so plain renderer changes
// do not need the three-platform native build.
export const NATIVE_PATHS = Object.freeze([
  'src-tauri/',
  'src/desktop/',
  'src/shared/',
  'src/node/building-cost-names.json',
  'integrations/native-map-renderer/',
  'scripts/manifests/',
  'scripts/build-desktop.mjs',
  'scripts/ci-scope.mjs',
  'tests/fixtures/',
  'assets/icon.ico',
  'assets/aiv/iso/verzeichnis.json',
  'docs/native-preview-readme.txt',
  'THIRD_PARTY_NOTICES.txt',
  'package.json',
  'package-lock.json',
  '.github/workflows/native-ci.yml',
]);

const documentation = file => /\.md$/i.test(file);
const native = file => NATIVE_PATHS.some(entry => entry.endsWith('/') ? file.startsWith(entry) : file === entry);

// Documentation-only changes need nothing, matching the workflow's paths-ignore.
export function scope(files) {
  const relevant = files.map(file => file.replace(/\\/g, '/')).filter(file => file && !documentation(file));
  return { shared: relevant.length > 0, native: relevant.some(native) };
}

export function changedFiles(base, head = 'HEAD', cwd = process.cwd()) {
  return execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...${head}`], { cwd, encoding: 'utf8' })
    .split('\n').map(line => line.trim()).filter(Boolean);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [base, head = 'HEAD'] = process.argv.slice(2);
  if (!base) throw new Error('Usage: node scripts/ci-scope.mjs <base> [head]');
  const files = changedFiles(base, head);
  const result = scope(files);
  const lines = Object.entries(result).map(([job, needed]) => `${job}=${needed}`);
  console.log(`${files.length} changed file(s): ${lines.join(', ')}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}
