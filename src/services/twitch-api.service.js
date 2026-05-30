// src/main/services/twitch-api.service.js
//@ts-check
const { twitchAuthService } = require("./twitch-auth.service");
const { CLIENT_ID, API_BASE } = require("../shared/config");
const { logger } = require("../utils/logger");
const { settingsService } = require("./settings.service");
const { BrowserWindow } = require("electron");

class TwitchApiService {
  // @ts-ignore
  async fetchTwitch(endpoint, options = {}, retry = true) {
    const url = `${API_BASE}/${endpoint}`;
    // @ts-ignore
    const method = options.method || 'GET';
    logger.debug(`[TwitchApi] ${method} ${endpoint} - starting`);

    const startTime = Date.now();
    // @ts-ignore
    const headers = { ...options.headers };

    const token = twitchAuthService.getAccessToken();
    if (!token) {
      logger.error(`[TwitchApi] ${endpoint} - No access token`);
      throw new Error("Not authenticated");
    }

    headers["Authorization"] = `Bearer ${token}`;
    headers["Client-Id"] = CLIENT_ID;

    try {
      const res = await fetch(url, { ...options, headers });
      const duration = Date.now() - startTime;

      if (res.status === 401 && retry) {
        logger.warn(`[TwitchApi] ${endpoint} - 401 Unauthorized, attempting token refresh`);
        const refreshed = await twitchAuthService.refreshTokenIfNeeded();
        if (refreshed) {
          logger.info(`[TwitchApi] ${endpoint} - Token refreshed, retrying (once)`);
          return this.fetchTwitch(endpoint, options, false);
        } else {
          logger.error(`[TwitchApi] ${endpoint} - Token refresh failed`);
        }
      }

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`[TwitchApi] ${endpoint} - HTTP ${res.status} (${duration}ms): ${errorText.substring(0, 200)}`);
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      logger.debug(`[TwitchApi] ${endpoint} - success (${duration}ms)`);
      return data;
    } catch (err) {
      // @ts-ignore
      logger.error(`[TwitchApi] ${endpoint} - exception:`, err);
      throw err;
    }
  }

  async getCurrentUser() {
    logger.debug("[TwitchApi] getCurrentUser called");
    const result = await this.fetchTwitch("users");
    logger.debug(`[TwitchApi] getCurrentUser - found ${result.data?.length || 0} users`);
    return result;
  }

  /**
   * @param {any} userId
   */
  async getFollowedChannels(userId, after = null) {
    logger.debug(`[TwitchApi] getFollowedChannels called for userId=${userId}, after=${after}`);
    const params = new URLSearchParams({
      user_id: userId,
      first: "100",
    });
    if (after) params.append("after", after);
    const result = await this.fetchTwitch(`channels/followed?${params}`);
    logger.debug(`[TwitchApi] getFollowedChannels - got ${result.data?.length || 0} entries, total=${result.total || '?'}`);
    return result;
  }

  /**
   * @param {any[]} userIds
   */
  async getStreams(userIds) {
    if (!userIds || userIds.length === 0) {
      logger.debug("[TwitchApi] getStreams called with empty userIds, returning empty");
      return { data: [] };
    }
    logger.debug(`[TwitchApi] getStreams called for ${userIds.length} user IDs`);
    const params = new URLSearchParams();
    userIds.forEach((id) => params.append("user_id", id));
    const result = await this.fetchTwitch(`streams?${params}`);
    logger.debug(`[TwitchApi] getStreams - found ${result.data?.length || 0} live streams`);
    return result;
  }

  /**
   * Kunin ang mga FOLLOWED channels na kasalukuyang LIVE
   * @param {any} userId
   */
  async getFollowedStreams(userId, limit = 100) {
    logger.info(`[TwitchApi] getFollowedStreams called for userId=${userId}, limit=${limit}`);
    try {
      const followedResponse = await this.getFollowedChannels(userId);
      if (!followedResponse?.data || followedResponse.data.length === 0) {
        logger.info("[TwitchApi] getFollowedStreams - no followed channels found");
        return { data: [] };
      }

      const broadcasterIds = followedResponse.data.map((/** @type {{ broadcaster_id: any; }} */ channel) => channel.broadcaster_id);
      const limitedIds = broadcasterIds.slice(0, Math.min(limit, 100));
      logger.debug(`[TwitchApi] getFollowedStreams - fetching streams for ${limitedIds.length} broadcasters`);
      const streamsResponse = await this.getStreams(limitedIds);
      logger.info(`[TwitchApi] getFollowedStreams - found ${streamsResponse?.data?.length || 0} live followed streams`);
      return streamsResponse;
    } catch (error) {
      // @ts-ignore
      logger.error("[TwitchApi] getFollowedStreams - error:", error);
      throw error;
    }
  }

  /**
   * Get user information by login name
   * @param {string} login
   * @returns {Promise<Object|null>}
   */
  async getUserByName(login) {
    logger.debug(`[TwitchApi] getUserByName called for login=${login}`);
    const result = await this.fetchTwitch(`users?login=${login}`);
    const user = result.data?.[0] || null;
    logger.debug(`[TwitchApi] getUserByName - ${user ? 'found' : 'not found'}`);
    return user;
  }

  async getTopStreams(first = 100, after = null) {
    logger.debug(`[TwitchApi] getTopStreams called first=${first}, after=${after}`);
    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
      type: "live",
    });
    if (after) params.append("after", after);
    const result = await this.fetchTwitch(`streams?${params}`);
    logger.debug(`[TwitchApi] getTopStreams - got ${result.data?.length || 0} streams`);
    return result;
  }

  async getTopStreamsWithFilters(first = 100, after = null, gameId = null, language = null) {
    logger.debug(`[TwitchApi] getTopStreamsWithFilters first=${first}, after=${after}, gameId=${gameId}, language=${language}`);
    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
      type: "live",
    });
    if (after) params.append("after", after);
    if (gameId) params.append("game_id", gameId);
    if (language) params.append("language", language);
    const result = await this.fetchTwitch(`streams?${params}`);
    logger.debug(`[TwitchApi] getTopStreamsWithFilters - got ${result.data?.length || 0} streams`);
    return result;
  }

  /**
   * @param {any} broadcasterId
   */
  async getChannelInfo(broadcasterId) {
    logger.debug(`[TwitchApi] getChannelInfo called for broadcasterId=${broadcasterId}`);
    const result = await this.fetchTwitch(`channels?broadcaster_id=${broadcasterId}`);
    logger.debug(`[TwitchApi] getChannelInfo - result ${result.data?.length ? 'found' : 'not found'}`);
    return result;
  }

  /**
   * @param {any} query
   */
  async searchChannels(query, first = 20) {
    logger.debug(`[TwitchApi] searchChannels called query="${query}", first=${first}`);
    const params = new URLSearchParams({
      query,
      first: String(Math.min(first, 100)),
    });
    const result = await this.fetchTwitch(`search/channels?${params}`);
    logger.debug(`[TwitchApi] searchChannels - found ${result.data?.length || 0} channels`);
    return result;
  }

  /**
   * @param {any} gameId
   */
  async getGameInfo(gameId) {
    logger.debug(`[TwitchApi] getGameInfo called for gameId=${gameId}`);
    const result = await this.fetchTwitch(`games?id=${gameId}`);
    const game = result.data?.[0] || null;
    logger.debug(`[TwitchApi] getGameInfo - ${game ? 'found' : 'not found'}`);
    return game ? { data: [game] } : result;
  }

  /**
   * @param {any} query
   */
  async searchCategories(query, first = 20) {
    logger.debug(`[TwitchApi] searchCategories called query="${query}", first=${first}`);
    const params = new URLSearchParams({
      query,
      first: String(Math.min(first, 100)),
    });
    const result = await this.fetchTwitch(`search/categories?${params}`);
    logger.debug(`[TwitchApi] searchCategories - found ${result.data?.length || 0} categories`);
    return result;
  }

  /**
   * @param {any} query
   */
  async searchStreams(query, first = 20) {
    logger.debug(`[TwitchApi] searchStreams called query="${query}", first=${first}`);
    const channels = await this.searchChannels(query, first);
    const channelIds = channels.data.map((/** @type {{ id: any; }} */ c) => c.id);
    if (channelIds.length === 0) {
      logger.debug("[TwitchApi] searchStreams - no channels found, returning empty");
      return { data: [] };
    }
    const streams = await this.getStreams(channelIds);
    logger.debug(`[TwitchApi] searchStreams - found ${streams.data?.length || 0} streams`);
    return streams;
  }

  /**
   * Get stream key for the authenticated user's channel
   * Requires scope: channel:read:stream_key
   */
  async getStreamKey() {
    const userId = settingsService.get("twitch")?.userId;
    if (!userId) {
      logger.error("[TwitchApi] getStreamKey - no userId in settings");
      throw new Error("Not logged in");
    }
    logger.debug(`[TwitchApi] getStreamKey called for userId=${userId}`);
    const result = await this.fetchTwitch(`streams/key?broadcaster_id=${userId}`);
    logger.info("[TwitchApi] getStreamKey - success (key obtained)");
    return result;
  }

  async getIngestServers() {
    logger.debug("[TwitchApi] getIngestServers called");
    const result = await this.fetchTwitch("ingests");
    logger.debug(`[TwitchApi] getIngestServers - found ${result.data?.length || 0} ingest servers`);
    return result;
  }

  /**
   * Opens the Twitch Dashboard stream settings page where the user can manually
   * regenerate their stream key.
   * @returns {Promise<{ status: boolean, message: string }>}
   */
  async regenerateStreamKey() {
    const userId = settingsService.get("twitch")?.userId;
    if (!userId) {
      logger.error("[TwitchApi] regenerateStreamKey - no userId");
      throw new Error("Not logged in");
    }

    logger.info(`[TwitchApi] regenerateStreamKey - opening dashboard for user ${userId}`);
    const dashboardUrl = "https://dashboard.twitch.tv/settings/stream";

    const keyWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      // @ts-ignore
      parent: BrowserWindow.getFocusedWindow(),
      modal: false,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    keyWindow.on("closed", () => {
      logger.info("[TwitchApi] regenerateStreamKey - dashboard window closed, notifying renderers to refresh live status");
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send("dashboard:closed", { action: "refresh_live_status" });
        }
      });
    });

    await keyWindow.loadURL(dashboardUrl);
    logger.info("[TwitchApi] regenerateStreamKey - dashboard window loaded");
    return {
      status: true,
      message: "Opened Twitch Dashboard. Please manually regenerate your stream key there.",
    };
  }

  /**
   * Get chat settings for a channel
   * @param {any} broadcasterId
   * @param {any} moderatorId
   */
  async getChatSettings(broadcasterId, moderatorId) {
    logger.debug(`[TwitchApi] getChatSettings called for broadcaster=${broadcasterId}, moderator=${moderatorId}`);
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
    });
    const result = await this.fetchTwitch(`chat/settings?${params}`);
    logger.debug(`[TwitchApi] getChatSettings - success`);
    return result;
  }

  /**
   * Update chat settings
   * @param {any} broadcasterId
   * @param {any} moderatorId
   * @param {any} settings
   */
  async updateChatSettings(broadcasterId, moderatorId, settings) {
    logger.info(`[TwitchApi] updateChatSettings called for broadcaster=${broadcasterId}`, settings);
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
    });
    const result = await this.fetchTwitch(`chat/settings?${params}`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
    logger.info(`[TwitchApi] updateChatSettings - success`);
    return result;
  }

  /**
   * @param {any} userId
   */
  async getVideos(userId, type = "archive", first = 20, after = null) {
    logger.debug(`[TwitchApi] getVideos called userId=${userId}, type=${type}, first=${first}, after=${after}`);
    const params = new URLSearchParams({
      user_id: userId,
      type: type,
      first: String(Math.min(first, 100)),
    });
    if (after) params.append("after", after);
    const result = await this.fetchTwitch(`videos?${params}`);
    logger.debug(`[TwitchApi] getVideos - found ${result.data?.length || 0} videos`);
    return result;
  }
}

const twitchApiService = new TwitchApiService();
module.exports = { twitchApiService, TwitchApiService };