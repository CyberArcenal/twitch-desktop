const { FollowsState } = require('./follows.state');
const { getFollowedChannels } = require('./handlers/get-followed-channels.handler');
const { getFollowers } = require('./handlers/get-followers.handler');
const { followChannel } = require('./handlers/follow-channel.handler');
const { unfollowChannel } = require('./handlers/unfollow-channel.handler');
const { isFollowing } = require('./handlers/is-following.handler');
const { settingsService } = require('../settings');
const { logger } = require('../../utils/logger');

class FollowsService {
  constructor() {
    this.state = new FollowsState();
    logger.debug('[FollowsService] Constructor - instance created');
  }

  initialize(mainWindow) {
    // mainWindow no longer used directly; IPC uses shared sendToRenderers
    logger.info('[FollowsService] Initialized');
  }

  async getFollowedChannels(userId, after = null, forceRefresh = false) {
    return getFollowedChannels(userId, after, forceRefresh, this.state);
  }

  async getFollowers(broadcasterId, after = null) {
    return getFollowers(broadcasterId, after);
  }

  async followChannel(broadcasterId) {
    return followChannel(broadcasterId, this.state);
  }

  async unfollowChannel(broadcasterId) {
    return unfollowChannel(broadcasterId, this.state);
  }

  async isFollowing(broadcasterId) {
    return isFollowing(broadcasterId);
  }

  saveFollowsToLocalStorage() {
    const cache = this.state.getCachedFollows();
    if (cache && cache.data) {
      logger.debug('[FollowsService] Saving follows to localStorage');
      settingsService.set('cachedFollows', {
        data: cache.data,
        timestamp: cache.timestamp,
      });
    }
  }

  loadFollowsFromLocalStorage() {
    const cached = settingsService.get('cachedFollows');
    if (cached && cached.data && cached.timestamp) {
      this.state.setCachedFollows({
        data: cached.data,
        total: cached.data.length,
        timestamp: cached.timestamp,
      });
      logger.debug(`[FollowsService] Loaded ${cached.data.length} follows from localStorage`);
      return true;
    }
    logger.debug('[FollowsService] No cached follows found');
    return false;
  }

  clearCache() {
    logger.info('[FollowsService] Clearing follows cache');
    this.state.clearCache();
    settingsService.set('cachedFollows', null);
  }
}

const followsService = new FollowsService();
module.exports = { followsService, FollowsService };