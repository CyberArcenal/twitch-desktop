// src/renderer/pages/WatchStreamPage/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import chatAPI from '../../../api/core/chat';
import type { ChatMessageType } from '../types';

export const useChat = (channel: string | undefined, isConnected: boolean) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      author: 'System',
      message: 'Welcome to the chat!',
      timestamp: new Date(),
    },
  ]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to chat when channel is available
  useEffect(() => {
    if (!channel || !isConnected) return;

    const connectToChat = async () => {
      try {
        setIsConnecting(true);
        setConnectionError(null);
        
        await chatAPI.connect(channel);
        
        // Set up message listener
        const cleanup = chatAPI.onMessage((data) => {
          const newMessage: ChatMessageType = {
            id: `${Date.now()}-${Math.random()}`,
            author: data.user,
            message: data.message,
            timestamp: new Date(data.timestamp),
            badges: data.badges,
          };
          setMessages((prev) => [...prev, newMessage]);
        });

        return cleanup;
      } catch (err: any) {
        console.error('Failed to connect to chat:', err);
        setConnectionError(err.message || 'Failed to connect to chat');
        // Add system message
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            author: 'System',
            message: `⚠️ ${err.message || 'Failed to connect to chat'}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsConnecting(false);
      }
    };

    const cleanupPromise = connectToChat();

    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
        chatAPI.disconnect().catch(console.error);
      });
    };
  }, [channel, isConnected]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    try {
      await chatAPI.sendMessage(message);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `send-error-${Date.now()}`,
          author: 'System',
          message: `⚠️ Failed to send message: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  return {
    messages,
    sendMessage,
    isConnecting,
    connectionError,
    messagesEndRef,
  };
};