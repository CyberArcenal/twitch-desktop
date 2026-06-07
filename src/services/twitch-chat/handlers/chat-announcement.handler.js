// src/renderer/api/chat/handlers/chat-announcement.handler.js
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleAnnouncement(state, channel, user, announcementInfo, msg) {
  const announceMessage = {
    id: msg.id,
    channel: channel.slice(1),
    user: user,
    message: announcementInfo.message,
    isAnnouncement: true,
    badges: null,
    emotes: null,
    timestamp: new Date().toISOString(),
    isFromMe: user === state.getCurrentUserLogin(),
    parsedMessage: undefined,
  };
  logger.info(`[Chat] Announcement from ${user}: ${announcementInfo.message}`);
  sendToRenderers('chat:message', announceMessage);
}

module.exports = { handleAnnouncement };