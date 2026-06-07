//@ts-check
const { ipcMain } = require('electron');
const { clipsService } = require('../../../../services/clips');
const { logger } = require('../../../../utils/logger');
/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handleClipsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getClips':
      // @ts-ignore
      return await clipsService.getClips(params.broadcasterId, params.first);
    case 'getClip':
      // @ts-ignore
      return await clipsService.getClip(params.clipId);
    case 'getTopClips':
      // @ts-ignore
      return await clipsService.getTopClips(params.gameId, params.broadcasterId, params.period, params.first);
    default:
      throw new Error(`Unknown clips method: ${method}`);
  }
}

ipcMain.handle('clips', async (event, payload) => {
  try {
    const result = await handleClipsRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:clips]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Clips handler registered');