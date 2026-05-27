// src/renderer/api/core/history.ts
import type { BaseResponse } from './common';

export interface HistoryEntry {
  id: string;
  type: 'stream' | 'vod';
  channelName: string;
  vodId: string | null;
  title: string | null;
  thumbnail: string | null;
  watchedAt: string;
  duration: number | null;
}

class HistoryAPI {
  async add(entry: Omit<HistoryEntry, 'id'>): Promise<BaseResponse<HistoryEntry>> {
    return window.backendAPI.history({
      method: 'add',
      params: { entry }
    });
  }

  async get(limit: number = 50): Promise<BaseResponse<HistoryEntry[]>> {
    return window.backendAPI.history({
      method: 'get',
      params: { limit }
    });
  }

  async clear(): Promise<BaseResponse<void>> {
    return window.backendAPI.history({ method: 'clear' });
  }

  async remove(id: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.history({
      method: 'remove',
      params: { id }
    });
  }

  async removeChannel(channelName: string): Promise<BaseResponse<number>> {
    return window.backendAPI.history({
      method: 'removeChannel',
      params: { channelName }
    });
  }

  async exists(type: 'stream' | 'vod', identifier: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.history({
      method: 'exists',
      params: { type, identifier }
    });
  }
}

export const historyAPI = new HistoryAPI();