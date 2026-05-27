// src/renderer/api/core/user.ts
import type { BaseResponse } from './common';

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export interface Subscription {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  gifter_id?: string;
  gifter_login?: string;
  gifter_name?: string;
  tier: string;
  is_gift: boolean;
}

export interface BadgesResult {
  global: any[];
  channel: any[];
}

class UserAPI {
  async getCurrentUser(): Promise<BaseResponse<TwitchUser | null>> {
    return window.backendAPI.user({ method: 'getCurrentUser' });
  }

  async getUserById(userId: string): Promise<BaseResponse<TwitchUser | null>> {
    return window.backendAPI.user({
      method: 'getUserById',
      params: { userId }
    });
  }

  async getUserByName(login: string): Promise<BaseResponse<TwitchUser | null>> {
    return window.backendAPI.user({
      method: 'getUserByName',
      params: { login }
    });
  }

  async getUserSubscriptions(): Promise<BaseResponse<Subscription[]>> {
    return window.backendAPI.user({ method: 'getUserSubscriptions' });
  }

  async getUserBadges(userId: string): Promise<BaseResponse<BadgesResult>> {
    return window.backendAPI.user({
      method: 'getUserBadges',
      params: { userId }
    });
  }
}

export const userAPI = new UserAPI();