import { useCallback } from 'react';

export const useModeration = (channelName: string) => {
  const banUser = useCallback(async (username: string) => {
    // TODO: implement actual IPC call
    console.log('Ban user:', username);
    // await window.backendAPI.moderation({ method: 'ban', params: { channelName, username } });
    return true;
  }, [channelName]);

  const timeoutUser = useCallback(async (username: string, durationSeconds: number = 600) => {
    console.log('Timeout user:', username, durationSeconds);
    // await window.backendAPI.moderation({ method: 'timeout', params: { channelName, username, duration: durationSeconds } });
    return true;
  }, [channelName]);

  const clearChat = useCallback(async () => {
    console.log('Clear chat');
    // await window.backendAPI.moderation({ method: 'clearChat', params: { channelName } });
    return true;
  }, [channelName]);

  return { banUser, timeoutUser, clearChat };
};