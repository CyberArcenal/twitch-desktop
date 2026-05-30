import React, { useState, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatFilterPanel from './ChatFilterPanel';
import ChatMessageList from './ChatMessageList';
import ChatInput, { type ChatInputRef } from './ChatInput';
import { useChatMessages } from './hooks/useChatMessages';
import { useChatFilters } from './hooks/useChatFilters';
import type { ChatMessage } from '../../../../api/core/chat';

interface ChatSidebarProps {
  channelName: string;
  isConnected: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ channelName, isConnected }) => {
  const { messages, sendMessage } = useChatMessages(isConnected);
  const { filters, showFilters, addFilter, removeFilter, toggleFilters, filterMessage } = useChatFilters();
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const chatInputRef = useRef<ChatInputRef>(null);

  const handleReplyClick = (messageId: string) => {
    const messageToReply = messages.find(m => m.id === messageId);
    if (messageToReply) setReplyingTo(messageToReply);
  };

  const handleCancelReply = () => setReplyingTo(null);
  const handleMentionClick = (username: string) => chatInputRef.current?.insertMention(username);
  const toggleAutoScroll = () => setAutoScrollPaused(prev => !prev);

  return (
    <div className="flex flex-col h-full bg-[#1f1f23] overflow-hidden">
      <ChatHeader
        onToggleFilters={toggleFilters}
        autoScrollPaused={autoScrollPaused}
        onToggleAutoScroll={toggleAutoScroll}
      />
      {showFilters && (
        <ChatFilterPanel
          filters={filters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
        />
      )}
      {/* This div takes remaining space and provides a height context for Virtuoso */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessageList
          messages={messages}
          filterMessage={filterMessage}
          isConnected={isConnected}
          onReplyClick={handleReplyClick}
          onMentionClick={handleMentionClick}
          autoScrollPaused={autoScrollPaused}
        />
      </div>
      <ChatInput
        ref={chatInputRef}
        onSendMessage={sendMessage}
        isConnected={isConnected}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
};

export default ChatSidebar;