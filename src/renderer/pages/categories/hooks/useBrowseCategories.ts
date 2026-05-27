// src/renderer/pages/browse/categories/hooks/useBrowseCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { gamesAPI, type Game } from '../../../api/core/games';
import { showError } from '../../../utils/notification';

export const useBrowseCategories = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchTopGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gamesAPI.getTopGames(50); // Fetch up to 50 games
      if (response.status && response.data?.data) {
        setGames(response.data.data);
        setTotal(response.data.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch games');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopGames();
  }, [fetchTopGames]);

  const refresh = useCallback(() => {
    fetchTopGames();
  }, [fetchTopGames]);

  return {
    games,
    loading,
    error,
    total,
    refresh,
  };
};