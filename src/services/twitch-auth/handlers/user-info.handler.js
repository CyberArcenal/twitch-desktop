const { API_BASE, CLIENT_ID } = require('../../../shared/config');
const { logger } = require('../../../utils/logger');

async function getUserInfo(accessToken) {
  logger.debug('[Auth] Fetching user info');
  const url = `${API_BASE}/users`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Client-Id': CLIENT_ID,
  };
  const response = await fetch(url, { headers });
  const data = await response.json();
  if (!data.data || data.data.length === 0) {
    logger.error('[Auth] No user data received', data);
    throw new Error('No user data');
  }
  logger.debug('[Auth] User info fetched', { id: data.data[0].id, login: data.data[0].login });
  return data.data[0];
}

module.exports = { getUserInfo };