// src/renderer/api/core/whisper.ts
import type { BaseResponse } from './common';

export interface WhisperMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  isFromMe: boolean;
  read: boolean;
}

export interface Conversation {
  userId: string;
  userLogin: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: WhisperMessage[];
}

class WhisperAPI {
  async connect(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.whisper({ method: 'connect' });
  }

  async send(toLogin: string, message: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.whisper({ method: 'send', params: { toLogin, message } });
  }

  async getConversations(): Promise<BaseResponse<Conversation[]>> {
    return window.backendAPI.whisper({ method: 'getConversations' });
  }

  async getMessages(userId: string): Promise<BaseResponse<WhisperMessage[]>> {
    return window.backendAPI.whisper({ method: 'getMessages', params: { userId } });
  }

  async markRead(userId: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.whisper({ method: 'markRead', params: { userId } });
  }
}

export const whisperAPI = new WhisperAPI();