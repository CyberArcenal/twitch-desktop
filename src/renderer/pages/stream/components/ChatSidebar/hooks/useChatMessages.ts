// src/renderer/pages/stream/components/ChatSidebar/hooks/useChatMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI, type ChatMessage } from '../../../../../api/core/chat';
import { userAPI } from '../../../../../api/core/user';

const MAX_MESSAGES = 500;
const DEDUP_WINDOW_MS = 2000;

export const useChatMessages = (isConnected: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [chatDisabled, setChatDisabled] = useState(false);
  const [timeoutRemaining, setTimeoutRemaining] = useState<number | null>(null);

  const recentMessageIds = useRef<Set<string>>(new Set());
  const cleanupTimeoutRef = useRef<number | null>(null);

  const scheduleCleanup = useCallback(() => {
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    cleanupTimeoutRef.current = window.setTimeout(() => {
      recentMessageIds.current.clear();
    }, DEDUP_WINDOW_MS);
  }, []);

  // Fetch current user
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

  const addSystemMessage = useCallback((text: string) => {
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      channel: '',
      user: 'system',
      message: text,
      badges: null,
      emotes: null,
      parsedMessage: undefined,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => {
      const newMessages = [...prev, sysMsg];
      if (newMessages.length > MAX_MESSAGES) return newMessages.slice(-MAX_MESSAGES);
      return newMessages;
    });
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    // Ensure message has an ID; if not, generate a fallback (should not happen)
    const messageId = msg.id || `fallback-${Date.now()}-${Math.random()}`;
    
    // Deduplicate only if we have a valid ID
    if (recentMessageIds.current.has(messageId)) {
      console.log('[Dedup] Blocked duplicate message:', messageId);
      return;
    }
    recentMessageIds.current.add(messageId);
    scheduleCleanup();

    setMessages(prev => {
      // Also check for duplicate in current list (just in case)
      if (prev.some(m => m.id === messageId)) return prev;
      const newMessages = [...prev, msg];
      if (newMessages.length > MAX_MESSAGES) return newMessages.slice(-MAX_MESSAGES);
      return newMessages;
    });
  }, [scheduleCleanup]);

  // Listen for chat events
  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (msg: ChatMessage) => {
      console.log('[Chat] Received message:', msg);
      addChatMessage(msg);
    };

    const handleConnected = () => {
      console.log('[Chat] Connected');
    };

    const handleUserJoined = (data: { channel: string; user: string }) => {
      addSystemMessage(`${data.user} joined the chat`);
    };

    const handleMessageRemoved = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      addSystemMessage(`A message was removed by a moderator`);
    };

    const handleChatCleared = () => {
      setMessages([]);
      addSystemMessage(`Chat has been cleared by a moderator`);
    };

    const handleUserTimedOut = ({ userName, duration, isBan }: { userName: string; duration?: number; isBan: boolean }) => {
      if (isBan) {
        addSystemMessage(`${userName} was banned from the channel`);
      } else {
        addSystemMessage(`${userName} was timed out for ${duration} seconds`);
      }
      setMessages(prev => prev.filter(m => m.user !== userName));
    };

    const handleSelfModAction = ({ action, duration }: { action: 'banned' | 'timedout'; duration?: number }) => {
      if (action === 'banned') {
        addSystemMessage(`You have been banned from this channel. Chat disabled.`);
        setChatDisabled(true);
        setTimeoutRemaining(null);
      } else if (action === 'timedout') {
        addSystemMessage(`You have been timed out for ${duration} seconds.`);
        setChatDisabled(true);
        setTimeoutRemaining(duration || 60);
        const timer = setTimeout(() => {
          setChatDisabled(false);
          setTimeoutRemaining(null);
          addSystemMessage(`Your timeout has ended. You can chat again.`);
        }, (duration || 60) * 1000);
        return () => clearTimeout(timer);
      }
    };

    window.backendAPI?.on?.('chat:message', handleMessage);
    window.backendAPI?.on?.('chat:connected', handleConnected);
    window.backendAPI?.on?.('chat:user-joined', handleUserJoined);
    window.backendAPI?.on?.('chat:message-removed', handleMessageRemoved);
    window.backendAPI?.on?.('chat:cleared', handleChatCleared);
    window.backendAPI?.on?.('chat:user-timed-out', handleUserTimedOut);
    window.backendAPI?.on?.('chat:self-mod-action', handleSelfModAction);

    return () => {
      window.backendAPI?.off?.('chat:message', handleMessage);
      window.backendAPI?.off?.('chat:connected', handleConnected);
      window.backendAPI?.off?.('chat:user-joined', handleUserJoined);
      window.backendAPI?.off?.('chat:message-removed', handleMessageRemoved);
      window.backendAPI?.off?.('chat:cleared', handleChatCleared);
      window.backendAPI?.off?.('chat:user-timed-out', handleUserTimedOut);
      window.backendAPI?.off?.('chat:self-mod-action', handleSelfModAction);
    };
  }, [isConnected, addSystemMessage, addChatMessage]);

  const sendMessage = useCallback(async (text: string, replyToId?: string): Promise<boolean> => {
    if (chatDisabled) {
      addSystemMessage('Chat is currently disabled (you are timed out or banned).');
      return false;
    }
    if (!text.trim()) return false;
    try {
      await chatAPI.send(text, replyToId);
      // Don't add local message – rely on backend echo (dedup will handle duplicates)
      return true;
    } catch (err) {
      console.error(err);
      addSystemMessage(`Failed to send message: ${(err as Error).message}`);
      return false;
    }
  }, [chatDisabled, addSystemMessage]);

  return {
    messages,
    sendMessage,
    currentUser,
    chatDisabled,
    timeoutRemaining,
  };
};