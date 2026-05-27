import React, { useState, useEffect, useRef } from 'react';
import { Send, Filter, X } from 'lucide-react';
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
    if (word && !filters.includes(word)) {
      setFilters([...filters, word]);
      // Also save to settings? optional
    }
  };
  const removeFilter = (word: string) => setFilters(filters.filter(f => f !== word));

  const filteredMessages = messages.filter(msg => {
    if (filters.length === 0) return true;
    return !filters.some(f => msg.message.toLowerCase().includes(f.toLowerCase()));
  });

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] border-l border-[var(--border-color)]">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
        <h3 className="font-semibold text-[var(--sidebar-text)]">Chat</h3>
        <button onClick={() => setShowFilters(!showFilters)} className="p-1 hover:bg-[var(--card-hover-bg)] rounded">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-2 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)]">
          <div className="flex gap-1 flex-wrap mb-2">
            {filters.map(f => (
              <span key={f} className="bg-[var(--primary-color)]/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                {f} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter(f)} />
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add filter word..."
            className="w-full text-sm bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2 py-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addFilter((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!isConnected && <p className="text-center text-[var(--text-tertiary)]">Connecting to chat...</p>}
        {filteredMessages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-semibold text-[var(--sidebar-text)]">{msg.user}: </span>
            <span className="text-[var(--text-secondary)]">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm text-[var(--input-text)]"
            disabled={!isConnected}
          />
          <button onClick={sendMessage} disabled={!isConnected} className="p-2 bg-[var(--primary-color)] rounded-lg">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;