// components/ChatCard.tsx
import React, { useState } from 'react';
import { Send, Ban, Clock, Trash2 } from 'lucide-react';
import { useChatMessages } from '../../stream/components/ChatSidebar/hooks/useChatMessages';
import { useModeration } from '../hooks/useModeration';

interface ChatCardProps {
  channelName?: string;
  isLive: boolean;
}

const ChatCard: React.FC<ChatCardProps> = ({ channelName, isLive }) => {
  const { messages, messagesEndRef, sendMessage } = useChatMessages(isLive && !!channelName);
  const { banUser, timeoutUser, clearChat } = useModeration(channelName || '');
  const [input, setInput] = useState('');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl shadow-lg border border-[#2a2a2e] flex flex-col h-full min-h-[300px]">
      <div className="p-3 border-b border-[#2a2a2e] flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">My Chat</h3>
        <button onClick={clearChat} className="text-red-400 text-xs hover:text-red-300">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="group relative hover:bg-[#2a2a2e]/50 p-1 rounded"
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
          >
            <div className="flex gap-1">
              <span className="font-semibold text-white">{msg.user}:</span>
              <span className="text-[#efeff1] break-words">{msg.message}</span>
            </div>
            {hoveredMsgId === msg.id && isLive && (
              <div className="absolute right-0 top-0 flex gap-1 bg-[#1f1f23] p-0.5 rounded shadow">
                <button onClick={() => timeoutUser(msg.user, 600)} className="text-yellow-400 hover:text-yellow-300">
                  <Clock className="w-3 h-3" />
                </button>
                <button onClick={() => banUser(msg.user)} className="text-red-400 hover:text-red-300">
                  <Ban className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-[#2a2a2e]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLive ? "Send a message..." : "Chat only when live"}
            disabled={!isLive}
            className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded px-2 py-1 text-sm text-white placeholder-[#adadb8] disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={!isLive} className="p-1 bg-[#9147ff] rounded hover:bg-[#772ce8] disabled:opacity-50">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-xs text-[#adadb8] text-center mt-2">
          Animated Emotes can be disabled in Settings
        </div>
      </div>
    </div>
  );
};

export default ChatCard;