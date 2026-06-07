const { twitchApiService } = require('../../twitch-api');
const { settingsService } = require('../../settings');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function unfollowChannel(broadcasterId, state) {
  if (!broadcasterId) throw new Error('Broadcaster ID is required');
  logger.info(`[Follows] unfollowChannel broadcasterId=${broadcasterId}`);

  const userId = settingsService.get('twitch')?.userId;
  if (!userId) throw new Error('User not logged in');

  const endpoint = `users/follows?from_id=${userId}&to_id=${broadcasterId}`;
  try {
    await twitchApiService.fetchTwitch(endpoint, { method: 'DELETE' });
  } catch (err) {
    // If it's a 404, the follow didn't exist – treat as success
    if (!err.message?.includes('404')) throw err;
    logger.debug(`[Follows] unfollowChannel - follow not found, nothing to delete`);
  }

  state.clearCache();
  sendToRenderers('follows:changed', { action: 'unfollow', broadcasterId });
  logger.info(`[Follows] Successfully unfollowed channel ${broadcasterId}`);
  return true;
}

module.exports = { unfollowChannel };