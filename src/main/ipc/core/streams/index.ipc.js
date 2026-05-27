// src/main/ipc/core/streams/index.ipc.js
//@ts-check
const { ipcMain } = require('electron');
const { settingsService } = require('../../../../services/settings.service');
const { twitchApiService } = require('../../../../services/twitch-api.service');

/**
 * Handle stream-related IPC requests
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: string, params?: any }} payload
 */
async function handleStreamsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getFollowedStreams': {
      // Get current logged-in user ID from settings
      const userId = settingsService.get('twitch')?.userId;
      if (!userId) {
        throw new Error('Not logged in');
      }
      const first = params.first || 100;
      const result = await twitchApiService.getFollowedStreams(userId, first);
      return result; // already has { data: [], pagination? }
    }

    case 'getStreams': {
      const { userIds, first = 100 } = params;
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return { data: [] };
      }
      // Limit to 100 IDs (Twitch API limit)
      const limitedIds = userIds.slice(0, 100);
      return await twitchApiService.getStreams(limitedIds);
    }

    case 'getStreamByUserLogin': {
      const { login } = params;
      if (!login) return { data: null };
      // First get user by login to get user_id
      const userResult = await twitchApiService.fetchTwitch(`users?login=${login}`);
      const user = userResult.data?.[0];
      if (!user) return { data: null };
      const streamsResult = await twitchApiService.getStreams([user.id]);
      return { data: streamsResult.data?.[0] || null };
    }

    default:
      throw new Error(`Unknown streams method: ${method}`);
  }
}

// Register IPC handler
ipcMain.handle('streams', async (event, payload) => {
  try {
    const result = await handleStreamsRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:streams]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Streams handler registered');