import React, { useState, useEffect, useRef } from 'react';
import { Send, Filter, X, AtSign } from 'lucide-react';
import { chatAPI, type ChatMessage } from '../../../api/core/chat';

interface ChatSidebarProps {
  channelName: string;
  isConnected: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ channelName, isConnected }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    };
    const handleConnected = () => console.log('Chat connected');
    const handleUserJoined = (data: any) => {
      setMessages(prev => [...prev, {
        channel: data.channel,
        user: 'system',
        message: `${data.user} joined the chat`,
        badges: null,
        emotes: null,
        timestamp: new Date().toISOString(),
      }]);
    };

    window.backendAPI?.on?.('chat:message', handleMessage);
    window.backendAPI?.on?.('chat:connected', handleConnected);
    window.backendAPI?.on?.('chat:user-joined', handleUserJoined);
    return () => {
      window.backendAPI?.off?.('chat:message', handleMessage);
      window.backendAPI?.off?.('chat:connected', handleConnected);
      window.backendAPI?.off?.('chat:user-joined', handleUserJoined);
    };
  }, [isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await chatAPI.send(input);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const addFilter = (word: string) => {
    if (word && !filters.includes(word)) setFilters([...filters, word]);
  };
  const removeFilter = (word: string) => setFilters(filters.filter(f => f !== word));

  const filteredMessages = messages.filter(msg =>
    filters.length === 0 || !filters.some(f => msg.message.toLowerCase().includes(f.toLowerCase()))
  );

  // Helper to render message with basic emote/mention styling
  const renderMessage = (text: string) => {
    // Simple mention highlight
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-[#9147ff]">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#1f1f23]">
      {/* Chat header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2e]">
        <h3 className="text-sm font-semibold text-white">Chat</h3>
        <button onClick={() => setShowFilters(!showFilters)} className="p-1 hover:bg-[#2a2a2e] rounded">
          <Filter className="w-4 h-4 text-[#adadb8]" />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-2 border-b border-[#2a2a2e] bg-[#18181b]">
          <div className="flex gap-1 flex-wrap mb-2">
            {filters.map(f => (
              <span key={f} className="bg-[#9147ff]/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-white">
                {f} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(f)} />
              </span>
            ))}
          </div>
          <div className="relative">
            <AtSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adadb8]" />
            <input
              type="text"
              placeholder="Filter words (e.g., spam)"
              className="w-full text-sm bg-[#0e0e10] border border-[#2a2a2e] rounded pl-8 pr-2 py-1 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addFilter((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {!isConnected && (
          <p className="text-center text-[#adadb8] text-sm">Connecting to chat...</p>
        )}
        {filteredMessages.map((msg, idx) => (
          <div key={idx} className="text-sm leading-relaxed">
            <span className="font-semibold text-white">{msg.user}: </span>
            <span className="text-[#efeff1]">{renderMessage(msg.message)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#2a2a2e] bg-[#18181b]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#adadb8] focus:outline-none focus:border-[#9147ff]"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            className="p-2 bg-[#9147ff] rounded-lg hover:bg-[#772ce8] disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;