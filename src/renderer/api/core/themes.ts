// src/renderer/api/core/themes.ts
import type { BaseResponse } from './common';

type Theme = 'light' | 'dark';

class ThemesAPI {
  async getCurrent(): Promise<BaseResponse<Theme>> {
    return window.backendAPI.themes({ method: 'get' });
  }

  async set(theme: Theme): Promise<BaseResponse<Theme>> {
    return window.backendAPI.themes({
      method: 'set',
      params: { theme }
    });
  }

  async toggle(): Promise<BaseResponse<Theme>> {
    return window.backendAPI.themes({ method: 'toggle' });
  }
}

export const themesAPI = new ThemesAPI();