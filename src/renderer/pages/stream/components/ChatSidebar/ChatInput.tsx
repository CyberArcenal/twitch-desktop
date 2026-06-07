// src/renderer/pages/stream/components/ChatSidebar/ChatInput.tsx
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, Smile, AlertCircle } from 'lucide-react';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import type { ChatMessage } from '../../../../api/core/chat';

export interface ChatInputRef {
  insertMention: (username: string) => void;
}

interface ChatInputProps {
  onSendMessage: (text: string, replyToId?: string) => Promise<boolean>;
  isConnected: boolean;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  disabled?: boolean;
  disabledReason?: string | null;
}

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  onSendMessage,
  isConnected,
  replyingTo,
  onCancelReply,
  disabled = false,
  disabledReason = null,
}, ref) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, right: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerPortalRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    insertMention: (username: string) => {
      if (disabled) return;
      if (!inputRef.current) return;
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const mention = `@${username} `;
      const newValue = input.slice(0, start) + mention + input.slice(end);
      setInput(newValue);
      setTimeout(() => {
        inputRef.current?.focus();
        const newCursorPos = start + mention.length;
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }));

  const handleSend = async () => {
    if (disabled || !input.trim() || isSending) return;
    setIsSending(true);
    const success = await onSendMessage(input, replyingTo?.id);
    if (success) {
      setInput('');
      onCancelReply();
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const start = inputRef.current?.selectionStart || 0;
    const end = inputRef.current?.selectionEnd || 0;
    const newValue = input.slice(0, start) + emoji + input.slice(end);
    setInput(newValue);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const togglePicker = () => {
    if (disabled) return;
    if (!showEmojiPicker && pickerButtonRef.current) {
      const rect = pickerButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.top - 10,
        right: window.innerWidth - rect.right,
      });
    }
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showEmojiPicker) return;
      const target = event.target as Node;
      const isInsidePicker = pickerPortalRef.current?.contains(target);
      const isInsideButton = pickerButtonRef.current?.contains(target);
      const isInsideContainer = containerRef.current?.contains(target);
      if (!isInsidePicker && !isInsideButton && !isInsideContainer) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const isInputDisabled = !isConnected || isSending || disabled;

  return (
    <div className="p-3 border-t border-[#2a2a2e] bg-[#18181b] relative" ref={containerRef}>
      {replyingTo && (
        <div className="flex items-center justify-between text-xs bg-[#2a2a2e] rounded-md px-2 py-1 mb-2">
          <span className="text-[#adadb8]">
            Replying to <span className="text-white font-medium">{replyingTo.user}</span>
          </span>
          <button onClick={onCancelReply} className="p-0.5 hover:bg-[#3a3a4a] rounded">
            <X className="w-3 h-3 text-[#adadb8]" />
          </button>
        </div>
      )}
      {disabled && disabledReason && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-md px-2 py-1 mb-2">
          <AlertCircle className="w-3 h-3" />
          <span>{disabledReason}</span>
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : (disabled ? "Chat disabled" : "Send a message...")}
            className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#adadb8] focus:outline-none focus:border-[#9147ff] transition-colors disabled:opacity-50 pr-8"
            disabled={isInputDisabled}
          />
          {!disabled && (
            <button
              ref={pickerButtonRef}
              type="button"
              onClick={togglePicker}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#adadb8] hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={isInputDisabled || !input.trim()}
          className="p-2 bg-[#9147ff] rounded-lg hover:bg-[#772ce8] disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>

      {showEmojiPicker && !disabled && createPortal(
        <div ref={pickerPortalRef} className="fixed z-[100]" style={{ bottom: `calc(100vh - ${pickerPosition.top}px)`, right: `${pickerPosition.right}px` }}>
          <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} width={350} height={450} theme={Theme.DARK} lazyLoadEmojis={true} />
        </div>,
        document.body
      )}
    </div>
  );
});

export default ChatInput;