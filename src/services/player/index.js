const { PlayerState } = require('./player.state');
const { buildUrl } = require('./handlers/url-builder.handler');
const { createPlayerWindow, closePlayer, toggleFullscreen } = require('./handlers/player-window.handler');
const { play, pause, setVolume, toggleMute, setQuality } = require('./handlers/player-controls.handler');
const { sendToRenderers } = require('../../utils/ipc-sender');
const { logger } = require('../../utils/logger');

class PlayerService {
  constructor() {
    this.state = new PlayerState();
    logger.debug('[PlayerService] Constructor - instance created');
  }

  initialize(mainWindow) {
    // mainWindow is no longer used directly; IPC uses shared sendToRenderers
    logger.info('[PlayerService] Initialized');
  }

  async loadStream(channelName, options = {}) {
    logger.info(`[PlayerService] loadStream called for channel=${channelName}, options=${JSON.stringify(options)}`);
    const win = createPlayerWindow(this.state);
    await win.loadURL(buildUrl('stream', channelName, options));
    win.setTitle(`Twitch: ${channelName}`);
    win.show();
    this.state.setCurrentType('stream');
    this.state.setCurrentId(channelName);
    this.state.setIsPlaying(options.autoplay || false);
    sendToRenderers('player:loaded', { type: 'stream', id: channelName });
    logger.success(`[PlayerService] Stream ${channelName} loaded`);
    return true;
  }

  async loadVod(vodId, options = {}) {
    logger.info(`[PlayerService] loadVod called for vodId=${vodId}, options=${JSON.stringify(options)}`);
    const win = createPlayerWindow(this.state);
    await win.loadURL(buildUrl('vod', vodId, options));
    win.setTitle(`Twitch VOD: ${vodId}`);
    win.show();
    this.state.setCurrentType('vod');
    this.state.setCurrentId(vodId);
    this.state.setIsPlaying(options.autoplay || false);
    sendToRenderers('player:loaded', { type: 'vod', id: vodId });
    logger.success(`[PlayerService] VOD ${vodId} loaded`);
    return true;
  }

  async play() {
    return play(this.state);
  }

  async pause() {
    return pause(this.state);
  }

  async setVolume(level) {
    return setVolume(this.state, level);
  }

  async toggleMute() {
    return toggleMute(this.state);
  }

  async setQuality(quality) {
    return setQuality(this.state, quality);
  }

  async fullscreen() {
    return toggleFullscreen(this.state);
  }

  closePlayer() {
    closePlayer(this.state);
  }
}

const playerService = new PlayerService();
module.exports = { playerService, PlayerService };