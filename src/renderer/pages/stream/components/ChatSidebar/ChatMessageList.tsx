// src/renderer/pages/stream/components/ChatSidebar/ChatMessageList.tsx
import React, { useRef, useEffect } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import ChatMessageItem from "./ChatMessageItem";
import type { ChatMessage } from "../../../../api/core/chat";
import { Loader2 } from "lucide-react";

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

  // Auto-scroll logic
  useEffect(() => {
    if (
      !autoScrollPaused &&
      filteredMessages.length > prevLengthRef.current &&
      virtuosoRef.current
    ) {
      virtuosoRef.current.scrollToIndex({
        index: filteredMessages.length - 1,
        behavior: "auto",
      });
    }
    prevLengthRef.current = filteredMessages.length;
  }, [filteredMessages.length, autoScrollPaused]);

  // Loading state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#adadb8] overflow-x-hidden">
        <Loader2 className="w-6 h-6 animate-spin text-[#9147ff] mb-2" />
        <span className="text-sm">Connecting to chat...</span>
      </div>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#adadb8] text-sm overflow-x-hidden">
        No messages yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-hidden">
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
        style={{ height: "100%", overflowX: "hidden" }}
      />
    </div>
  );
};

export default ChatMessageList;