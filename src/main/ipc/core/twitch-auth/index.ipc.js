//@ts-check
const { ipcMain } = require('electron');
const { twitchAuthService } = require('../../../../services/twitch-auth.service');

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
async function handleAuthRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'login':
      return await twitchAuthService.login();
    case 'logout':
      return await twitchAuthService.logout();
    case 'isLoggedIn':
      return twitchAuthService.isLoggedIn();
    case 'getAccessToken':
      return twitchAuthService.getAccessToken();
    case 'refreshToken':
      return await twitchAuthService.refreshTokenIfNeeded();
    default:
      throw new Error(`Unknown auth method: ${method}`);
  }
}

ipcMain.handle('twitch-auth', async (event, payload) => {
  try {
    const result = await handleAuthRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:twitch-auth]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Twitch Auth handler registered');