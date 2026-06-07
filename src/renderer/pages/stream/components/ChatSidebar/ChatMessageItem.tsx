// src/renderer/pages/stream/components/ChatSidebar/components/ChatMessageItem.tsx
import React, { memo } from "react";
import type { ChatMessage } from "../../../../api/core/chat";
import Badge from "./Badge";

interface ChatMessageItemProps {
  message: ChatMessage;
  onReplyClick: (messageId: string) => void;
  onMentionClick: (username: string) => void;
  currentUser: string;
}

// Helper: get badge image URL based on name and version
const getBadgeImageUrl = (name: string, version: string): string | null => {
  if (name === "subscriber") {
    return `https://badges.twitch.tv/v1/badges/subscriber/${version}`;
  }
  const badgeMap: Record<string, string> = {
    broadcaster:
      "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1",
    moderator:
      "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1",
    vip: "https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1",
    turbo:
      "https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5568-4b5a-bbd5-1d95c52c4fef/1",
  };
  return badgeMap[name] || null;
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

    // System message rendering
    if (isSystemMessage) {
      return (
        <div className="px-2 py-1 text-xs text-[#adadb8] italic border-t border-[#2a2a2e] mt-1 pt-1">
          {message.message}
        </div>
      );
    }

    // Announcement styling
    if (isAnnouncement) {
      return (
        <div className="my-2 mx-2 p-2 bg-[#9147ff]/20 rounded-lg border-l-4 border-[#9147ff]">
          <div className="text-xs text-[#9147ff] font-bold uppercase tracking-wide">
            Announcement
          </div>
          <div className="text-white text-sm">
            <span className="font-semibold">{message.user}</span>: {message.message}
          </div>
        </div>
      );
    }

    // Regular or action message
    return (
      <div
        className={`group relative flex flex-col text-sm leading-relaxed px-2 py-1.5 rounded-lg transition-all duration-150 ${
          isOwnMessage
            ? "bg-[#9147ff]/10 border-l-2 border-l-[#9147ff] hover:bg-[#9147ff]/15"
            : "hover:bg-[#2a2a2e]/30"
        } ${isAction ? "italic text-[#adadb8]" : ""}`}
      >
        <div className="flex items-start gap-1">
          {/* Badges container */}
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
              isOwnMessage ? "text-[#9147ff]" : "text-white"
            } ${isAction ? "opacity-80" : ""}`}
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
            <span className={isAction ? "text-[#adadb8]" : "text-[#efeff1]"}>
              {renderMessageContent(message)}
            </span>
          </div>
        </div>

        {/* Hover actions row (only for non-system, non-announcement messages) */}
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
            <span className="text-xs text-[#adadb8]/60">
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