// src/main/services/ad-block.service.js
//@ts-check
const { BrowserWindow } = require('electron');

class AdBlockService {
  constructor() {
    this.isAdPlaying = false;
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[AdBlockService] send error:', err);
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