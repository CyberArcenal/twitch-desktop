import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Send, X } from 'lucide-react';
import type { ChatMessage } from '../../../../api/core/chat';

export interface ChatInputRef {
  insertMention: (username: string) => void;
}

interface ChatInputProps {
  onSendMessage: (text: string, replyToId?: string) => Promise<boolean>;
  isConnected: boolean;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
}

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  onSendMessage,
  isConnected,
  replyingTo,
  onCancelReply,
}, ref) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    insertMention: (username: string) => {
      if (!inputRef.current) return;
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const mention = `@${username} `;
      const newValue = input.slice(0, start) + mention + input.slice(end);
      setInput(newValue);
      // Set cursor position after the inserted mention
      setTimeout(() => {
        inputRef.current?.focus();
        const newCursorPos = start + mention.length;
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }));

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
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

  return (
    <div className="p-3 border-t border-[#2a2a2e] bg-[#18181b]">
      {replyingTo && (
        <div className="flex items-center justify-between text-xs bg-[#2a2a2e] rounded-md px-2 py-1 mb-2">
          <span className="text-[#adadb8]">
            Replying to <span className="text-white font-medium">{replyingTo.user}</span>
          </span>
          <button
            onClick={onCancelReply}
            className="p-0.5 hover:bg-[#3a3a4a] rounded transition-colors"
            aria-label="Cancel reply"
          >
            <X className="w-3 h-3 text-[#adadb8]" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : "Send a message..."}
          className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#adadb8] focus:outline-none focus:border-[#9147ff] transition-colors disabled:opacity-50"
          disabled={!isConnected || isSending}
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || isSending || !input.trim()}
          className="p-2 bg-[#9147ff] rounded-lg hover:bg-[#772ce8] disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
});

export default ChatInput;