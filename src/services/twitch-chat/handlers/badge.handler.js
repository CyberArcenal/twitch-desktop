// src/renderer/api/chat/handlers/badge.handler.js
const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function fetchBadgeSets(state, broadcasterId) {
  try {
    // Fetch global badges
    const globalResult = await twitchApiService.fetchTwitch('chat/badges/global');
    state.setGlobalBadges(globalResult.data || []);
    logger.debug(`[Chat] Loaded ${globalResult.data?.length || 0} global badge sets`);

    // Fetch channel-specific badges
    const channelResult = await twitchApiService.fetchTwitch(`chat/badges?broadcaster_id=${broadcasterId}`);
    state.setChannelBadges(channelResult.data || []);
    logger.debug(`[Chat] Loaded ${channelResult.data?.length || 0} channel badge sets`);

    // Optional: also fetch subscriber badge version mapping (not needed for dynamic URL)
  } catch (err) {
    logger.warn('[Chat] Failed to fetch badge sets:', err);
  }
}

function getBadgeImageUrl(state, badgeName, badgeVersion) {
  // Special case: subscriber badges use a dynamic URL pattern
  if (badgeName === 'subscriber') {
    // Example: https://badges.twitch.tv/v1/badges/subscriber/1
    // badgeVersion is the tier (1, 3, 6, 12, 24, etc.)
    return `https://badges.twitch.tv/v1/badges/subscriber/${badgeVersion}`;
  }

  // For all other badges, search the fetched sets
  const allSets = [...(state.getChannelBadges() || []), ...(state.getGlobalBadges() || [])];
  const badgeSet = allSets.find(s => s.set_id === badgeName);
  if (badgeSet && badgeSet.versions) {
    const version = badgeSet.versions.find(v => v.id === badgeVersion);
    if (version) {
      // Prefer 2x for better quality, fallback to 1x
      return version.image_url_2x || version.image_url_1x;
    }
  }

  // If still not found, return null (will hide badge)
  logger.debug(`[Chat] No image URL found for badge: ${badgeName} version ${badgeVersion}`);
  return null;
}

module.exports = { fetchBadgeSets, getBadgeImageUrl };