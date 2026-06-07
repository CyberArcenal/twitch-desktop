const { ipcMain } = require('electron');
const { twitchApiService } = require('../../../../services/twitch-api');
const { logger } = require('../../../../utils/logger');
async function handleStreamSettingsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getStreamKey':
      return await twitchApiService.getStreamKey();
    case 'getIngestServers':
      return await twitchApiService.getIngestServers();
    case 'regenerateStreamKey':
      return await twitchApiService.regenerateStreamKey();
    default:
      throw new Error(`Unknown streamSettings method: ${method}`);
  }
}

ipcMain.handle('stream-settings', async (event, payload) => {
  try {
    const result = await handleStreamSettingsRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:stream-settings]', err);
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Stream Settings handler registered');