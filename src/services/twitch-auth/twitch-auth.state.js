class TwitchAuthState {
  constructor() {
    this.refreshTimer = null;
  }

  setRefreshTimer(timer) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = timer;
  }

  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

module.exports = { TwitchAuthState };