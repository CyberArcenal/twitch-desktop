const { fetchTwitch } = require('./core-fetch.handler');
const { getFollowedChannels: getFollowedChannelsApi } = require('./users.handler'); // careful: circular? We'll implement directly
const { getStreams } = require('./streams.handler');
const { logger } = require('../../../utils/logger');

async function getFollowedChannels(userId, after = null) {
  logger.debug(`[TwitchApi] getFollowedChannels called for userId=${userId}, after=${after}`);
  const params = new URLSearchParams({
    user_id: userId,
    first: '100',
  });
  if (after) params.append('after', after);
  const result = await fetchTwitch(`channels/followed?${params}`);
  logger.debug(`[TwitchApi] getFollowedChannels - got ${result.data?.length || 0} entries, total=${result.total || '?'}`);
  return result;
}

async function getFollowedStreams(userId, limit = 100) {
  logger.info(`[TwitchApi] getFollowedStreams called for userId=${userId}, limit=${limit}`);
  try {
    const followedResponse = await getFollowedChannels(userId);
    if (!followedResponse?.data || followedResponse.data.length === 0) {
      logger.info('[TwitchApi] getFollowedStreams - no followed channels found');
      return { data: [] };
    }

    const broadcasterIds = followedResponse.data.map(channel => channel.broadcaster_id);
    const limitedIds = broadcasterIds.slice(0, Math.min(limit, 100));
    logger.debug(`[TwitchApi] getFollowedStreams - fetching streams for ${limitedIds.length} broadcasters`);
    const streamsResponse = await getStreams(limitedIds);
    logger.info(`[TwitchApi] getFollowedStreams - found ${streamsResponse?.data?.length || 0} live followed streams`);
    return streamsResponse;
  } catch (error) {
    logger.error('[TwitchApi] getFollowedStreams - error:', error);
    throw error;
  }
}

module.exports = { getFollowedChannels, getFollowedStreams };