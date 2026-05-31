// src/renderer/pages/stream/components/ChatSidebar/hooks/useChatFilters.ts
import { useState, useCallback } from 'react';

export const useChatFilters = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const addFilter = useCallback((word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (trimmed && !filters.includes(trimmed)) {
      setFilters(prev => [...prev, trimmed]);
    }
  }, [filters]);

  const removeFilter = useCallback((word: string) => {
    setFilters(prev => prev.filter(f => f !== word));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);

  const filterMessage = useCallback((message: string): boolean => {
    if (filters.length === 0) return true;
    const lowerMessage = message.toLowerCase();
    // If ANY filter word is found in the message, HIDE it (return false)
    return !filters.some(filterWord => lowerMessage.includes(filterWord));
  }, [filters]);

  return { filters, showFilters, addFilter, removeFilter, clearAllFilters, toggleFilters, filterMessage };
};