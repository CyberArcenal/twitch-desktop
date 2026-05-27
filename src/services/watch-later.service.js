// src/main/services/watch-later.service.js
//@ts-check
const Store = require('electron-store');

const WATCH_LATER_KEY = 'watchLater';

class WatchLaterService {
  constructor() {
    this.store = new Store({ name: 'watchLater' });
  }

  getAll() {
    return this.store.get(WATCH_LATER_KEY, []);
  }

  // @ts-ignore
  add(item) {
    const list = this.getAll();
    // Check if already exists by id (type + identifier)
    // @ts-ignore
    const exists = list.some(i => i.id === item.id);
    if (exists) return false;
    const newItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    // @ts-ignore
    list.push(newItem);
    this.store.set(WATCH_LATER_KEY, list);
    return true;
  }

  // @ts-ignore
  remove(id) {
    const list = this.getAll();
    // @ts-ignore
    const filtered = list.filter(i => i.id !== id);
    // @ts-ignore
    if (filtered.length === list.length) return false;
    this.store.set(WATCH_LATER_KEY, filtered);
    return true;
  }

  // @ts-ignore
  reorder(items) {
    // items should be full array in new order
    this.store.set(WATCH_LATER_KEY, items);
    return true;
  }

  clear() {
    this.store.delete(WATCH_LATER_KEY);
  }

  // @ts-ignore
  markAsWatched(id) {
    // Remove from watch later and return the item to be added to history
    const list = this.getAll();
    // @ts-ignore
    const item = list.find(i => i.id === id);
    if (!item) return null;
    // @ts-ignore
    const filtered = list.filter(i => i.id !== id);
    this.store.set(WATCH_LATER_KEY, filtered);
    return item;
  }
}

const watchLaterService = new WatchLaterService();
module.exports = { watchLaterService, WatchLaterService };