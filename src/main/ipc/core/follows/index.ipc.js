//@ts-check
const { ipcMain } = require('electron');
const { followsService } = require('../../../../services/follows.service');

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handleFollowsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'get':
      // @ts-ignore
      return await followsService.getFollowedChannels(params.userId, params.after, params.forceRefresh);
    case 'follow':
      // @ts-ignore
      return await followsService.followChannel(params.broadcasterId);
    case 'unfollow':
      // @ts-ignore
      return await followsService.unfollowChannel(params.broadcasterId);
    case 'isFollowing':
      // @ts-ignore
      return await followsService.isFollowing(params.broadcasterId);
    case 'clearCache':
      followsService.clearCache();
      return true;
    default:
      throw new Error(`Unknown follows method: ${method}`);
  }
}

ipcMain.handle('follows', async (event, payload) => {
  try {
    const result = await handleFollowsRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:follows]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Follows handler registered');