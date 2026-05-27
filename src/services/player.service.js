// src/main/services/player.service.js
//@ts-check
const { BrowserWindow } = require('electron');
const path = require('path');

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
  }

  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    console.log('[PlayerService] Initialized');
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[PlayerService] send error:', err);
    }
  }

  _createPlayerWindow() {
    if (this.playerWindow && !this.playerWindow.isDestroyed()) {
      this.playerWindow.focus();
      return this.playerWindow;
    }

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

    // Forward events from preload
    this.playerWindow.webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'player:event') {
        const { type, data } = args[0];
        this._handlePlayerEvent(type, data);
      }
    });

    this.playerWindow.on('closed', () => {
      this.playerWindow = null;
      this.currentType = null;
      this.currentId = null;
      this.isPlaying = false;
      this._sendToRenderers('player:closed', {});
    });

    return this.playerWindow;
  }

  _buildUrl(type, id, options = {}) {
    const base = 'https://player.twitch.tv';
    const params = new URLSearchParams({
      parent: 'localhost',
      autoplay: options.autoplay ? 'true' : 'false'
    });
    if (type === 'stream') params.set('channel', id);
    else if (type === 'vod') params.set('video', id);
    if (options.quality && options.quality !== 'auto') params.set('quality', options.quality);
    if (options.timestamp) params.set('timestamp', options.timestamp);
    return `${base}/?${params.toString()}`;
  }

  _handlePlayerEvent(type, data) {
    switch (type) {
      case 'playing': this.isPlaying = true; break;
      case 'paused': this.isPlaying = false; break;
      case 'ended': this.isPlaying = false; break;
      case 'volume-change':
        this.volume = data.volume;
        this.isMuted = data.muted;
        break;
      case 'error':
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
  async loadStream(channelName, options = {}) {
    const win = this._createPlayerWindow();
    await win.loadURL(this._buildUrl('stream', channelName, options));
    win.setTitle(`Twitch: ${channelName}`);
    win.show();
    this.currentType = 'stream';
    this.currentId = channelName;
    this.isPlaying = options.autoplay || false;
    this._sendToRenderers('player:loaded', { type: 'stream', id: channelName });
    return true;
  }

  async loadVod(vodId, options = {}) {
    const win = this._createPlayerWindow();
    await win.loadURL(this._buildUrl('vod', vodId, options));
    win.setTitle(`Twitch VOD: ${vodId}`);
    win.show();
    this.currentType = 'vod';
    this.currentId = vodId;
    this.isPlaying = options.autoplay || false;
    this._sendToRenderers('player:loaded', { type: 'vod', id: vodId });
    return true;
  }

  async play() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return false;
    const result = await this.playerWindow.webContents.executeJavaScript(`
      (() => { const v = document.querySelector('video'); if(v) { v.play(); return true; } return false; })()
    `);
    if (result) this.isPlaying = true;
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    return result;
  }

  async pause() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return false;
    const result = await this.playerWindow.webContents.executeJavaScript(`
      (() => { const v = document.querySelector('video'); if(v) { v.pause(); return true; } return false; })()
    `);
    if (result) this.isPlaying = false;
    this._sendToRenderers('player:state-change', {
      isPlaying: this.isPlaying, volume: this.volume, muted: this.isMuted,
      currentType: this.currentType, currentId: this.currentId, quality: this.quality
    });
    return result;
  }

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
    return this.isMuted;
  }

  async setQuality(quality) {
    const allowed = ['auto', '160p', '360p', '480p', '720p', '1080p', 'source'];
    if (!allowed.includes(quality)) throw new Error(`Invalid quality: ${quality}`);
    this.quality = quality;
    this._sendToRenderers('player:quality-change', { quality });
    // Optional: reload with new quality
    return true;
  }

  async fullscreen() {
    if (!this.playerWindow || this.playerWindow.isDestroyed()) return false;
    this.playerWindow.setFullScreen(!this.playerWindow.isFullScreen());
    return true;
  }

  closePlayer() {
    if (this.playerWindow && !this.playerWindow.isDestroyed()) this.playerWindow.close();
  }
}

const playerService = new PlayerService();
module.exports = { playerService, PlayerService };