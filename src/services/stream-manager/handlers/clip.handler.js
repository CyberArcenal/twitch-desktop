const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function createClip(broadcasterId) {
  logger.info(`[StreamManager] Creating clip for ${broadcasterId}`);

  const result = await twitchApiService.fetchTwitch(`clips?broadcaster_id=${broadcasterId}`, {
    method: 'POST',
  });

  logger.success('[StreamManager] Clip created', result.data[0]);
  return result.data[0]; // { id, edit_url }
}

module.exports = { createClip };