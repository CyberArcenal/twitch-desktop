// src/renderer/api/core/clips.ts
import type { BaseResponse } from './common';

export interface Clip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
}

export interface PaginatedClips {
  data: Clip[];
  pagination?: { cursor: string };
}

class ClipsAPI {
  async getClips(broadcasterId: string, first: number = 20): Promise<BaseResponse<PaginatedClips>> {
    return window.backendAPI.clips({
      method: 'getClips',
      params: { broadcasterId, first }
    });
  }

  async getClip(clipId: string): Promise<BaseResponse<Clip | null>> {
    return window.backendAPI.clips({
      method: 'getClip',
      params: { clipId }
    });
  }

  async getTopClips(gameId?: string, period: 'day' | 'week' | 'month' | 'all' = 'week', first: number = 20): Promise<BaseResponse<PaginatedClips>> {
    return window.backendAPI.clips({
      method: 'getTopClips',
      params: { gameId, period, first }
    });
  }
}

export const clipsAPI = new ClipsAPI();