const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function runCommercial(broadcasterId, length = 30) {
  logger.info(`[StreamManager] Running ${length}s commercial for ${broadcasterId}`);

  const body = { broadcaster_id: broadcasterId, length };
  const result = await twitchApiService.fetchTwitch('channels/commercial', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return result;
}

module.exports = { runCommercial };