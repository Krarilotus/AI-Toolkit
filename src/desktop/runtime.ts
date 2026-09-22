/** Shared desktop transport and window-local state; no editor document state. */
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { Listener, RecordData, DesktopOperation, GameOperation } from './types';

export const state = {
  workspace: 'ucp',
  projectRoot: null as string | null,
  shortcutCapture: false,
  overview: {} as RecordData,
  castleBindings: {} as Record<string, string[]>,
};

export function tr(key: string, args?: RecordData) {
  return window.toolkitI18n.t(key, args);
}

export function reportError(error: unknown): never {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    const details = error as { code: string; arguments?: RecordData; details?: string };
    throw new Error(
      tr(details.code, details.arguments) + (details.details ? '\n' + details.details : ''),
    );
  }
  throw error instanceof Error ? error : new Error(String(error));
}

export function rpc<T = unknown>(operation: DesktopOperation, payload: unknown = {}): Promise<T> {
  return invoke<T>('desktop_request', { request: { operation, payload } }).catch(reportError);
}

export function game<T = unknown>(operation: GameOperation, payload: unknown = {}): Promise<T> {
  return invoke<T>('game_request', { operation, payload }).catch(reportError);
}

const callbacks = new Map<string, Set<Listener>>();

export function dispatch(channel: string, data?: unknown) {
  callbacks.get(channel)?.forEach((callback) => callback(data));
}

export function on(channel: string, callback: Listener) {
  if (!callbacks.has(channel)) {
    callbacks.set(channel, new Set());
    // Global listeners also receive explicitly targeted Tauri events. Scope the
    // listener as well as the native emitter; broadcasts still reach all windows.
    void getCurrentWebviewWindow().listen(channel, (event) => dispatch(channel, event.payload)).then(() => {
      if (channel === 'load-file') void rpc('document-ready');
      if (channel === 'request-window-close') void rpc('protect-close');
    });
  }
  // The legacy preload has one document consumer, even if it is re-registered.
  if (channel === 'load-file') callbacks.get(channel)!.clear();
  callbacks.get(channel)!.add(callback);
  return () => callbacks.get(channel)?.delete(callback);
}
