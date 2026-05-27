// src/main/services/twitch-api.service.js
//@ts-check
const { twitchAuthService } = require("./twitch-auth.service");
const { CLIENT_ID, API_BASE } = require("../shared/config");
const { logger } = require("../utils/logger");

class TwitchApiService {
  // @ts-ignore
  async fetchTwitch(endpoint, options = {}, retry = true) {
    const url = `${API_BASE}/${endpoint}`;
    // @ts-ignore
    const headers = { ...options.headers };

    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error("Not authenticated");
    headers["Authorization"] = `Bearer ${token}`;
    headers["Client-Id"] = CLIENT_ID;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && retry) {
      const refreshed = await twitchAuthService.refreshTokenIfNeeded();
      if (refreshed) return this.fetchTwitch(endpoint, options, false);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "API error");
    }
    return res.json();
  }

  async getCurrentUser() {
    return this.fetchTwitch("users");
  }

  /**
   * @param {any} userId
   */
  async getFollowedChannels(userId, after = null) {
    const params = new URLSearchParams({
      user_id: userId,
      first: "100",
    });
    if (after) params.append("after", after);

    return this.fetchTwitch(`channels/followed?${params}`);
  }

  /**
   * @param {any[]} userIds
   */
  async getStreams(userIds) {
    const params = new URLSearchParams();
    userIds.forEach((/** @type {string} */ id) => params.append("user_id", id));
    return this.fetchTwitch(`streams?${params}`);
  }

  // Sa loob ng class TwitchApiService

  /**
   * Kunin ang mga FOLLOWED channels na kasalukuyang LIVE
   * @param {string} userId - Ang user ID ng naka-login na user
   * @param {number} limit - Maximum number of live streams to return (default 100)
   * @returns {Promise<Object>} Twitch API response with live followed streams
   */
  async getFollowedStreams(userId, limit = 100) {
    try {
      logger.debug(`[TwitchApiService] getFollowedStreams called for user ${userId}`);

      // Step 1: Kunin ang lahat ng followed channels
      const followedResponse = await this.getFollowedChannels(userId);
      
      if (!followedResponse?.data || followedResponse.data.length === 0) {
        logger.debug('[TwitchApiService] No followed channels found');
        return { data: [] };
      }

      // Step 2: Kunin ang broadcaster IDs
      const broadcasterIds = followedResponse.data.map((/** @type {{ broadcaster_id: any; }} */ channel) => channel.broadcaster_id);
      
      // Limit to first 'limit' channels (Twitch streams endpoint has limit)
      const limitedIds = broadcasterIds.slice(0, Math.min(limit, 100));

      // Step 3: Kunin ang live streams ng mga ito
      const streamsResponse = await this.getStreams(limitedIds);

      logger.debug(`[TwitchApiService] Found ${streamsResponse?.data?.length || 0} live followed streams`);
      return streamsResponse;

    } catch (error) {
      // @ts-ignore
      logger.error('[TwitchApiService] Error in getFollowedStreams:', error);
      throw error;
    }
  }

  /**
   * @param {any} broadcasterId
   */
  async getChannelInfo(broadcasterId) {
    return this.fetchTwitch(`channels?broadcaster_id=${broadcasterId}`);
  }

  /**
   * @param {any} query
   */
  async searchChannels(query, first = 20) {
    const params = new URLSearchParams({
      query,
      first: String(Math.min(first, 100)),
    });
    return this.fetchTwitch(`search/channels?${params}`);
  }

  /**
   * @param {any} gameId
   */
  async getGameInfo(gameId) {
    return this.fetchTwitch(`games?id=${gameId}`);
  }

  /**
   * @param {any} query
   */
  async searchCategories(query, first = 20) {
    const params = new URLSearchParams({
      query,
      first: String(Math.min(first, 100)),
    });
    return this.fetchTwitch(`search/categories?${params}`);
  }

  /**
   * @param {any} query
   */
  async searchStreams(query, first = 20) {
    // Twitch API has no direct stream search; workaround: search channels, then get streams for those channel IDs
    const channels = await this.searchChannels(query, first);
    const channelIds = channels.data.map(
      (/** @type {{ id: any; }} */ c) => c.id,
    );
    if (channelIds.length === 0) return { data: [] };
    const streamsData = await this.getStreams(channelIds);
    return streamsData;
  }
}

const twitchApiService = new TwitchApiService();
module.exports = { twitchApiService, TwitchApiService };
