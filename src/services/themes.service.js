// src/main/services/themes.service.js
//@ts-check
const { logger } = require('../utils/logger');
const { settingsService } = require('./settings.service');
const { BrowserWindow } = require('electron');

class ThemesService {
  constructor() {
    this.currentTheme = settingsService.get('theme') || 'dark';
  }

 /**
   * @param {string} channel
   * @param {{ theme: any; }} data
   */
 _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (error) {
      // If running outside Electron (e.g., tests), ignore
      logger.warn(
        "Failed to send IPC event (maybe not in Electron):",
        // @ts-ignore
        error.message,
      );
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * @param {string} theme
   */
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