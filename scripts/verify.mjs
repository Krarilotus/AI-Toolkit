// Runs the Native CI checks locally before a push, limited to what the change
// needs (see scripts/ci-scope.mjs). Use it to find out before pushing whether
// CI will fail.
//
//   npm run verify                    checks this branch against upstream main
//   npm run verify -- --all           runs every check, including the native build
//   npm run verify -- --base <ref>    compares against another base
//   npm run verify -- --install-hook  runs this before every `git push`
//
// AI_TOOLKIT_SKIP_VERIFY=1 git push skips the hook once.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, chmodSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scope, changedFiles } from './ci-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const tryGit = (...args) => { try { return git(...args); } catch { return null; } };
const argv = process.argv.slice(2);
const option = name => { const at = argv.indexOf(name); return at < 0 ? null : argv[at + 1]; };
const MARKER = '# ai-toolkit verify hook';

// Same commands as .github/workflows/native-ci.yml, in the same order.
const SHARED = [
  ['Translations', 'npm run check:locales'],
  ['Package policy', 'node scripts/package-policy.mjs'],
  ['Native bridge types', 'npx tsc --project tsconfig.desktop.json --noEmit'],
  ['Syntax and tests', 'npm run check'],
  ['Embedded frontend build', 'node scripts/build-desktop.mjs'],
  ['Renderer smoke test', 'npx electron scripts/render-smoke.cjs --isolated'],
];
const NATIVE = [
  ['Rust formatting', 'cargo fmt --manifest-path src-tauri/Cargo.toml --check'],
  ['Rust tests', 'cargo test --locked --all-targets --manifest-path src-tauri/Cargo.toml'],
  ['Native build', 'cargo build --locked --bins --manifest-path src-tauri/Cargo.toml'],
];

function installHook() {
  const hooks = path.resolve(root, git('rev-parse', '--git-common-dir'), 'hooks');
  const file = path.join(hooks, 'pre-push');
  if (existsSync(file) && !readFileSync(file, 'utf8').includes(MARKER)) {
    console.error(`${file} already exists and is not this check. Call "node scripts/verify.mjs --hook" from it instead.`);
    process.exit(1);
  }
  mkdirSync(hooks, { recursive: true });
  // The hook belongs to the clone, not to a branch: branches without this
  // script are pushed unchecked rather than blocked.
  writeFileSync(file, `#!/bin/sh\n${MARKER}\nscript="$(git rev-parse --show-toplevel)/scripts/verify.mjs"\n` +
    `if [ ! -f "$script" ]; then echo "verify: this branch has no scripts/verify.mjs; pushing unchecked." >&2; exit 0; fi\n` +
    `exec node "$script" --hook "$@"\n`);
  chmodSync(file, 0o755);
  console.log(`Installed ${file}.`);
  const hooksPath = tryGit('config', 'core.hooksPath');
  if (hooksPath) console.log(`core.hooksPath is set to ${hooksPath}; Git only runs this hook if that hook directory calls it.`);
}

function defaultBase() {
  for (const ref of ['upstream/main', 'origin/main']) if (tryGit('rev-parse', '--verify', '--quiet', `${ref}^{commit}`)) return ref;
  return null;
}

// What CI will see for each pushed branch. Returns false when nothing needs checking.
function checkPush() {
  if (process.env.AI_TOOLKIT_SKIP_VERIFY === '1') { console.log('verify: skipped (AI_TOOLKIT_SKIP_VERIFY=1).'); return false; }
  const updates = readFileSync(0, 'utf8').split('\n').map(line => line.trim().split(/\s+/)).filter(parts => parts.length === 4);
  const pushed = updates.map(parts => parts[1]).filter(sha => !/^0+$/.test(sha));
  if (!pushed.length) return false;
  const head = git('rev-parse', 'HEAD');
  if (pushed.some(sha => sha !== head)) {
    console.error('verify: only the checked-out commit can be checked. Check out the branch you push, or set AI_TOOLKIT_SKIP_VERIFY=1.');
    process.exit(1);
  }
  // The checks run on the working tree. Uncommitted or untracked files would
  // let them pass here and still fail in CI.
  // Compared by content: regenerated files whose bytes did not change don't count.
  const dirty = [git('diff', '--name-only', 'HEAD'), git('ls-files', '--others', '--exclude-standard')].filter(Boolean).join('\n');
  if (dirty) {
    console.error(`verify: the working tree differs from the pushed commit, so the result would not match CI:\n${dirty}\nCommit or stash these first, or set AI_TOOLKIT_SKIP_VERIFY=1.`);
    process.exit(1);
  }
  return true;
}

function run([label, command]) {
  const started = Date.now();
  console.log(`\n── ${label}: ${command}`);
  const result = spawnSync(command, { cwd: root, stdio: ['ignore', 'inherit', 'inherit'], shell: true });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (result.status !== 0) {
    console.error(`\nverify: ${label} failed after ${seconds}s. CI would fail at this step.`);
    process.exit(result.status || 1);
  }
  console.log(`── ${label} passed (${seconds}s)`);
}

if (argv.includes('--install-hook')) {
  installHook();
} else if (!argv.includes('--hook') || checkPush()) {
  const base = option('--base') ?? defaultBase();
  const all = argv.includes('--all') || !base;
  const needed = all ? { shared: true, native: true } : scope(changedFiles(base, 'HEAD', root));
  console.log(all ? 'verify: running every check.' : `verify: changes since ${base} need ${needed.native ? 'shared and native' : needed.shared ? 'shared' : 'no'} checks.`);
  // Rust formatting is the quickest check that has failed CI, so it runs first.
  if (needed.native) run(NATIVE[0]);
  if (needed.shared) SHARED.forEach(run);
  if (needed.native) NATIVE.slice(1).forEach(run);
  console.log('\nverify: all needed checks passed.');
}
