import { useState, useEffect, useCallback } from 'react';
import type { Conversation, WhisperMessage } from '../types';
import { showError, showSuccess } from '../../../utils/notification';
import { whisperAPI } from '../../../api/core/whisper';

// These methods need to be added to chatAPI in renderer
// For brevity, we assume whisperAPI.whisper exists

export const useWhispers = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<WhisperMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false); // for typing indicator (simplified)

  const loadConversations = useCallback(async () => {
    const res = await whisperAPI.getConversations();
    if (res.status) {
      setConversations(res.data);
    } else {
      showError(res.message);
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const res = await whisperAPI.getMessages(userId);
    if (res.status) {
      setMessages(res.data);
    }
  }, []);

  const sendMessage = useCallback(async (toLogin: string, message: string) => {
    if (!message.trim()) return;
    setSending(true);
    const res = await whisperAPI.send(toLogin, message);
    if (res.status) {
      // Optimistically update UI? The backend will send event
    } else {
      showError(res.message);
    }
    setSending(false);
  }, []);

  const markRead = useCallback(async (userId: string) => {
    await whisperAPI.markRead(userId);
  }, []);

  const selectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConv(conv);
    await loadMessages(conv.userId);
    if (conv.unreadCount > 0) {
      await markRead(conv.userId);
      // Update local unread count
      setConversations(prev => prev.map(c => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c));
    }
  }, [loadMessages, markRead]);

  useEffect(() => {
    loadConversations();

    // Listen for new whispers
    const unsubReceived = window.backendAPI.on?.('whisper:received', (msg: WhisperMessage) => {
      // Update conversations list and messages if selected
      loadConversations();
      if (selectedConv && msg.from === selectedConv.userLogin) {
        setMessages(prev => [...prev, msg]);
      }
    });
    const unsubConversations = window.backendAPI.on?.('whisper:conversations-updated', (convs: Conversation[]) => {
      setConversations(convs);
    });
    const unsubSent = window.backendAPI.on?.('whisper:sent', (msg: WhisperMessage) => {
      loadConversations();
      if (selectedConv && msg.to === selectedConv.userLogin) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      unsubReceived?.();
      unsubConversations?.();
      unsubSent?.();
    };
  }, [loadConversations, selectedConv]);

  return {
    conversations,
    selectedConv,
    messages,
    loading,
    sending,
    selectConversation,
    sendMessage,
  };
};