// src/main/services/history.service.js
//@ts-check
const Store = require('electron-store');
const { logger } = require("../utils/logger");

const HISTORY_KEY = 'watchHistory';
const MAX_HISTORY_SIZE = 500;

class HistoryService {
  constructor() {
    this.store = new Store({ name: 'history' });
    logger.debug("[HistoryService] Constructor - store initialized");
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
    logger.info(`[HistoryService] addToHistory called for ${entry.type}: ${entry.channelName}`);
    const history = this._getHistoryArray();

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

    // @ts-ignore
    history.unshift(newEntry);
    // @ts-ignore
    if (history.length > MAX_HISTORY_SIZE) {
      // @ts-ignore
      const removed = history.length - MAX_HISTORY_SIZE;
      // @ts-ignore
      history.length = MAX_HISTORY_SIZE;
      logger.debug(`[HistoryService] Trimmed ${removed} old entries`);
    }

    this.store.set(HISTORY_KEY, history);
    // @ts-ignore
    logger.info(`[HistoryService] Added entry id=${id}, total now ${history.length}`);
    return newEntry;
  }

  /**
   * Get watch history, most recent first
   * @param {number} limit - Max number of entries to return (default 50)
   */
  getHistory(limit = 50) {
    const history = this._getHistoryArray();
    // @ts-ignore
    const result = history.slice(0, Math.min(limit, history.length));
    logger.debug(`[HistoryService] getHistory(limit=${limit}) - returning ${result.length} entries`);
    return result;
  }

  clearHistory() {
    logger.warn("[HistoryService] Clearing all watch history");
    this.store.delete(HISTORY_KEY);
  }

  /**
   * @param {any} id
   */
  removeFromHistory(id) {
    logger.info(`[HistoryService] removeFromHistory called for id=${id}`);
    const history = this._getHistoryArray();
    // @ts-ignore
    const initialLength = history.length;
    // @ts-ignore
    const filtered = history.filter((/** @type {{ id: any; }} */ entry) => entry.id !== id);
    if (filtered.length === initialLength) {
      logger.warn(`[HistoryService] Entry with id=${id} not found`);
      return false;
    }
    this.store.set(HISTORY_KEY, filtered);
    logger.info(`[HistoryService] Removed entry ${id}, remaining ${filtered.length}`);
    return true;
  }

  /**
   * @param {any} channelName
   */
  removeChannelHistory(channelName) {
    logger.info(`[HistoryService] removeChannelHistory for ${channelName}`);
    const history = this._getHistoryArray();
    // @ts-ignore
    const filtered = history.filter((/** @type {{ channelName: any; }} */ entry) => entry.channelName !== channelName);
    // @ts-ignore
    const removed = history.length - filtered.length;
    if (removed > 0) {
      this.store.set(HISTORY_KEY, filtered);
      logger.info(`[HistoryService] Removed ${removed} entries for channel ${channelName}`);
    } else {
      logger.debug(`[HistoryService] No entries found for channel ${channelName}`);
    }
    return removed;
  }

  /**
   * @param {string} type
   * @param {any} identifier
   */
  existsInHistory(type, identifier) {
    const history = this._getHistoryArray();
    const exists = type === 'stream'
      // @ts-ignore
      ? history.some((/** @type {{ type: string; channelName: any; }} */ e) => e.type === 'stream' && e.channelName === identifier)
      // @ts-ignore
      : history.some((/** @type {{ type: string; vodId: any; }} */ e) => e.type === 'vod' && e.vodId === identifier);
    logger.debug(`[HistoryService] existsInHistory(${type}, ${identifier}): ${exists}`);
    return exists;
  }

  _getHistoryArray() {
    return this.store.get(HISTORY_KEY, []);
  }
}

const historyService = new HistoryService();
module.exports = { historyService, HistoryService };