/** Tauri adapter for the editor's existing desktop contract. No Node runtime. */
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { rpc, game, tr, on, state, reportError } from './runtime';
import { createMenus } from './menus';
import {
  loadConfig,
  decodeDocument,
  encodeCastle,
  save,
  open,
  imageDialog,
  toBase64,
  fromBase64,
} from './documents';
import { assetUrls, loadedSkins } from './assets';
import { portraitPng } from './portraits';
import type { RecordData, SaveRequest, DocumentResult, LanguageSettings, Listener } from './types';
if ('__TAURI_INTERNALS__' in window) {
  const menus = createMenus();
  const api = {
    checkReleaseUpdate: async (force = false) => {
      const result = await rpc<RecordData>('check-update', { force });
      if (result.error) reportError(result.error);
      return result;
    },
    listUpdateSources: () => rpc('update-sources'),
    setUpdateSource: (repo: string) => rpc('set-update-source', { repo }),
    prepareReleaseUpdate: (key: string) => rpc('prepare-update', { key }),
    installReleaseUpdate: () => rpc('install-update'),
    getInterfaceSettings: () => rpc<LanguageSettings>('interface-settings'),
    setTheme: (theme: string) => rpc<LanguageSettings>('set-theme', { theme }),
    listThemes: async () => {
      const packs = await rpc<{ id: string; name: string; path: string }[]>('list-themes');
      return packs.map((pack) => ({ ...pack, baseUrl: convertFileSrc(pack.path) + '/' }));
    },
    setLanguage: (language: string) => rpc<LanguageSettings>('set-language', { language }),
    onThemeChanged: (fn: Listener) => on('theme-changed', fn),
    onLanguageChanged: (fn: Listener) => on('language-changed', fn),
    loadConfig,
    openFile: open,
    saveFile: (
      content: SaveRequest['content'],
      kind = 'json',
      defaultPath?: string,
      options: Partial<SaveRequest> = {},
    ) => save({ content, kind, defaultPath, ...options }),
    quickSaveFile: save,
    getWindowChrome: async () => ({ integrated: true }),
    showTitlebarMenu: async (request: { menu: string; x: number; y: number }) =>
      menus.showMenu(request),
    setDialogProject: async (root: string | null) => {
      state.projectRoot = root;
    },
    getUcpInstallation: () => rpc('installation'),
    chooseUcpInstallation: () =>
      rpc('choose-installation', { title: tr('native:choose_game'), directory: true }),
    loadGameBuildingAssets: async () => assetUrls(await game('buildings')),
    readResourceIcons: () => game('resource-icons'),
    readInstalledBalance: () => game('balance'),
    listGameMaps: () => game('maps'),
    loadGameMap: async (path: string) => assetUrls(await game('map', { path })),
    loadMapTiles: async (path: string) => assetUrls(await game('tiles', { path })),
    loadAivSkins: loadedSkins,
    openAivSkinsFolder: () => rpc('open-skins'),
    chooseAivSkin: (itemType: number) =>
      rpc('choose-skin', {
        itemType,
        dialog: { defaultPath: state.projectRoot, filters: [{ name: 'PNG', extensions: ['png'] }] },
      }),
    removeAivSkin: (itemType: number) => rpc('remove-skin', { itemType }),
    chooseCastleBackground: () => rpc('choose-background', imageDialog()),
    saveCastlePicture: (png: string) =>
      rpc('save-picture', {
        png,
        dialog: {
          save: true,
          defaultPath: state.projectRoot ? state.projectRoot + '/Castle.png' : 'Castle.png',
          filters: [{ name: 'PNG', extensions: ['png'] }],
        },
      }),
    scanUcpAiLibrary: (gameRoot: string) => rpc('scan-library', { gameRoot }),
    loadUcpAiProject: async (request: RecordData) => {
      const project = await rpc<RecordData>('read-project', request);
      if (project.castle) project.castle = decodeDocument(project.castle as DocumentResult);
      return project;
    },
    updateAiCastleMapping: (request: RecordData) => rpc('update-mapping', request),
    cloneUcpAi: (request: RecordData) => rpc('clone-ai', request),
    createUcpAi: async (request: RecordData) => {
      const content = {
        pauseDelayAmount: 100,
        frames: [{ itemType: 61, tilePositionOfsets: [5643], shouldPause: false }],
        miscItems: [],
      };
      const portrait = async (size: number) => {
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#26343b';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#e2bf78';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${size / 3}px sans-serif`;
        ctx.fillText('AI', size / 2, size / 2);
        return toBase64(
          new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()),
        );
      };
      return rpc('create-ai', {
        ...request,
        characterContent: JSON.stringify(await loadConfig('template.json'), null, 2),
        castleBase64: toBase64(await encodeCastle({ content })),
        portraitBase64: await portrait(72),
        portraitSmallBase64: await portrait(36),
      });
    },
    updateUcpAi: async (request: RecordData) => {
      const castleBase64 = request.castleDocument
        ? toBase64(
            await encodeCastle({
              content: request.castleDocument as RecordData,
              sourceBytes: request.castleSourceBytes as Uint8Array,
              unchanged: request.castleUnchanged === true,
            }),
          )
        : null;
      const saved = await rpc<RecordData>('update-ai', { ...request, castleBase64 });
      if (typeof saved.savedCastleBase64 === 'string') {
        saved.savedCastleSourceBytes = fromBase64(saved.savedCastleBase64);
        delete saved.savedCastleBase64;
      }
      return saved;
    },
    addAiDocument: async (request: RecordData) => {
      if (request.kind === 'character') return rpc('replace-character', request);
      let fileName = String(request.suggestedFileName || request.sourcePath || '')
        .split(/[\\/]/)
        .pop()
        ?.replace(/\.aivjson$/i, '.aiv');
      if (!fileName) {
        const path = await rpc<string | null>('pick-path', {
          save: true,
          defaultPath: String(request.aiRoot) + '/aiv/New Castle.aiv',
          filters: [{ name: tr('native:castle_files'), extensions: ['aiv'] }],
        });
        if (!path) return null;
        fileName = path.split(/[\\/]/).pop();
      }
      if (!fileName) return null;
      if (!/\.aiv$/i.test(fileName)) fileName += '.aiv';
      const info = await rpc<{ path: string; exists: boolean }>('castle-destination', {
        ...request,
        fileName,
      });
      let overwrite =
        info.path.replaceAll('\\', '/').toLowerCase() ===
        String(request.sourcePath || '')
          .replaceAll('\\', '/')
          .toLowerCase();
      if (info.exists && !overwrite) {
        const choice = await rpc('confirm', {
          title: tr('common:actions.replace'),
          message: tr('native:replace_castle', { name: fileName }),
          choices: [
            tr('common:actions.replace'),
            tr('common:actions.cancel'),
            tr('common:actions.cancel'),
          ],
          values: ['replace', 'cancel', 'cancel'],
        });
        if (choice !== 'replace') return null;
        overwrite = true;
      }
      const bytes = await encodeCastle({
        content: request.document as RecordData,
        sourcePath: request.sourcePath as string,
        sourceBytes: request.sourceBytes as Uint8Array,
        unchanged: request.unchanged === true,
      });
      const saved = await rpc<RecordData>('add-castle', {
        ...request,
        fileName,
        overwrite,
        castleBase64: toBase64(bytes),
      });
      return { ...saved, sourceBytes: bytes };
    },
    chooseAiPortrait: async (request: RecordData) => {
      const selected = await rpc<{ dataUrl: string } | null>('choose-background', imageDialog());
      if (!selected) return null;
      const size = request.kind === 'portraitSmall' ? 36 : 72;
      return rpc('replace-portrait', {
        ...request,
        base64: toBase64(await portraitPng(selected.dataUrl, size)),
      });
    },
    loadAiMediaData: (request: RecordData) => rpc('read-media', request),
    replaceAiMedia: (request: RecordData) =>
      rpc('replace-media', {
        ...request,
        dialog: {
          defaultPath: state.projectRoot,
          filters: [
            {
              name: request.kind === 'speech' ? 'WAV' : 'Bink',
              extensions: [request.kind === 'speech' ? 'wav' : 'bik'],
            },
          ],
        },
      }),
    openAiMedia: (request: RecordData) => rpc('open-media', request),
    openUcpPath: (request: RecordData) => rpc('open-path', request),
    confirmWindowClose: () => rpc('confirm-close'),
    openNewWindow: () => rpc('new-window'),
    loadFileInNewWindow: async (kind = 'json') => {
      const result = await open(kind);
      if (!result) return null;
      const label = await rpc<string>('new-window');
      await invoke('queue_document', {
        label,
        payload: {
          ...result,
          sourceBytes: result.sourceBytes ? Array.from(result.sourceBytes) : null,
          kind,
        },
      });
      return true;
    },
    setActiveWorkspace: (name: string) => {
      state.workspace = name;
    },
    setCastleOverviewPreferences: (preferences: RecordData) => {
      state.overview = preferences;
    },
    setCastleShortcuts: (bindings: Record<string, string[]>) => {
      state.castleBindings = bindings;
    },
    setCastleShortcutCapture: (active: boolean) => {
      state.shortcutCapture = active;
    },
    confirmUnsaved: async (details: { documentName?: string; action?: string } = {}) =>
      rpc('confirm', {
        title: tr('native:unsaved_title'),
        message: tr('native:unsaved_message', {
          name: details.documentName || tr('native:document'),
          action: details.action || tr('native:continue'),
        }),
        choices: [tr('common:actions.save'), tr('native:discard'), tr('common:actions.cancel')],
        values: ['save', 'discard', 'cancel'],
      }),
    chooseAiDocumentAction: (request: RecordData) =>
      rpc('confirm', {
        title: tr('native:add_to_ai'),
        message: tr(
          request.kind === 'castle'
            ? request.operation === 'new'
              ? 'native:new_castle_message'
              : 'native:add_castle_message'
            : request.operation === 'new'
              ? 'native:new_character_message'
              : 'native:replace_character_message',
          { name: request.aiName },
        ),
        choices: [
          tr('native:add_to_ai'),
          tr('native:edit_separately'),
          tr('common:actions.cancel'),
        ],
        values: ['project', 'separate', 'cancel'],
      }),
  };
  const events: Record<string, string> = {
    onLoadFile: 'load-file',
    onTriggerLoad: 'trigger-load',
    onTriggerNewDocument: 'trigger-new-document',
    onTriggerSave: 'trigger-save',
    onTriggerSaveAs: 'trigger-save-as',
    onTriggerNewWindow: 'trigger-new-window',
    onTriggerLoadInWindow: 'trigger-load-in-window',
    onTriggerToggleOx: 'trigger-toggle-ox',
    onTriggerToggleRunning: 'trigger-toggle-running',
    onTriggerStandardOrder: 'trigger-set-standard-order',
    onTriggerOrderedOrder: 'trigger-set-ordered-order',
    onTriggerToggleSections: 'trigger-toggle-section',
    onTriggerWorkspace: 'trigger-workspace',
    onTriggerUndo: 'trigger-undo',
    onTriggerRedo: 'trigger-redo',
    onTriggerDeleteSelected: 'trigger-delete-selected',
    onTriggerLoadCastleBackground: 'trigger-load-castle-background',
    onTriggerClearCastleBackground: 'trigger-clear-castle-background',
    onTriggerEditCastleMapping: 'trigger-edit-castle-mapping',
    onTriggerCustomizeCastleShortcuts: 'trigger-customize-castle-shortcuts',
    onTriggerCastleOverview: 'trigger-castle-overview',
    onRequestWindowClose: 'request-window-close',
    onFocusTitlebarMenu: 'focus-titlebar-menu',
    onUpdateSourceChanged: 'update-source-changed',
  };
  window.electronAPI = {
    ...api,
    ...Object.fromEntries(
      Object.entries(events).map(([method, channel]) => [
        method,
        (fn: Listener) => on(channel, fn),
      ]),
    ),
  };

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      void rpc('ready');
    },
    { once: true },
  );
}
