const { twitchApiService } = require('./twitch-api.service');
const { settingsService } = require('./settings.service');
const { notifyStreamLive } = require('./notification.service');

let monitorInterval = null;
let lastLiveStatus = new Map(); // broadcaster_id -> { isLive, gameName, title }
let mainWindow = null;

function initStreamMonitor(window) {
  mainWindow = window;
}

async function checkFollowedStreams() {
  const twitch = settingsService.get('twitch');
  if (!twitch.userId || !twitch.accessToken) return;

  try {
    // Get followed channels
    const followed = await twitchApiService.getFollowedChannels(twitch.userId);
    const followedIds = followed.data.map(f => f.broadcaster_id);
    if (followedIds.length === 0) return;

    // Get stream info for those channels
    const streamsData = await twitchApiService.getStreams(followedIds);
    const liveStreams = streamsData.data || [];

    // Create map of live streams
    const currentLive = new Map();
    for (const stream of liveStreams) {
      currentLive.set(stream.user_id, {
        isLive: true,
        gameName: stream.game_name,
        title: stream.title,
        userName: stream.user_name
      });
    }

    // Compare with previous state
    for (const [userId, prev] of lastLiveStatus.entries()) {
      const now = currentLive.get(userId);
      if (prev.isLive && !now) {
        // Went offline – just remove from map (no notification)
        lastLiveStatus.delete(userId);
      } else if (!prev.isLive && now) {
        // Just went live – send notification
        notifyStreamLive(now.userName, now.gameName);
        // Optionally send to renderer for UI update
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('stream:went-live', {
            userName: now.userName,
            gameName: now.gameName,
            title: now.title
          });
        }
        lastLiveStatus.set(userId, now);
      }
    }

    // Add new channels that are live and not tracked
    for (const [userId, now] of currentLive.entries()) {
      if (!lastLiveStatus.has(userId)) {
        notifyStreamLive(now.userName, now.gameName);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('stream:went-live', {
            userName: now.userName,
            gameName: now.gameName,
            title: now.title
          });
        }
        lastLiveStatus.set(userId, now);
      }
    }
  } catch (err) {
    console.error('[StreamMonitor] Error checking streams:', err);
  }
}

function startStreamMonitor(intervalSeconds = 60) {
  if (monitorInterval) clearInterval(monitorInterval);
  // Initial check after 5 seconds
  setTimeout(() => checkFollowedStreams(), 5000);
  monitorInterval = setInterval(() => checkFollowedStreams(), intervalSeconds * 1000);
}

function stopStreamMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  lastLiveStatus.clear();
}

module.exports = { initStreamMonitor, startStreamMonitor, stopStreamMonitor, checkFollowedStreams };