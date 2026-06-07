const { twitchApiService } = require('../../twitch-api');
const { settingsService } = require('../../settings');
const { logger } = require('../../../utils/logger');

async function isFollowing(broadcasterId) {
  if (!broadcasterId) return false;
  const userId = settingsService.get('twitch')?.userId;
  if (!userId) return false;

  const endpoint = `users/follows?from_id=${userId}&to_id=${broadcasterId}`;
  try {
    const result = await twitchApiService.fetchTwitch(endpoint);
    const following = result.data && result.data.length > 0;
    logger.debug(`[Follows] isFollowing for ${broadcasterId}: ${following}`);
    return following;
  } catch (err) {
    logger.error(`[Follows] isFollowing error:`, err);
    return false;
  }
}

module.exports = { isFollowing };