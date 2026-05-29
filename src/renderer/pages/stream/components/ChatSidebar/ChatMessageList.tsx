import React, { type RefObject } from 'react';
import ChatMessageItem from './ChatMessageItem';
import type { ChatMessage } from '../../../../api/core/chat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  filterMessage: (msg: string) => boolean;
  isConnected: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onReplyClick: (messageId: string) => void;
  onMentionClick: (username: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  filterMessage,
  isConnected,
  messagesEndRef,
  onReplyClick,
  onMentionClick,
}) => {
  const filteredMessages = messages.filter(msg => filterMessage(msg.message));

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-1 custom-scrollbar">
      {!isConnected && (
        <p className="text-center text-[#adadb8] text-sm py-4">
          Connecting to chat...
        </p>
      )}
      {filteredMessages.map((msg, idx) => (
        <ChatMessageItem
          key={idx}
          message={msg}
          onReplyClick={onReplyClick}
          onMentionClick={onMentionClick}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;