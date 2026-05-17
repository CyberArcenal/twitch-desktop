const { ChatClient } = require('@twurple/chat');
const { settingsService } = require('./settings.service');
const { twitchAuthService } = require('./twitch-auth.service');
const { CLIENT_ID } = require('../shared/config');

let chatClient = null;
let currentChannel = null;
let mainWindow = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectTimer = null;

function initChatService(window) {
  mainWindow = window;
}

async function connectToChannel(channelName) {
  if (chatClient) {
    await disconnectChat();
  }

  const token = twitchAuthService.getAccessToken();
  if (!token) throw new Error('Not logged in');

  const userLogin = settingsService.get('twitch').login;
  if (!userLogin) throw new Error('User login not found');

  // Auth provider that always returns fresh token
  const authProvider = {
    getAccessToken: async () => {
      let token = twitchAuthService.getAccessToken();
      if (!token) throw new Error('No access token');
      return token;
    },
    getUserId: async () => settingsService.get('twitch').userId,
    getClientId: async () => CLIENT_ID
  };

  chatClient = new ChatClient({ authProvider, channels: [channelName] });

  // Read filters on each message (dynamic)
  chatClient.onMessage((channel, user, message, msg) => {
    const filters = settingsService.get('chatFilters') || [];
    const lowerMsg = message.toLowerCase();
    const isFiltered = filters.some(filter => lowerMsg.includes(filter));
    if (isFiltered) return;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('chat:message', {
        channel: channel.slice(1),
        user: user,
        message: message,
        badges: msg.userInfo.badges,
        emotes: msg.emoteOffsets,
        timestamp: new Date().toISOString()
      });
    }
  });

  chatClient.onJoin((channel, user) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (user === userLogin) {
        mainWindow.webContents.send('chat:connected', { channel: channel.slice(1) });
        reconnectAttempts = 0; // reset on successful connection
      } else {
        mainWindow.webContents.send('chat:user-joined', { channel: channel.slice(1), user });
      }
    }
  });

  chatClient.onConnect(() => {
    console.log(`[Chat] Connected to ${channelName}`);
    if (reconnectTimer) clearTimeout(reconnectTimer);
  });

  chatClient.onDisconnect(async (manually) => {
    console.log(`[Chat] Disconnected from ${channelName}, manually: ${manually}`);
    if (!manually && currentChannel) {
      // Auto-reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`[Chat] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        reconnectTimer = setTimeout(async () => {
          try {
            await connectToChannel(currentChannel);
          } catch (err) {
            console.error('[Chat] Reconnect failed:', err);
          }
        }, delay);
      } else {
        console.error('[Chat] Max reconnect attempts reached');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('chat:error', { error: 'Chat connection lost permanently' });
        }
      }
    }
  });

  await chatClient.connect();
  currentChannel = channelName;
}

async function sendChatMessage(message) {
  if (!chatClient || !currentChannel) throw new Error('Not connected to chat');
  await chatClient.say(currentChannel, message);
}

async function disconnectChat() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (chatClient) {
    await chatClient.quit();
    chatClient = null;
    currentChannel = null;
  }
  reconnectAttempts = 0;
}

module.exports = { initChatService, connectToChannel, sendChatMessage, disconnectChat };