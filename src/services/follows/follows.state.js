class FollowsState {
  constructor() {
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  isCacheValid() {
    return this.followsCache && Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  getCachedFollows() {
    return this.followsCache;
  }

  setCachedFollows(data) {
    this.followsCache = data;
    this.cacheTimestamp = Date.now();
  }

  clearCache() {
    this.followsCache = null;
    this.cacheTimestamp = 0;
  }

  getCacheTTL() {
    return this.CACHE_TTL;
  }
}

module.exports = { FollowsState };