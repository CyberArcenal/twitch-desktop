const { twitchAuthService } = require('../../twitch-auth');
const { CLIENT_ID, API_BASE } = require('../../../shared/config');
const { logger } = require('../../../utils/logger');

async function fetchTwitch(endpoint, options = {}, retry = true) {
  const url = `${API_BASE}/${endpoint}`;
  const method = options.method || 'GET';
  logger.debug(`[TwitchApi] ${method} ${endpoint} - starting`);

  const startTime = Date.now();
  const headers = { ...options.headers };

  const token = twitchAuthService.getAccessToken();
  if (!token) {
    logger.error(`[TwitchApi] ${endpoint} - No access token`);
    throw new Error('Not authenticated');
  }

  headers['Authorization'] = `Bearer ${token}`;
  headers['Client-Id'] = CLIENT_ID;

  try {
    const res = await fetch(url, { ...options, headers });
    const duration = Date.now() - startTime;

    if (res.status === 401 && retry) {
      logger.warn(`[TwitchApi] ${endpoint} - 401 Unauthorized, attempting token refresh`);
      const refreshed = await twitchAuthService.refreshTokenIfNeeded();
      if (refreshed) {
        logger.info(`[TwitchApi] ${endpoint} - Token refreshed, retrying (once)`);
        return fetchTwitch(endpoint, options, false);
      } else {
        logger.error(`[TwitchApi] ${endpoint} - Token refresh failed`);
      }
    }

    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`[TwitchApi] ${endpoint} - HTTP ${res.status} (${duration}ms): ${errorText.substring(0, 200)}`);
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `API error: ${res.status}`);
    }

    const data = await res.json();
    logger.debug(`[TwitchApi] ${endpoint} - success (${duration}ms)`);
    return data;
  } catch (err) {
    logger.error(`[TwitchApi] ${endpoint} - exception:`, err);
    throw err;
  }
}

module.exports = { fetchTwitch };