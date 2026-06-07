const { fetchTwitch } = require('./core-fetch.handler');
const { logger } = require('../../../utils/logger');

async function getChatSettings(broadcasterId, moderatorId) {
  logger.debug(`[TwitchApi] getChatSettings called for broadcaster=${broadcasterId}, moderator=${moderatorId}`);
  const params = new URLSearchParams({
    broadcaster_id: broadcasterId,
    moderator_id: moderatorId,
  });
  const result = await fetchTwitch(`chat/settings?${params}`);
  logger.debug('[TwitchApi] getChatSettings - success');
  return result;
}

async function updateChatSettings(broadcasterId, moderatorId, settings) {
  logger.info(`[TwitchApi] updateChatSettings called for broadcaster=${broadcasterId}`, settings);
  const params = new URLSearchParams({
    broadcaster_id: broadcasterId,
    moderator_id: moderatorId,
  });
  const result = await fetchTwitch(`chat/settings?${params}`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
  logger.info('[TwitchApi] updateChatSettings - success');
  return result;
}

module.exports = { getChatSettings, updateChatSettings };