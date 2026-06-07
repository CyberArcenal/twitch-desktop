// src/renderer/api/core/chat.ts
import type { BaseResponse } from "./common";

// src/renderer/api/core/chat.ts
export interface ChatMessage {
  id: string;
  channel: string;
  user: string;
  message: string;
  badges: any;
  emotes: any;
  timestamp: string;
  replyParentMsgId?: string;
  parsedMessage?: Array<{
    type: "text" | "emote";
    text: string;
    name?: string;
    id?: string;
  }>;
  isFromMe?: boolean;
  isPinned?: boolean;
  // new fields:
  isAction?: boolean;       // true for /me messages
  isAnnouncement?: boolean; // true for /announce messages
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
      method: "connect",
      params: { channelName },
    });
  }

  async disconnect(): Promise<BaseResponse<void>> {
    return window.backendAPI.chat({ method: "disconnect" });
  }

  async send(
    message: string,
    replyToMsgId?: string,
  ): Promise<BaseResponse<void>> {
    return window.backendAPI.chat({
      method: "send",
      params: { message, replyParentMsgId: replyToMsgId },
    });
  }

  async getRecentMessages(
    channelName: string,
  ): Promise<BaseResponse<ChatMessage[]>> {
    return window.backendAPI.chat({
      method: "getRecentMessages",
      params: { channelName },
    });
  }
}

export const chatAPI = new ChatAPI();
