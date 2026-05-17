// src/pages/Chat/components/EmptyState.tsx
import React from "react";
import { MessageCircle } from "lucide-react";

export const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <MessageCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
      <p className="text-[var(--text-secondary)]">
        No messages yet. Start chatting!
      </p>
    </div>
  </div>
);