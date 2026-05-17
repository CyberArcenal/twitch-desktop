import React, { useState } from 'react';
import { MessageSquare, Ban, Clock, Filter } from 'lucide-react';
import Button from '../UI/Button';

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  isModerator?: boolean;
}

interface ChatPanelProps {
  messages?: ChatMessage[];
  onBan?: (userId: string) => void;
  onTimeout?: (userId: string, seconds: number) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages = [],
  onBan,
  onTimeout
}) => {
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showModerationOptions, setShowModerationOptions] = useState(false);

  const mockMessages: ChatMessage[] = [
    { id: '1', author: 'User1', text: 'Great stream!', timestamp: new Date(), isModerator: false },
    { id: '2', author: 'Mod1', text: 'Chat rules apply', timestamp: new Date(), isModerator: true },
    { id: '3', author: 'User2', text: 'Thanks for streaming', timestamp: new Date(), isModerator: false },
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  return (
    <div className="windows-card p-6 flex flex-col space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare size={20} />
          Chat & Moderation
        </h2>
        <button
          onClick={() => setFilterEnabled(!filterEnabled)}
          className={`p-2 rounded transition-colors ${
            filterEnabled ? 'bg-[var(--brand-color)] text-white' : 'hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 bg-[var(--bg-elevated)] rounded p-4 min-h-[250px]">
        {displayMessages.map((msg) => (
          <div key={msg.id} className="group hover:bg-[var(--bg-base)] p-2 rounded transition-colors">
            <div className="flex items-start gap-2">
              <span
                className={`font-semibold text-sm cursor-pointer hover:underline ${
                  msg.isModerator ? 'text-[var(--brand-color)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {msg.author}
              </span>
              <span className="text-sm text-white flex-1 break-words">{msg.text}</span>
              <button
                onClick={() => {
                  setSelectedUser(msg.author);
                  setShowModerationOptions(true);
                }}
                className="hidden group-hover:block text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                ⋮
              </button>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {/* Moderation Options */}
      {showModerationOptions && selectedUser && (
        <div className="border-t border-[var(--bg-secondary)] pt-4 space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Moderating: <span className="text-white font-semibold">{selectedUser}</span></p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onBan?.(selectedUser);
                setShowModerationOptions(false);
              }}
              icon={Ban}
              iconPosition="left"
              className="flex-1"
            >
              Ban
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onTimeout?.(selectedUser, 600);
                setShowModerationOptions(false);
              }}
              icon={Clock}
              iconPosition="left"
              className="flex-1"
            >
              10m Timeout
            </Button>
          </div>
          <button
            onClick={() => setShowModerationOptions(false)}
            className="text-xs text-[var(--text-secondary)] hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
