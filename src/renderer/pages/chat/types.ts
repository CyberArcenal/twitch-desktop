// src/pages/Chat/types.ts
export interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}