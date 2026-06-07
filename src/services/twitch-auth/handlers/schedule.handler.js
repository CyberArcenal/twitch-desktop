const { settingsService } = require('../../settings');
const { refreshAccessToken } = require('./token.handler');
const { logger } = require('../../../utils/logger');

function scheduleTokenRefresh(state, expiresInSeconds) {
  state.clearRefreshTimer();
  const refreshMs = (expiresInSeconds - 300) * 1000;
  if (refreshMs <= 0) {
    logger.warn('[Auth] Token expires too soon, skipping refresh scheduling');
    return;
  }
  logger.debug(`[Auth] Scheduling token refresh in ${Math.round(refreshMs / 1000)} seconds`);
  const timer = setTimeout(async () => {
    try {
      const storedRefreshToken = settingsService.get('twitch')?.refreshToken;
      if (storedRefreshToken) {
        logger.info('[Auth] Auto-refreshing token...');
        const { accessToken, refreshToken, expiresIn } = await refreshAccessToken(storedRefreshToken);
        const userId = settingsService.get('twitch')?.userId;
        const login = settingsService.get('twitch')?.login;
        settingsService.setTwitchTokens(accessToken, refreshToken, userId, login);
        logger.success('[Auth] Token refreshed successfully');
        scheduleTokenRefresh(state, expiresIn);
      } else {
        logger.warn('[Auth] No stored refresh token – cannot auto-refresh');
      }
    } catch (err) {
      logger.error('[Auth] Auto-refresh failed', err);
      state.clearRefreshTimer();
      settingsService.clearTwitchTokens();
    }
  }, refreshMs);
  state.setRefreshTimer(timer);
}

module.exports = { scheduleTokenRefresh };