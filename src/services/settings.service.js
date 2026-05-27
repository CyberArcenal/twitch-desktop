// src/main/services/settings.service.js
//@ts-check
const Store = require('electron-store');
const { logger } = require('../utils/logger');

const defaults = {
  theme: 'dark',
  notificationsEnabled: true,
  autoPlay: true,
  chatFilters: [],
  twitch: {}
};

class SettingsService {
  constructor() {
    this.store = new Store({ defaults });
    // @ts-ignore
    logger.debug('[SettingsService] Initialized with defaults', defaults);
  }

  getAll() {
    const all = this.store.store;
    // @ts-ignore
    logger.debug('[SettingsService] getAll called, keys:', Object.keys(all));
    return all;
  }

  // @ts-ignore
  get(key) {
    const value = this.store.get(key);
    // Only log non‑sensitive keys; don't log full tokens
    if (key === 'twitch') {
      // @ts-ignore
      logger.debug('[SettingsService] get(twitch):', { hasToken: !!value?.accessToken, userId: value?.userId });
    } else {
      logger.debug(`[SettingsService] get(${key}) =`, value);
    }
    return value;
  }

  // @ts-ignore
  set(key, value) {
    if (key === 'twitch') {
      // @ts-ignore
      logger.debug('[SettingsService] set(twitch): updating tokens', { userId: value?.userId, login: value?.login });
    } else {
      logger.debug(`[SettingsService] set(${key}) =`, value);
    }
    this.store.set(key, value);
  }

  // @ts-ignore
  addChatFilter(word) {
    const filters = this.get('chatFilters');
    const lowerWord = word.toLowerCase();
    if (!filters.includes(lowerWord)) {
      this.set('chatFilters', [...filters, lowerWord]);
      logger.debug(`[SettingsService] addChatFilter: added "${word}"`);
    } else {
      logger.debug(`[SettingsService] addChatFilter: "${word}" already exists`);
    }
  }

  // @ts-ignore
  removeChatFilter(word) {
    const filters = this.get('chatFilters');
    // @ts-ignore
    this.set('chatFilters', filters.filter(f => f !== word.toLowerCase()));
    logger.debug(`[SettingsService] removeChatFilter: removed "${word}"`);
  }

  // @ts-ignore
  setTwitchTokens(accessToken, refreshToken, userId, login) {
    this.set('twitch', { accessToken, refreshToken, userId, login });
    // @ts-ignore
    logger.info('[SettingsService] Twitch tokens saved', { userId, login });
  }

  clearTwitchTokens() {
    this.set('twitch', {});
    logger.warn('[SettingsService] Twitch tokens cleared');
  }

  reset() {
    logger.warn('[SettingsService] Resetting all settings to defaults');
    this.store.clear();
    this.store.set(defaults);
  }
}

const settingsService = new SettingsService();
module.exports = { settingsService, SettingsService };