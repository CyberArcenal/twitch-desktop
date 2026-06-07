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
    <div className="flex flex-col h-full bg-[#1f1f23] overflow-hidden chat-sidebar-container">
      <style>{`
        .chat-sidebar-container {
          overflow-x: hidden !important;
        }
        .chat-sidebar-container * {
          max-width: 100%;
          word-break: break-word;
        }
        /* Force all images to be small and inline */
        .chat-sidebar-container img {
          max-height: 20px !important;
          width: auto !important;
          display: inline-block !important;
          vertical-align: middle !important;
        }
        /* Hide broken images */
        .chat-sidebar-container img:not([src]),
        .chat-sidebar-container img[src=""],
        .chat-sidebar-container img[src^="http"]:not([src*="static-cdn.jtvnw.net"]) {
          display: none !important;
        }
        /* Remove extra line spacing */
        .chat-sidebar-container .message-row {
          line-height: 1.3;
        }
        /* Ensure text wraps */
        .chat-sidebar-container .message-text {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        /* Custom scrollbar */
        .chat-sidebar-container ::-webkit-scrollbar {
          width: 6px;
        }
        .chat-sidebar-container ::-webkit-scrollbar-track {
          background: #1f1f23;
        }
        .chat-sidebar-container ::-webkit-scrollbar-thumb {
          background: #3a3a4a;
          border-radius: 3px;
        }
        .chat-sidebar-container ::-webkit-scrollbar-thumb:hover {
          background: #5a5a6e;
        }
      `}</style>
      
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