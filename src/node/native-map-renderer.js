'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const FORMAT = 'ai-toolkit-native-map-v1';
const MODULE = 'ai-toolkit-native-map-renderer-0.1.0';
const MODULE_SOURCE = path.join(__dirname, '../../integrations/native-map-renderer');
const ENGINES = new Set([
  '3bb0a8c1e72331b3a30a5aa93ed94beca0081b476b04c1960e26d5b45387ac5a',
  '0d3d0d0be90a41d0c07d02cb41e6edc3e399288d16039db5b666392660fbda34'
]);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
// Read-only compatibility with captures made by earlier Toolkit builds.
// A cache miss must never launch the game, patch an executable or install UCP modules.
function sourceFingerprint(gameRoot) {
  const engineHash = sha(fs.readFileSync(path.join(gameRoot, 'Stronghold Crusader.exe')));
  if (!ENGINES.has(engineHash)) throw new Error('No compatible cached camera views for this game executable.');
  const sources = [];
  for (const name of fs.readdirSync(gameRoot).filter(name => /\.dll$/i.test(name))) sources.push([name, path.join(gameRoot, name)]);
  for (const name of ['cr.tex', 'faces.bmp', 'extremeTrail.csv']) sources.push([name, path.join(gameRoot, name)]);
  for (const name of ['code.zip', 'ucp-version.yml']) sources.push([`ucp/${name}`, path.join(gameRoot, 'ucp', name)]);
  for (const name of ['winProcHandler-1.0.0.zip', 'graphicsApiReplacer-1.3.0.zip'])
    sources.push([`ucp/modules/${name}`, path.join(gameRoot, 'ucp/modules', name)]);
  for (const name of ['definition.yml', 'init.lua']) sources.push([`ucp/modules/${MODULE}/${name}`, path.join(MODULE_SOURCE, name)]);
  const hashes = [engineHash];
  // Reproduce the old capture fingerprint without copying or changing inputs.
  sources.forEach(([target, source]) => {
    if (!fs.existsSync(source)) throw new Error(`Native renderer needs ${path.basename(source)} in the selected UCP game installation.`);
    const bytes = fs.readFileSync(source); hashes.push(target + ':' + sha(bytes));
  });
  for (const name of fs.readdirSync(path.join(gameRoot, 'gm')).sort()) {
    const stat = fs.statSync(path.join(gameRoot, 'gm', name));
    if (stat.isFile()) hashes.push(`gm/${name}:${stat.size}:${stat.mtimeMs}`);
  }
  return { engineHash, sourceHash: sha(hashes.join('\n')) };
}

function readResult(root, request) {
  const result = JSON.parse(fs.readFileSync(path.join(root, 'renderer-result.json'), 'utf8'));
  if (result.format !== FORMAT || result.id !== request.id) throw new Error('Native renderer returned a stale result.');
  if (result.error) throw new Error(result.error);
  if (!result.complete || result.mapHash !== request.mapHash || result.engineHash !== request.engineHash)
    throw new Error('Native renderer output does not match this map and executable.');
  const read = (name, length) => {
    const file = path.join(root, name);
    if (fs.lstatSync(file).isSymbolicLink() || fs.statSync(file).size !== length) throw new Error(`Invalid native renderer layer: ${name}`);
    return fs.readFileSync(file);
  };
  return { sourceHash: request.sourceHash, mapHash: request.mapHash, heights: read('height.bin', 80400), baseHeights: read('base-height.bin', 80400), cameras: [0, 2, 4, 6].map(orientation => ({
    orientation, gfx: read(`camera-${orientation}-gfx.bin`, 160800), pillars: read(`camera-${orientation}-pillar.bin`, 160800)
  })) };
}

function readCachedNativeMap({ gameRoot, mapPath, cacheRoot }, fingerprint = sourceFingerprint) {
  const root = path.resolve(cacheRoot);
  const cached = path.join(root, 'completed-request.json');
  if (!fs.existsSync(cached)) throw new Error('No cached camera views; using the saved map terrain. The game will not be started.');
  const request = JSON.parse(fs.readFileSync(cached, 'utf8'));
  const mapHash = sha(fs.readFileSync(mapPath));
  const source = fingerprint(path.resolve(gameRoot));
  if (request.format !== FORMAT || request.mapHash !== mapHash || request.sourceHash !== source.sourceHash || request.engineHash !== source.engineHash)
    throw new Error('Cached camera views are outdated; using the saved map terrain. The game will not be started.');
  return readResult(root, request);
}

module.exports = { readCachedNativeMap, internals: { FORMAT, sha, readResult, sourceFingerprint } };
