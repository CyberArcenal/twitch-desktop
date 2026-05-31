// src/renderer/pages/stream-manager/components/ChatMessageItem.tsx
import React, { memo } from "react";
import { Ban, Clock, AtSign, Pin, PinOff, Trash2, Reply } from "lucide-react";
import type { ChatMessage } from "../../../../api/core/chat";

// Badge component (simple version)
const Badge: React.FC<{ name: string; version: string; imageUrl?: string }> = ({
  name,
  version,
  imageUrl,
}) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        title={`${name} ${version}`}
        className="inline-block h-4 w-auto align-middle mr-0.5"
        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
      />
    );
  }
  // Fallback text
  return (
    <span
      className="text-[10px] text-[#adadb8] bg-[#2a2a2e] px-1 rounded mr-0.5"
      title={name}
    >
      {name}
    </span>
  );
};

// Highlight mentions
const highlightMentions = (text: string): React.ReactNode => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-[#9147ff] font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

// Render message content with emotes
const renderMessageContent = (message: ChatMessage): React.ReactNode => {
  if (message.parsedMessage && message.parsedMessage.length > 0) {
    return message.parsedMessage.map((part: any, idx: number) => {
      if (part.type === "emote") {
        const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${part.id}/3.0`;
        return (
          <img
            key={idx}
            src={emoteUrl}
            alt={part.name || "emote"}
            className="inline-block align-middle h-5 w-auto my-[-2px] mx-0.5"
            loading="lazy"
          />
        );
      }
      return <span key={idx}>{highlightMentions(part.text)}</span>;
    });
  }
  return highlightMentions(message.message);
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface ChatMessageItemProps {
  message: ChatMessage;
  onReplyClick: (msg: ChatMessage) => void;
  onMentionClick: (username: string) => void;
  onPinClick: (msg: ChatMessage) => void;
  onUnpinClick: (msgId: string) => void;
  onDeleteClick: (msgId: string) => void;
  onBanClick?: (username: string) => void;
  onTimeoutClick?: (username: string, duration: number) => void;
  currentUser: string;
  isLive: boolean;
  isPinned?: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(
  ({
    message,
    onReplyClick,
    onMentionClick,
    onPinClick,
    onUnpinClick,
    onDeleteClick,
    onBanClick,
    onTimeoutClick,
    currentUser,
    isLive,
    isPinned,
  }) => {
    const isOwnMessage =
      currentUser && message.user.toLowerCase() === currentUser.toLowerCase();
    const badges = message.badges || [];

    return (
      <div
        className={`group relative flex flex-col text-sm leading-relaxed px-2 py-1.5 rounded-lg transition-all duration-150
          ${
            isOwnMessage
              ? "bg-[#9147ff]/10 border-l-2 border-l-[#9147ff] hover:bg-[#9147ff]/15"
              : "hover:bg-[#2a2a2e]/30"
          }
          ${isPinned ? "bg-[#2a2a2e]/30 border-l-2 border-l-yellow-500" : ""}
        `}
      >
        <div className="flex items-start gap-1">
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-shrink-0 gap-0.5 mr-0.5">
              {badges.map((badge: any, idx: number) => (
                <Badge
                  key={idx}
                  name={badge.name}
                  version={badge.version}
                  imageUrl={badge.imageUrl}
                />
              ))}
            </div>
          )}
          <span
            className={`font-semibold flex-shrink-0 ${isOwnMessage ? "text-[#9147ff]" : "text-white"}`}
          >
            {message.user}
            {isOwnMessage && (
              <span className="text-xs ml-1 text-[#9147ff]/70">(you)</span>
            )}
          </span>
          <div className="flex-1 overflow-x-hidden break-words">
            {message.replyParentMsgId && (
              <span className="text-[#adadb8] text-xs block mb-0.5">
                ↳ Replying to previous message
              </span>
            )}
            <span className="text-[#efeff1]">
              {renderMessageContent(message)}
            </span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="mt-1 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMentionClick(message.user)}
            className="text-xs text-[#adadb8] hover:text-[#9147ff] transition-colors"
          >
            Mention
          </button>
          <button
            onClick={() => onReplyClick(message)}
            className="text-xs text-[#adadb8] hover:text-[#9147ff] transition-colors"
          >
            Reply
          </button>
          {!isOwnMessage && isLive && onBanClick && onTimeoutClick && (
            <>
              <button
                onClick={() => onTimeoutClick?.(message.user, 600)}
                className="text-xs text-yellow-400 hover:text-yellow-300"
              >
                Timeout
              </button>
              <button
                onClick={() => onBanClick?.(message.user)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Ban
              </button>
            </>
          )}
          {isPinned ? (
            <button
              onClick={() => onUnpinClick(message.id)}
              className="text-xs text-yellow-400 hover:text-yellow-300"
            >
              Unpin
            </button>
          ) : (
            <button
              onClick={() => onPinClick(message)}
              className="text-xs text-gray-400 hover:text-yellow-400"
            >
              Pin
            </button>
          )}
          <button
            onClick={() => onDeleteClick(message.id)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Delete
          </button>
          <span className="text-xs text-[#adadb8]/60">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  },
);

export default ChatMessageItem;
