// src/renderer/pages/stream/components/ChatSidebar/components/ChatMessageItem.tsx
import React, { memo, useMemo } from "react";
import type { ChatMessage } from "../../../../api/core/chat";
import Badge from "./Badge";
import EmoteImage from "./EmoteImage";

interface ChatMessageItemProps {
  message: ChatMessage;
  onReplyClick: (messageId: string) => void;
  onMentionClick: (username: string) => void;
  currentUser: string;
}

// Deterministic color generator based on username
const getUsernameColor = (username: string): string => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash) + username.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  // Hue between 0 and 360
  const hue = Math.abs(hash % 360);
  // Saturation: 70-90%
  const saturation = 70 + (Math.abs(hash >> 8) % 20);
  // Lightness: 55-75% for good contrast on dark background
  const lightness = 55 + (Math.abs(hash >> 16) % 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

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

const renderMessageContent = (message: ChatMessage): React.ReactNode => {
  if (message.parsedMessage && message.parsedMessage.length > 0) {
    return message.parsedMessage.map((part: any, idx: number) => {
      if (part.type === "emote") {
        return <EmoteImage key={idx} part={part} />;
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

const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(
  ({ message, onReplyClick, onMentionClick, currentUser }) => {
    const handleReplyClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onReplyClick(message.id);
    };

    const handleMentionClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMentionClick(message.user);
    };

    const isOwnMessage =
      currentUser && message.user.toLowerCase() === currentUser.toLowerCase();
    const isSystemMessage = message.user === "system";
    const isAction = message.isAction === true;
    const isAnnouncement = message.isAnnouncement === true;

    // Generate consistent color for the username (except for system, own messages, and announcements)
    const usernameColor = useMemo(() => {
      if (isSystemMessage || isAnnouncement || isOwnMessage) return null;
      return getUsernameColor(message.user);
    }, [message.user, isSystemMessage, isAnnouncement, isOwnMessage]);

    if (isSystemMessage) {
      return (
        <div className="px-3 py-1 text-xs text-[#adadb8] italic border-t border-[#2a2a2e] mt-1 pt-1 overflow-hidden break-words">
          {message.message}
        </div>
      );
    }

    if (isAnnouncement) {
      return (
        <div className="mx-3 my-2 p-2 bg-[#9147ff]/10 rounded-lg border-l-3 border-[#9147ff] overflow-hidden break-words">
          <div className="text-[10px] text-[#9147ff] font-bold uppercase tracking-wide">
            Announcement
          </div>
          <div className="text-sm text-white break-words">
            <span className="font-semibold">{message.user}</span>:{" "}
            {message.message}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`group relative flex flex-col text-sm leading-relaxed px-3 py-1.5 transition-all duration-150 message-row ${
          isOwnMessage
            ? "bg-[#9147ff]/5 hover:bg-[#9147ff]/10"
            : "hover:bg-[#2a2a2e]/40"
        } ${isAction ? "italic text-[#adadb8]" : ""}`}
        style={{ overflowX: "hidden", maxWidth: "100%" }}
      >
        <div className="flex items-start gap-1 min-w-0 w-full flex-wrap">
          {message.badges && message.badges.length > 0 && (
            <div className="flex flex-shrink-0 gap-0.5 mr-0.5">
              {message.badges.map((badge: any, idx: number) => (
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
            className={`font-semibold flex-shrink-0 ${
              isOwnMessage ? "text-[#9147ff]" : ""
            } ${isAction ? "opacity-80" : ""}`}
            style={!isOwnMessage && usernameColor ? { color: usernameColor } : undefined}
          >
            {message.user}
            {isOwnMessage && (
              <span className="text-xs ml-1 text-[#9147ff]/70">(you)</span>
            )}
          </span>
          <div className="flex-1 min-w-0 break-words overflow-hidden">
            {message.replyParentMsgId && (
              <span className="text-[#adadb8] text-xs block mb-0.5">
                ↳ Replying to previous message
              </span>
            )}
            <span
              className={`${isAction ? "text-[#adadb8]" : "text-[#efeff1]"} break-words message-text`}
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {renderMessageContent(message)}
            </span>
          </div>
        </div>

        {!isAnnouncement && (
          <div className="mt-1 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleMentionClick}
              className="text-xs text-[#adadb8] hover:text-[#9147ff] transition-colors"
            >
              Mention
            </button>
            <button
              onClick={handleReplyClick}
              className="text-xs text-[#adadb8] hover:text-[#9147ff] transition-colors"
            >
              Reply
            </button>
            <span className="text-xs text-[#adadb8]/50">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    );
  }
);

ChatMessageItem.displayName = "ChatMessageItem";

export default ChatMessageItem;