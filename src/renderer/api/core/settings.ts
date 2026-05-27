// src/renderer/api/core/settings.ts
import type { BaseResponse } from "./common";

export interface TwitchTokens {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  login?: string;
}

export interface Settings {
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  autoPlay: boolean;
  chatFilters: string[];
  twitch: TwitchTokens;
}

class SettingsAPI {
  async get(key: string): Promise<BaseResponse<any>> {
    return window.backendAPI.settings({
      method: "get",
      params: { key },
    });
  }

  async set(key: string, value: any): Promise<BaseResponse<boolean>> {
    return window.backendAPI.settings({
      method: "set",
      params: { key, value },
    });
  }

  async getAll(): Promise<BaseResponse<Settings>> {
    return window.backendAPI.settings({ method: "getAll" });
  }

  async addChatFilter(word: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.settings({
      method: "addChatFilter",
      params: { word },
    });
  }

  async removeChatFilter(word: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.settings({
      method: "removeChatFilter",
      params: { word },
    });
  }

  async reset(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.settings({ method: "reset" });
  }

  async testNotification(type: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.settings({
      method: "testNotification",
      params: { type },
    });
  }
}

export const settingsAPI = new SettingsAPI();
