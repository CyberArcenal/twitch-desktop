// src/renderer/api/chat/handlers/chat-ban.handler.js
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleBan(state, channel, user, msg) {
  const cleanChannel = channel.slice(1);
  const isSelf = user === state.getCurrentUserLogin();
  logger.info(`[Chat] User ${user} permanently banned from ${channel}`);
  if (isSelf) {
    sendToRenderers('chat:self-mod-action', {
      channel: cleanChannel,
      action: 'banned',
      duration: null,
    });
  } else {
    sendToRenderers('chat:user-timed-out', {
      channel: cleanChannel,
      userName: user,
      duration: null,
      isBan: true,
    });
  }
}

module.exports = { handleBan };