// src/renderer/types/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
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

      // ---------- Settings ----------
      getSettings: () => Promise<any>;
      setSetting: (key: string, value: any) => Promise<void>;
      addChatFilter: (word: string) => Promise<void>;
      removeChatFilter: (word: string) => Promise<void>;
      resetSettings: () => Promise<void>;

      // ---------- Auth ----------
      login: () => Promise<{
        accessToken: string;
        userId: string;
        login: string;
      }>;
      logout: () => Promise<void>;
      isLoggedIn: () => Promise<boolean>;
      getCurrentUser: () => Promise<any>;

      // ---------- Twitch API ----------
      getTwitchUser: () => Promise<any>;
      getFollowedChannels: (userId: string, after?: string) => Promise<any>;
      getStreams: (userIds: string[]) => Promise<any>;
      searchChannels: (query: string) => Promise<any>;
      getChannelInfo: (broadcasterId: string) => Promise<any>;

      // ---------- Chat ----------
      connectChat: (channel: string) => Promise<void>;
      sendChatMessage: (message: string) => Promise<void>;
      disconnectChat: () => Promise<void>;

      // ---------- Event listeners ----------
      onChatMessage: (callback: (data: any) => void) => () => void;
      onChatConnected: (callback: (data: any) => void) => () => void;
      onUserJoined: (callback: (data: any) => void) => () => void;

      notifyAppReady?: () => void;

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
    };
  }
}
