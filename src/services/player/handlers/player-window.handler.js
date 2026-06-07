const { BrowserWindow } = require('electron');
const path = require('path');
const { handlePlayerIpcMessage } = require('./ipc-message.handler');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function createPlayerWindow(state) {
  if (state.getPlayerWindow() && !state.getPlayerWindow().isDestroyed()) {
    logger.debug('[Player] Reusing existing player window');
    state.getPlayerWindow().focus();
    return state.getPlayerWindow();
  }

  logger.info('[Player] Creating new player window');
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', '..', '..', 'preloads', 'player.js') // adjust path
    },
    title: 'Twitch Player'
  });

  win.webContents.on('ipc-message', (event, channel, ...args) => {
    if (channel === 'player:event') {
      const { type, data } = args[0];
      handlePlayerIpcMessage(state, type, data);
    }
  });

  win.on('closed', () => {
    logger.info('[Player] Player window closed');
    state.setPlayerWindow(null);
    state.setCurrentType(null);
    state.setCurrentId(null);
    state.setIsPlaying(false);
    sendToRenderers('player:closed', {});
  });

  state.setPlayerWindow(win);
  return win;
}

function closePlayer(state) {
  logger.info('[Player] closePlayer called');
  const win = state.getPlayerWindow();
  if (win && !win.isDestroyed()) win.close();
}

function toggleFullscreen(state) {
  const win = state.getPlayerWindow();
  if (!win || win.isDestroyed()) return false;
  win.setFullScreen(!win.isFullScreen());
  logger.debug('[Player] fullscreen toggled');
  return true;
}

module.exports = { createPlayerWindow, closePlayer, toggleFullscreen };