// src/renderer/api/core/watch-later.ts
import type { BaseResponse } from './common';

export interface WatchLaterItem {
  id: string;
  type: 'stream' | 'vod' | 'clip';
  channelName: string;
  title: string;
  thumbnail: string;
  url: string;
  addedAt: string;
}

class WatchLaterAPI {
  async getAll(): Promise<BaseResponse<WatchLaterItem[]>> {
    return window.backendAPI.watchLater({ method: 'getAll' });
  }

  async add(item: Omit<WatchLaterItem, 'addedAt'>): Promise<BaseResponse<boolean>> {
    return window.backendAPI.watchLater({ method: 'add', params: { item } });
  }

  async remove(id: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.watchLater({ method: 'remove', params: { id } });
  }

  async reorder(items: WatchLaterItem[]): Promise<BaseResponse<boolean>> {
    return window.backendAPI.watchLater({ method: 'reorder', params: { items } });
  }

  async clear(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.watchLater({ method: 'clear' });
  }

  async markAsWatched(id: string): Promise<BaseResponse<WatchLaterItem | null>> {
    return window.backendAPI.watchLater({ method: 'markAsWatched', params: { id } });
  }
}

export const watchLaterAPI = new WatchLaterAPI();