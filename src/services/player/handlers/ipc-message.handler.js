const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handlePlayerIpcMessage(state, type, data) {
  logger.debug(`[Player] Player event: ${type}`, data);
  switch (type) {
    case 'playing':
      state.setIsPlaying(true);
      break;
    case 'paused':
      state.setIsPlaying(false);
      break;
    case 'ended':
      state.setIsPlaying(false);
      break;
    case 'volume-change':
      state.setVolume(data.volume);
      state.setIsMuted(data.muted);
      break;
    case 'error':
      logger.error(`[Player] Player error: ${data.message}`);
      sendToRenderers('player:error', { error: data.message });
      return;
    default:
      return;
  }
  sendToRenderers('player:state-change', {
    isPlaying: state.getIsPlaying(),
    volume: state.getVolume(),
    muted: state.getIsMuted(),
    currentType: state.getCurrentType(),
    currentId: state.getCurrentId(),
    quality: state.getQuality()
  });
}

module.exports = { handlePlayerIpcMessage };