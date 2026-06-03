// src/main/services/picture-in-picture.service.js
//@ts-check
const { BrowserWindow } = require('electron');
const path = require('path');
const { logger } = require('../utils/logger');

class PictureInPictureService {
  constructor() {
    this.pipWindow = null;
    this.mainWindow = null;
  }

  /**
   * @param {any} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
  }

 /**
   * @param {string} channel
   * @param {{}} data
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

  createPipWindow() {
    if (this.pipWindow && !this.pipWindow.isDestroyed()) {
      this.pipWindow.focus();
      return this.pipWindow;
    }

    this.pipWindow = new BrowserWindow({
      width: 400,
      height: 225,
      minWidth: 320,
      minHeight: 180,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: true,
      closable: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preloads', 'pip.js')
      }
    });

    this.pipWindow.loadURL('data:text/html,<!DOCTYPE html><html><body style="margin:0;background:black;"><video id="pip-video" style="width:100%;height:100%;object-fit:contain;" autoplay muted></body></html>');

    this.pipWindow.on('closed', () => {
      this.pipWindow = null;
      this._sendToRenderers('pip:closed', {});
    });

    this.pipWindow.show();
    return this.pipWindow;
  }

  /**
   * @param {string} streamUrl
   */
  async setVideoSource(streamUrl) {
    const win = this.createPipWindow();
    await win.webContents.executeJavaScript(`
      const video = document.getElementById('pip-video');
      if (video) {
        video.src = '${streamUrl.replace(/'/g, "\\'")}';
        video.play();
      }
    `);
    return true;
  }

  closePip() {
    if (this.pipWindow && !this.pipWindow.isDestroyed()) {
      this.pipWindow.close();
    }
  }
}

const pipService = new PictureInPictureService();
module.exports = { pipService, PictureInPictureService };