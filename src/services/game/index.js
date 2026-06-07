const { twitchApiService } = require('../twitch-api');

class GamesService {
  async getTopGames(first = 20) {
    const params = new URLSearchParams({ first: String(Math.min(first, 100)) });
    return await twitchApiService.fetchTwitch(`games/top?${params}`);
  }

  async getGameInfo(gameId) {
    const result = await twitchApiService.fetchTwitch(`games?id=${gameId}`);
    return result.data?.[0] || null;
  }

  async getStreamsByGame(gameId, first = 20) {
    const params = new URLSearchParams({
      game_id: gameId,
      first: String(Math.min(first, 100))
    });
    return await twitchApiService.fetchTwitch(`streams?${params}`);
  }

  async getGameByName(name) {
    const topGames = await this.getTopGames(100);
    const lowerName = name.toLowerCase();
    return topGames.data.filter(game => game.name.toLowerCase().includes(lowerName));
  }

  async searchCategories(query, first = 20) {
    if (!query || query.trim() === '') return { data: [] };
    const params = new URLSearchParams({
      query: query.trim(),
      first: String(Math.min(first, 100))
    });
    return await twitchApiService.fetchTwitch(`search/categories?${params}`);
  }
}

const gamesService = new GamesService();
module.exports = { gamesService, GamesService };