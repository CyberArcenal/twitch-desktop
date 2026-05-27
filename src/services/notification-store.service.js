// src/main/services/notification-store.service.js
const Store = require('electron-store');
const { BrowserWindow } = require('electron');

class NotificationStoreService {
  constructor() {
    this.store = new Store({ name: 'notifications' });
    this.notificationsKey = 'notifications';
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[NotificationStore] send error:', err);
    }
  }

  getAll() {
    return this.store.get(this.notificationsKey, []);
  }

  add(notification) {
    const notifications = this.getAll();
    const newNotif = {
      id: `${notification.type}_${Date.now()}_${Math.random()}`,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    // Keep last 500 notifications
    if (notifications.length > 500) notifications.pop();
    this.store.set(this.notificationsKey, notifications);
    this._sendToRenderers('notification:new', newNotif);
    return newNotif;
  }

  markRead(id) {
    const notifications = this.getAll();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.store.set(this.notificationsKey, notifications);
      this._sendToRenderers('notification:updated', notifications[index]);
      return true;
    }
    return false;
  }

  markAllRead() {
    const notifications = this.getAll();
    notifications.forEach(n => n.read = true);
    this.store.set(this.notificationsKey, notifications);
    this._sendToRenderers('notification:all-read', null);
    return true;
  }

  delete(id) {
    const notifications = this.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    this.store.set(this.notificationsKey, filtered);
    this._sendToRenderers('notification:deleted', id);
    return true;
  }

  clearAll() {
    this.store.delete(this.notificationsKey);
    this._sendToRenderers('notification:cleared', null);
    return true;
  }
}

const notificationStore = new NotificationStoreService();
module.exports = { notificationStore, NotificationStoreService };