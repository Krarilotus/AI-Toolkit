/* Backend-only F1 facade. All detection, metadata and journal policy is Rust. */
'use strict';
const path = require('node:path');
const { CoreClient, resourcePaths } = require('./core-client');
const { coreBuildPaths } = require('./core-build-paths');
const spec = require('../desktop/generated/core/contract.json');
let connection;
function client() {
  if (!connection) connection = new CoreClient(resourcePaths(process.resourcesPath || coreBuildPaths().resourcesPath));
  return connection;
}
async function invoke(pending) {
  const result = await pending;
  if (result.kind === 'rejected') throw Object.assign(new Error(result.code), { code: result.code });
  return result.value;
}
// Enter the client's reservation synchronously, even before hello. The facade
// must not prepare payloads or yield before the transport captures their bytes.
function request(operation, options) { return invoke(client().request(operation, options)); }
class ProfileRepository {
  constructor(directory) {
    if (!path.isAbsolute(directory)) throw new TypeError('Absolute repository directory required.');
    this.directory = directory; this.file = path.join(directory, spec.storeName);
    this.lock = `${this.file}.lock`; this.transaction = `${this.file}.transaction`; this.backup = `${this.file}.backup`;
  }
  read(options) { return request({ op: 'read', directory: this.directory }, options); }
  recover(options) { return request({ op: 'recover', directory: this.directory }, options); }
  compareAndSwap(expectedRevision, store, options) { return request({ op: 'compareAndSwap', directory: this.directory, expectedRevision, store }, options); }
  migrateLegacy(legacyFile, options) { return request({ op: 'migrateLegacy', directory: this.directory, legacyFile }, options); }
}
module.exports = {
  ProfileRepository,
  probeInstallation: (selected, options) => request({ op: 'probe', path: selected }, options),
  inspectPe: (bytes, options) => invoke(client().requestBytes('inspectPe', bytes, options)),
  parseMetadata: (bytes, options) => invoke(client().requestBytes('parseMetadata', bytes, options)),
  validateStore: (store, options) => request({ op: 'validateStore', store }, options),
  emptyStore: () => structuredClone(spec.emptyStore),
  STORE_NAME: spec.storeName, MAX_JSON_DEPTH: spec.maxJsonDepth,
  DE_DATA: spec.deData, CLASSIC_EXES: spec.classicExes, DE_FILES: spec.deFiles,
  close: async () => { if (connection) await connection.close(); },
};
