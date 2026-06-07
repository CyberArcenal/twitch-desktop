const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function startRaid(fromBroadcasterId, toBroadcasterLogin) {
  logger.info(`[StreamManager] Raiding ${toBroadcasterLogin}`);

  const user = await twitchApiService.getUserByName(toBroadcasterLogin);
  if (!user) throw new Error('Target channel not found');

  const body = {
    from_broadcaster_id: fromBroadcasterId,
    to_broadcaster_id: user.id,
  };

  await twitchApiService.fetchTwitch('raids', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  logger.success(`[StreamManager] Raid started to ${toBroadcasterLogin}`);
  return true;
}

module.exports = { startRaid };