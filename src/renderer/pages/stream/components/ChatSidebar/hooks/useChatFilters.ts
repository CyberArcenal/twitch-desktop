import { useState } from 'react';

export const useChatFilters = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const addFilter = (word: string) => {
    if (word && !filters.includes(word)) {
      setFilters([...filters, word]);
    }
  };

  const removeFilter = (word: string) => {
    setFilters(filters.filter(f => f !== word));
  };

  const toggleFilters = () => setShowFilters(prev => !prev);

  const filterMessage = (message: string) => {
    if (filters.length === 0) return true;
    return !filters.some(f => message.toLowerCase().includes(f.toLowerCase()));
  };

  return { filters, showFilters, addFilter, removeFilter, toggleFilters, filterMessage };
};