// src/renderer/api/chat/handlers/chat-clear.handler.js
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleChatClear(state, channel, userName, msg) {
  const cleanChannel = channel.slice(1);
  if (userName) {
    const duration = msg.banDuration; // seconds, undefined if permanent ban
    const isBan = !duration;
    logger.info(
      `[Chat] User ${userName} ${isBan ? 'banned' : `timed out for ${duration}s`} in ${channel}`,
    );
    const isSelf = userName === state.getCurrentUserLogin();
    if (isSelf) {
      sendToRenderers('chat:self-mod-action', {
        channel: cleanChannel,
        action: isBan ? 'banned' : 'timedout',
        duration: duration || null,
      });
    } else {
      sendToRenderers('chat:user-timed-out', {
        channel: cleanChannel,
        userName: userName,
        duration: duration || null,
        isBan: isBan,
      });
    }
  } else {
    // Entire chat cleared
    logger.info(`[Chat] Chat cleared in ${channel}`);
    sendToRenderers('chat:cleared', { channel: cleanChannel });
  }
}

module.exports = { handleChatClear };