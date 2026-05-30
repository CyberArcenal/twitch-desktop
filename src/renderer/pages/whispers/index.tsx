// src/renderer/pages/whispers/index.tsx
import React from "react";
import { useWhispers } from "./hooks/useWhispers";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";

const WhispersPage: React.FC = () => {
  const {
    conversations,
    selectedConv,
    messages,
    loading,
    sending,
    selectConversation,
    sendMessage,
  } = useWhispers();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading whispers..." />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0e0e10] overflow-hidden">
      {/* Conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-[#2a2a2e] bg-gradient-to-b from-[#1f1f2b] to-[#18181b]">
        <ConversationList
          conversations={conversations}
          selectedUserId={selectedConv?.userId || null}
          onSelect={selectConversation}
        />
      </div>
      {/* Chat area */}
      <div className="flex-1 bg-[#1f1f23]">
        {selectedConv ? (
          <ChatWindow
            recipientName={selectedConv.userName}
            recipientLogin={selectedConv.userLogin}
            messages={messages}
            onSend={(msg) => sendMessage(selectedConv.userLogin, msg)}
            sending={sending}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#0e0e10] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#adadb8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">No conversation selected</h3>
            <p className="text-sm text-[#adadb8] mt-1">Choose a whisper from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhispersPage;