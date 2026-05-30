// src/renderer/types/global.d.ts
export {};

declare global {
  interface Window {
    backendAPI: {
      // ---------- Window Controls ----------
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      getWindowState: () => Promise<{
        isMaximized: boolean;
        isMinimized: boolean;
      }>;
      onWindowMaximized: (callback: () => void) => () => void;
      onWindowRestored: (callback: () => void) => () => void;
      onWindowMinimized: (callback: () => void) => () => void;

      // Sa interface Window.backendAPI
      player: (payload: any) => Promise<any>;
      notification: (payload: any) => Promise<any>;
      auth: (payload: any) => Promise<any>;
      chat: (payload: any) => Promise<any>;
      streamMonitor: (payload: any) => Promise<any>;
      follows: (payload: any) => Promise<any>;
      notification: (payload: any) => Promise<any>;
      settings: (payload: any) => Promise<any>;
      games: (payload: any) => Promise<any>;
      user: (payload: any) => Promise<any>;
      clips: (payload: any) => Promise<any>;
      eventsub: (payload: any) => Promise<any>;
      history: (payload: any) => Promise<any>;
      shortcut: (payload: any) => Promise<any>;

      themes: (payload: any) => Promise<any>;
      adBlock: (payload: any) => Promise<any>;
      pip: (payload: any) => Promise<any>;
      download: (payload: any) => Promise<any>;
      predictions: (payload: any) => Promise<any>;
      search: (payload: any) => Promise<any>;
      streams: (payload: any) => Promise<any>;
      watchLater: (payload: any) => Promise<any>;
      whisper: (payload: any) => Promise<any>;
      notificationStore: (payload: any) => Promise<any>;
      streamSettings: (payload: any) => Promise<any>;

      notifyAppReady?: () => void;
      openExternal: (url: string) => Promise<void>;
      openDashboard: (url: string) => Promise<void>;

      appInfo: () => Promise<any>;

      // 🆕 Updater API (invoke)
      updater: (payload: { method: string; params?: any }) => Promise<{
        status: boolean;
        message: string;
        data: any;
      }>;

      // 🎧 Generic event listener (returns cleanup function)
      on: (
        channel: string,
        callback: (event: any, ...args: any[]) => void,
      ) => () => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
