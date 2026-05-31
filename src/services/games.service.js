// src/main/services/games.service.js
// @ts-nocheck
const { twitchApiService } = require('./twitch-api.service');

class GamesService {
  /**
   * Get the most popular games on Twitch
   * @param {number} first - Number of games to return (max 100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getTopGames(first = 20) {
    const params = new URLSearchParams({ first: String(Math.min(first, 100)) });
    return await twitchApiService.fetchTwitch(`games/top?${params}`);
  }

  /**
   * Get detailed information about a game by its ID
   * @param {string} gameId
   * @returns {Promise<object>}
   */
  async getGameInfo(gameId) {
    const result = await twitchApiService.fetchTwitch(`games?id=${gameId}`);
    return result.data?.[0] || null;
  }

  /**
   * Get live streams currently playing a specific game
   * @param {string} gameId
   * @param {number} first - Number of streams (max 100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getStreamsByGame(gameId, first = 20) {
    const params = new URLSearchParams({
      game_id: gameId,
      first: String(Math.min(first, 100))
    });
    return await twitchApiService.fetchTwitch(`streams?${params}`);
  }

  /**
   * Search for a game by name (partial match)
   * @param {string} name
   * @returns {Promise<Array>}
   */
  async getGameByName(name) {
    // Twitch API does not have a direct search by name endpoint for games.
    // Alternative: fetch top games and filter, or use search/categories? Not available.
    // We'll use the search/channels? but that's for channels.
    // Actually there is no official game search endpoint. We'll implement a simple workaround:
    // fetch top 100 games and filter by name (case-insensitive).
    const topGames = await this.getTopGames(100);
    const lowerName = name.toLowerCase();
    return topGames.data.filter(game => game.name.toLowerCase().includes(lowerName));
  }

    /**
   * Search for categories/games by name (official Twitch search endpoint)
   * @param {string} query - Search query
   * @param {number} first - Number of results (max 100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async searchCategories(query, first = 20) {
    if (!query || query.trim() === '') {
      return { data: [] };
    }
    const params = new URLSearchParams({
      query: query.trim(),
      first: String(Math.min(first, 100))
    });
    return await twitchApiService.fetchTwitch(`search/categories?${params}`);
  }
}

const gamesService = new GamesService();
module.exports = { gamesService, GamesService };