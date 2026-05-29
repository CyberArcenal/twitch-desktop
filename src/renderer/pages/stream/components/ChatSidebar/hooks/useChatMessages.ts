// src/renderer/pages/stream/components/ChatSidebar/hooks/useChatMessages.ts
import { useState, useEffect, useRef } from 'react';
import { chatAPI, type ChatMessage } from '../../../../../api/core/chat';
import { userAPI } from '../../../../../api/core/user';

export const useChatMessages = (isConnected: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<string>('You');

  // Fetch logged-in user
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

  // Listen for incoming messages
  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    };
    const handleConnected = () => console.log('Chat connected');
    const handleUserJoined = (data: any) => {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        channel: data.channel,
        user: 'system',
        message: `${data.user} joined the chat`,
        badges: null,
        emotes: null,
        parsedMessage: undefined,
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message with optional reply ID
  const sendMessage = async (text: string, replyToId?: string): Promise<boolean> => {
    if (!text.trim()) return false;
    try {
      await chatAPI.send(text, replyToId);

      // Optimistically add user's own message
      const localMessage: ChatMessage = {
          id: `local-${Date.now()}`,
          channel: '',
          user: currentUser,
          message: text,
          badges: null,
          emotes: null,
          timestamp: new Date().toISOString(),
          replyParentMsgId: replyToId,
          parsedMessage: undefined
      };
      setMessages(prev => [...prev, localMessage]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return { messages, messagesEndRef, sendMessage };
};