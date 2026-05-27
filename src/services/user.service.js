// src/main/services/user.service.js
//@ts-check
const { twitchApiService } = require('./twitch-api.service');
const { settingsService } = require('./settings.service');

class UserService {
  /**
   * Get the currently authenticated user's information
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
    const result = await twitchApiService.fetchTwitch('users');
    return result.data?.[0] || null;
  }

  /**
   * Get user information by user ID
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getUserById(userId) {
    const result = await twitchApiService.fetchTwitch(`users?id=${userId}`);
    return result.data?.[0] || null;
  }

  /**
   * Get user information by login name
   * @param {string} login
   * @returns {Promise<object>}
   */
  async getUserByName(login) {
    const result = await twitchApiService.fetchTwitch(`users?login=${login}`);
    return result.data?.[0] || null;
  }

  /**
   * Get the list of channels the authenticated user subscribes to (requires subscription scope)
   * @returns {Promise<{data: Array, pagination?: object}>}
   */
  async getUserSubscriptions() {
    const userId = settingsService.get('twitch').userId;
    if (!userId) throw new Error('Not logged in');
    // Requires 'user:read:subscriptions' scope
    return await twitchApiService.fetchTwitch(`subscriptions?broadcaster_id=${userId}`);
  }

  /**
   * Get badges for a specific user (global and channel-specific)
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserBadges(userId) {
    // Global badges
    const globalResult = await twitchApiService.fetchTwitch(`chat/badges/global`);
    // Channel-specific badges (if userId is a broadcaster)
    let channelBadges = [];
    try {
      const channelResult = await twitchApiService.fetchTwitch(`chat/badges?broadcaster_id=${userId}`);
      channelBadges = channelResult.data || [];
    } catch (err) {
      // Channel may not have custom badges
    }
    return {
      global: globalResult.data || [],
      channel: channelBadges
    };
  }
}

const userService = new UserService();
module.exports = { userService, UserService };