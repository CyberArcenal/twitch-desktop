// src/main/services/player.service.js
//@ts-check
const { BrowserWindow } = require('electron');
const path = require('path');
const { logger } = require("../utils/logger");

class PlayerService {
  constructor() {
    this.playerWindow = null;
    this.currentType = null;     // 'stream' or 'vod'
    this.currentId = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.isMuted = false;
    this.quality = 'auto';
    this.mainWindow = null;
    logger.debug("[PlayerService] Constructor - instance created");
  }

  /**
   * @param {BrowserWindow | null} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    logger.info("[PlayerService] Initialized");
  }

  /**
   * @param {string} channel
   * @param {{ error?: any; isPlaying?: boolean; volume?: number; muted?: boolean; currentType?: string | null; currentId?: any; quality?: any; type?: string; id?: any; }} data
   */
  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
      logger.debug(`[PlayerService] Sent event "${channel}" to renderers`);
    } catch (err) {
      // @ts-ignore
      logger.warn(`[PlayerService] Failed to send event "${channel}":`, err);
    }
  }

  _createPlayerWindow() {
    if (this.playerWindow && !this.playerWindow.isDestroyed()) {
      logger.debug("[PlayerService] Reusing existing player window");
      this.playerWindow.focus();
      return this.playerWindow;
    }

    logger.info("[PlayerService] Creating new player window");
    this.playerWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 640,
      minHeight: 360,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preloads', 'player.js')
      },
      title: 'Twitch Player'
    });

    // @ts-ignore
    this.playerWindow.webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'player:event') {
        const { type, data } = args[0];
        this._handlePlayerEvent(type, data);
      }
    });

    this.playerWindow.on('closed', () => {
      logger.info("[PlayerService] Player window closed");
      this.playerWindow = null;
      this.currentType = null;
      this.currentId = null;
      this.isPlaying = false;
      this._sendToRenderers('player:closed', {});
    });

    return this.playerWindow;
  }

  /**
   * @param {string} type
   * @param {string} id
   */
  _buildUrl(type, id, options = {}) {
    const base = 'https://player.twitch.tv';
    const params = new URLSearchParams({
      parent: 'localhost',
      // @ts-ignore
      autoplay: options.autoplay ? 'true' : 'false'
    });
    if (type === 'stream') params.set('channel', id);
    else if (type === 'vod') params.set('video', id);
    // @ts-ignore
    if (options.quality && options.quality !== 'auto') params.set('quality', options.quality);
    // @ts-ignore
    if (options.timestamp) params.set('timestamp', options.timestamp);
    const url = `${base}/?${params.toString()}`;
    logger.debug(`[PlayerService] Built URL for ${type} ${id}: ${url}`);
    return url;
  }

  /**
   * @param {any} type
   * @param {{ volume: number; muted: boolean; message: any; }} data
   */
  _handlePlayerEvent(type, data) {
    // @ts-ignore
    logger.debug(`[PlayerService] Player event: ${type}`, data);
    switch (type) {
      case 'playing': this.isPlaying = true; break;
      case 'paused': this.isPlaying = false; break;
      case 'ended': this.isPlaying = false; break;
      case 'volume-change':
        this.volume = data.volume;
        this.isMuted = data.muted;
        break;
      case 'error':
        logger.error(`[PlayerService] Player error: ${data.message}`);
        this._sendToRenderers('player:error', { error: data.message });
        return;
      default: return;
    }
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying,
      volume: this.volume,
      muted: this.isMuted,
      currentType: this.currentType,
      currentId: this.currentId,
      quality: this.quality
    });
  }

  // Public API
  /**
   * @param {any} channelName
   */
  async loadStream(channelName, options = {}) {
    logger.info(`[PlayerService] loadStream called for channel=${channelName}, options=${JSON.stringify(options)}`);
    const win = this._createPlayerWindow();
    await win.loadURL(this._buildUrl('stream', channelName, options));
    win.setTitle(`Twitch: ${channelName}`);
    win.show();
    this.currentType = 'stream';
    this.currentId = channelName;
    // @ts-ignore
    this.isPlaying = options.autoplay || false;
    this._sendToRenderers('player:loaded', { type: 'stream', id: channelName });
    logger.success(`[PlayerService] Stream ${channelName} loaded`);
    return true;
  }

  /**
   * @param {any} vodId
   */
  async loadVod(vodId, options = {}) {
    logger.info(`[PlayerService] loadVod called for vodId=${vodId}, options=${JSON.stringify(options)}`);
    const win = this._createPlayerWindow();
    await win.loadURL(this._buildUrl('vod', vodId, options));
    win.setTitle(`Twitch VOD: ${vodId}`);
    win.show();
    this.currentType = 'vod';
    this.currentId = vodId;
    // @ts-ignore
    this.isPlaying = options.autoplay || false;
    this._sendToRenderers('player:loaded', { type: 'vod', id: vodId });
    logger.success(`[PlayerService] VOD ${vodId} loaded`);
    return true;
  }

  async play() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) {
      logger.warn("[PlayerService] play() called but no player window");
      return false;
    }
    const result = await this.playerWindow.webContents.executeJavaScript(`
      (() => { const v = document.querySelector('video'); if(v) { v.play(); return true; } return false; })()
    `);
    if (result) this.isPlaying = true;
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    logger.debug(`[PlayerService] play() executed, success=${result}`);
    return result;
  }

  async pause() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) {
      logger.warn("[PlayerService] pause() called but no player window");
      return false;
    }
    const result = await this.playerWindow.webContents.executeJavaScript(`
      (() => { const v = document.querySelector('video'); if(v) { v.pause(); return true; } return false; })()
    `);
    if (result) this.isPlaying = false;
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    logger.debug(`[PlayerService] pause() executed, success=${result}`);
    return result;
  }

  /**
   * @param {number} level
   */
  async setVolume(level) {
    this.volume = Math.min(1, Math.max(0, level));
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return false;
    await this.playerWindow.webContents.executeJavaScript(`
      const v = document.querySelector('video'); if(v) v.volume = ${this.volume};
    `);
    if (this.isMuted) await this.toggleMute();
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    logger.debug(`[PlayerService] setVolume(${level}) -> ${this.volume}`);
    return true;
  }

  async toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return this.isMuted;
    await this.playerWindow.webContents.executeJavaScript(`
      const v = document.querySelector('video'); if(v) v.muted = ${this.isMuted};
    `);
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    logger.debug(`[PlayerService] toggleMute() -> muted=${this.isMuted}`);
    return this.isMuted;
  }

  /**
   * @param {string} quality
   */
  async setQuality(quality) {
    const allowed = ['auto', '160p', '360p', '480p', '720p', '1080p', 'source'];
    if (!allowed.includes(quality)) throw new Error(`Invalid quality: ${quality}`);
    this.quality = quality;
    this._sendToRenderers('player:quality-change', { quality });
    logger.info(`[PlayerService] setQuality(${quality})`);
    return true;
  }

  async fullscreen() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return false;
    this.playerWindow.setFullScreen(!this.playerWindow.isFullScreen());
    logger.debug(`[PlayerService] fullscreen toggled`);
    return true;
  }

  closePlayer() {
    logger.info("[PlayerService] closePlayer called");
    if (this.playerWindow && !this.playerWindow.isDestroyed()) this.playerWindow.close();
  }
}

const playerService = new PlayerService();
module.exports = { playerService, PlayerService };