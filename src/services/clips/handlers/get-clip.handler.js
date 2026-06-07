const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

/**
 * Get a single clip by its ID
 * @param {string} clipId
 * @returns {Promise<object>}
 */
async function getClip(clipId) {
  logger.debug(`[Clips] getClip id=${clipId}`);
  const result = await twitchApiService.fetchTwitch(`clips?id=${clipId}`);
  const clip = result.data?.[0] || null;
  logger.debug(`[Clips] getClip ${clip ? 'found' : 'not found'}`);
  return clip;
}

module.exports = { getClip };