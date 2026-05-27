import type { BaseResponse } from './common';

export interface ChatSettings {
  slow_mode: boolean;
  slow_mode_wait_time: number;
  follower_mode: boolean;
  follower_mode_duration: number;
  non_moderator_chat_delay: boolean;
  non_moderator_chat_delay_duration: number;
  emote_mode: boolean;
}

class ChatSettingsAPI {
  async get(broadcasterId: string, moderatorId: string): Promise<BaseResponse<ChatSettings>> {
    return window.backendAPI.chat({
      method: 'getChatSettings',
      params: { broadcasterId, moderatorId }
    });
  }

  async update(broadcasterId: string, moderatorId: string, settings: Partial<ChatSettings>): Promise<BaseResponse<ChatSettings>> {
    return window.backendAPI.chat({
      method: 'updateChatSettings',
      params: { broadcasterId, moderatorId, settings }
    });
  }
}

export const chatSettingsAPI = new ChatSettingsAPI();