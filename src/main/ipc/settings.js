const { ipcMain } = require('electron');
const { settingsService } = require('../../services/settings.service');

function registerSettingsHandlers() {
  ipcMain.handle('settings:getAll', () => settingsService.getAll());
  ipcMain.handle('settings:get', (_, key) => settingsService.get(key));
  ipcMain.handle('settings:set', (_, key, value) => settingsService.set(key, value));
  ipcMain.handle('settings:addFilter', (_, word) => settingsService.addChatFilter(word));
  ipcMain.handle('settings:removeFilter', (_, word) => settingsService.removeChatFilter(word));
  ipcMain.handle('settings:reset', () => settingsService.reset());
}

module.exports = { registerSettingsHandlers };