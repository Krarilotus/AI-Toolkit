'use strict';
const fs = require('node:fs');
const path = require('node:path');
const v8 = require('node:v8');
const crypto = require('node:crypto');

// One derived map only: bounded disk usage, no stale per-step or per-map trees.
// Increment when terrain decoding, composition or the returned schema changes.
const FORMAT = 'map-atlas-v1';
const MAX_BYTES = 128 * 1024 * 1024;
function cachedAtlas(directory, identity, build) {
  const key = crypto.createHash('sha256').update(FORMAT + JSON.stringify(identity)).digest('hex');
  const file = path.join(directory, 'derived-atlas.bin');
  try {
    const stat = fs.lstatSync(file);
    if (stat.isFile() && !stat.isSymbolicLink() && stat.size <= MAX_BYTES) {
      const entry = v8.deserialize(fs.readFileSync(file));
      if (entry.key === key && entry.value?.nativeRenderer === true && entry.value.cameras?.length === 4) return entry.value;
    }
  } catch { /* Missing, corrupt or incompatible runtime cache: rebuild. */ }
  const value = build();
  const temporary = path.join(directory, `derived-atlas-${crypto.randomUUID()}.tmp`);
  try {
    const bytes = v8.serialize({key, value});
    if (bytes.length > MAX_BYTES) return value;
    fs.mkdirSync(directory, {recursive:true});
    fs.writeFileSync(temporary, bytes, {flag:'wx'});
    fs.renameSync(temporary, file);
  } catch { /* Cache storage is optional; a valid map must still open. */ }
  finally { try { fs.unlinkSync(temporary); } catch {} }
  return value;
}
module.exports = { cachedAtlas };
