const { ipcMain } = require('electron');
const { historyService } = require('../../../../services/history');

async function handleHistoryRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'add':
      return historyService.addToHistory(params.entry);
    case 'get':
      return historyService.getHistory(params.limit);
    case 'clear':
      historyService.clearHistory();
      return true;
    case 'remove':
      return historyService.removeFromHistory(params.id);
    case 'removeChannel':
      return historyService.removeChannelHistory(params.channelName);
    case 'exists':
      return historyService.existsInHistory(params.type, params.identifier);
    default:
      throw new Error(`Unknown history method: ${method}`);
  }
}

ipcMain.handle('history', async (event, payload) => {
  try {
    const result = await handleHistoryRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:history]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] History handler registered');