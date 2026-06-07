const { twitchApiService } = require('../twitch-api');
const { logger } = require('../../utils/logger');

let cachedTopGameId = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getTopGameId() {
  if (cachedTopGameId && Date.now() - cacheTime < CACHE_TTL) {
    return cachedTopGameId;
  }
  
  try {
    const topStreams = await twitchApiService.getTopStreams(1);
    const topGameId = topStreams.data?.[0]?.game_id;
    if (topGameId) {
      cachedTopGameId = topGameId;
      cacheTime = Date.now();
      logger.debug(`[ClipsState] Cached top game ID: ${topGameId}`);
      return topGameId;
    }
  } catch (err) {
    logger.error('[ClipsState] Failed to fetch top game:', err);
  }
  
  // Fallback: Just Chatting game ID
  const fallbackId = '509658';
  logger.warn(`[ClipsState] Using fallback game ID: ${fallbackId}`);
  return fallbackId;
}

module.exports = { getTopGameId };