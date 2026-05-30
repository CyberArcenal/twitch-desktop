import React, { memo } from 'react';
import type { ChatMessage } from '../../../../api/core/chat';

interface ChatMessageItemProps {
  message: ChatMessage;
  onReplyClick: (messageId: string) => void;
  onMentionClick: (username: string) => void;
}

const highlightMentions = (text: string): React.ReactNode => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
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
      if (part.type === 'emote') {
        const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${part.id}/3.0`;
        return (
          <img
            key={idx}
            src={emoteUrl}
            alt={part.name || 'emote'}
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(({ message, onReplyClick, onMentionClick }) => {
  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReplyClick(message.id);
  };

  const handleMentionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMentionClick(message.user);
  };

  return (
    <div className="group relative flex flex-col text-sm leading-relaxed hover:bg-[#2a2a2e]/30 px-1 py-1 rounded transition-colors message-enter">
      {/* Main message row */}
      <div className="flex items-start gap-1">
        <span className="font-semibold text-white flex-shrink-0">{message.user}:</span>
        <div className="flex-1 overflow-x-hidden break-words">
          {message.replyParentMsgId && (
            <span className="text-[#adadb8] text-xs block mb-0.5">↳ Replying to previous message</span>
          )}
          <span className="text-[#efeff1]">{renderMessageContent(message)}</span>
        </div>
      </div>

      {/* Hover actions row – inside the same container, below the text */}
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
        <span className="text-xs text-[#adadb8]/60">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export default ChatMessageItem;