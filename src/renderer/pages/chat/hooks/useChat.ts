// src/pages/Chat/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../../../api/core/auth";
import type { ChatMessage } from "../types";

export function useChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load user and check auth
  useEffect(() => {
    const loadUser = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
        return;
      }
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setLoading(false);

      // Add welcome message
      setMessages([
        {
          id: "0",
          author: "System",
          message: `Welcome to Twitch Desktop Chat, ${userData?.display_name || "user"}! This is a standalone chat interface.`,
          timestamp: new Date(),
          isSystem: true,
        },
      ]);
    };
    loadUser();
  }, [navigate]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      author: user.display_name || user.login,
      message: messageInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  }, [messageInput, user]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    messages,
    messageInput,
    setMessageInput,
    user,
    loading,
    messagesEndRef,
    sendMessage,
    handleKeyPress,
  };
}