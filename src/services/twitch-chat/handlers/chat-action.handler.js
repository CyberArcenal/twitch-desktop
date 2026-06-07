// src/renderer/api/chat/handlers/chat-action.handler.js
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleAction(state, channel, user, text, msg) {
  const actionMessage = {
    id: msg.id,
    channel: channel.slice(1),
    user: user,
    message: text,
    isAction: true,
    badges: null,
    emotes: null,
    timestamp: new Date().toISOString(),
    isFromMe: user === state.getCurrentUserLogin(),
    parsedMessage: undefined,
  };
  logger.debug(`[Chat] Action from ${user}: ${text}`);
  sendToRenderers('chat:message', actionMessage);
}

module.exports = { handleAction };