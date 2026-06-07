const { fetchTwitch } = require('./core-fetch.handler');
const { logger } = require('../../../utils/logger');

async function getGameInfo(gameId) {
  logger.debug(`[TwitchApi] getGameInfo called for gameId=${gameId}`);
  const result = await fetchTwitch(`games?id=${gameId}`);
  const game = result.data?.[0] || null;
  logger.debug(`[TwitchApi] getGameInfo - ${game ? 'found' : 'not found'}`);
  return game ? { data: [game] } : result;
}

module.exports = { getGameInfo };