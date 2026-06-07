const {
  CLIENT_ID,
  CLIENT_SECRET,
  TOKEN_URL,
  REVOKE_URL,
} = require('../../../shared/config');
const { logger } = require('../../../utils/logger');

async function exchangeCodeForTokens(code, codeVerifier) {
  logger.info('[Auth] Exchanging code for tokens');
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  if (CLIENT_SECRET) params.append('client_secret', CLIENT_SECRET);
  params.append('code', code);
  params.append('code_verifier', codeVerifier);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', require('../../../shared/config').REDIRECT_URI);

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) {
    logger.error('[Auth] Token exchange failed', { status: response.status, message: data.message });
    throw new Error(data.message || 'Token exchange failed');
  }
  logger.success('[Auth] Tokens obtained successfully', { expiresIn: data.expires_in });
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

async function refreshAccessToken(refreshToken) {
  logger.info('[Auth] Refreshing access token');
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  if (CLIENT_SECRET) params.append('client_secret', CLIENT_SECRET);
  params.append('refresh_token', refreshToken);
  params.append('grant_type', 'refresh_token');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) {
    logger.error('[Auth] Token refresh failed', { status: response.status, message: data.message });
    throw new Error(data.message || 'Token refresh failed');
  }
  logger.success('[Auth] Token refreshed', { expiresIn: data.expires_in });
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

async function revokeToken(token) {
  logger.info('[Auth] Revoking token');
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('token', token);
  await fetch(REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  }).catch(err => logger.warn('[Auth] Revoke request failed', err));
  logger.debug('[Auth] Token revoke request sent');
}

module.exports = { exchangeCodeForTokens, refreshAccessToken, revokeToken };