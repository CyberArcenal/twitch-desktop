// src/main/services/themes.service.js
//@ts-check
const { settingsService } = require('./settings.service');
const { BrowserWindow } = require('electron');

class ThemesService {
  constructor() {
    this.currentTheme = settingsService.get('theme') || 'dark';
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[ThemesService] send error:', err);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('Theme must be "light" or "dark"');
    }
    this.currentTheme = theme;
    settingsService.set('theme', theme);
    this._sendToRenderers('theme:changed', { theme });
    return theme;
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    return this.setTheme(newTheme);
  }
}

const themesService = new ThemesService();
module.exports = { themesService, ThemesService };