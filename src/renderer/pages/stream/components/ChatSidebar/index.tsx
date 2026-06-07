// src/renderer/pages/stream/components/ChatSidebar/index.tsx
import React, { useState, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatFilterPanel from "./ChatFilterPanel";
import ChatMessageList from "./ChatMessageList";
import ChatInput, { type ChatInputRef } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatFilters } from "./hooks/useChatFilters";
import type { ChatMessage } from "../../../../api/core/chat";

interface ChatSidebarProps {
  channelName: string;
  isConnected: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ channelName, isConnected }) => {
  const { messages, sendMessage, currentUser, chatDisabled, timeoutRemaining } = useChatMessages(isConnected);
  const { filters, showFilters, addFilter, removeFilter, toggleFilters, filterMessage, clearAllFilters } = useChatFilters();
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const chatInputRef = useRef<ChatInputRef>(null);

  const handleReplyClick = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) setReplyingTo(msg);
  };
  const handleCancelReply = () => setReplyingTo(null);
  const handleMentionClick = (username: string) => chatInputRef.current?.insertMention(username);
  const toggleAutoScroll = () => setAutoScrollPaused((prev) => !prev);

  let disabledReason = null;
  if (chatDisabled) {
    if (timeoutRemaining) {
      disabledReason = `You are timed out for ${timeoutRemaining} seconds`;
    } else {
      disabledReason = `You are banned from this channel`;
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1f1f23] overflow-hidden">
      <ChatHeader
        onToggleFilters={toggleFilters}
        autoScrollPaused={autoScrollPaused}
        onToggleAutoScroll={toggleAutoScroll}
        filtersCount={filters.length}
      />
      {showFilters && (
        <ChatFilterPanel
          filters={filters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
        />
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessageList
          messages={messages}
          filterMessage={filterMessage}
          isConnected={isConnected}
          onReplyClick={handleReplyClick}
          onMentionClick={handleMentionClick}
          autoScrollPaused={autoScrollPaused}
          currentUser={currentUser}
        />
      </div>
      <ChatInput
        ref={chatInputRef}
        onSendMessage={sendMessage}
        isConnected={isConnected}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        disabled={chatDisabled}
        disabledReason={disabledReason}
      />
    </div>
  );
};

export default ChatSidebar;