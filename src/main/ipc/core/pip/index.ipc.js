const { ipcMain } = require('electron');
const { pipService } = require('../../../../services/picture-in-picture.service');

async function handlePipRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'create':
      pipService.createPipWindow();
      return true;
    case 'setSource':
      return await pipService.setVideoSource(params.streamUrl);
    case 'close':
      pipService.closePip();
      return true;
    default:
      throw new Error(`Unknown pip method: ${method}`);
  }
}

ipcMain.handle('pip', async (event, payload) => {
  try {
    const result = await handlePipRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:pip]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] PiP handler registered');