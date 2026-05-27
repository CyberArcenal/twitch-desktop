import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import type { WhisperMessage } from '../types';

interface ChatWindowProps {
  recipientName: string;
  messages: WhisperMessage[];
  onSend: (message: string) => void;
  sending: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientName, messages, onSend, sending }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-full bg-[var(--card-bg)]">
      <div className="p-3 border-b border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--sidebar-text)]">Whisper to {recipientName}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] mt-10">No messages yet. Send a whisper!</div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.isFromMe} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border-color)] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message @${recipientName}...`}
          className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        />
        <button type="submit" disabled={sending || !input.trim()} className="bg-[var(--primary-color)] text-white p-2 rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;