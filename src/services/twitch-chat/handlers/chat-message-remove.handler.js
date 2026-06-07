// src/renderer/api/chat/handlers/chat-message-remove.handler.js
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleMessageRemove(state, channel, messageId, msg) {
  logger.info(`[Chat] Message removed in ${channel}: ${messageId}`);
  sendToRenderers('chat:message-removed', {
    channel: channel.slice(1),
    messageId: messageId,
  });
}

module.exports = { handleMessageRemove };