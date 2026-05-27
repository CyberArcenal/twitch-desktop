// src/renderer/api/core/picture-in-picture.ts
import type { BaseResponse } from './common';

class PictureInPictureAPI {
  async create(): Promise<BaseResponse<void>> {
    return window.backendAPI.pip({ method: 'create' });
  }

  async setSource(streamUrl: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.pip({
      method: 'setSource',
      params: { streamUrl }
    });
  }

  async close(): Promise<BaseResponse<void>> {
    return window.backendAPI.pip({ method: 'close' });
  }
}

export const pipAPI = new PictureInPictureAPI();