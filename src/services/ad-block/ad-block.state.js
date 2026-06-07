class AdBlockState {
  constructor() {
    this.isAdPlaying = false;
  }

  setAdPlaying(playing) {
    this.isAdPlaying = playing;
  }

  getAdPlaying() {
    return this.isAdPlaying;
  }
}

module.exports = { AdBlockState };