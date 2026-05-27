import React from 'react';
import type { Conversation } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelect: (conv: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedUserId, onSelect }) => {
  return (
    <div className="h-full border-r border-[var(--border-color)] bg-[var(--card-bg)]">
      <div className="p-3 border-b border-[var(--border-color)]">
        <h2 className="font-semibold text-[var(--sidebar-text)]">Whispers</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {conversations.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] p-4 text-sm">No conversations yet</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.userId}
              onClick={() => onSelect(conv)}
              className={`p-3 border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-hover-bg)] transition ${selectedUserId === conv.userId ? 'bg-[var(--primary-color)]/10' : ''}`}
            >
              <div className="flex justify-between">
                <span className="font-medium text-[var(--sidebar-text)]">{conv.userName}</span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {formatDistanceToNow(new Date(conv.lastTimestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">{conv.lastMessage}</p>
              {conv.unreadCount > 0 && (
                <span className="inline-block mt-1 bg-[var(--primary-color)] text-white text-xs rounded-full px-2 py-0.5">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;