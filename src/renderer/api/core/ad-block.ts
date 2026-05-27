// src/renderer/api/core/ad-block.ts
import type { BaseResponse } from './common';

class AdBlockAPI {
  async adStart(): Promise<BaseResponse<void>> {
    return window.backendAPI.adBlock({ method: 'adStart' });
  }

  async adEnd(): Promise<BaseResponse<void>> {
    return window.backendAPI.adBlock({ method: 'adEnd' });
  }

  async isAdActive(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.adBlock({ method: 'isAdActive' });
  }
}

export const adBlockAPI = new AdBlockAPI();