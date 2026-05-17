// src/renderer/pages/WatchStreamPage/components/ChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, WifiOff, MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { ChatPanelProps } from '../types';
import clsx from 'clsx';

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    await onSendMessage(inputValue);
    setInputValue('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Desktop Chat Sidebar */}
      <div className={clsx(
        'hidden lg:flex flex-col bg-[var(--bg-elevated)] border-l border-[var(--border-default)] w-96',
        'transition-all duration-300'
      )}>
        <ChatHeader onClose={onClose} />
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
          isSending={isSending}
          inputRef={inputRef}
        />
      </div>

      {/* Mobile Chat Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="absolute bottom-0 left-0 right-0 top-20 bg-[var(--bg-elevated)] rounded-t-2xl shadow-2xl flex flex-col animate-slide-up">
            <ChatHeader onClose={onClose} isMobile />
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} isMobile />
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              onKeyPress={handleKeyPress}
              isSending={isSending}
              inputRef={inputRef}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Mobile Chat Toggle Button */}
      <button
        onClick={onClose}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[var(--twitch-purple)] text-white p-4 rounded-full shadow-lg hover:bg-[var(--twitch-purple-dark)] transition-all duration-200"
        aria-label="Toggle chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  );
};

// Sub-components for better organization
const ChatHeader: React.FC<{ onClose: () => void; isMobile?: boolean }> = ({ onClose, isMobile }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] flex-shrink-0">
    <h3 className="font-semibold text-white">Live Chat</h3>
    {isMobile && (
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors"
      >
        <X className="w-5 h-5 text-[var(--text-secondary)]" />
      </button>
    )}
  </div>
);

const ChatMessages: React.FC<{ 
  messages: any[]; 
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}> = ({ messages, messagesEndRef, isMobile }) => (
  <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
    {messages.map((msg) => (
      <ChatMessage key={msg.id} message={msg} />
    ))}
    <div ref={messagesEndRef} />
  </div>
);

const ChatInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isMobile?: boolean;
}> = ({ value, onChange, onSubmit, onKeyPress, isSending, inputRef, isMobile }) => (
  <form onSubmit={onSubmit} className="p-4 border-t border-[var(--border-default)] flex-shrink-0">
    <div className="flex gap-2">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Send a message..."
        rows={isMobile ? 2 : 1}
        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent text-sm resize-none"
        disabled={isSending}
      />
      <button
        type="submit"
        disabled={!value.trim() || isSending}
        className="px-4 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  </form>
);