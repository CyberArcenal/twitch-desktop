const Store = require('electron-store');
const { logger } = require('../../utils/logger');

const { updateStreamInfo } = require('./handlers/stream-info.handler');
const { createClip } = require('./handlers/clip.handler');
const { startRaid } = require('./handlers/raid.handler');
const { runCommercial } = require('./handlers/commercial.handler');
const {
  banUser,
  timeoutUser,
  clearChat,
  getModerators,
  addModerator,
  removeModerator,
} = require('./handlers/moderation.handler');
const { sendShoutout } = require('./handlers/shoutout.handler');
const { getGoals, addGoal, updateGoalProgress, deleteGoal } = require('./handlers/goals.handler');
const { getStreamKey, saveStreamKey } = require('./handlers/stream-key.handler');

class StreamManagerService {
  constructor() {
    this.goalsStore = new Store({ name: 'streamGoals' });
    logger.debug('[StreamManagerService] Constructor - store initialized');
  }

  async updateStreamInfo(broadcasterId, data) {
    return updateStreamInfo(broadcasterId, data);
  }

  async createClip(broadcasterId) {
    return createClip(broadcasterId);
  }

  async startRaid(fromBroadcasterId, toBroadcasterLogin) {
    return startRaid(fromBroadcasterId, toBroadcasterLogin);
  }

  async runCommercial(broadcasterId, length = 30) {
    return runCommercial(broadcasterId, length);
  }

  async banUser(broadcasterId, moderatorId, userName) {
    return banUser(broadcasterId, moderatorId, userName);
  }

  async timeoutUser(broadcasterId, moderatorId, userName, durationSeconds) {
    return timeoutUser(broadcasterId, moderatorId, userName, durationSeconds);
  }

  async clearChat(broadcasterId, moderatorId) {
    return clearChat(broadcasterId, moderatorId);
  }

  async getModerators(broadcasterId) {
    return getModerators(broadcasterId);
  }

  async addModerator(broadcasterId, userId) {
    return addModerator(broadcasterId, userId);
  }

  async removeModerator(broadcasterId, userId) {
    return removeModerator(broadcasterId, userId);
  }

  async sendShoutout(fromBroadcasterId, toBroadcasterId, moderatorId) {
    return sendShoutout(fromBroadcasterId, toBroadcasterId, moderatorId);
  }

  getGoals() {
    return getGoals(this.goalsStore);
  }

  addGoal(goal) {
    return addGoal(this.goalsStore, goal);
  }

  updateGoalProgress(goalId, currentValue) {
    return updateGoalProgress(this.goalsStore, goalId, currentValue);
  }

  deleteGoal(goalId) {
    return deleteGoal(this.goalsStore, goalId);
  }

  getStreamKey() {
    return getStreamKey(this.goalsStore);
  }

  saveStreamKey(key) {
    return saveStreamKey(this.goalsStore, key);
  }
}

const streamManagerService = new StreamManagerService();
module.exports = { streamManagerService, StreamManagerService };