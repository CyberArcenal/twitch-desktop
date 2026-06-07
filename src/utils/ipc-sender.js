const { BrowserWindow } = require('electron');
const { logger } = require('./logger');

function sendToRenderers(channel, data) {
  try {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    });
  } catch (error) {
    logger.warn('Failed to send IPC event:', error.message);
  }
}

module.exports = { sendToRenderers };