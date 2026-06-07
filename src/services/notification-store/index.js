const Store = require('electron-store');
const { sendToRenderers } = require('../../utils/ipc-sender');
const { logger } = require('../../utils/logger');

class NotificationStoreService {
  constructor() {
    this.store = new Store({ name: 'notifications' });
    this.notificationsKey = 'notifications';
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
    if (notifications.length > 500) notifications.pop();
    this.store.set(this.notificationsKey, notifications);
    sendToRenderers('notification:new', newNotif);
    return newNotif;
  }

  markRead(id) {
    const notifications = this.getAll();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.store.set(this.notificationsKey, notifications);
      sendToRenderers('notification:updated', notifications[index]);
      return true;
    }
    return false;
  }

  markAllRead() {
    const notifications = this.getAll();
    notifications.forEach(n => n.read = true);
    this.store.set(this.notificationsKey, notifications);
    sendToRenderers('notification:all-read', null);
    return true;
  }

  delete(id) {
    const notifications = this.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    this.store.set(this.notificationsKey, filtered);
    sendToRenderers('notification:deleted', id);
    return true;
  }

  clearAll() {
    this.store.delete(this.notificationsKey);
    sendToRenderers('notification:cleared', null);
    return true;
  }
}

const notificationStore = new NotificationStoreService();
module.exports = { notificationStore, NotificationStoreService };