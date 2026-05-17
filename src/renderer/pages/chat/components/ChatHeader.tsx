// src/pages/Chat/components/ChatHeader.tsx
import React from "react";
import { MessageCircle } from "lucide-react";

export const ChatHeader: React.FC = () => (
  <div className="px-6 py-4 border-b border-[var(--border-default)]">
    <div className="flex items-center gap-2">
      <MessageCircle className="w-6 h-6 text-[var(--twitch-purple)]" />
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Chat</h1>
    </div>
    <p className="text-sm text-[var(--text-secondary)] mt-1">
      Standalone chat interface
    </p>
  </div>
);