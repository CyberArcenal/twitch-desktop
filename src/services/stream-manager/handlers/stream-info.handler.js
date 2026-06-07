const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function updateStreamInfo(broadcasterId, data) {
  logger.info(`[StreamManager] Updating stream info for ${broadcasterId}`, data);

  const body = {
    title: data.title,
    game_id: data.game_id,
    go_live_notification: data.go_live_notification,
    broadcaster_language: data.broadcaster_language,
    tags: data.tags,
    is_branded_content: data.is_branded_content,
    content_classification_labels: data.content_classification_labels,
    is_rerun: data.is_rerun,
  };
  // Remove undefined fields
  Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

  await twitchApiService.fetchTwitch(`channels?broadcaster_id=${broadcasterId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  logger.success('[StreamManager] Stream info updated');
  return true;
}

module.exports = { updateStreamInfo };