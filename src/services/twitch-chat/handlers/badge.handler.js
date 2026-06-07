const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function fetchBadgeSets(state, broadcasterId) {
  try {
    // Use twitchApiService.fetchTwitch for both endpoints
    const globalResult = await twitchApiService.fetchTwitch('chat/badges/global');
    state.setGlobalBadges(globalResult.data || []);

    const channelResult = await twitchApiService.fetchTwitch(`chat/badges?broadcaster_id=${broadcasterId}`);
    state.setChannelBadges(channelResult.data || []);

    logger.debug('[Chat] Badge sets fetched');
  } catch (err) {
    logger.warn('[Chat] Failed to fetch badge sets:', err);
  }
}

function getBadgeImageUrl(state, badgeName, badgeVersion) {
  const allSets = [...(state.getChannelBadges() || []), ...(state.getGlobalBadges() || [])];
  const set = allSets.find(s => s.set_id === badgeName);
  if (set && set.versions) {
    const version = set.versions.find(v => v.id === badgeVersion);
    if (version) return version.image_url_1x || version.image_url_2x;
  }
  return null;
}

module.exports = { fetchBadgeSets, getBadgeImageUrl };