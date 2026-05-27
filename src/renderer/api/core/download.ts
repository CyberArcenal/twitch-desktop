// src/renderer/api/core/download.ts
import type { BaseResponse } from './common';

export interface DownloadOptions {
  outputDir?: string;
}

class DownloadAPI {
  async download(vodUrl: string, options?: DownloadOptions): Promise<BaseResponse<boolean>> {
    return window.backendAPI.download({
      method: 'download',
      params: { vodUrl, options }
    });
  }

  async cancel(): Promise<BaseResponse<void>> {
    return window.backendAPI.download({ method: 'cancel' });
  }
}

export const downloadAPI = new DownloadAPI();