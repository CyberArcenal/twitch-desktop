const { Notification } = require('electron');
const { sendToRenderers } = require('../../utils/ipc-sender');
const { settingsService } = require('../settings');
const { logger } = require('../../utils/logger');

class NotificationService {
  initialize(window) {
    logger.info('[NotificationService] Initialized');
  }

  show(title, body, onClick = null) {
    if (!settingsService.get('notificationsEnabled')) return false;

    const notification = new Notification({ title, body, silent: false });

    if (onClick) {
      notification.on('click', onClick);
    } else {
      notification.on('click', () => {
        sendToRenderers('notification:clicked', { title, body });
      });
    }

    notification.show();
    sendToRenderers('notification:shown', { title, body });
    sendToRenderers('notification:created', { title, message: body, type: 'info' });
    return true;
  }

  notifyStreamLive(channelName, gameName, onClick = null) {
    return this.show(`${channelName} is live!`, `Playing ${gameName}`, onClick);
  }

  notifyFollow(userName, onClick = null) {
    return this.show('New Follower', `${userName} started following you!`, onClick);
  }

  isEnabled() {
    return settingsService.get('notificationsEnabled');
  }

  setEnabled(enabled) {
    settingsService.set('notificationsEnabled', enabled);
    sendToRenderers('notification:settings-changed', { enabled });
    return enabled;
  }
}

const notificationService = new NotificationService();
module.exports = { notificationService, NotificationService };