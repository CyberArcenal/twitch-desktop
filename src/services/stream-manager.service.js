// src/main/services/stream-manager.service.js
const { twitchApiService } = require("./twitch-api.service");
const { settingsService } = require("./settings.service");
const { BrowserWindow } = require("electron");
const Store = require("electron-store");
const { logger } = require("../utils/logger");

class StreamManagerService {
  constructor() {
    this.goalsStore = new Store({ name: "streamGoals" });
  }

  async updateStreamInfo(broadcasterId, title, gameId) {
    logger.info(`[StreamManager] Updating stream info for ${broadcasterId}`);
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/channels?broadcaster_id=${broadcasterId}`;
    const body = { title, game_id: gameId };
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to update stream info: ${error}`);
    }
    logger.success("[StreamManager] Stream info updated");
    return true;
  }

  async createClip(broadcasterId) {
    logger.info(`[StreamManager] Creating clip for ${broadcasterId}`);
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/clips?broadcaster_id=${broadcasterId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create clip");
    logger.success("[StreamManager] Clip created", data.data[0]);
    return data.data[0]; // { id, edit_url }
  }

  async startRaid(fromBroadcasterId, toBroadcasterLogin) {
    logger.info(`[StreamManager] Raiding ${toBroadcasterLogin}`);
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const user = await twitchApiService.getUserByName(toBroadcasterLogin);
    if (!user) throw new Error("Target channel not found");
    const url = `${API_BASE}/raids`;
    const body = {
      from_broadcaster_id: fromBroadcasterId,
      to_broadcaster_id: user.id,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Raid failed: ${error}`);
    }
    logger.success(`[StreamManager] Raid started to ${toBroadcasterLogin}`);
    return true;
  }

  async runCommercial(broadcasterId, length = 30) {
    logger.info(
      `[StreamManager] Running ${length}s commercial for ${broadcasterId}`,
    );
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/channels/commercial`;
    const body = { broadcaster_id: broadcasterId, length };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to run commercial");
    return await res.json();
  }

  // Moderation
  async banUser(broadcasterId, moderatorId, userName) {
    const user = await twitchApiService.getUserByName(userName);
    if (!user) throw new Error("User not found");
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/moderation/bans`;
    const body = {
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
      data: { user_id: user.id },
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Ban failed");
    return true;
  }

  async timeoutUser(broadcasterId, moderatorId, userName, durationSeconds) {
    const user = await twitchApiService.getUserByName(userName);
    if (!user) throw new Error("User not found");
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/moderation/bans`;
    const body = {
      broadcaster_id: broadcasterId,
      moderator_id: moderatorId,
      data: { user_id: user.id, duration: durationSeconds },
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Timeout failed");
    return true;
  }

  async clearChat(broadcasterId, moderatorId) {
    const token = settingsService.get("twitch").accessToken;
    const { CLIENT_ID, API_BASE } = require("../shared/config");
    const url = `${API_BASE}/moderation/chat?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });
    if (!res.ok) throw new Error("Clear chat failed");
    return true;
  }


/**
 * Get the list of moderators for the broadcaster's channel
 * @param {string} broadcasterId - The broadcaster's Twitch user ID
 * @returns {Promise<Array>} List of moderator objects
 */
async getModerators(broadcasterId) {
  const token = settingsService.get('twitch').accessToken;
  const { CLIENT_ID, API_BASE } = require('../shared/config');
  const url = `${API_BASE}/moderation/moderators?broadcaster_id=${broadcasterId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': CLIENT_ID,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch moderators');
  const data = await res.json();
  return data.data;
}

/**
 * Add a user as a moderator
 * @param {string} broadcasterId - The broadcaster's Twitch user ID
 * @param {string} userId - The Twitch user ID of the person to add
 * @returns {Promise<boolean>}
 */
async addModerator(broadcasterId, userId) {
  const token = settingsService.get('twitch').accessToken;
  const { CLIENT_ID, API_BASE } = require('../shared/config');
  const url = `${API_BASE}/moderation/moderators?broadcaster_id=${broadcasterId}&user_id=${userId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': CLIENT_ID,
    },
  });
  if (!res.ok) throw new Error('Failed to add moderator');
  return true;
}

/**
 * Remove a user from the moderator list
 * @param {string} broadcasterId - The broadcaster's Twitch user ID
 * @param {string} userId - The Twitch user ID to remove
 * @returns {Promise<boolean>}
 */
async removeModerator(broadcasterId, userId) {
  const token = settingsService.get('twitch').accessToken;
  const { CLIENT_ID, API_BASE } = require('../shared/config');
  const url = `${API_BASE}/moderation/moderators?broadcaster_id=${broadcasterId}&user_id=${userId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': CLIENT_ID,
    },
  });
  if (!res.ok) throw new Error('Failed to remove moderator');
  return true;
}


/**
 * Send a shoutout to another broadcaster
 * @param {string} fromBroadcasterId - The authenticated user's broadcaster ID
 * @param {string} toBroadcasterId - The target broadcaster's user ID
 * @param {string} moderatorId - The moderator ID (usually the streamer themselves)
 * @returns {Promise<boolean>}
 */
async sendShoutout(fromBroadcasterId, toBroadcasterId, moderatorId) {
  const token = settingsService.get('twitch').accessToken;
  const { CLIENT_ID, API_BASE } = require('../shared/config');
  const url = `${API_BASE}/chat/shoutouts?from_broadcaster_id=${fromBroadcasterId}&to_broadcaster_id=${toBroadcasterId}&moderator_id=${moderatorId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Client-Id': CLIENT_ID,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Shoutout failed: ${error}`);
  }
  return true;
}

  // Goals (local storage)
  getGoals() {
    return this.goalsStore.get("goals", []);
  }

  addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      id: Date.now().toString(),
      ...goal,
      createdAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    this.goalsStore.set("goals", goals);
    return newGoal;
  }

  updateGoalProgress(goalId, currentValue) {
    const goals = this.getGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      goal.current = currentValue;
      this.goalsStore.set("goals", goals);
    }
  }

  deleteGoal(goalId) {
    const goals = this.goalsStore
      .get("goals", [])
      .filter((g) => g.id !== goalId);
    this.goalsStore.set("goals", goals);
  }

  // Stream key (encrypted via electron-store)
  getStreamKey() {
    return this.goalsStore.get("streamKey", null);
  }

  saveStreamKey(key) {
    this.goalsStore.set("streamKey", key);
  }
}

const streamManagerService = new StreamManagerService();
module.exports = { streamManagerService };
