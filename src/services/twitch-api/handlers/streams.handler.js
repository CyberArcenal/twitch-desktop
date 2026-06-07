const { fetchTwitch } = require('./core-fetch.handler');
const { logger } = require('../../../utils/logger');

async function getStreams(userIds) {
  if (!userIds || userIds.length === 0) {
    logger.debug('[TwitchApi] getStreams called with empty userIds, returning empty');
    return { data: [] };
  }
  logger.debug(`[TwitchApi] getStreams called for ${userIds.length} user IDs`);
  const params = new URLSearchParams();
  userIds.forEach(id => params.append('user_id', id));
  const result = await fetchTwitch(`streams?${params}`);
  logger.debug(`[TwitchApi] getStreams - found ${result.data?.length || 0} live streams`);
  return result;
}

async function getTopStreams(first = 100, after = null) {
  logger.debug(`[TwitchApi] getTopStreams called first=${first}, after=${after}`);
  const params = new URLSearchParams({
    first: String(Math.min(first, 100)),
    type: 'live',
  });
  if (after) params.append('after', after);
  const result = await fetchTwitch(`streams?${params}`);
  logger.debug(`[TwitchApi] getTopStreams - got ${result.data?.length || 0} streams`);
  return result;
}

async function getTopStreamsWithFilters(first = 100, after = null, gameId = null, language = null) {
  logger.debug(`[TwitchApi] getTopStreamsWithFilters first=${first}, after=${after}, gameId=${gameId}, language=${language}`);
  const params = new URLSearchParams({
    first: String(Math.min(first, 100)),
    type: 'live',
  });
  if (after) params.append('after', after);
  if (gameId) params.append('game_id', gameId);
  if (language) params.append('language', language);
  const result = await fetchTwitch(`streams?${params}`);
  logger.debug(`[TwitchApi] getTopStreamsWithFilters - got ${result.data?.length || 0} streams`);
  return result;
}

module.exports = { getStreams, getTopStreams, getTopStreamsWithFilters };