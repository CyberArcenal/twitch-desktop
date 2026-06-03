// src/main/services/ad-block.service.js
//@ts-check
const { BrowserWindow } = require('electron');
const { logger } = require('../utils/logger');

class AdBlockService {
  constructor() {
    this.isAdPlaying = false;
  }

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

  onAdStart() {
    this.isAdPlaying = true;
    this._sendToRenderers('ad:start', {});
    // Optional: automatically mute the player
    // Player could be controlled via IPC
  }

  onAdEnd() {
    this.isAdPlaying = false;
    this._sendToRenderers('ad:end', {});
  }

  isAdActive() {
    return this.isAdPlaying;
  }
}

const adBlockService = new AdBlockService();
module.exports = { adBlockService, AdBlockService };