// src/main/services/clips.service.js
//@ts-check
const { twitchApiService } = require('./twitch-api.service');

class ClipsService {
  /**
   * Get clips from a specific broadcaster
   * @param {string} broadcasterId
   * @param {number} first - Max number of clips (1-100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getClips(broadcasterId, first = 20) {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: String(Math.min(first, 100))
    });
    return await twitchApiService.fetchTwitch(`clips?${params}`);
  }

  /**
   * Get a single clip by its ID
   * @param {string} clipId
   * @returns {Promise<object>}
   */
  async getClip(clipId) {
    const result = await twitchApiService.fetchTwitch(`clips?id=${clipId}`);
    return result.data?.[0] || null;
  }

  /**
   * Get top clips, optionally filtered by game ID and time period
   * @param {string} [gameId] - Optional game ID
   * @param {string} [period] - 'day', 'week', 'month', 'all' (default 'week')
   * @param {number} first - Number of clips (max 100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getTopClips(gameId = null, period = 'week', first = 20) {
    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
      period: period
    });
    if (gameId) params.append('game_id', gameId);
    return await twitchApiService.fetchTwitch(`clips?${params}`);
  }
}

const clipsService = new ClipsService();
module.exports = { clipsService, ClipsService };