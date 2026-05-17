// src/pages/Chat/components/MessageList.tsx
import React from "react";
import { ChatMessage } from "./ChatMessage";
import { EmptyState } from "./EmptyState";
import  type { ChatMessage as ChatMessageType } from "../types";

interface MessageListProps {
  messages: ChatMessageType[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};