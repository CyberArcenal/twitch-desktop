// src/renderer/api/core/search.ts
import type { BaseResponse } from './common';
import type { Game } from './games';
import type { Stream } from './games';
import type { TwitchUser } from './user';

export interface SearchResult {
  channels: TwitchUser[];
  streams: Stream[];
  games: Game[];
}

class SearchAPI {
  async searchChannels(query: string, limit: number = 20): Promise<BaseResponse<{ data: TwitchUser[]; total: number }>> {
    return window.backendAPI.search({
      method: 'searchChannels',
      params: { query, limit }
    });
  }

  async searchStreams(query: string, limit: number = 20): Promise<BaseResponse<{ data: Stream[]; total: number }>> {
    return window.backendAPI.search({
      method: 'searchStreams',
      params: { query, limit }
    });
  }

  async searchGames(query: string, limit: number = 20): Promise<BaseResponse<{ data: Game[]; total: number }>> {
    return window.backendAPI.search({
      method: 'searchGames',
      params: { query, limit }
    });
  }

  async searchAll(query: string, limitPerType: number = 10): Promise<BaseResponse<SearchResult>> {
    return window.backendAPI.search({
      method: 'searchAll',
      params: { query, limitPerType }
    });
  }
}

export const searchAPI = new SearchAPI();