export type RecordData = Record<string, unknown>;
export type DesktopOperation =
  | "interface-settings"
  | "set-theme"
  | "list-themes"
  | "set-language"
  | "load-config"
  | "installation"
  | "choose-installation"
  | "pick-path"
  | "read-document"
  | "write-file"
  | "read-bytes"
  | "scan-library"
  | "read-project"
  | "replace-character"
  | "update-mapping"
  | "read-media"
  | "replace-media"
  | "open-media"
  | "open-path"
  | "load-skins"
  | "choose-skin"
  | "remove-skin"
  | "open-skins"
  | "choose-background"
  | "save-picture"
  | "ready"
  | "confirm-close"
  | "new-window"
  | "confirm"
  | "clone-ai"
  | "create-ai"
  | "update-ai"
  | "castle-destination"
  | "add-castle"
  | "replace-portrait"
  | "check-update"
  | "update-sources"
  | "set-update-source"
  | "prepare-update"
  | "install-update"
  | "document-ready"
  | "protect-close"
  | "developer-tools";
export type GameOperation =
  | "buildings"
  | "resource-icons"
  | "balance"
  | "maps"
  | "map"
  | "tiles"
  | "units";
export type LanguageSettings = { theme: string; language: string };
export type DocumentResult = {
  path: string;
  source?: string;
  document?: RecordData;
  content?: string;
  sourceBase64?: string;
  sourceBytes?: Uint8Array;
};
export type SaveRequest = {
  path?: string;
  content: string | RecordData;
  kind?: string;
  defaultPath?: string;
  sourcePath?: string;
  sourceBytes?: Uint8Array;
  unchanged?: boolean;
};
export type Listener = (payload?: unknown) => void;
declare global {
  interface Window {
    electronAPI: Record<string, unknown>;
    toolkitI18n: {
      ready: Promise<unknown>;
      t: (key: string, args?: RecordData) => string;
      languages: { id?: string; code?: string; name: string }[];
      locale: string;
    };
    ToolkitTheme: {
      list(): { id: string; name: string }[];
      select(id: string): Promise<unknown>;
      refresh?(): Promise<void>;
    };
    appWorkspace: { setStatus(message: string): void };
    castleShortcuts: { accelerator(key: string): string | undefined };
    unsavedChanges: { confirmAll(action: string): Promise<boolean> };
    castleFormat: {
      classicIssues(document: RecordData, constants: RecordData): string[];
      stringify(document: RecordData): string;
    };
  }
}
