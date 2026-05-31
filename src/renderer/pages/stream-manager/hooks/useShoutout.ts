// src/renderer/pages/stream-manager/hooks/useShoutout.ts
import { useCallback } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useShoutout = () => {
  const sendShoutout = useCallback(async (targetUsername: string) => {
    if (!targetUsername.trim()) throw new Error('Channel name is required');
    const res = await streamManagerAPI.sendShoutout(targetUsername.trim());
    if (!res.status) throw new Error(res.message || 'Shoutout failed');
    return true;
  }, []);

  return { sendShoutout };
};