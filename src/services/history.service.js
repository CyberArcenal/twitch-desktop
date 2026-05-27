// src/main/services/history.service.js
//@ts-check
const Store = require('electron-store');

const HISTORY_KEY = 'watchHistory';
const MAX_HISTORY_SIZE = 500;

class HistoryService {
  constructor() {
    this.store = new Store({ name: 'history' });
  }

  /**
   * Add a watched stream or VOD to history
   * @param {Object} entry
   * @param {string} entry.type - 'stream' or 'vod'
   * @param {string} entry.channelName - Channel name (required)
   * @param {string} [entry.vodId] - VOD ID (required if type='vod')
   * @param {string} [entry.title] - Stream/VOD title
   * @param {string} [entry.thumbnail] - Thumbnail URL
   * @param {Date|string} [entry.watchedAt] - When watched (defaults to now)
   * @param {number} [entry.duration] - How many seconds watched (optional)
   * @returns {Object} The saved entry with id and timestamp
   */
  addToHistory(entry) {
    const history = this._getHistoryArray();

    // Generate unique ID
    const id = `${entry.type}_${entry.type === 'stream' ? entry.channelName : entry.vodId}_${Date.now()}`;
    const watchedAt = entry.watchedAt ? new Date(entry.watchedAt) : new Date();

    const newEntry = {
      id,
      type: entry.type,
      channelName: entry.channelName,
      vodId: entry.vodId || null,
      title: entry.title || null,
      thumbnail: entry.thumbnail || null,
      watchedAt: watchedAt.toISOString(),
      duration: entry.duration || null,
    };

    // Add to beginning of array (most recent first)
    history.unshift(newEntry);

    // Trim to max size
    if (history.length > MAX_HISTORY_SIZE) {
      history.length = MAX_HISTORY_SIZE;
    }

    this.store.set(HISTORY_KEY, history);
    return newEntry;
  }

  /**
   * Get watch history, most recent first
   * @param {number} limit - Max number of entries to return (default 50)
   * @returns {Array} Array of history entries
   */
  getHistory(limit = 50) {
    const history = this._getHistoryArray();
    return history.slice(0, Math.min(limit, history.length));
  }

  /**
   * Clear all watch history
   */
  clearHistory() {
    this.store.delete(HISTORY_KEY);
  }

  /**
   * Remove a specific entry by its ID
   * @param {string} id - Entry ID (from addToHistory)
   * @returns {boolean} True if removed, false if not found
   */
  removeFromHistory(id) {
    const history = this._getHistoryArray();
    const initialLength = history.length;
    const filtered = history.filter(entry => entry.id !== id);
    if (filtered.length === initialLength) return false;
    this.store.set(HISTORY_KEY, filtered);
    return true;
  }

  /**
   * Remove all entries for a specific channel
   * @param {string} channelName - Channel name
   * @returns {number} Number of entries removed
   */
  removeChannelHistory(channelName) {
    const history = this._getHistoryArray();
    const filtered = history.filter(entry => entry.channelName !== channelName);
    const removed = history.length - filtered.length;
    if (removed > 0) {
      this.store.set(HISTORY_KEY, filtered);
    }
    return removed;
  }

  /**
   * Check if a stream/VOD is already in history (to avoid duplicates)
   * @param {string} type - 'stream' or 'vod'
   * @param {string} identifier - channelName for stream, vodId for VOD
   * @returns {boolean}
   */
  existsInHistory(type, identifier) {
    const history = this._getHistoryArray();
    if (type === 'stream') {
      return history.some(e => e.type === 'stream' && e.channelName === identifier);
    } else {
      return history.some(e => e.type === 'vod' && e.vodId === identifier);
    }
  }

  /**
   * Internal helper: get history array from store, empty if none
   * @private
   */
  _getHistoryArray() {
    return this.store.get(HISTORY_KEY, []);
  }
}

const historyService = new HistoryService();
module.exports = { historyService, HistoryService };