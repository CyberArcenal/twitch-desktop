// src/main/services/search.js
//@ts-check
const { twitchApiService } = require('../twitch-api');

class SearchService {
  /**
   * Search for channels by name
   * @param {string} query - Search term
   * @param {number} limit - Max results (1-100, default 20)
   */
  async searchChannels(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0 };
    }
    const result = await twitchApiService.searchChannels(query, limit);
    return {
      data: result.data || [],
      total: result.data?.length || 0
    };
  }

  /**
   * Search for streams (by channel name) - workaround via channel search
   * @param {string} query - Search term for channel name
   * @param {number} limit - Max results (1-100, default 20)
   */
  async searchStreams(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0 };
    }
    // First search channels matching query
    const channels = await twitchApiService.searchChannels(query, limit);
    if (!channels.data || channels.data.length === 0) {
      return { data: [], total: 0 };
    }
    const channelIds = channels.data.map((/** @type {{ id: any; }} */ c) => c.id);
    const streams = await twitchApiService.getStreams(channelIds);
    return {
      data: streams.data || [],
      total: streams.data?.length || 0
    };
  }

  /**
   * Search for games/categories by name
   * @param {string} query - Search term
   * @param {number} limit - Max results (1-100, default 20)
   */
  async searchGames(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0 };
    }
    const result = await twitchApiService.searchCategories(query, limit);
    return {
      data: result.data || [],
      total: result.data?.length || 0
    };
  }

  /**
   * Combined search: returns channels, streams, games in one call
   * @param {string} query
   * @param {number} limitPerType
   */
  async searchAll(query, limitPerType = 10) {
    const [channels, streams, games] = await Promise.all([
      this.searchChannels(query, limitPerType),
      this.searchStreams(query, limitPerType),
      this.searchGames(query, limitPerType)
    ]);
    return {
      channels: channels.data,
      streams: streams.data,
      games: games.data
    };
  }
}

const searchService = new SearchService();
module.exports = { searchService, SearchService };