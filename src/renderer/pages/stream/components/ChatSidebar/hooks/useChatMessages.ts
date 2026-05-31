// src/renderer/pages/stream/components/ChatSidebar/hooks/useChatMessages.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI, type ChatMessage } from '../../../../../api/core/chat';
import { userAPI } from '../../../../../api/core/user';

const MAX_MESSAGES = 500; // keep only last 500 messages to prevent memory bloat

export const useChatMessages = (isConnected: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<string>('You');

  // Fetch logged-in user once
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await userAPI.getCurrentUser();
        if (res.status && res.data?.display_name) {
          setCurrentUser(res.data.display_name);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Listen for incoming messages – with limit
  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages(prev => {
        const newMessages = [...prev, msg];
        // Keep only last MAX_MESSAGES
        if (newMessages.length > MAX_MESSAGES) {
          return newMessages.slice(-MAX_MESSAGES);
        }
        return newMessages;
      });
    };
    const handleConnected = () => console.log('Chat connected');
    const handleUserJoined = (data: any) => {
      const systemMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        channel: data.channel,
        user: 'system',
        message: `${data.user} joined the chat`,
        badges: null,
        emotes: null,
        parsedMessage: undefined,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => {
        const newMessages = [...prev, systemMsg];
        if (newMessages.length > MAX_MESSAGES) return newMessages.slice(-MAX_MESSAGES);
        return newMessages;
      });
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

  // Auto-scroll – use requestAnimationFrame to avoid layout thrashing
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string, replyToId?: string): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      await chatAPI.send(text, replyToId);
      const localMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        channel: '',
        user: currentUser,
        message: text,
        badges: null,
        emotes: null,
        timestamp: new Date().toISOString(),
        replyParentMsgId: replyToId,
        parsedMessage: undefined,
      };
      // setMessages(prev => {
      //   const newMessages = [...prev, localMessage];
      //   if (newMessages.length > MAX_MESSAGES) return newMessages.slice(-MAX_MESSAGES);
      //   return newMessages;
      // });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [currentUser]);

  return { messages, messagesEndRef, sendMessage, currentUser };
};