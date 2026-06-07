const { TwitchApiState } = require('./twitch-api.state');
const { fetchTwitch } = require('./handlers/core-fetch.handler');
const { getCurrentUser, getUserByName } = require('./handlers/users.handler');
const { getFollowedChannels, getFollowedStreams } = require('./handlers/follows.handler');
const { getStreams, getTopStreams, getTopStreamsWithFilters } = require('./handlers/streams.handler');
const { getChannelInfo, getStreamKey, getIngestServers, regenerateStreamKey } = require('./handlers/channels.handler');
const { getChatSettings, updateChatSettings } = require('./handlers/chat.handler');
const { getVideos } = require('./handlers/videos.handler');
const { searchChannels, searchCategories, searchStreams } = require('./handlers/search.handler');
const { getGameInfo } = require('./handlers/games.handler');

class TwitchApiService {
  constructor() {
    this.state = new TwitchApiState();
  }

  // Core method
  async fetchTwitch(endpoint, options = {}, retry = true) {
    return fetchTwitch(endpoint, options, retry);
  }

  // Users
  async getCurrentUser() {
    return getCurrentUser();
  }

  async getUserByName(login) {
    return getUserByName(login);
  }

  // Follows
  async getFollowedChannels(userId, after = null) {
    return getFollowedChannels(userId, after);
  }

  async getFollowedStreams(userId, limit = 100) {
    return getFollowedStreams(userId, limit);
  }

  // Streams
  async getStreams(userIds) {
    return getStreams(userIds);
  }

  async getTopStreams(first = 100, after = null) {
    return getTopStreams(first, after);
  }

  async getTopStreamsWithFilters(first = 100, after = null, gameId = null, language = null) {
    return getTopStreamsWithFilters(first, after, gameId, language);
  }

  // Channels
  async getChannelInfo(broadcasterId) {
    return getChannelInfo(broadcasterId);
  }

  async getStreamKey() {
    return getStreamKey();
  }

  async getIngestServers() {
    return getIngestServers();
  }

  async regenerateStreamKey() {
    return regenerateStreamKey();
  }

  // Chat
  async getChatSettings(broadcasterId, moderatorId) {
    return getChatSettings(broadcasterId, moderatorId);
  }

  async updateChatSettings(broadcasterId, moderatorId, settings) {
    return updateChatSettings(broadcasterId, moderatorId, settings);
  }

  // Videos
  async getVideos(userId, type = 'archive', first = 20, after = null) {
    return getVideos(userId, type, first, after);
  }

  // Search
  async searchChannels(query, first = 20) {
    return searchChannels(query, first);
  }

  async searchCategories(query, first = 20) {
    return searchCategories(query, first);
  }

  async searchStreams(query, first = 20) {
    return searchStreams(query, first);
  }

  // Games
  async getGameInfo(gameId) {
    return getGameInfo(gameId);
  }
}

const twitchApiService = new TwitchApiService();
module.exports = { twitchApiService, TwitchApiService };