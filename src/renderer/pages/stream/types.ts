import type { Stream } from "../../api/core/twitch";

// src/renderer/pages/WatchStreamPage/types.ts
export interface StreamWithUser extends Stream {
  user_name: string;
}

export interface ChatMessageType {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  badges?: Record<string, string>;
  color?: string;
}

export interface StreamInfoProps {
  stream: StreamWithUser;
  user: any;
  isFollowing: boolean;
  onFollow: () => void;
  onShare: () => void;
  onMore: () => void;
}

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  currentUser: any;
}