const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function sendShoutout(fromBroadcasterId, toBroadcasterId, moderatorId) {
  await twitchApiService.fetchTwitch(`chat/shoutouts?from_broadcaster_id=${fromBroadcasterId}&to_broadcaster_id=${toBroadcasterId}&moderator_id=${moderatorId}`, {
    method: 'POST',
  });
  return true;
}

module.exports = { sendShoutout };