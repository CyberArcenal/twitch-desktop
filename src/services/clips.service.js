// src/main/services/clips.service.js
//@ts-check
const { twitchApiService } = require("./twitch-api.service");

// @ts-ignore
let cachedTopGameId = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getTopGameId() {
  // @ts-ignore
  if (cachedTopGameId && Date.now() - cacheTime < CACHE_TTL) return cachedTopGameId;
  const topStreams = await twitchApiService.getTopStreams(1);
  const topGameId = topStreams.data?.[0]?.game_id;
  if (topGameId) {
    cachedTopGameId = topGameId;
    cacheTime = Date.now();
  }
  return topGameId || '509658';
}


class ClipsService {
  /**
   * Get clips from a specific broadcaster
   * @param {string} broadcasterId
   * @param {number} first - Max number of clips (1-100)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getClips(broadcasterId, first = 20) {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: String(Math.min(first, 100)),
    });
    return await twitchApiService.fetchTwitch(`clips?${params}`);
  }

  /**
   * Get a single clip by its ID
   * @param {string} clipId
   * @returns {Promise<object>}
   */
  async getClip(clipId) {
    const result = await twitchApiService.fetchTwitch(`clips?id=${clipId}`);
    return result.data?.[0] || null;
  }

  /**
   * Get top clips, filtered by gameId or broadcasterId and optional time period
   * @param {string|null} gameId
   * @param {string|null} broadcasterId
   * @param {'day'|'week'|'month'|'all'} period
   * @param {number} first
   */
  /**
   * Get top clips, filtered by gameId or broadcasterId and optional time period.
   * If neither gameId nor broadcasterId is provided, uses the current top game.
   */
  async getTopClips(
    gameId = null,
    broadcasterId = null,
    period = "week",
    first = 20,
  ) {
    let effectiveGameId = gameId;
    let effectiveBroadcasterId = broadcasterId;

    // If both are missing, fetch the top game by current viewers
    if (!effectiveGameId && !effectiveBroadcasterId) {
      try {
        const topGameId = await getTopGameId();
        if (topGameId) {
          effectiveGameId = topGameId;
          console.log(
            `[ClipsService] No gameId/broadcasterId, using top game: ${effectiveGameId}`,
          );
        } else {
          // Fallback: use a default popular game (e.g., Just Chatting)
          // @ts-ignore
          effectiveGameId = "509658"; // Just Chatting game ID (adjust if needed)
        }
      } catch (err) {
        console.error(
          "[ClipsService] Failed to fetch top game, using fallback",
          err,
        );
        // @ts-ignore
        effectiveGameId = "509658"; // fallback
      }
    }

    const params = new URLSearchParams({
      first: String(Math.min(first, 100)),
    });

    if (effectiveGameId) params.append("game_id", effectiveGameId);
    if (effectiveBroadcasterId)
      params.append("broadcaster_id", effectiveBroadcasterId);

    // Date filtering
    if (period && period !== "all") {
      const now = new Date();
      let startDate;
      switch (period) {
        case "day":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      if (startDate) {
        params.append("started_at", startDate.toISOString());
        params.append("ended_at", now.toISOString());
      }
    }

    return await twitchApiService.fetchTwitch(`clips?${params.toString()}`);
  }
}

const clipsService = new ClipsService();
module.exports = { clipsService, ClipsService };
