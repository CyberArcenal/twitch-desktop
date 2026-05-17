// Settings API - wrapper for electron-store

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  autoPlay: boolean;
  chatFilters: string[];
  twitch: {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    login?: string;
  };
}

class SettingsAPI {
  /**
   * Get all settings
   */
  async getAll(): Promise<AppSettings> {
    try {
      if (!window.electronAPI?.getSettings) {
        throw new Error("Electron API (settings) not available");
      }
      return await window.electronAPI.getSettings();
    } catch (error: any) {
      throw new Error(error.message || "Failed to get settings");
    }
  }

  /**
   * Get a single setting by key
   * @param key - Setting key
   */
  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    try {
      const all = await this.getAll();
      return all[key];
    } catch (error: any) {
      throw new Error(error.message || `Failed to get setting "${key}"`);
    }
  }

  /**
   * Set a single setting
   * @param key - Setting key
   * @param value - New value
   */
  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    try {
      if (!window.electronAPI?.setSetting) {
        throw new Error("Electron API (settings) not available");
      }
      await window.electronAPI.setSetting(key, value);
    } catch (error: any) {
      throw new Error(error.message || `Failed to set setting "${key}"`);
    }
  }

  /**
   * Add a word to chat filters (block list)
   * @param word - Word or phrase to filter
   */
  async addChatFilter(word: string): Promise<void> {
    try {
      if (!window.electronAPI?.addChatFilter) {
        throw new Error("Electron API (settings) not available");
      }
      await window.electronAPI.addChatFilter(word);
    } catch (error: any) {
      throw new Error(error.message || "Failed to add chat filter");
    }
  }

  /**
   * Remove a word from chat filters
   * @param word - Word or phrase to remove
   */
  async removeChatFilter(word: string): Promise<void> {
    try {
      if (!window.electronAPI?.removeChatFilter) {
        throw new Error("Electron API (settings) not available");
      }
      await window.electronAPI.removeChatFilter(word);
    } catch (error: any) {
      throw new Error(error.message || "Failed to remove chat filter");
    }
  }

  /**
   * Reset all settings to defaults
   */
  async reset(): Promise<void> {
    try {
      if (!window.electronAPI?.resetSettings) {
        throw new Error("Electron API (settings) not available");
      }
      await window.electronAPI.resetSettings();
    } catch (error: any) {
      throw new Error(error.message || "Failed to reset settings");
    }
  }
}

const settingsAPI = new SettingsAPI();
export default settingsAPI;