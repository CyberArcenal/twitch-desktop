const { RefreshingAuthProvider } = require('@twurple/auth');
const { settingsService } = require('../../settings');
const { CLIENT_ID, CLIENT_SECRET } = require('../../../shared/config');
const { logger } = require('../../../utils/logger');

async function getAuthProvider(state) {
  if (state.getAuthProvider()) {
    logger.debug('[Chat] Returning existing auth provider');
    return state.getAuthProvider();
  }

  const twitchData = settingsService.get('twitch');
  if (!twitchData?.accessToken || !twitchData?.refreshToken || !twitchData?.userId) {
    logger.error('[Chat] Missing Twitch tokens');
    throw new Error('No Twitch tokens found');
  }

  logger.info(`[Chat] Creating auth provider for user ${twitchData.userId}`);

  const tokenStore = {
    getUserToken: async (userId) => {
      const data = settingsService.get('twitch');
      if (data && data.userId === userId) {
        let scopeString = data.scope || 'chat:read chat:edit';
        if (Array.isArray(scopeString)) scopeString = scopeString.join(' ');
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn || 3600,
          obtainmentTimestamp: data.obtainmentTimestamp || Date.now(),
          scope: scopeString,
        };
      }
      return null;
    },
    setUserToken: async (userId, token) => {
      const existing = settingsService.get('twitch') || {};
      settingsService.setTwitchTokens(
        token.accessToken,
        token.refreshToken || existing.refreshToken || '',
        userId,
        existing.login || '',
        token.expiresIn,
        token.obtainmentTimestamp,
        token.scope || 'chat:read chat:edit'
      );
      logger.info(`[Chat] Token updated for ${userId}`);
    },
    removeUserToken: async (userId) => {
      logger.warn(`[Chat] removeUserToken called for ${userId}`);
    },
  };

  const authProvider = new RefreshingAuthProvider(
    { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET },
    tokenStore
  );

  const tokenData = {
    accessToken: twitchData.accessToken,
    refreshToken: twitchData.refreshToken,
    expiresIn: twitchData.expiresIn || 3600,
    obtainmentTimestamp: twitchData.obtainmentTimestamp || Date.now(),
  };

  await authProvider.addUserForToken(tokenData, ['chat']);
  logger.info('[Chat] User added with chat intent');

  authProvider.onRefresh(async (userId, newTokenData) => {
    if (userId === twitchData.userId) {
      logger.info(`[Chat] Token refreshed for ${userId}`);
      settingsService.setTwitchTokens(
        newTokenData.accessToken,
        newTokenData.refreshToken || twitchData.refreshToken,
        twitchData.userId,
        twitchData.login,
        newTokenData.expiresIn,
        newTokenData.obtainmentTimestamp,
        newTokenData.scope || 'chat:read chat:edit'
      );
    }
  });

  authProvider.onRefreshFailure(async (userId, error) => {
    logger.error(`[Chat] Token refresh failed for ${userId}:`, error);
  });

  state.setAuthProvider(authProvider);
  return authProvider;
}

module.exports = { getAuthProvider };