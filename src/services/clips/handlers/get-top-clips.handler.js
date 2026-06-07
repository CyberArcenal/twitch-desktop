const { twitchApiService } = require('../../twitch-api');
const { getTopGameId } = require('../clips.state');
const { logger } = require('../../../utils/logger');

/**
 * Get top clips, filtered by gameId or broadcasterId and optional time period.
 * If neither gameId nor broadcasterId is provided, uses the current top game.
 */
async function getTopClips(
  gameId = null,
  broadcasterId = null,
  period = 'week',
  first = 20,
) {
  let effectiveGameId = gameId;
  let effectiveBroadcasterId = broadcasterId;

  // If both are missing, fetch the top game by current viewers
  if (!effectiveGameId && !effectiveBroadcasterId) {
    effectiveGameId = await getTopGameId();
    logger.debug(`[Clips] No filters provided, using top game ID: ${effectiveGameId}`);
  }

  const params = new URLSearchParams({
    first: String(Math.min(first, 100)),
  });

  if (effectiveGameId) params.append('game_id', effectiveGameId);
  if (effectiveBroadcasterId) params.append('broadcaster_id', effectiveBroadcasterId);

  // Date filtering
  if (period && period !== 'all') {
    const now = new Date();
    let startDate;
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    if (startDate) {
      params.append('started_at', startDate.toISOString());
      params.append('ended_at', now.toISOString());
    }
  }

  const url = `clips?${params.toString()}`;
  logger.debug(`[Clips] getTopClips request: ${url}`);
  const result = await twitchApiService.fetchTwitch(url);
  logger.debug(`[Clips] getTopClips returned ${result.data?.length || 0} clips`);
  return result;
}

module.exports = { getTopClips };