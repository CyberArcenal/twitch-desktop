// src/renderer/pages/stream/components/ChatSidebar/ChatMessageList.tsx
import React, { useRef, useEffect } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import ChatMessageItem from "./ChatMessageItem";
import type { ChatMessage } from "../../../../api/core/chat";

interface ChatMessageListProps {
  messages: ChatMessage[];
  filterMessage: (msg: string) => boolean;
  isConnected: boolean;
  onReplyClick: (messageId: string) => void;
  onMentionClick: (username: string) => void;
  autoScrollPaused: boolean;
  currentUser: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  filterMessage,
  isConnected,
  onReplyClick,
  onMentionClick,
  autoScrollPaused,
  currentUser,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const filteredMessages = messages.filter((msg) => filterMessage(msg.message));
  const prevLengthRef = useRef(filteredMessages.length);

  // Auto-scroll to bottom only when NOT paused
  useEffect(() => {
    if (
      !autoScrollPaused &&
      filteredMessages.length > prevLengthRef.current &&
      virtuosoRef.current
    ) {
      virtuosoRef.current.scrollToIndex({
        index: filteredMessages.length - 1,
        behavior: "smooth",
      });
    }
    prevLengthRef.current = filteredMessages.length;
  }, [filteredMessages.length, autoScrollPaused]);

  if (!isConnected) {
    return (
      <div className="text-center text-[#adadb8] text-sm py-4">
        Connecting to chat...
      </div>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="text-center text-[#adadb8] text-sm py-4">
        No messages yet
      </div>
    );
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={filteredMessages}
      itemContent={(index, msg) => (
        <ChatMessageItem
          message={msg}
          onReplyClick={onReplyClick}
          onMentionClick={onMentionClick}
          currentUser={currentUser}
        />
      )}
      style={{ height: "100%" }}
    />
  );
};

export default ChatMessageList;
