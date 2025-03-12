/**
 * Type definitions for Chrome Extension API
 */

export interface ChromeStorageArea {
  get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
  set(items: object, callback?: () => void): void;
  remove(keys: string | string[], callback?: () => void): void;
  clear(callback?: () => void): void;
}

export interface ChromeStorage {
  local: ChromeStorageArea;
  sync: ChromeStorageArea;
  session: ChromeStorageArea;
  onChanged: {
    addListener(callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void): void;
    removeListener(callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void): void;
  };
}

export interface ChromeTab {
  id?: number;
  windowId?: number;
  url?: string;
  title?: string;
  active?: boolean;
  index?: number;
}

export interface ChromeWindow {
  id?: number;
  tabs?: ChromeTab[];
  focused?: boolean;
  incognito?: boolean;
  type?: string;
  state?: string;
  alwaysOnTop?: boolean;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

export interface ChromeWindowCreateOptions {
  url?: string | string[];
  tabId?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  focused?: boolean;
  incognito?: boolean;
  type?: 'normal' | 'popup' | 'panel' | 'detached_panel';
  state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
}

export interface ChromeWindows {
  create(createData: ChromeWindowCreateOptions, callback?: (window: ChromeWindow) => void): void;
  get(windowId: number, callback: (window: ChromeWindow) => void): void;
  getAll(getInfo: object, callback: (windows: ChromeWindow[]) => void): void;
  getAll(callback: (windows: ChromeWindow[]) => void): void;
  getCurrent(callback: (window: ChromeWindow) => void): void;
  remove(windowId: number, callback?: () => void): void;
  update(windowId: number, updateInfo: object, callback?: (window: ChromeWindow) => void): void;
}

export interface ChromeAction {
  onClicked: {
    addListener(callback: (tab: ChromeTab) => void): void;
    removeListener(callback: (tab: ChromeTab) => void): void;
  };
}

export interface ChromeMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

export interface ChromeMessageSender {
  tab?: ChromeTab;
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
}

export interface ChromeManifest {
  manifest_version: number;
  name: string;
  version: string;
  description?: string;
  oauth2?: {
    client_id: string;
    scopes: string[];
  };
  [key: string]: any;
}

export interface ChromeRuntime {
  lastError?: {
    message?: string;
  };
  onInstalled: {
    addListener(callback: (details: { reason: string; previousVersion?: string; id?: string }) => void): void;
    removeListener(callback: (details: { reason: string; previousVersion?: string; id?: string }) => void): void;
  };
  onMessage: {
    addListener(callback: (message: ChromeMessage, sender: ChromeMessageSender, sendResponse: (response?: any) => void) => boolean | void): void;
    removeListener(callback: (message: ChromeMessage, sender: ChromeMessageSender, sendResponse: (response?: any) => void) => boolean | void): void;
  };
  onConnect: {
    addListener(callback: (port: any) => void): void;
    removeListener(callback: (port: any) => void): void;
  };
  sendMessage(message: ChromeMessage, responseCallback?: (response: any) => void): void;
  getURL(path: string): string;
  getManifest(): ChromeManifest;
}

export interface ChromeSidePanel {
  setOptions(options: { path?: string; enabled?: boolean }): void;
  open(options?: { windowId?: number }): void;
}

export interface ChromeIdentity {
  getRedirectURL(): string;
  launchWebAuthFlow(options: { url: string; interactive: boolean }, callback: (responseUrl?: string) => void): void;
  getAuthToken(options: { interactive: boolean }, callback: (token?: string) => void): void;
  removeCachedAuthToken(options: { token: string }, callback?: () => void): void;
}

export interface Chrome {
  storage: ChromeStorage;
  runtime: ChromeRuntime;
  sidePanel?: ChromeSidePanel;
  action: ChromeAction;
  windows: ChromeWindows;
  identity: ChromeIdentity;
}

declare global {
  const chrome: Chrome;
}

export {};
