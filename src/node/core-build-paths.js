/* Shared developer build/test resource paths. Packaged hosts use resourcesPath. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

function coreBuildPaths({ checkoutRoot = path.resolve(__dirname, '../..'), environment = process.env,
  temporaryRoot = os.tmpdir() } = {}) {
  const canonicalRoot = fs.realpathSync.native(checkoutRoot);
  const identity = process.platform === 'win32' ? canonicalRoot.toLowerCase() : canonicalRoot;
  const key = crypto.createHash('sha256').update(identity).digest('hex').slice(0, 24);
  const override = environment.TOOLKIT_CORE_OUTPUT;
  if (override && !path.isAbsolute(override)) throw new Error('TOOLKIT_CORE_OUTPUT must be absolute.');
  const output = path.resolve(override || path.join(temporaryRoot, 'toolkit-core-builds', key));
  // Resolve an existing ancestor as well, so an alias cannot route output into Git.
  let ancestor = output;
  const suffix = [];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor)); const parent = path.dirname(ancestor);
    if (parent === ancestor) break; ancestor = parent;
  }
  const resolvedOutput = path.join(fs.realpathSync.native(ancestor), ...suffix);
  const relative = path.relative(canonicalRoot, resolvedOutput);
  if (relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) {
    throw new Error('Core build output must be outside the Toolkit checkout.');
  }
  return { checkoutRoot: canonicalRoot, output: resolvedOutput,
    resourcesPath: path.join(resolvedOutput, 'resources'), coreResourceDir: path.join(resolvedOutput, 'resources/core'),
    targetDir: path.join(resolvedOutput, 'target') };
}
module.exports = { coreBuildPaths };
