const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function banUser(broadcasterId, moderatorId, userName) {
  const user = await twitchApiService.getUserByName(userName);
  if (!user) throw new Error('User not found');

  const body = {
    broadcaster_id: broadcasterId,
    moderator_id: moderatorId,
    data: { user_id: user.id },
  };

  await twitchApiService.fetchTwitch('moderation/bans', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return true;
}

async function timeoutUser(broadcasterId, moderatorId, userName, durationSeconds) {
  const user = await twitchApiService.getUserByName(userName);
  if (!user) throw new Error('User not found');

  const body = {
    broadcaster_id: broadcasterId,
    moderator_id: moderatorId,
    data: { user_id: user.id, duration: durationSeconds },
  };

  await twitchApiService.fetchTwitch('moderation/bans', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return true;
}

async function clearChat(broadcasterId, moderatorId) {
  await twitchApiService.fetchTwitch(`moderation/chat?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`, {
    method: 'DELETE',
  });
  return true;
}

async function getModerators(broadcasterId) {
  const result = await twitchApiService.fetchTwitch(`moderation/moderators?broadcaster_id=${broadcasterId}`);
  return result.data;
}

async function addModerator(broadcasterId, userId) {
  await twitchApiService.fetchTwitch(`moderation/moderators?broadcaster_id=${broadcasterId}&user_id=${userId}`, {
    method: 'POST',
  });
  return true;
}

async function removeModerator(broadcasterId, userId) {
  await twitchApiService.fetchTwitch(`moderation/moderators?broadcaster_id=${broadcasterId}&user_id=${userId}`, {
    method: 'DELETE',
  });
  return true;
}

module.exports = {
  banUser,
  timeoutUser,
  clearChat,
  getModerators,
  addModerator,
  removeModerator,
};