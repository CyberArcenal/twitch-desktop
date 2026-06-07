
const { TwitchAuthState } = require('./twitch-auth.state');
const { login } = require('./handlers/login.handler');
const { refreshAccessToken, revokeToken } = require('./handlers/token.handler');
const { getUserInfo } = require('./handlers/user-info.handler');
const { scheduleTokenRefresh } = require('./handlers/schedule.handler');
const { settingsService } = require('../settings');
const { sendToRenderers } = require('../../utils/ipc-sender');
const { logger } = require('../../utils/logger');

class TwitchAuthService {
  constructor() {
    this.state = new TwitchAuthState();
    logger.debug('[TwitchAuthService] Constructor called');
  }

  async login() {
    return login(this.state);
  }

  getAccessToken() {
    const token = settingsService.get('twitch')?.accessToken;
    logger.debug('[Auth] getAccessToken called', { hasToken: !!token });
    return token;
  }

  getRefreshToken() {
    const token = settingsService.get('twitch')?.refreshToken;
    logger.debug('[Auth] getRefreshToken called', { hasToken: !!token });
    return token;
  }

  isLoggedIn() {
    const logged = !!this.getAccessToken();
    logger.debug(`[Auth] isLoggedIn = ${logged}`);
    return logged;
  }

  async refreshTokenIfNeeded() {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      logger.debug('[Auth] No refresh token – cannot refresh');
      return false;
    }
    logger.info('[Auth] Manually refreshing token');
    try {
      const { accessToken, refreshToken, expiresIn } = await refreshAccessToken(refresh);
      const userId = settingsService.get('twitch')?.userId;
      const login = settingsService.get('twitch')?.login;
      settingsService.setTwitchTokens(accessToken, refreshToken, userId, login);
      scheduleTokenRefresh(this.state, expiresIn);
      logger.success('[Auth] Manual refresh succeeded');
      return true;
    } catch (err) {
      logger.error('[Auth] Manual refresh failed – clearing tokens', err);
      await this.logout();
      sendToRenderers('auth:invalid', {});
      return false;
    }
  }

  async logout() {
    logger.info('[Auth] Logging out – revoking tokens');
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (accessToken) await revokeToken(accessToken);
    if (refreshToken) await revokeToken(refreshToken);
    this.state.clearRefreshTimer();
    settingsService.clearTwitchTokens();
    logger.success('[Auth] Logout completed');
  }

  async revokeAllTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (accessToken) await revokeToken(accessToken);
    if (refreshToken) await revokeToken(refreshToken);
    await this.logout();
  }

  // Helper methods (kept for compatibility)
  async checkTokenScopes(accessToken) {
    const url = 'https://id.twitch.tv/oauth2/validate';
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await res.json();
    const required = ['user:write:chat', 'user:write:chat'];
    const missing = required.filter(s => !data.scopes?.includes(s));
    if (missing.length) logger.warn(`Token missing scopes: ${missing.join(', ')}`);
  }

  async getUserInfo(accessToken) {
    return getUserInfo(accessToken);
  }
}

const twitchAuthService = new TwitchAuthService();
module.exports = { twitchAuthService, TwitchAuthService };