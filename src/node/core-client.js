/* Private Electron-main transport. Never export this module through preload. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { types, isDeepStrictEqual } = require('node:util');
const spec = require('../desktop/generated/core/contract.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const failure = (code, message, details = {}) => Object.assign(new Error(message), { code, ...details });
const typedArray = Object.getPrototypeOf(Uint8Array.prototype);
const byteLength = Object.getOwnPropertyDescriptor(typedArray, 'length').get;
const byteBuffer = Object.getOwnPropertyDescriptor(typedArray, 'buffer').get;

// Generic wire serialization: never run getters/toJSON or coerce JS-only values.
// Profile validation belongs exclusively to Rust.
function serializeWire(value, { charge = () => {}, framed = false, byteVector } = {}) {
  const active = new Set();
  const parts = [];
  let size = 0;
  const take = count => {
    if (size + count > spec.maxFrameBytes) throw failure('frame-too-large', 'Core request exceeds the 12 MiB frame limit.');
    charge(count); size += count;
  };
  const token = text => { take(text.length); parts.push(text); };
  function string(text) {
    let bytes = 2;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = text.charCodeAt(++i);
        if (!(next >= 0xdc00 && next <= 0xdfff)) throw failure('invalid-wire-value', 'Unpaired Unicode surrogate.');
        bytes += 4;
      } else if (code >= 0xdc00 && code <= 0xdfff) throw failure('invalid-wire-value', 'Unpaired Unicode surrogate.');
      else if (code === 34 || code === 92 || code === 8 || code === 9 || code === 10 || code === 12 || code === 13) bytes += 2;
      else if (code < 32) bytes += 6;
      else bytes += code < 128 ? 1 : code < 2048 ? 2 : 3;
    }
    // Reserve exact UTF-8/escaping cost before stringify copies the payload.
    take(bytes); parts.push(JSON.stringify(text));
  }
  function encode(item, depth) {
    if (byteVector && item === byteVector.value) {
      if (types.isProxy(item)) throw failure('invalid-wire-value', 'Ordinary byte vectors required.');
      if (types.isUint8Array(item)) {
        const prototype = Object.getPrototypeOf(item);
        if ((prototype !== Uint8Array.prototype && prototype !== Buffer.prototype) ||
          types.isSharedArrayBuffer(byteBuffer.call(item))) throw failure('invalid-wire-value', 'Ordinary unshared byte vectors required.');
        const length = byteLength.call(item);
        // Reserve even the minimum wire cost before scanning, then the exact
        // decimal cost before allocating. Never expand to a JS number array or
        // invoke an iterator/toJSON. The final frame is the only byte snapshot.
        take(length ? length * 2 + 1 : 2);
        let extra = 0;
        for (let i = 0; i < length; i++) extra += item[i] < 10 ? 0 : item[i] < 100 ? 1 : 2;
        take(extra); parts.push({ bytes: item, length }); return;
      }
      if (!Array.isArray(item)) throw failure('invalid-wire-value', 'Byte vectors require a Buffer, Uint8Array or dense array.');
      // Ordinary arrays retain the generic wire checks below, including all
      // accessor, sparse, prototype and scalar rejection rules.
    }
    if (item === null || typeof item === 'boolean') return token(String(item));
    if (typeof item === 'string') return string(item);
    if (typeof item === 'number' && Number.isSafeInteger(item) && !Object.is(item, -0)) return token(String(item));
    if (typeof item !== 'object' || types.isProxy(item)) throw failure('invalid-wire-value', 'Core requests require ordinary JSON data.');
    if (depth >= spec.maxWireDepth || active.has(item)) throw failure('invalid-wire-value', 'Core request is cyclic or too deep.');
    const array = Array.isArray(item), prototype = Object.getPrototypeOf(item);
    if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) throw failure('invalid-wire-value', 'Plain records and dense arrays required.');
    const keys = Reflect.ownKeys(item);
    if (array && keys.length !== item.length + 1) throw failure('invalid-wire-value', 'Sparse or extended array.');
    active.add(item);
    token(array ? '[' : '{');
    let first = true;
    for (const key of keys) {
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value') ||
        (array && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= item.length))) throw failure('invalid-wire-value', 'Accessors, hidden and symbol properties are unsupported.');
      if (!first) token(','); first = false;
      if (!array) { string(key); token(':'); }
      encode(descriptor.value, depth + 1);
    }
    active.delete(item);
    token(array ? ']' : '}');
  }
  if (framed) charge(4);
  encode(value, 0);
  const bytes = Buffer.allocUnsafe(size + (framed ? 4 : 0));
  let offset = framed ? 4 : 0;
  if (framed) bytes.writeUInt32LE(size);
  for (const part of parts) {
    if (typeof part === 'string') { offset += bytes.write(part, offset, undefined, 'utf8'); continue; }
    bytes[offset++] = 91;
    for (let i = 0; i < part.length; i++) {
      if (i) bytes[offset++] = 44;
      const value = part.bytes[i];
      if (value >= 100) bytes[offset++] = 48 + Math.floor(value / 100);
      if (value >= 10) bytes[offset++] = 48 + Math.floor(value / 10) % 10;
      bytes[offset++] = 48 + value % 10;
    }
    bytes[offset++] = 93;
  }
  return bytes;
}
function frame(value) {
  return serializeWire(value, { framed: true });
}
class FrameReader {
  constructor(onFrame) { this.onFrame = onFrame; this.header = Buffer.alloc(4); this.used = 0; this.body = null; }
  push(chunk) {
    while (chunk.length) {
      const target = this.body || this.header, count = Math.min(target.length - this.used, chunk.length);
      chunk.copy(target, this.used, 0, count); this.used += count; chunk = chunk.subarray(count);
      if (this.used !== target.length) continue;
      if (!this.body) {
        const length = this.header.readUInt32LE();
        if (!length || length > spec.maxFrameBytes) throw failure('protocol', 'Invalid core frame length.');
        this.body = Buffer.alloc(length); this.used = 0;
      } else {
        const bytes = this.body; this.body = null; this.used = 0;
        let value;
        try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
        catch { throw failure('protocol', 'Invalid core JSON/UTF-8 response.'); }
        this.onFrame(value);
      }
    }
  }
  finish() { if (this.body || this.used) throw failure('protocol', 'Truncated core frame at EOF.'); }
}
function resourcePaths(resourcesPath) {
  if (!path.isAbsolute(resourcesPath)) throw failure('unavailable', 'Absolute core resource directory required.');
  return { helperPath: path.join(resourcesPath, 'core', process.platform === 'win32' ? 'toolkit-host-helper.exe' : 'toolkit-host-helper'), manifestPath: path.join(resourcesPath, 'core', 'manifest.json') };
}
class CoreClient {
  static async connect(options) { const client = new CoreClient(options); await client.ready; return client; }
  constructor({ helperPath, manifestPath, handshakeTimeoutMs = 10000 }) {
    this.pending = new Map(); this.nextId = 0; this.pendingBytes = 0; this.failed = null; this.closing = false; this.stderr = '';
    // Includes synchronous preparation and requests waiting for hello. Reserving
    // only after ready would leave every pre-await payload copy unbounded.
    this.admissions = new Set(); this.admittedBytes = 0;
    this.ready = new Promise((resolve, reject) => { this.resolveReady = resolve; this.rejectReady = reject; });
    // request() also supports callers waiting for hello; fail() rejects those
    // requests directly. Keep ready observable without an unhandled twin error.
    this.ready.catch(() => {});
    try {
      if (!path.isAbsolute(helperPath) || !path.isAbsolute(manifestPath)) throw new Error('Absolute helper and manifest paths required.');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.executable !== path.basename(helperPath) || manifest.sha256 !== hash(fs.readFileSync(helperPath))) throw new Error('Helper artifact hash/path mismatch.');
      const contractDir = path.resolve(__dirname, '../desktop/generated/core');
      const contractHash = hash(Buffer.concat(['types.ts', 'contract.json'].map(name => Buffer.from(fs.readFileSync(path.join(contractDir, name), 'utf8').replaceAll('\r\n', '\n')))));
      const hello = manifest.hello;
      for (const key of ['protocolMajor', 'protocolMinor', 'schemaVersion', 'maxFrameBytes', 'maxRawBytes', 'maxMetadataBytes', 'maxMetadataResultBytes', 'queueCapacity']) if (hello?.[key] !== spec[key]) throw new Error(`Unsupported ${key}.`);
      const architecture = { x64: 'x86_64', arm64: 'aarch64', ia32: 'x86' }[process.arch];
      if (hello.contractHash !== contractHash || hello.architecture !== architecture || !/^[a-f0-9]{64}$/.test(hello.sourceId) || !/^[a-f0-9]{64}$/.test(hello.buildId)) throw new Error('Contract/build/architecture mismatch.');
      this.expectedHello = hello;
      this.child = spawn(helperPath, [], { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
      this.exited = new Promise(resolve => this.child.once('close', resolve));
      const reader = new FrameReader(value => this.receive(value));
      this.child.stdout.on('data', chunk => { if (!this.failed) { try { reader.push(chunk); } catch (error) { this.fail(error); } } });
      this.child.stdout.on('end', () => {
        try { reader.finish(); } catch (error) { this.fail(error); }
        if (!this.closing || this.pending.size) this.fail(failure('unavailable', 'Core helper closed its output.'));
      });
      this.child.stderr.on('data', chunk => { this.stderr = `${this.stderr}${chunk}`.slice(-65536); });
      this.child.on('error', error => this.fail(failure('unavailable', `Core helper could not start: ${error.message}`)));
      this.child.stdin.on('error', error => this.fail(failure('unavailable', `Core helper input failed: ${error.message}`)));
      this.child.on('close', code => { if (!this.closing || this.pending.size) this.fail(failure('unavailable', `Core helper exited (${code}).`)); });
      this.timer = setTimeout(() => this.fail(failure('unavailable', 'Core handshake timed out. Rebuild/reinstall matching core resources.')), handshakeTimeoutMs);
    } catch (error) { this.fail(failure('unavailable', `Toolkit backend unavailable: ${error.message} Rebuild/reinstall matching core resources.`)); }
  }
  receive(message) {
    if (!this.hello) {
      if (message.kind !== 'hello' || !isDeepStrictEqual(message.hello, this.expectedHello)) throw failure('unavailable', 'Core hello/build/schema/protocol/contract/target mismatch. Rebuild/reinstall matching core resources.');
      clearTimeout(this.timer); this.hello = message.hello; this.resolveReady();
      for (const request of this.admissions) queueMicrotask(() => this.submit(request));
      return;
    }
    const request = this.pending.get(message.id);
    if (!Number.isSafeInteger(message.id) || !request) throw failure('protocol', 'Unexpected core response ID.');
    if (message.kind === 'started' && !request.started) { request.started = true; return; }
    if (message.kind !== 'reply' || !message.result || !['probe', 'store', 'pe', 'metadata', 'rejected', 'cancelled', 'queueFull'].includes(message.result.kind)) throw failure('protocol', 'Invalid core response envelope.');
    if (message.result.kind === 'cancelled') this.settle(request, failure('cancelled', 'Core operation cancelled before acceptance.'));
    else if (message.result.kind === 'queueFull') this.settle(request, failure('queue-full', 'Core helper queue is full.'));
    else this.settle(request, null, message.result);
  }
  settle(request, error, result) {
    if (!this.admissions.delete(request)) return;
    if (this.pending.delete(request.id)) this.pendingBytes -= request.bytes;
    this.admittedBytes -= request.bytes; request.buffer = null; request.cleanup();
    if (error) request.reject(error); else request.resolve(result);
  }
  submit(request) {
    if (!this.admissions.has(request) || request.submitted) return;
    if (this.failed) return this.settle(request, this.failed);
    if (this.closing) return this.settle(request, failure('unavailable', 'Core client is closing.'));
    request.submitted = true;
    this.pending.set(request.id, request); this.pendingBytes += request.bytes;
    const bytes = request.buffer; request.buffer = null;
    try { this.child.stdin.write(bytes, error => { if (error) this.fail(failure('unavailable', error.message)); }); }
    catch (error) { this.fail(failure('unavailable', error.message)); }
  }
  fail(error) {
    if (this.failed) return;
    this.failed = error; clearTimeout(this.timer); this.rejectReady(error);
    for (const request of this.admissions) {
      this.settle(request, request.submitted && request.write ? failure('unknown-outcome', 'Core connection lost during a write. Inspect/recover the repository before reapplying the change; it was not replayed.', { cause: error, requestId: request.id }) : error);
    }
    // Stop admission and drain accepted work. Cancellation never kills a helper.
    if (this.child && !this.child.stdin.destroyed) this.child.stdin.end();
  }
  request(operation, options) { return this.#request(operation, options); }
  // Private-main byte adaptation shares request admission and accounting; no
  // caller-side conversion may precede this entrypoint.
  requestBytes(op, bytes, options) { return this.#request({ op, bytes }, options, { value: bytes }); }
  #request(operation, { signal } = {}, byteVector) {
    return new Promise((resolve, reject) => {
      let request;
      try {
        if (this.failed) throw this.failed;
        if (this.closing) throw failure('unavailable', 'Core client is closing.');
        if (signal?.aborted) throw failure('cancelled', 'Core operation cancelled before submission.');
        if (this.admissions.size >= spec.queueCapacity + 1) throw failure('queue-full', 'Core client queue is full.');
        if (this.nextId >= spec.maxRequestId) throw failure('unavailable', 'Core request ID range exhausted; reconnect explicitly.');
        const id = ++this.nextId;
        const cancel = () => {
          if (!request.submitted) this.settle(request, failure('cancelled', 'Core operation cancelled before submission.'));
          else if (!this.failed && !this.closing && this.pending.has(id)) this.child.stdin.write(frame({ kind: 'cancel', id }));
        };
        request = { id, resolve, reject, bytes: 0, started: false, submitted: false,
          cleanup: () => signal?.removeEventListener('abort', cancel) };
        this.admissions.add(request);
        const charge = count => {
          if (this.admittedBytes + count > spec.maxFrameBytes * 2) throw failure('queue-full', 'Core client byte budget is full.');
          this.admittedBytes += count; request.bytes += count;
        };
        // This buffer is the immutable submitted snapshot. Do not decode and
        // re-encode it after ready, or retain the caller's mutable operation.
        request.buffer = serializeWire({ kind: 'request', id, operation }, { charge, framed: true, byteVector });
        request.write = typeof operation === 'object' && operation !== null &&
          ['compareAndSwap', 'recover', 'migrateLegacy'].includes(Object.getOwnPropertyDescriptor(operation, 'op')?.value);
        signal?.addEventListener('abort', cancel, { once: true });
        // Waiting requests live only in admissions. Cancellation can drop their
        // buffer immediately instead of retaining a per-request ready reaction.
        if (this.hello) queueMicrotask(() => this.submit(request));
      } catch (error) {
        if (request) this.settle(request, error); else reject(error);
      }
    });
  }
  async close() {
    this.closing = true;
    for (const request of this.admissions) if (!request.submitted) this.settle(request, failure('unavailable', 'Core client is closing.'));
    if (!this.hello) this.fail(failure('unavailable', 'Core client closed before hello.'));
    if (this.child && !this.child.stdin.destroyed) this.child.stdin.end();
    await this.exited;
  }
}
module.exports = { CoreClient, FrameReader, frame, serializeWire, resourcePaths };
