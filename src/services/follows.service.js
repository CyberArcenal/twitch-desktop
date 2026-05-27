// src/main/services/follows.service.js
//@ts-check
const { twitchApiService } = require('./twitch-api.service');
const { settingsService } = require('./settings.service');
const { BrowserWindow } = require('electron');

class FollowsService {
  constructor() {
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.mainWindow = null;
  }

  initialize(mainWindow) {
    this.mainWindow = mainWindow;
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[FollowsService] send error:', err);
    }
  }

  isCacheValid() {
    return this.followsCache && (Date.now() - this.cacheTimestamp) < this.CACHE_TTL;
  }

  async getFollowedChannels(userId, after = null, forceRefresh = false) {
    if (!userId) throw new Error('User ID is required');
    if (!forceRefresh && this.isCacheValid()) {
      return this.followsCache;
    }

    const response = await twitchApiService.getFollowedChannels(userId, after);
    let allFollows = [...(response.data || [])];
    let cursor = response.pagination?.cursor;
    while (cursor) {
      const nextPage = await twitchApiService.getFollowedChannels(userId, cursor);
      allFollows = allFollows.concat(nextPage.data || []);
      cursor = nextPage.pagination?.cursor;
    }

    const result = {
      data: allFollows,
      total: allFollows.length,
      timestamp: Date.now()
    };
    this.followsCache = result;
    this.cacheTimestamp = Date.now();
    return result;
  }

  async followChannel(broadcasterId) {
    if (!broadcasterId) throw new Error('Broadcaster ID is required');
    const token = settingsService.get('twitch').accessToken;
    if (!token) throw new Error('Not authenticated');
    const userId = settingsService.get('twitch').userId;
    if (!userId) throw new Error('User not logged in');
    const { API_BASE, CLIENT_ID } = require('../shared/config');

    const url = `${API_BASE}/users/follows`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from_id: userId, to_id: broadcasterId })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to follow channel');
    }
    // Invalidate cache
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this._sendToRenderers('follows:changed', { action: 'follow', broadcasterId });
    return true;
  }

  async unfollowChannel(broadcasterId) {
    if (!broadcasterId) throw new Error('Broadcaster ID is required');
    const token = settingsService.get('twitch').accessToken;
    if (!token) throw new Error('Not authenticated');
    const userId = settingsService.get('twitch').userId;
    if (!userId) throw new Error('User not logged in');
    const { API_BASE, CLIENT_ID } = require('../shared/config');

    const url = `${API_BASE}/users/follows?from_id=${userId}&to_id=${broadcasterId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID
      }
    });
    if (!response.ok && response.status !== 404) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to unfollow channel');
    }
    this.followsCache = null;
    this.cacheTimestamp = 0;
    this._sendToRenderers('follows:changed', { action: 'unfollow', broadcasterId });
    return true;
  }

  async isFollowing(broadcasterId) {
    if (!broadcasterId) return false;
    const userId = settingsService.get('twitch').userId;
    if (!userId) return false;
    const token = settingsService.get('twitch').accessToken;
    if (!token) return false;
    const { API_BASE, CLIENT_ID } = require('../shared/config');

    const url = `${API_BASE}/users/follows?from_id=${userId}&to_id=${broadcasterId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID
      }
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.data && data.data.length > 0;
  }

  saveFollowsToLocalStorage() {
    if (this.followsCache && this.followsCache.data) {
      settingsService.set('cachedFollows', {
        data: this.followsCache.data,
        timestamp: this.followsCache.timestamp
      });
    }
  }

  loadFollowsFromLocalStorage() {
    const cached = settingsService.get('cachedFollows');
    if (cached && cached.data && cached.timestamp) {
      this.followsCache = {
        data: cached.data,
        total: cached.data.length,
        timestamp: cached.timestamp
      };
      this.cacheTimestamp = cached.timestamp;
      return true;
    }
    return false;
  }

  clearCache() {
    this.followsCache = null;
    this.cacheTimestamp = 0;
    settingsService.set('cachedFollows', null);
  }
}

const followsService = new FollowsService();
module.exports = { followsService, FollowsService };