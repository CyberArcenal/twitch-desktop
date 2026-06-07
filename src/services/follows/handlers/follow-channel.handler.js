const { twitchApiService } = require('../../twitch-api');
const { settingsService } = require('../../settings');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function followChannel(broadcasterId, state) {
  if (!broadcasterId) throw new Error('Broadcaster ID is required');
  logger.info(`[Follows] followChannel broadcasterId=${broadcasterId}`);

  const userId = settingsService.get('twitch')?.userId;
  if (!userId) throw new Error('User not logged in');

  // Use twitchApiService.fetchTwitch with method POST
  const body = { from_id: userId, to_id: broadcasterId };
  await twitchApiService.fetchTwitch('users/follows', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Invalidate cache
  state.clearCache();
  sendToRenderers('follows:changed', { action: 'follow', broadcasterId });
  logger.info(`[Follows] Successfully followed channel ${broadcasterId}`);
  return true;
}

module.exports = { followChannel };