// src/renderer/api/chat/handlers/chat-message.handler.js
const { parseChatMessage } = require('@twurple/chat');
const { settingsService } = require('../../settings');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { parseBadgesFromRaw } = require('../utils/message-parser');
const { getBadgeImageUrl } = require('./badge.handler');
const thirdPartyEmoteService = require('../../../services/third-party-emotes/ThirdPartyEmoteService');
const { logger } = require('../../../utils/logger');

// Cache for channel emotes (per channel)
const channelEmoteCache = new Map();

async function getThirdPartyEmotesForChannel(channelName) {
  if (channelEmoteCache.has(channelName)) {
    return channelEmoteCache.get(channelName);
  }
  const emotes = await thirdPartyEmoteService.getChannelEmotes(channelName);
  channelEmoteCache.set(channelName, emotes);
  return emotes;
}

async function handleChatMessage(state, channel, user, message, msg) {
  logger.debug(`[Chat] RAW MESSAGE: channel=${channel}, user=${user}, msg=${message}`);

  // Filtering logic (existing)
  const filters = settingsService.get('chatFilters') || [];
  if (filters.some(f => message.toLowerCase().includes(f))) {
    logger.debug(`[Chat] Message filtered (${user}): "${message}"`);
    return;
  }

  // 1. Badge parsing (existing)
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

  // 2. Get third‑party emotes for this channel
  const cleanChannel = channel.slice(1);
  const thirdPartyEmotes = await getThirdPartyEmotesForChannel(cleanChannel);
  
  // 3. Parse Twitch emotes (built‑in)
  let parsed = parseChatMessage(message, msg.emoteOffsets);
  
  // 4. Add third‑party emotes to parsed array (by scanning plain text parts)
  const newParsed = [];
  for (const part of parsed) {
    if (part.type === 'text') {
      let remainingText = part.text;
      const regex = /(\S+)/g;
      let match;
      let lastIndex = 0;
      const tokens = [];
      while ((match = regex.exec(remainingText)) !== null) {
        const word = match[0];
        const start = match.index;
        const end = start + word.length;
        // Check if word is an emote code
        const foundEmote = [...thirdPartyEmotes.bttv, ...thirdPartyEmotes.ffz].find(e => e.code === word);
        if (foundEmote) {
          // Push previous plain text if any
          if (start > lastIndex) {
            tokens.push({ type: 'text', text: remainingText.substring(lastIndex, start) });
          }
          // Push emote
          tokens.push({
            type: 'emote',
            id: foundEmote.id,
            name: foundEmote.code,
            isThirdParty: true,
            thirdPartyType: foundEmote.type,
          });
          lastIndex = end;
        }
      }
      if (lastIndex < remainingText.length) {
        tokens.push({ type: 'text', text: remainingText.substring(lastIndex) });
      }
      newParsed.push(...tokens);
    } else {
      newParsed.push(part);
    }
  }

  const isFromMe = user === state.getCurrentUserLogin();
  const chatMessage = {
    messageId: msg.id,
    channel: cleanChannel,
    user: user,
    message: message,
    parsedMessage: newParsed,
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