const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function play(state) {
  const win = state.getPlayerWindow();
  if (!win || win.isDestroyed()) {
    logger.warn('[Player] play() called but no player window');
    return false;
  }
  const result = await win.webContents.executeJavaScript(`
    (() => { const v = document.querySelector('video'); if(v) { v.play(); return true; } return false; })()
  `);
  if (result) state.setIsPlaying(true);
  sendToRenderers('player:state-change', {
    isPlaying: state.getIsPlaying(),
    volume: state.getVolume(),
    muted: state.getIsMuted(),
    currentType: state.getCurrentType(),
    currentId: state.getCurrentId(),
    quality: state.getQuality()
  });
  logger.debug(`[Player] play() executed, success=${result}`);
  return result;
}

async function pause(state) {
  const win = state.getPlayerWindow();
  if (!win || win.isDestroyed()) {
    logger.warn('[Player] pause() called but no player window');
    return false;
  }
  const result = await win.webContents.executeJavaScript(`
    (() => { const v = document.querySelector('video'); if(v) { v.pause(); return true; } return false; })()
  `);
  if (result) state.setIsPlaying(false);
  sendToRenderers('player:state-change', {
    isPlaying: state.getIsPlaying(),
    volume: state.getVolume(),
    muted: state.getIsMuted(),
    currentType: state.getCurrentType(),
    currentId: state.getCurrentId(),
    quality: state.getQuality()
  });
  logger.debug(`[Player] pause() executed, success=${result}`);
  return result;
}

async function setVolume(state, level) {
  state.setVolume(level);
  const win = state.getPlayerWindow();
  if (!win || win.isDestroyed()) return false;
  await win.webContents.executeJavaScript(`
    const v = document.querySelector('video'); if(v) v.volume = ${state.getVolume()};
  `);
  if (state.getIsMuted()) await toggleMute(state);
  sendToRenderers('player:state-change', {
    isPlaying: state.getIsPlaying(),
    volume: state.getVolume(),
    muted: state.getIsMuted(),
    currentType: state.getCurrentType(),
    currentId: state.getCurrentId(),
    quality: state.getQuality()
  });
  logger.debug(`[Player] setVolume(${level}) -> ${state.getVolume()}`);
  return true;
}

async function toggleMute(state) {
  state.setIsMuted(!state.getIsMuted());
  const win = state.getPlayerWindow();
  if (!win || win.isDestroyed()) return state.getIsMuted();
  await win.webContents.executeJavaScript(`
    const v = document.querySelector('video'); if(v) v.muted = ${state.getIsMuted()};
  `);
  sendToRenderers('player:state-change', {
    isPlaying: state.getIsPlaying(),
    volume: state.getVolume(),
    muted: state.getIsMuted(),
    currentType: state.getCurrentType(),
    currentId: state.getCurrentId(),
    quality: state.getQuality()
  });
  logger.debug(`[Player] toggleMute() -> muted=${state.getIsMuted()}`);
  return state.getIsMuted();
}

async function setQuality(state, quality) {
  const allowed = ['auto', '160p', '360p', '480p', '720p', '1080p', 'source'];
  if (!allowed.includes(quality)) throw new Error(`Invalid quality: ${quality}`);
  state.setQuality(quality);
  sendToRenderers('player:quality-change', { quality });
  logger.info(`[Player] setQuality(${quality})`);
  return true;
}

module.exports = { play, pause, setVolume, toggleMute, setQuality };