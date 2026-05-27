//@ts-check
const { ipcMain } = require('electron');
const { adBlockService } = require('../../../../services/ad-block.service');

async function handleAdBlockRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'adStart':
      adBlockService.onAdStart();
      return true;
    case 'adEnd':
      adBlockService.onAdEnd();
      return true;
    case 'isAdActive':
      return adBlockService.isAdActive();
    default:
      throw new Error(`Unknown ad-block method: ${method}`);
  }
}

ipcMain.handle('ad-block', async (event, payload) => {
  try {
    const result = await handleAdBlockRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:ad-block]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Ad-block handler registered');