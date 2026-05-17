// src/pages/Chat/index.tsx
import React from "react";
import { useChat } from "./hooks/useChat";
import { ChatHeader } from "./components/ChatHeader";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { LoadingState } from "./components/LoadingState";

const ChatPage: React.FC = () => {
  const {
    messages,
    messageInput,
    setMessageInput,
    loading,
    messagesEndRef,
    sendMessage,
    handleKeyPress,
  } = useChat();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList
        messages={messages}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
      />
      <ChatInput
        value={messageInput}
        onChange={setMessageInput}
        onSend={sendMessage}
        onKeyPress={handleKeyPress}
        disabled={!messageInput.trim()}
      />
    </div>
  );
};

export default ChatPage;