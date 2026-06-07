const { parseChatMessage } = require('@twurple/chat');
const { settingsService } = require('../../settings');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { parseBadgesFromRaw } = require('../utils/message-parser');
const { getBadgeImageUrl } = require('./badge.handler');
const { logger } = require('../../../utils/logger');

function handleChatMessage(state, channel, user, message, msg) {
  logger.debug(`[Chat] RAW MESSAGE: channel=${channel}, user=${user}, msg=${message}`);

  const filters = settingsService.get('chatFilters') || [];
  if (filters.some(f => message.toLowerCase().includes(f))) {
    logger.debug(`[Chat] Message filtered (${user}): "${message}"`);
    return;
  }

  let badgesArray = [];
  try {
    const raw = msg._raw;
    if (raw && typeof raw === 'string') {
      badgesArray = parseBadgesFromRaw(raw);
    }
    if (badgesArray.length === 0 && msg.userInfo?.badges) {
      const userBadges = msg.userInfo.badges;
      if (typeof userBadges === 'object') {
        badgesArray = Object.entries(userBadges).map(([name, version]) => ({ name, version }));
      }
    }
  } catch (err) {
    logger.warn('[Chat] Failed to parse badges:', err);
  }

  const badgesWithUrl = badgesArray.map(b => ({
    name: b.name,
    version: b.version,
    imageUrl: getBadgeImageUrl(state, b.name, b.version),
  }));

  const isFromMe = user === state.getCurrentUserLogin();

  const chatMessage = {
    messageId: msg.id,
    channel: channel.slice(1),
    user: user,
    message: message,
    parsedMessage: parseChatMessage(message, msg.emoteOffsets),
    badges: badgesWithUrl,
    emotes: msg.emoteOffsets,
    timestamp: new Date().toISOString(),
    isFromMe: isFromMe,
    replyParentMsgId: msg.parentMessageId || null,
  };

  if (isFromMe) {
    logger.success(`[Chat] OWN MESSAGE: "${message}" (ID: ${msg.id})`);
  }

  state.addToMessageBuffer(chatMessage);
  sendToRenderers('chat:message', chatMessage);
}

module.exports = { handleChatMessage };