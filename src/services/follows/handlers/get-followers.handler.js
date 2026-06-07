const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function getFollowers(broadcasterId, after = null) {
  logger.info(`[Follows] getFollowers broadcasterId=${broadcasterId}, after=${after}`);
  if (!broadcasterId) throw new Error('Broadcaster ID is required');

  const params = new URLSearchParams({
    broadcaster_id: broadcasterId,
    first: '100',
  });
  if (after) params.append('after', after);

  // Use twitchApiService.fetchTwitch with endpoint "channels/followers"
  const result = await twitchApiService.fetchTwitch(`channels/followers?${params.toString()}`);
  logger.debug(`[Follows] getFollowers - found ${result.data?.length || 0} followers`);
  return result;
}

module.exports = { getFollowers };