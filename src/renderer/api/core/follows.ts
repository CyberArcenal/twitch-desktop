// src/renderer/api/core/follows.ts
import type { BaseResponse } from './common';

export interface FollowedChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface FollowsResult {
  data: FollowedChannel[];
  total: number;
  timestamp: number;
}

export interface FollowsChanged {
  action: 'follow' | 'unfollow';
  broadcasterId: string;
}

class FollowsAPI {
  async get(userId: string, after?: string | null, forceRefresh?: boolean): Promise<BaseResponse<FollowsResult>> {
    return window.backendAPI.follows({
      method: 'get',
      params: { userId, after, forceRefresh }
    });
  }

  async follow(broadcasterId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.follows({
      method: 'follow',
      params: { broadcasterId }
    });
  }

  async unfollow(broadcasterId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.follows({
      method: 'unfollow',
      params: { broadcasterId }
    });
  }

  async isFollowing(broadcasterId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.follows({
      method: 'isFollowing',
      params: { broadcasterId }
    });
  }

  async getFollowers(userId: string, after?: string): Promise<BaseResponse<any>> {
  return window.backendAPI.follows({
    method: 'getFollowers',
    params: { userId, after }
  });
}

  

  async clearCache(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.follows({ method: 'clearCache' });
  }
}

export const followsAPI = new FollowsAPI();