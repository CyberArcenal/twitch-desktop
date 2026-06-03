// src/main/services/notification-store.service.js
//@ts-check
const Store = require('electron-store');
const { BrowserWindow } = require('electron');
const { logger } = require('../utils/logger');

class NotificationStoreService {
  constructor() {
    this.store = new Store({ name: 'notifications' });
    this.notificationsKey = 'notifications';
  }

 /**
   * @param {string} channel
   * @param {null} data
   */
 _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (error) {
      // If running outside Electron (e.g., tests), ignore
      logger.warn(
        "Failed to send IPC event (maybe not in Electron):",
        // @ts-ignore
        error.message,
      );
    }
  }

  getAll() {
    return this.store.get(this.notificationsKey, []);
  }

  /**
   * @param {{ type: any; title?: string; message?: any; data?: { broadcasterId: any; broadcasterName: any; title: any; gameId: any; } | { followerId: any; followerName: any; broadcasterId: any; } | { userId: any; userName: any; tier: any; isGift: any; }; }} notification
   */
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

  /**
   * @param {any} id
   */
  markRead(id) {
    const notifications = this.getAll();
    const index = notifications.findIndex((/** @type {{ id: any; }} */ n) => n.id === id);
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
    notifications.forEach((/** @type {{ read: boolean; }} */ n) => n.read = true);
    this.store.set(this.notificationsKey, notifications);
    this._sendToRenderers('notification:all-read', null);
    return true;
  }

  /**
   * @param {any} id
   */
  delete(id) {
    const notifications = this.getAll();
    const filtered = notifications.filter((/** @type {{ id: any; }} */ n) => n.id !== id);
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