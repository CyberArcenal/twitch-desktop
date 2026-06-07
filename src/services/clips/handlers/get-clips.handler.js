const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

/**
 * Get clips from a specific broadcaster
 * @param {string} broadcasterId
 * @param {number} first - Max number of clips (1-100)
 * @returns {Promise<{data: Array, pagination?: object}>}
 */
async function getClips(broadcasterId, first = 20) {
  logger.debug(`[Clips] getClips for broadcaster ${broadcasterId}, first=${first}`);
  const params = new URLSearchParams({
    broadcaster_id: broadcasterId,
    first: String(Math.min(first, 100)),
  });
  const result = await twitchApiService.fetchTwitch(`clips?${params}`);
  logger.debug(`[Clips] getClips returned ${result.data?.length || 0} clips`);
  return result;
}

module.exports = { getClips };