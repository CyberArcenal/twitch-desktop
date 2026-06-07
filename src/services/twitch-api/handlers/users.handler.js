const { fetchTwitch } = require('./core-fetch.handler');
const { logger } = require('../../../utils/logger');

async function getCurrentUser() {
  logger.debug('[TwitchApi] getCurrentUser called');
  const result = await fetchTwitch('users');
  logger.debug(`[TwitchApi] getCurrentUser - found ${result.data?.length || 0} users`);
  return result;
}

async function getUserByName(login) {
  logger.debug(`[TwitchApi] getUserByName called for login=${login}`);
  const result = await fetchTwitch(`users?login=${login}`);
  const user = result.data?.[0] || null;
  logger.debug(`[TwitchApi] getUserByName - ${user ? 'found' : 'not found'}`);
  return user;
}

module.exports = { getCurrentUser, getUserByName };