// src/renderer/pages/WatchStreamPage/components/ChatMessage.tsx
import React from 'react';
import type { ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, isOwnMessage }) => {
  const isSystem = message.author === 'System';
  
  if (isSystem) {
    return (
      <div className="px-3 py-2 text-center">
        <p className="text-xs text-[var(--text-tertiary)] italic">
          {message.message}
        </p>
      </div>
    );
  }

  return (
    <div className={`group px-3 py-2 hover:bg-[var(--bg-overlay)] transition-colors rounded-lg ${
      isOwnMessage ? 'bg-[var(--twitch-purple-bg)]' : ''
    }`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span 
          className="font-semibold text-sm hover:underline cursor-pointer"
          style={{ color: message.color || 'var(--text-primary)' }}
        >
          {message.author}
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] break-words leading-relaxed">
        {message.message}
      </p>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';