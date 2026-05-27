// src/main/services/notification.service.js
//@ts-check
const { Notification, BrowserWindow } = require('electron');
const { settingsService } = require('./settings.service');

class NotificationService {
  constructor() {
    this.mainWindow = null;
  }

  /**
   * Initialize service with main window reference (for event sending)
   * @param {Electron.BrowserWindow} window
   */
  initialize(window) {
    this.mainWindow = window;
    console.log('[NotificationService] Initialized');
  }

  /**
   * Send event to all renderer windows
   * @param {string} channel
   * @param {any} data
   */
  _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (err) {
      console.warn('[NotificationService] Failed to send event:', err);
    }
  }

  /**
   * Show a native desktop notification
   * @param {string} title
   * @param {string} body
   * @param {Function} [onClick] - optional callback (executed in main process)
   * @returns {boolean} - whether notification was shown
   */
  // @ts-ignore
  show(title, body, onClick = null) {
    if (!settingsService.get('notificationsEnabled')) return false;

    const notification = new Notification({ title, body, silent: false });

    if (onClick) {
      // @ts-ignore
      notification.on('click', onClick);
    } else {
      // Default: send event to renderer when clicked
      notification.on('click', () => {
        this._sendToRenderers('notification:clicked', { title, body });
      });
    }

    notification.show();

    // Also send event to renderer that a notification was shown
    this._sendToRenderers('notification:shown', { title, body });

    return true;
  }

  /**
   * Notify that a stream went live
   * @param {string} channelName
   * @param {string} gameName
   * @param {Function} [onClick]
   */
  // @ts-ignore
  notifyStreamLive(channelName, gameName, onClick = null) {
    const title = `${channelName} is live!`;
    const body = `Playing ${gameName}`;
    return this.show(title, body, onClick);
  }

  /**
   * Notify that someone followed the user
   * @param {string} userName
   * @param {Function} [onClick]
   */
  // @ts-ignore
  notifyFollow(userName, onClick = null) {
    const title = 'New Follower';
    const body = `${userName} started following you!`;
    return this.show(title, body, onClick);
  }

  /**
   * Check if notifications are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return settingsService.get('notificationsEnabled');
  }

  /**
   * Enable/disable notifications globally
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    settingsService.set('notificationsEnabled', enabled);
    this._sendToRenderers('notification:settings-changed', { enabled });
    return enabled;
  }
}

// Singleton export
const notificationService = new NotificationService();
module.exports = { notificationService, NotificationService };