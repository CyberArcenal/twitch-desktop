// src/renderer/api/core/stream-monitor.ts
import type { BaseResponse } from './common';

export interface StreamLiveEvent {
  userName: string;
  gameName: string;
  title: string;
}

class StreamMonitorAPI {
  async start(intervalSeconds: number = 60): Promise<BaseResponse<void>> {
    return window.backendAPI.streamMonitor({
      method: 'start',
      params: { intervalSeconds }
    });
  }

  async stop(): Promise<BaseResponse<void>> {
    return window.backendAPI.streamMonitor({ method: 'stop' });
  }

  async checkNow(): Promise<BaseResponse<void>> {
    return window.backendAPI.streamMonitor({ method: 'checkNow' });
  }
}

export const streamMonitorAPI = new StreamMonitorAPI();