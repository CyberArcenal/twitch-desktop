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