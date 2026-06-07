// src/main/ipc/core/watch-later/index.ipc.js
//@ts-check
const { ipcMain } = require('electron');
const { watchLaterService } = require('../../../../services/watch-later');

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handleWatchLaterRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getAll':
      return watchLaterService.getAll();
    case 'add':
      // @ts-ignore
      return watchLaterService.add(params.item);
    case 'remove':
      // @ts-ignore
      return watchLaterService.remove(params.id);
    case 'reorder':
      // @ts-ignore
      return watchLaterService.reorder(params.items);
    case 'clear':
      return watchLaterService.clear();
    case 'markAsWatched':
      // @ts-ignore
      return watchLaterService.markAsWatched(params.id);
    default:
      throw new Error(`Unknown watchLater method: ${method}`);
  }
}

ipcMain.handle('watch-later', async (event, payload) => {
  try {
    const result = await handleWatchLaterRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:watch-later]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Watch Later handler registered');