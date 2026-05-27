// src/renderer/api/core/eventsub.ts
import type { BaseResponse } from './common';

export interface StreamOnlineEvent {
  broadcasterId: string;
  broadcasterName: string;
  title: string;
  gameId: string;
  startedAt: string;
}

export interface FollowEvent {
  followerId: string;
  followerName: string;
  followedAt: string;
  broadcasterId: string;
}

export interface SubscriptionEvent {
  userId: string;
  userName: string;
  tier: string;
  isGift: boolean;
  broadcasterId: string;
}

export interface EventSubConnected {
  sessionId: string;
}

class EventSubAPI {
  async start(): Promise<BaseResponse<void>> {
    return window.backendAPI.eventsub({ method: 'start' });
  }

  async stop(): Promise<BaseResponse<void>> {
    return window.backendAPI.eventsub({ method: 'stop' });
  }

  async subscribeStream(userId: string): Promise<BaseResponse<any>> {
    return window.backendAPI.eventsub({
      method: 'subscribeStream',
      params: { userId }
    });
  }

  async subscribeFollows(userId: string): Promise<BaseResponse<any>> {
    return window.backendAPI.eventsub({
      method: 'subscribeFollows',
      params: { userId }
    });
  }

  async subscribeSubscriptions(userId: string): Promise<BaseResponse<any>> {
    return window.backendAPI.eventsub({
      method: 'subscribeSubscriptions',
      params: { userId }
    });
  }
}

export const eventsubAPI = new EventSubAPI();