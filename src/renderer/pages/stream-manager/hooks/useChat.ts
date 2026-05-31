import { useState, useEffect, useRef } from 'react';
import { chatAPI, type ChatMessage } from '../../../api/core/chat';
import { userAPI } from '../../../api/core/user';
import { useModeration } from './useModeration';

export const useChat = (channelName?: string, broadcasterId?: string, isLive?: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState('You');
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { banUser, timeoutUser, clearChat } = useModeration(broadcasterId || '');

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const res = await userAPI.getCurrentUser();
      if (res.status && res.data?.display_name) setCurrentUser(res.data.display_name);
    };
    fetchUser();
  }, []);

  // Connect/disconnect
  useEffect(() => {
    if (!channelName || !isLive) {
      if (connected) {
        chatAPI.disconnect().catch(console.error);
        setConnected(false);
        setMessages([]);
      }
      return;
    }
    const connect = async () => {
      try {
        await chatAPI.connect(channelName);
        setConnected(true);
      } catch (err) {
        console.error(err);
        setConnected(false);
      }
    };
    connect();
    return () => {
      chatAPI.disconnect().catch(console.error);
      setConnected(false);
    };
  }, [channelName, isLive]);

  // Message listener
  useEffect(() => {
    if (!connected) return;
    const handleMessage = (msg: ChatMessage) => {
      if (msg.channel === channelName) {
        setMessages(prev => {
          if (msg.isFromMe && prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg].slice(-200);
        });
      }
    };
    const unsubMsg = window.backendAPI?.on?.('chat:message', handleMessage);
    const unsubConn = window.backendAPI?.on?.('chat:connected', () => setConnected(true));
    return () => {
      unsubMsg?.();
      unsubConn?.();
    };
  }, [connected, channelName]);

  const sendMessage = async () => {
    if (!input.trim() || !connected) return;
    try {
      await chatAPI.send(input);
      const localMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        channel: channelName || '',
        user: currentUser,
        message: input,
        badges: null,
        emotes: null,
        timestamp: new Date().toISOString(),
        isFromMe: true,
      };
      setMessages(prev => [...prev, localMsg].slice(-200));
      setInput('');
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  const clearChatMessages = async () => {
    if (!broadcasterId) return;
    try {
      await clearChat();
      setMessages([]);
    } catch (err) {
      alert('Could not clear chat.');
    }
  };

  const mentionUser = (username: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const mention = `@${username} `;
    const newValue = input.slice(0, start) + mention + input.slice(end);
    setInput(newValue);
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = start + mention.length;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return {
    messages,
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
  };
};