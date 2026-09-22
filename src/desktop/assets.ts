import { convertFileSrc } from '@tauri-apps/api/core';
import { rpc, game } from './runtime';
export const loadedSkins = async () => {
  const files: Record<string, string> = await (
    await fetch('../assets/aiv/skin-manifest.json')
  ).json();
  const result = await rpc<{ skins: Record<string, string>; customSkinTypes: string[] }>(
    'load-skins',
  );
  const local = await game<{ sprites?: Record<string, { path: string }> }>('units').catch(() => ({
    sprites: {},
  }));
  const skins: Record<string, string> = {};
  for (const [id, file] of Object.entries(files))
    skins[id] = new URL('../assets/aiv/skins/' + file, location.href).href;
  const sprites: Record<string, { path: string }> = local.sprites || {};
  for (const [id, value] of Object.entries(sprites)) skins[id] = convertFileSrc(value.path);
  return { ...result, skins: { ...skins, ...result.skins } };
};
export function assetUrls(value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('file:')) {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname).replace(/^\/([A-Z]:)/i, '$1');
    return convertFileSrc(url.host ? '//' + url.host + path : path);
  }
  if (Array.isArray(value)) return value.map(assetUrls);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, assetUrls(child)]));
  return value;
}
