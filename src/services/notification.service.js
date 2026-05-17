const { Notification } = require('electron');
const { settingsService } = require('./settings.service');

function showNotification(title, body, onClick = null) {
  if (!settingsService.get('notificationsEnabled')) return;

  const notification = new Notification({ title, body, silent: false });
  if (onClick) {
    notification.on('click', onClick);
  }
  notification.show();
}

function notifyStreamLive(channelName, gameName) {
  showNotification(`${channelName} is live!`, `Playing ${gameName}`);
}

function notifyFollow(userName) {
  showNotification('New Follower', `${userName} started following you!`);
}

module.exports = { showNotification, notifyStreamLive, notifyFollow };