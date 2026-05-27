// src/main/services/twitch-api.service.js
//@ts-check
const { twitchAuthService } = require("./twitch-auth.service");
const { CLIENT_ID, API_BASE } = require("../shared/config");
const { logger } = require("../utils/logger");
const { settingsService } = require("./settings.service");

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
      throw new Error(error.message || `API error: ${res.status}`);
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
    if (!userIds || userIds.length === 0) return { data: [] };
    const params = new URLSearchParams();
    userIds.forEach((/** @type {string} */ id) => params.append("user_id", id));
    return this.fetchTwitch(`streams?${params}`);
  }

  /**
   * Kunin ang mga FOLLOWED channels na kasalukuyang LIVE
   * @param {any} userId
   */
  async getFollowedStreams(userId, limit = 100) {
    try {
      logger.debug(`[TwitchApiService] getFollowedStreams called for user ${userId}`);

      const followedResponse = await this.getFollowedChannels(userId);

      if (!followedResponse?.data || followedResponse.data.length === 0) {
        logger.debug("[TwitchApiService] No followed channels found");
        return { data: [] };
      }

      const broadcasterIds = followedResponse.data.map(
        (/** @type {{ broadcaster_id: any; }} */ channel) => channel.broadcaster_id
      );

      const limitedIds = broadcasterIds.slice(0, Math.min(limit, 100));
      const streamsResponse = await this.getStreams(limitedIds);

      logger.debug(`[TwitchApiService] Found ${streamsResponse?.data?.length || 0} live followed streams`);
      return streamsResponse;
    } catch (error) {
      // @ts-ignore
      logger.error("[TwitchApiService] Error in getFollowedStreams:", error);
      throw error;
    }
  }

  /**
   * Get user information by login name
   * @param {string} login
   * @returns {Promise<Object|null>}
   */
  async getUserByName(login) {
    const result = await this.fetchTwitch(`users?login=${login}`);
    return result.data?.[0] || null;
  }

  async getTopStreams(first = 100, after = null) {
    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
      type: "live",
    });
    if (after) params.append("after", after);
    return this.fetchTwitch(`streams?${params}`);
  }

  async getTopStreamsWithFilters(
    first = 100,
    after = null,
    gameId = null,
    language = null,
  ) {
    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
      type: "live",
    });
    if (after) params.append("after", after);
    if (gameId) params.append("game_id", gameId);
    if (language) params.append("language", language);
    return this.fetchTwitch(`streams?${params}`);
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
    const channels = await this.searchChannels(query, first);
    const channelIds = channels.data.map((/** @type {{ id: any; }} */ c) => c.id);
    if (channelIds.length === 0) return { data: [] };
    return this.getStreams(channelIds);
  }

  // Add these methods to TwitchApiService class

  /**
   * Get stream key for the authenticated user's channel
   * Requires scope: channel:read:stream_key
   */
  async getStreamKey() {
    const userId = settingsService.get("twitch")?.userId;
    if (!userId) throw new Error("Not logged in");
    return this.fetchTwitch(`streams/key?broadcaster_id=${userId}`);
  }

  async getIngestServers() {
    return this.fetchTwitch("ingests");
  }

  /**
   * Regenerate stream key (POST)
   * Requires scope: channel:manage:broadcast
   */
  async regenerateStreamKey() {
    const userId = settingsService.get("twitch")?.userId;
    if (!userId) throw new Error("Not logged in");

    const url = `${API_BASE}/streams/key`;
    const token = twitchAuthService.getAccessToken();

    const response = await fetch(url, {
      method: "POST",
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ broadcaster_id: userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to regenerate stream key");
    }

    return response.json();
  }

  /**
   * Get chat settings for a channel
   * @param {any} broadcasterId
   * @param {any} moderatorId
   */
  async getChatSettings(broadcasterId, moderatorId) {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
    });
    return this.fetchTwitch(`chat/settings?${params}`);
  }

  /**
   * Update chat settings
   * @param {any} broadcasterId
   * @param {any} moderatorId
   * @param {any} settings
   */
  async updateChatSettings(broadcasterId, moderatorId, settings) {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
    });
    return this.fetchTwitch(`chat/settings?${params}`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  }

  /**
   * @param {any} userId
   */
  async getVideos(userId, type = "archive", first = 20, after = null) {
    const params = new URLSearchParams({
      user_id: userId,
      type: type,
      first: String(Math.min(first, 100)),
    });
    if (after) params.append("after", after);
    return this.fetchTwitch(`videos?${params}`);
  }
}

const twitchApiService = new TwitchApiService();
module.exports = { twitchApiService, TwitchApiService };