import React from 'react';
import type { WhisperMessage } from '../types';

interface MessageBubbleProps {
  message: WhisperMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${isOwn ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)]'}`}>
        <p className="text-sm break-words">{message.message}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>{time}</p>
      </div>
    </div>
  );
};

export default MessageBubble;