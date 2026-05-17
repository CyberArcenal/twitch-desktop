// src/pages/Chat/components/ChatInput.tsx
import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled,
}) => (
  <div className="px-6 py-4 border-t border-[var(--border-default)]">
    <div className="flex gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type a message... (Shift+Enter for new line)"
        rows={2}
        className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent resize-none"
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className="px-4 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  </div>
);