//@ts-check
const { ipcMain } = require('electron');
const { downloadService } = require('../../../../services/livestream-download');


async function handleDownloadRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'download':
      return await downloadService.downloadVod(params.vodUrl, params.options);
    case 'cancel':
      downloadService.cancelDownload();
      return true;
    default:
      throw new Error(`Unknown download method: ${method}`);
  }
}

ipcMain.handle('download', async (event, payload) => {
  try {
    const result = await handleDownloadRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:download]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Download handler registered');