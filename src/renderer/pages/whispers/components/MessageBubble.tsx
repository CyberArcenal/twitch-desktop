// src/renderer/pages/whispers/components/MessageBubble.tsx
import React from 'react';
import type { WhisperMessage } from '../types';

interface MessageBubbleProps {
  message: WhisperMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2 shadow-md transition-all
          ${isOwn 
            ? 'bg-gradient-to-r from-[#9147ff] to-[#772ce8] text-white rounded-br-sm' 
            : 'bg-[#2a2a2e] text-[#efeff1] rounded-bl-sm'
          }
        `}
      >
        <p className="text-sm break-words leading-relaxed">{message.message}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-[#adadb8]/70'}`}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;