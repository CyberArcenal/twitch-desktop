import { useCallback } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useModeration = (broadcasterId: string) => {
  const banUser = useCallback(async (username: string) => {
    const res = await streamManagerAPI.banUser(broadcasterId, username);
    if (!res.status) throw new Error(res.message);
  }, [broadcasterId]);

  const timeoutUser = useCallback(async (username: string, durationSeconds: number = 600) => {
    const res = await streamManagerAPI.timeoutUser(broadcasterId, username, durationSeconds);
    if (!res.status) throw new Error(res.message);
  }, [broadcasterId]);

  const clearChat = useCallback(async () => {
    const res = await streamManagerAPI.clearChat(broadcasterId);
    if (!res.status) throw new Error(res.message);
  }, [broadcasterId]);

  return { banUser, timeoutUser, clearChat };
};