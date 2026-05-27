// src/renderer/api/core/streams.ts
import type { BaseResponse } from './common';

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
  type: 'live' | '';
  language: string;
}

export interface FollowedStreamsResponse {
  data: Stream[];
  pagination?: { cursor: string };
}

class StreamsAPI {
  /**
   * Get all live streams from channels that the current user follows.
   * This uses the Twitch API endpoint: GET /streams/followed?user_id=<user_id>
   */
  async getFollowedStreams(first: number = 100): Promise<BaseResponse<FollowedStreamsResponse>> {
    return window.backendAPI.streams({
      method: 'getFollowedStreams',
      params: { first }
    });
  }

  async getTopStreams(first: number = 100, after?: string): Promise<BaseResponse<FollowedStreamsResponse>> {
  return window.backendAPI.streams({
    method: 'getTopStreams',
    params: { first, after }
  });
}


async getTopStreamsWithFilters(
  first: number = 100,
  after?: string,
  gameId?: string,
  language?: string
): Promise<BaseResponse<FollowedStreamsResponse>> {
  return window.backendAPI.streams({
    method: 'getTopStreamsWithFilters',
    params: { first, after, gameId, language }
  });
}

  /**
   * Get streams by specific user IDs
   */
  async getStreams(userIds: string[], first: number = 100): Promise<BaseResponse<FollowedStreamsResponse>> {
    return window.backendAPI.streams({
      method: 'getStreams',
      params: { userIds, first }
    });
  }

  /**
   * Get a single stream by user login
   */
  async getStreamByUserLogin(login: string): Promise<BaseResponse<Stream | null>> {
    return window.backendAPI.streams({
      method: 'getStreamByUserLogin',
      params: { login }
    });
  }
}

export const streamsAPI = new StreamsAPI();