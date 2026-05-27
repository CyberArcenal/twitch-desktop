// src/main/services/stream-monitor.service.js
//@ts-check
const { twitchApiService } = require('./twitch-api.service');
const { settingsService } = require('./settings.service');
const { notificationService } = require('./notification.service');
const { BrowserWindow } = require('electron');

class StreamMonitorService {
  constructor() {
    this.monitorInterval = null;
    this.lastLiveStatus = new Map(); // broadcaster_id -> { isLive, gameName, title, userName }
    this.mainWindow = null;
  }

  initStreamMonitor(window) {
    this.mainWindow = window;
  }

  async checkFollowedStreams() {
    const twitch = settingsService.get('twitch');
    if (!twitch.userId || !twitch.accessToken) return;

    try {
      const followed = await twitchApiService.getFollowedChannels(twitch.userId);
      const followedIds = followed.data.map(f => f.broadcaster_id);
      if (followedIds.length === 0) return;

      const streamsData = await twitchApiService.getStreams(followedIds);
      const liveStreams = streamsData.data || [];

      const currentLive = new Map();
      for (const stream of liveStreams) {
        currentLive.set(stream.user_id, {
          isLive: true,
          gameName: stream.game_name,
          title: stream.title,
          userName: stream.user_name
        });
      }

      // Check for newly live streams
      for (const [userId, now] of currentLive.entries()) {
        const prev = this.lastLiveStatus.get(userId);
        if (!prev || !prev.isLive) {
          notificationService.notifyStreamLive(now.userName, now.gameName);
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('stream:went-live', {
              userName: now.userName,
              gameName: now.gameName,
              title: now.title
            });
          }
          this.lastLiveStatus.set(userId, now);
        }
      }

      // Remove channels that are no longer live
      for (const [userId, prev] of this.lastLiveStatus.entries()) {
        if (!currentLive.has(userId) && prev.isLive) {
          this.lastLiveStatus.delete(userId);
        }
      }
    } catch (err) {
      console.error('[StreamMonitor] Error checking streams:', err);
    }
  }

  startStreamMonitor(intervalSeconds = 60) {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    setTimeout(() => this.checkFollowedStreams(), 5000);
    this.monitorInterval = setInterval(() => this.checkFollowedStreams(), intervalSeconds * 1000);
  }

  stopStreamMonitor() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.lastLiveStatus.clear();
  }
}

const streamMonitorService = new StreamMonitorService();
module.exports = { streamMonitorService, StreamMonitorService };