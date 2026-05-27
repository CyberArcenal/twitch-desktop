//@ts-check
const { ipcMain } = require('electron');
const { twitchChatService } = require('../../../../services/twitch-chat.service');

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handleChatRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'connect':
      // @ts-ignore
      return await twitchChatService.connectToChannel(params.channelName);
    case 'disconnect':
      return await twitchChatService.disconnectChat();
    case 'send':
      // @ts-ignore
      return await twitchChatService.sendChatMessage(params.message);
    default:
      throw new Error(`Unknown chat method: ${method}`);
  }
}

ipcMain.handle('twitch-chat', async (event, payload) => {
  try {
    const result = await handleChatRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:twitch-chat]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Twitch Chat handler registered');