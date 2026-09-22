'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src-tauri/src/viewport-close.js'), 'utf8');

test('browser popup close uses the opener native API for exactly that popup', async () => {
  const closed = [], lookedUp = [];
  const nativeWindows = new Map(['main', 'viewport-1', 'editor-2', 'viewport-3'].map(label => [label, { close: async () => { closed.push(label); nativeWindows.delete(label); } }]));
  function popup(label) {
    const window = {
      __TAURI_INTERNALS__: { metadata: { currentWindow: { label } } },
      opener: { __TAURI__: { window: { Window: { getByLabel: async label => { lookedUp.push(label); return nativeWindows.get(label); } } } } },
      close: () => { throw Error('Must not bypass the native-window registry'); },
    };
    vm.runInNewContext(source, { window, console });
    return window;
  }
  const first = popup('viewport-1');
  await Promise.all([first.close(), first.close()]);
  assert.deepEqual(lookedUp, ['viewport-1']);
  assert.deepEqual(closed, ['viewport-1']);
  assert.deepEqual([...nativeWindows.keys()], ['main', 'editor-2', 'viewport-3']);
  const orphan = popup('viewport-3');
  orphan.opener.closed = true;
  await orphan.close();
  assert.deepEqual(closed, ['viewport-1'], 'native owner destruction handles orphan cleanup');
});
