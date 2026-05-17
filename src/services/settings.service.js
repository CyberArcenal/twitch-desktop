const Store = require('electron-store');

// Default settings
const defaults = {
  theme: 'dark',
  notificationsEnabled: true,
  autoPlay: true,
  chatFilters: [],
  twitch: {}
};

const store = new Store({ defaults });

const settingsService = {
  getAll() {
    return store.store;
  },

  get(key) {
    return store.get(key);
  },

  set(key, value) {
    store.set(key, value);
  },

  addChatFilter(word) {
    const filters = store.get('chatFilters');
    const lowerWord = word.toLowerCase();
    if (!filters.includes(lowerWord)) {
      store.set('chatFilters', [...filters, lowerWord]);
    }
  },

  removeChatFilter(word) {
    const filters = store.get('chatFilters');
    store.set('chatFilters', filters.filter(f => f !== word.toLowerCase()));
  },

setTwitchTokens(accessToken, refreshToken, userId, login) {
  store.set('twitch', { accessToken, refreshToken, userId, login });
},

  clearTwitchTokens() {
    store.set('twitch', {});
  },

  reset() {
    store.clear();
    store.set(defaults);
  }
};

module.exports = { settingsService };