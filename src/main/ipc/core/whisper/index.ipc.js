// src/main/ipc/core/whisper/index.ipc.js
const { ipcMain } = require('electron');
const { twitchChatService } = require('../../../../services/twitch-chat');

async function handleWhisperRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'connect':
      await twitchChatService.connectToWhispers();
      return true;
    case 'send':
      await twitchChatService.sendWhisper(params.toLogin, params.message);
      return true;
    case 'getConversations':
      return await twitchChatService.getConversations();
    case 'getMessages':
      return await twitchChatService.getMessages(params.userId);
    case 'markRead':
      await twitchChatService.markConversationRead(params.userId);
      return true;
    default:
      throw new Error(`Unknown whisper method: ${method}`);
  }
}

ipcMain.handle('whisper', async (event, payload) => {
  try {
    const result = await handleWhisperRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:whisper]', err);
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Whisper handler registered');