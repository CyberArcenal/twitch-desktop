// src/renderer/pages/whispers/components/ConversationList.tsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';
import type { Conversation } from '../types';
import { userAPI } from '../../../api/core/user';

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelect: (conv: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedUserId, onSelect }) => {
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAvatars = async () => {
      const map: Record<string, string> = {};
      for (const conv of conversations) {
        try {
          const res = await userAPI.getUserByName(conv.userLogin);
          if (res.status && res.data?.profile_image_url) {
            map[conv.userId] = res.data.profile_image_url;
          } else {
            map[conv.userId] = '';
          }
        } catch {
          map[conv.userId] = '';
        }
      }
      setAvatars(map);
    };
    fetchAvatars();
  }, [conversations]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#2a2a2e] bg-[#1f1f23]/50">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#9147ff]" /> Whispers
        </h2>
        <p className="text-xs text-[#adadb8] mt-1">Direct messages from other users</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-[#adadb8]/30 mb-2" />
            <p className="text-sm text-[#adadb8]">No whispers yet</p>
            <p className="text-xs text-[#adadb8]/60">Start a conversation by whispering someone</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const avatarUrl = avatars[conv.userId];
              const isSelected = selectedUserId === conv.userId;
              return (
                <div
                  key={conv.userId}
                  onClick={() => onSelect(conv)}
                  className={`
                    group relative p-3 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'bg-gradient-to-r from-[#9147ff]/15 to-transparent border-l-4 border-l-[#9147ff]' 
                      : 'hover:bg-[#2a2a2e]/50'
                    }
                  `}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={conv.userName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9147ff]/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2e] flex items-center justify-center">
                          <User className="w-5 h-5 text-[#adadb8]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-white truncate group-hover:text-[#9147ff] transition">
                          {conv.userName}
                        </span>
                        <span className="text-xs text-[#adadb8]/60 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(conv.lastTimestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-[#adadb8] truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute top-3 right-3 bg-[#9147ff] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;