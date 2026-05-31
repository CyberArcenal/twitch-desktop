// src/renderer/pages/stream-manager/hooks/useCollaboration.ts
import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';
import { userAPI } from '../../../api/core/user';

interface Moderator {
  user_id: string;
  user_login: string;
  user_name: string;
}

export const useCollaboration = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamTogetherUrl, setStreamTogetherUrl] = useState<string | null>(null);

  // Fetch the list of moderators
  const fetchModerators = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await streamManagerAPI.getModerators();
      if (res.status) {
        setModerators(res.data);
      } else {
        setError(res.message || 'Failed to load moderators');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a moderator by Twitch username
  const addModeratorByUsername = async (username: string) => {
    // First resolve username to user ID
    const userRes = await streamManagerAPI.getUserByName(username.trim());
    if (!userRes.status || !userRes.data) {
      throw new Error('User not found');
    }
    const userId = userRes.data.id;
    const res = await streamManagerAPI.addModerator(userId);
    if (!res.status) throw new Error(res.message);
    await fetchModerators(); // refresh list
    return true;
  };

  // Remove a moderator by user ID
  const removeModeratorById = async (userId: string) => {
    const res = await streamManagerAPI.removeModerator(userId);
    if (!res.status) throw new Error(res.message);
    await fetchModerators();
    return true;
  };

  // Build the “Stream Together” URL when the user data is known
  useEffect(() => {
    const buildStreamTogetherUrl = async () => {
      const userRes = await userAPI.getCurrentUser();
      if (userRes.status && userRes.data?.login) {
        setStreamTogetherUrl(`https://dashboard.twitch.tv/u/${userRes.data.login}/stream-manager/stream-together`);
      }
    };
    buildStreamTogetherUrl();
  }, []);

  // Load moderators once on mount
  useEffect(() => {
    fetchModerators();
  }, []);

  return {
    moderators,
    loading,
    error,
    addModeratorByUsername,
    removeModeratorById,
    refreshModerators: fetchModerators,
    streamTogetherUrl,
  };
};