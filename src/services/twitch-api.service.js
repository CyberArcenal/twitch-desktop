const { twitchAuthService } = require("./twitch-auth.service");
const { CLIENT_ID, API_BASE, IS_DEV } = require('../shared/config');

async function fetchTwitch(endpoint, options = {}, retry = true) {
  const url = `${API_BASE}/${endpoint}`;
  const headers = { ...options.headers };
  
  // Only send auth headers when using real Twitch API
  if (!IS_DEV) {
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
    headers['Client-Id'] = CLIENT_ID;
  }
  
  const res = await fetch(url, { ...options, headers });
  
  if (!IS_DEV && res.status === 401 && retry) {
    const refreshed = await twitchAuthService.refreshTokenIfNeeded();
    if (refreshed) return fetchTwitch(endpoint, options, false);
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API error');
  }
  return res.json();
}

const twitchApiService = {
  async getCurrentUser() {
    return fetchTwitch("users");
  },

  async getFollowedChannels(userId, after = null) {
    const params = new URLSearchParams({ user_id: userId, first: "100" });
    if (after) params.append("after", after);
    return fetchTwitch(`users/follows?${params}`);
  },

  async getStreams(userIds) {
    const params = new URLSearchParams();
    userIds.forEach((id) => params.append("user_id", id));
    return fetchTwitch(`streams?${params}`);
  },

  async getChannelInfo(broadcasterId) {
    return fetchTwitch(`channels?broadcaster_id=${broadcasterId}`);
  },

  async searchChannels(query) {
    const params = new URLSearchParams({ query, first: "20" });
    return fetchTwitch(`search/channels?${params}`);
  },

  async getGameInfo(gameId) {
    return fetchTwitch(`games?id=${gameId}`);
  },
};

module.exports = { twitchApiService };
