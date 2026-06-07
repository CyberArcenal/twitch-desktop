const { ipcMain } = require('electron');
const { userService } = require('../../../../services/user');
const { logger } = require('../../../../utils/logger');
async function handleUserRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getCurrentUser':
      return await userService.getCurrentUser();
    case 'getUserById':
      return await userService.getUserById(params.userId);
    case 'getUserByName':
      return await userService.getUserByName(params.login);
    case 'getUserSubscriptions':
      return await userService.getUserSubscriptions();
    case 'getUserBadges':
      return await userService.getUserBadges(params.userId);
    default:
      throw new Error(`Unknown user method: ${method}`);
  }
}

ipcMain.handle('user', async (event, payload) => {
  try {
    const result = await handleUserRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:user]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] User handler registered');