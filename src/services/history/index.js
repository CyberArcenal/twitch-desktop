const Store = require('electron-store');
const { logger } = require('../../utils/logger');

const HISTORY_KEY = 'watchHistory';
const MAX_HISTORY_SIZE = 500;

class HistoryService {
  constructor() {
    this.store = new Store({ name: 'history' });
    logger.debug('[HistoryService] Constructor - store initialized');
  }

  addToHistory(entry) {
    logger.info(`[HistoryService] addToHistory for ${entry.type}: ${entry.channelName}`);
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

    history.unshift(newEntry);
    if (history.length > MAX_HISTORY_SIZE) {
      const removed = history.length - MAX_HISTORY_SIZE;
      history.length = MAX_HISTORY_SIZE;
      logger.debug(`[HistoryService] Trimmed ${removed} old entries`);
    }

    this.store.set(HISTORY_KEY, history);
    logger.info(`[HistoryService] Added entry id=${id}, total now ${history.length}`);
    return newEntry;
  }

  getHistory(limit = 50) {
    const history = this._getHistoryArray();
    const result = history.slice(0, Math.min(limit, history.length));
    logger.debug(`[HistoryService] getHistory(${limit}) -> ${result.length} entries`);
    return result;
  }

  clearHistory() {
    logger.warn('[HistoryService] Clearing all watch history');
    this.store.delete(HISTORY_KEY);
  }

  removeFromHistory(id) {
    logger.info(`[HistoryService] removeFromHistory id=${id}`);
    const history = this._getHistoryArray();
    const filtered = history.filter(entry => entry.id !== id);
    if (filtered.length === history.length) {
      logger.warn(`[HistoryService] Entry ${id} not found`);
      return false;
    }
    this.store.set(HISTORY_KEY, filtered);
    logger.info(`[HistoryService] Removed ${id}, remaining ${filtered.length}`);
    return true;
  }

  removeChannelHistory(channelName) {
    logger.info(`[HistoryService] removeChannelHistory for ${channelName}`);
    const history = this._getHistoryArray();
    const filtered = history.filter(entry => entry.channelName !== channelName);
    const removed = history.length - filtered.length;
    if (removed > 0) {
      this.store.set(HISTORY_KEY, filtered);
      logger.info(`[HistoryService] Removed ${removed} entries for ${channelName}`);
    }
    return removed;
  }

  existsInHistory(type, identifier) {
    const history = this._getHistoryArray();
    const exists = type === 'stream'
      ? history.some(e => e.type === 'stream' && e.channelName === identifier)
      : history.some(e => e.type === 'vod' && e.vodId === identifier);
    logger.debug(`[HistoryService] existsInHistory(${type}, ${identifier}): ${exists}`);
    return exists;
  }

  _getHistoryArray() {
    return this.store.get(HISTORY_KEY, []);
  }
}

const historyService = new HistoryService();
module.exports = { historyService, HistoryService };