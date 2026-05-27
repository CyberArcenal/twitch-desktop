// src/main/services/twitch-api.service.js
//@ts-check
const { twitchAuthService } = require("./twitch-auth.service");
const { CLIENT_ID, API_BASE } = require("../shared/config");

class TwitchApiService {
  async fetchTwitch(endpoint, options = {}, retry = true) {
    const url = `${API_BASE}/${endpoint}`;
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

  async getFollowedChannels(userId, after = null) {
    const params = new URLSearchParams({ from_id: userId, first: "100" });
    if (after) params.append("after", after);
    return this.fetchTwitch(`users/follows?${params}`);
  }

  async getStreams(userIds) {
    const params = new URLSearchParams();
    userIds.forEach((id) => params.append("user_id", id));
    return this.fetchTwitch(`streams?${params}`);
  }

  async getChannelInfo(broadcasterId) {
    return this.fetchTwitch(`channels?broadcaster_id=${broadcasterId}`);
  }

async searchChannels(query, first = 20) {
  const params = new URLSearchParams({ query, first: String(Math.min(first, 100)) });
  return this.fetchTwitch(`search/channels?${params}`);
}

  async getGameInfo(gameId) {
    return this.fetchTwitch(`games?id=${gameId}`);
  }

  async searchCategories(query, first = 20) {
    const params = new URLSearchParams({
      query,
      first: String(Math.min(first, 100)),
    });
    return this.fetchTwitch(`search/categories?${params}`);
  }

  async searchStreams(query, first = 20) {
    // Twitch API has no direct stream search; workaround: search channels, then get streams for those channel IDs
    const channels = await this.searchChannels(query, first);
    const channelIds = channels.data.map((c) => c.id);
    if (channelIds.length === 0) return { data: [] };
    const streamsData = await this.getStreams(channelIds);
    return streamsData;
  }
}

const twitchApiService = new TwitchApiService();
module.exports = { twitchApiService, TwitchApiService };
