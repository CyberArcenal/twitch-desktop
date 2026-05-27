import React from 'react';
import { useWhispers } from './hooks/useWhispers';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';

const WhispersPage: React.FC = () => {
  const { conversations, selectedConv, messages, loading, sending, selectConversation, sendMessage } = useWhispers();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]" /></div>;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedUserId={selectedConv?.userId || null}
          onSelect={selectConversation}
        />
      </div>
      <div className="flex-1">
        {selectedConv ? (
          <ChatWindow
            recipientName={selectedConv.userName}
            messages={messages}
            onSend={(msg) => sendMessage(selectedConv.userLogin, msg)}
            sending={sending}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
            Select a conversation to start whispering
          </div>
        )}
      </div>
    </div>
  );
};

export default WhispersPage;