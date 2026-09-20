'use strict';
// Resolve declarative UCP file sources without executing plugin Lua or starting the game.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const yaml = require('js-yaml');
function resolveGameGraphics(root) {
  root = path.resolve(root);
  const files = new Map(), inputs = [];
  const add = directory => {
    if (!fs.existsSync(directory)) return;
    for (const name of fs.readdirSync(directory).sort()) if (/\.gm1$/i.test(name)) {
      const file = path.join(directory, name), stat = fs.statSync(file);
      if (!stat.isFile()) continue;
      files.set(name.toLowerCase().slice(0,-4), file);
      inputs.push(`${file}:${stat.size}:${stat.mtimeMs}`);
    }
  };
  add(path.join(root, 'gm'));
  const configPath = path.join(root, 'ucp-config.yml');
  if (fs.existsSync(configPath)) {
    const text = fs.readFileSync(configPath, 'utf8'); inputs.push(text);
    const config = yaml.load(text) || {};
    const full = config['config-full'] || config['config-sparse'];
    if (config.active !== false) for (const entry of full?.['load-order'] || []) {
      // Versioned folders are selected by the active load order, never by scanning
      // all installed packs. Later registered sources override earlier ones.
      if (!/^[\w. -]+$/.test(entry.extension || '') || !/^[\w.+-]+$/.test(entry.version || '')) continue;
      const folder = path.join(root, 'ucp', 'plugins', `${entry.extension}-${entry.version}`);
      const init = path.join(folder, 'init.lua');
      if (!fs.existsSync(init)) continue;
      const text = fs.readFileSync(init, 'utf8'); inputs.push(text);
      const lua = text.replace(/(['"])(?:\\.|(?!\1)[^\\])*?\1|--\[(=*)\[[\s\S]*?\]\2\]|--[^\r\n]*/g, token => token.startsWith('--') ? '' : token);
      for (const match of lua.matchAll(/registerFileSource\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        let relative = match[1].replaceAll('\\', '/');
        const prefix = `ucp/plugins/${entry.extension}-*/`;
        if (relative.startsWith(prefix)) relative = `ucp/plugins/${entry.extension}-${entry.version}/` + relative.slice(prefix.length);
        if (relative.includes('*')) continue;
        const source = path.resolve(root, relative), rel = path.relative(root, source);
        if (rel.startsWith('..') || path.isAbsolute(rel)) continue;
        add(path.join(source, 'gm')); // gmx is deliberately inactive in UCP files.
      }
    }
  }
  return {root, files, revision: crypto.createHash('sha256').update(inputs.join('\n')).digest('hex'),
    file(name) { return files.get(name.toLowerCase()) || path.join(root, 'gm', `${name}.gm1`); }};
}
module.exports = {resolveGameGraphics};
