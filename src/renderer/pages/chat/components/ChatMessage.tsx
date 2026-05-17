// src/pages/Chat/components/ChatMessage.tsx
import React from "react";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  if (message.isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-[var(--bg-overlay)] text-[var(--text-secondary)] text-sm italic px-3 py-2 rounded text-center max-w-[80%]">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-[var(--twitch-purple)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {message.author.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-[var(--text-primary)]">
            {message.author}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-[var(--text-secondary)] break-words">
          {message.message}
        </div>
      </div>
    </div>
  );
};