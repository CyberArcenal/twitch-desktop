// src/main/services/follows.service.js
//@ts-check
const { twitchApiService } = require("./twitch-api.service");
const { settingsService } = require("./settings.service");
const { BrowserWindow } = require("electron");
const { logger } = require("../utils/logger");

class FollowsService {
  constructor() {
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.mainWindow = null;
    logger.debug("[FollowsService] Constructor - instance created");
  }

  /**
   * @param {BrowserWindow | null} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    logger.info("[FollowsService] Initialized");
  }

  /**
   * @param {string} channel
   * @param {{ action: string; broadcasterId: any; }} data
   */
  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
      logger.debug(`[FollowsService] Sent event "${channel}" to renderers`);
    } catch (err) {
      // @ts-ignore
      logger.warn(`[FollowsService] Failed to send event "${channel}":`, err);
    }
  }

  isCacheValid() {
    const valid = this.followsCache && Date.now() - this.cacheTimestamp < this.CACHE_TTL;
    logger.debug(`[FollowsService] isCacheValid: ${valid}`);
    return valid;
  }

  /**
   * @param {any} userId
   */
  async getFollowedChannels(userId, after = null, forceRefresh = false) {
    if (!userId) throw new Error("User ID is required");
    logger.info(`[FollowsService] getFollowedChannels called userId=${userId}, after=${after}, forceRefresh=${forceRefresh}`);
    if (!forceRefresh && this.isCacheValid()) {
      logger.debug("[FollowsService] Returning cached follows");
      return this.followsCache;
    }

    const response = await twitchApiService.getFollowedChannels(userId, after);
    let allFollows = [...(response.data || [])];
    let cursor = response.pagination?.cursor;
    while (cursor) {
      logger.debug(`[FollowsService] Fetching next page with cursor ${cursor}`);
      const nextPage = await twitchApiService.getFollowedChannels(userId, cursor);
      allFollows = allFollows.concat(nextPage.data || []);
      cursor = nextPage.pagination?.cursor;
    }

    const result = {
      data: allFollows,
      total: allFollows.length,
      timestamp: Date.now(),
    };
    this.followsCache = result;
    this.cacheTimestamp = Date.now();
    logger.info(`[FollowsService] getFollowedChannels - fetched ${allFollows.length} followed channels`);
    return result;
  }

  /**
   * Get followers of a channel (users who follow the broadcaster)
   * @param {string} broadcasterId - The ID of the broadcaster whose followers to fetch
   * @param {string|null} after - Pagination cursor
   * @returns {Promise<{ data: Array, pagination: object }>}
   */
  async getFollowers(broadcasterId, after = null) {
    logger.info(`[FollowsService] getFollowers called broadcasterId=${broadcasterId}, after=${after}`);
    const token = settingsService.get("twitch").accessToken;
    if (!token) throw new Error("Not authenticated");
    const { API_BASE, CLIENT_ID } = require("../shared/config");

    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: "100",
    });
    if (after) params.append("after", after);

    const url = `${API_BASE}/channels/followers?${params.toString()}`;
    const response = await fetch(url, {
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[FollowsService] getFollowers error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch followers: ${response.status}`);
    }

    const data = await response.json();
    logger.debug(`[FollowsService] getFollowers - found ${data.data?.length || 0} followers`);
    return data;
  }

  /**
   * @param {any} broadcasterId
   */
  async followChannel(broadcasterId) {
    if (!broadcasterId) throw new Error("Broadcaster ID is required");
    logger.info(`[FollowsService] followChannel called for broadcasterId=${broadcasterId}`);
    const token = settingsService.get("twitch").accessToken;
    if (!token) throw new Error("Not authenticated");
    const userId = settingsService.get("twitch").userId;
    if (!userId) throw new Error("User not logged in");
    const { API_BASE, CLIENT_ID } = require("../shared/config");

    const url = `${API_BASE}/users/follows`;
    const response = await fetch(url, {
      method: "POST",
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from_id: userId, to_id: broadcasterId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      logger.error(`[FollowsService] followChannel failed: ${error.message}`);
      throw new Error(error.message || "Failed to follow channel");
    }
    // Invalidate cache
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this._sendToRenderers("follows:changed", { action: "follow", broadcasterId });
    logger.info(`[FollowsService] Successfully followed channel ${broadcasterId}`);
    return true;
  }

  /**
   * @param {any} broadcasterId
   */
  async unfollowChannel(broadcasterId) {
    if (!broadcasterId) throw new Error("Broadcaster ID is required");
    logger.info(`[FollowsService] unfollowChannel called for broadcasterId=${broadcasterId}`);
    const token = settingsService.get("twitch").accessToken;
    if (!token) throw new Error("Not authenticated");
    const userId = settingsService.get("twitch").userId;
    if (!userId) throw new Error("User not logged in");
    const { API_BASE, CLIENT_ID } = require("../shared/config");

    const url = `${API_BASE}/users/follows?from_id=${userId}&to_id=${broadcasterId}`;
    const response = await fetch(url, {
      method: "DELETE",
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });
    if (!response.ok && response.status !== 404) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      logger.error(`[FollowsService] unfollowChannel failed: ${error.message}`);
      throw new Error(error.message || "Failed to unfollow channel");
    }
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this._sendToRenderers("follows:changed", { action: "unfollow", broadcasterId });
    logger.info(`[FollowsService] Successfully unfollowed channel ${broadcasterId}`);
    return true;
  }

  /**
   * @param {any} broadcasterId
   */
  async isFollowing(broadcasterId) {
    if (!broadcasterId) return false;
    const userId = settingsService.get("twitch").userId;
    if (!userId) return false;
    const token = settingsService.get("twitch").accessToken;
    if (!token) return false;
    const { API_BASE, CLIENT_ID } = require("../shared/config");

    const url = `${API_BASE}/users/follows?from_id=${userId}&to_id=${broadcasterId}`;
    const response = await fetch(url, {
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });
    if (!response.ok) return false;
    const data = await response.json();
    const following = data.data && data.data.length > 0;
    logger.debug(`[FollowsService] isFollowing for ${broadcasterId}: ${following}`);
    return following;
  }

  saveFollowsToLocalStorage() {
    if (this.followsCache && this.followsCache.data) {
      logger.debug("[FollowsService] Saving follows to localStorage");
      settingsService.set("cachedFollows", {
        data: this.followsCache.data,
        timestamp: this.followsCache.timestamp,
      });
    }
  }

  loadFollowsFromLocalStorage() {
    const cached = settingsService.get("cachedFollows");
    if (cached && cached.data && cached.timestamp) {
      this.followsCache = {
        data: cached.data,
        total: cached.data.length,
        timestamp: cached.timestamp,
      };
      this.cacheTimestamp = cached.timestamp;
      logger.debug(`[FollowsService] Loaded ${cached.data.length} follows from localStorage`);
      return true;
    }
    logger.debug("[FollowsService] No cached follows found");
    return false;
  }

  clearCache() {
    logger.info("[FollowsService] Clearing follows cache");
    this.followsCache = null;
    this.cacheTimestamp = 0;
    settingsService.set("cachedFollows", null);
  }
}

const followsService = new FollowsService();
module.exports = { followsService, FollowsService };