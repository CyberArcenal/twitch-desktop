//@ts-check
const { ipcMain } = require('electron');
const { twitchAuthService } = require('../../services/twitch-auth.service');

function registerAuthHandlers() {
  ipcMain.handle('auth:login', () => twitchAuthService.login());
  ipcMain.handle('auth:logout', () => twitchAuthService.logout());
  ipcMain.handle('auth:isLoggedIn', () => twitchAuthService.isLoggedIn());
  ipcMain.handle('auth:getUser', async () => {
    try {
      const token = twitchAuthService.getAccessToken();
      if (!token) return null;
      return await twitchAuthService.getUserInfo(token);
    } catch (err) {
      console.error('[IPC] auth:getUser error:', err);
      return null;
    }
  });
}

module.exports = { registerAuthHandlers };