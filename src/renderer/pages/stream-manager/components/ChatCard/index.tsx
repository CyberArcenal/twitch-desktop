// src/renderer/pages/stream-manager/components/ChatCard.tsx
import React, { useState, useRef } from "react";
import { Send, Trash2, Pin, PinOff, Reply, X } from "lucide-react";
import ChatMessageItem from "./ChatMessageItem";
import { useChat } from "../../hooks/useChat";
import type { ChatMessage } from "../../../../api/core/chat";

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
    sendMessage,
    clearChatMessages,
    mentionUser,
    banUser,
    timeoutUser,
    pinMessage,
    unpinMessage,
    deleteMessage,
  } = useChat(channelName, broadcasterId, isLive);

  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine pinned + normal messages
  const displayedMessages = [
    ...pinnedMessages.map((msg) => ({ ...msg, isPinned: true })),
    ...messages.filter((msg) => !pinnedMessages.some((p) => p.id === msg.id)),
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    let success = false;
    if (replyingTo) {
      success = await sendMessage(input, replyingTo.id);
    } else {
      success = await sendMessage(input);
    }
    if (success) {
      setInput("");
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReplyClick = (msg: ChatMessage) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => setReplyingTo(null);

  const handleMention = (username: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const mention = `@${username} `;
    const newValue = input.slice(0, start) + mention + input.slice(end);
    setInput(newValue);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        start + mention.length,
        start + mention.length,
      );
    }, 0);
  };

  // Auto-scroll on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, pinnedMessages]);

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

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displayedMessages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onReplyClick={handleReplyClick}
            onMentionClick={handleMention}
            onPinClick={pinMessage}
            onUnpinClick={unpinMessage}
            onDeleteClick={deleteMessage}
            onBanClick={banUser}
            onTimeoutClick={timeoutUser}
            currentUser={""} // will be set inside useChat? Actually useChat returns currentUser but not exposed. We'll expose it.
            isLive={isLive}
            isPinned={msg.isPinned}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[#2a2a2e]">
        {replyingTo && (
          <div className="flex items-center justify-between text-xs bg-[#2a2a2e] rounded-md px-2 py-1 mb-2">
            <span className="text-[#adadb8]">
              Replying to{" "}
              <span className="text-white font-medium">{replyingTo.user}</span>
            </span>
            <button
              onClick={handleCancelReply}
              className="p-0.5 hover:bg-[#3a3a4a] rounded"
            >
              <X className="w-3 h-3 text-[#adadb8]" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              replyingTo
                ? `Reply to @${replyingTo.user}...`
                : connected
                  ? "Send a message..."
                  : "Connecting..."
            }
            disabled={!connected}
            className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded px-2 py-1 text-sm text-white placeholder-[#adadb8] disabled:opacity-50 focus:outline-none focus:border-[#9147ff]"
          />
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            className="p-1 bg-[#9147ff] rounded hover:bg-[#772ce8] disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-xs text-[#adadb8] text-center mt-2">
          {!connected && isLive ? "Connecting..." : "Hover message to interact"}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
