// src/renderer/pages/stream-manager/components/ChatCard.tsx
import React from "react";
import { Send, Ban, Clock, Trash2, AtSign, Pin, PinOff } from "lucide-react";
import { useChat } from "../hooks/useChat";

interface ChatCardProps {
  channelName?: string;
  broadcasterId?: string;
  isLive: boolean;
}

const ChatCard: React.FC<ChatCardProps> = ({
  channelName,
  broadcasterId,
  isLive,
}) => {
  const {
    messages,
    pinnedMessages,
    input,
    setInput,
    connected,
    hoveredMsgId,
    setHoveredMsgId,
    messagesEndRef,
    inputRef,
    sendMessage,
    clearChatMessages,
    mentionUser,
    banUser,
    timeoutUser,
    pinMessage,
    unpinMessage,
    deleteMessage,
  } = useChat(channelName, broadcasterId, isLive);

  // Combine pinned + normal messages, pinned on top
  const displayedMessages = [
    ...pinnedMessages.map(msg => ({ ...msg, isPinned: true })),
    ...messages.filter(msg => !pinnedMessages.some(p => p.id === msg.id))
  ];

  const handleSend = () => sendMessage();
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl shadow-lg border border-[#2a2a2e] flex flex-col h-full min-h-[300px]">
      <div className="p-3 border-b border-[#2a2a2e] flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">
          My Chat {connected ? "🟢" : "🔴"}
        </h3>
        <button
          onClick={clearChatMessages}
          className="text-red-400 text-xs hover:text-red-300"
          title="Clear all messages"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
        {displayedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`group relative hover:bg-[#2a2a2e]/50 p-1 rounded ${msg.isPinned ? 'bg-[#2a2a2e]/30 border-l-2 border-yellow-500' : ''}`}
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
          >
            <div className="flex gap-1">
              <button
                onClick={() => mentionUser(msg.user)}
                className={`font-semibold ${msg.isFromMe ? "text-[#9147ff]" : "text-white"} hover:underline`}
              >
                {msg.user}:
              </button>
              <span className="text-[#efeff1] break-words">{msg.message}</span>
            </div>
            {hoveredMsgId === msg.id && (
              <div className="absolute right-0 top-0 flex gap-1 bg-[#1f1f23] p-0.5 rounded shadow z-10">
                {!msg.isFromMe && isLive && (
                  <>
                    <button
                      onClick={() => timeoutUser(msg.user, 600)}
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Timeout 10 minutes"
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => banUser(msg.user)}
                      className="text-red-400 hover:text-red-300"
                      title="Ban user"
                    >
                      <Ban className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => mentionUser(msg.user)}
                  className="text-blue-400 hover:text-blue-300"
                  title="Mention"
                >
                  <AtSign className="w-3 h-3" />
                </button>
                {/* Pin / Unpin */}
                {msg.isPinned ? (
                  <button
                    onClick={() => unpinMessage(msg.id)}
                    className="text-yellow-400 hover:text-yellow-300"
                    title="Unpin message"
                  >
                    <PinOff className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => pinMessage(msg)}
                    className="text-gray-400 hover:text-yellow-400"
                    title="Pin message"
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                )}
                {/* Delete (local removal) */}
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="text-red-400 hover:text-red-300"
                  title="Delete from view"
                >
                  <Trash2 className="w-3 h-3" />
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Send a message..." : "Connecting to chat..."}
            disabled={!connected}
            className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded px-2 py-1 text-sm text-white placeholder-[#adadb8] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!connected}
            className="p-1 bg-[#9147ff] rounded hover:bg-[#772ce8] disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-xs text-[#adadb8] text-center mt-2">
          {!connected && isLive ? "Connecting..." : "Hover message to pin/delete, @ to mention"}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;