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

/**
 * Subscription object returned by Twitch API
 * (list of users who subscribe to the authenticated channel)
 */
export interface Subscription {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  gifter_id?: string;
  gifter_login?: string;
  gifter_name?: string;
  tier: string;           // '1000' = Tier 1, '2000' = Tier 2, '3000' = Tier 3
  is_gift: boolean;
  plan_name?: string;
  // Subscriber info (the user who is subscribed)
  user_id: string;
  user_login: string;
  user_name: string;
}

/**
 * Twitch‑style cursor‑based pagination (used by getUserSubscriptions)
 */
export interface TwitchPaginatedResult<T> {
  data: T[];
  pagination?: {
    cursor: string;
  };
}

/**
 * Badges result – matches what user.js returns:
 * { global: [], channel: [] }
 */
export interface BadgesResult {
  global: any[];   // global badges
  channel: any[];  // channel‑specific badges
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

  /**
   * Returns the list of subscribers for the authenticated user's channel.
   * Response uses Twitch's cursor pagination, not page/limit/total.
   */
  async getUserSubscriptions(): Promise<BaseResponse<TwitchPaginatedResult<Subscription>>> {
    const results = await window.backendAPI.user({ method: 'getUserSubscriptions' });
    console.log('Fetched subscriptions:', results);
    return results;
  }

  async getUserBadges(userId: string): Promise<BaseResponse<BadgesResult>> {
    return window.backendAPI.user({
      method: 'getUserBadges',
      params: { userId }
    });
  }
}

export const userAPI = new UserAPI();