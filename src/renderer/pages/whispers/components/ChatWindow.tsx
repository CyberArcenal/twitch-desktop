// src/renderer/pages/whispers/components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import MessageBubble from './MessageBubble';
import type { WhisperMessage } from '../types';

interface ChatWindowProps {
  recipientName: string;
  recipientLogin: string;
  messages: WhisperMessage[];
  onSend: (message: string) => void;
  sending: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientName, recipientLogin, messages, onSend, sending }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const fetchAvatar = async () => {
      const { userAPI } = await import('../../../api/core/user');
      const res = await userAPI.getUserByName(recipientLogin);
      if (res.status && res.data?.profile_image_url) {
        setAvatarUrl(res.data.profile_image_url);
      }
    };
    fetchAvatar();
  }, [recipientLogin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !sending) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with avatar */}
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a2e] bg-gradient-to-r from-[#1f1f23] to-[#18181b]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={recipientName} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9147ff]/30" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#2a2a2e] flex items-center justify-center">
            <User className="w-5 h-5 text-[#adadb8]" />
          </div>
        )}
        <div>
          <h3 className="font-bold text-white">{recipientName}</h3>
          <p className="text-xs text-[#adadb8]">@{recipientLogin}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-[#0e0e10] flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-[#adadb8]" />
            </div>
            <p className="text-sm text-[#adadb8]">No messages yet</p>
            <p className="text-xs text-[#adadb8]/60 mt-1">Send a whisper to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.isFromMe} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#2a2a2e] bg-[#1f1f23]/50">
        <div className="flex gap-2 bg-[#0e0e10] rounded-xl border border-[#2a2a2e] focus-within:border-[#9147ff] transition-colors p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message @${recipientName}...`}
            className="flex-1 bg-transparent px-3 py-2 text-white placeholder-[#adadb8] focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-[#9147ff] text-white p-2 rounded-lg hover:bg-[#772ce8] disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;