const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function getFollowedChannels(userId, after = null, forceRefresh = false, state) {
  if (!userId) throw new Error('User ID is required');
  logger.info(`[Follows] getFollowedChannels userId=${userId}, after=${after}, forceRefresh=${forceRefresh}`);

  if (!forceRefresh && state.isCacheValid()) {
    logger.debug('[Follows] Returning cached follows');
    return state.getCachedFollows();
  }

  const response = await twitchApiService.getFollowedChannels(userId, after);
  let allFollows = [...(response.data || [])];
  let cursor = response.pagination?.cursor;

  while (cursor) {
    logger.debug(`[Follows] Fetching next page with cursor ${cursor}`);
    const nextPage = await twitchApiService.getFollowedChannels(userId, cursor);
    allFollows = allFollows.concat(nextPage.data || []);
    cursor = nextPage.pagination?.cursor;
  }

  const result = {
    data: allFollows,
    total: allFollows.length,
    timestamp: Date.now(),
  };
  state.setCachedFollows(result);
  logger.info(`[Follows] getFollowedChannels - fetched ${allFollows.length} followed channels`);
  return result;
}

module.exports = { getFollowedChannels };