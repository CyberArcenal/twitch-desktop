class PlayerState {
  constructor() {
    this.playerWindow = null;
    this.currentType = null;     // 'stream' or 'vod'
    this.currentId = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.isMuted = false;
    this.quality = 'auto';
  }

  setPlayerWindow(win) { this.playerWindow = win; }
  getPlayerWindow() { return this.playerWindow; }
  setCurrentType(type) { this.currentType = type; }
  getCurrentType() { return this.currentType; }
  setCurrentId(id) { this.currentId = id; }
  getCurrentId() { return this.currentId; }
  setIsPlaying(playing) { this.isPlaying = playing; }
  getIsPlaying() { return this.isPlaying; }
  setVolume(vol) { this.volume = Math.min(1, Math.max(0, vol)); }
  getVolume() { return this.volume; }
  setIsMuted(muted) { this.isMuted = muted; }
  getIsMuted() { return this.isMuted; }
  setQuality(qual) { this.quality = qual; }
  getQuality() { return this.quality; }
}

module.exports = { PlayerState };