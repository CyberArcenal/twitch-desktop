// src/renderer/api/core/chat.ts
import type { BaseResponse } from './common';

export interface ChatMessage {
  channel: string;
  user: string;
  message: string;
  badges: any;
  emotes: any;
  timestamp: string;
}

export interface ChatConnected {
  channel: string;
}

export interface ChatUserJoined {
  channel: string;
  user: string;
}

export interface ChatError {
  error: string;
}

class ChatAPI {
  async connect(channelName: string): Promise<BaseResponse<void>> {
    return window.backendAPI.chat({
      method: 'connect',
      params: { channelName }
    });
  }

  async disconnect(): Promise<BaseResponse<void>> {
    return window.backendAPI.chat({ method: 'disconnect' });
  }

  async send(message: string): Promise<BaseResponse<void>> {
    return window.backendAPI.chat({
      method: 'send',
      params: { message }
    });
  }
}

export const chatAPI = new ChatAPI();