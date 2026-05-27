// src/main/services/twitch-chat.service.js
//@ts-check
const { ChatClient } = require('@twurple/chat');
const { settingsService } = require('./settings.service');
const { twitchAuthService } = require('./twitch-auth.service');
const { CLIENT_ID } = require('../shared/config');
const { BrowserWindow } = require('electron');

class TwitchChatService {
  constructor() {
    this.chatClient = null;
    this.currentChannel = null;
    this.mainWindow = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.reconnectTimer = null;
  }

  initChatService(window) {
    this.mainWindow = window;
  }

  async connectToChannel(channelName) {
    if (this.chatClient) {
      await this.disconnectChat();
    }

    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not logged in');

    const userLogin = settingsService.get('twitch').login;
    if (!userLogin) throw new Error('User login not found');

    const authProvider = {
      getAccessToken: async () => {
        await twitchAuthService.refreshTokenIfNeeded();
        const token = twitchAuthService.getAccessToken();
        if (!token) throw new Error('No access token');
        return token;
      },
      getUserId: async () => settingsService.get('twitch').userId,
      getClientId: async () => CLIENT_ID
    };

    this.chatClient = new ChatClient({ authProvider, channels: [channelName] });

    this.chatClient.onMessage((channel, user, message, msg) => {
      const filters = settingsService.get('chatFilters') || [];
      const lowerMsg = message.toLowerCase();
      const isFiltered = filters.some(filter => lowerMsg.includes(filter));
      if (isFiltered) return;

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('chat:message', {
          channel: channel.slice(1),
          user: user,
          message: message,
          badges: msg.userInfo.badges,
          emotes: msg.emoteOffsets,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.chatClient.onJoin((channel, user) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        if (user === userLogin) {
          this.mainWindow.webContents.send('chat:connected', { channel: channel.slice(1) });
          this.reconnectAttempts = 0;
        } else {
          this.mainWindow.webContents.send('chat:user-joined', { channel: channel.slice(1), user });
        }
      }
    });

    this.chatClient.onConnect(() => {
      console.log(`[Chat] Connected to ${channelName}`);
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    });

    this.chatClient.onDisconnect(async (manually) => {
      console.log(`[Chat] Disconnected from ${channelName}, manually: ${manually}`);
      if (!manually && this.currentChannel) {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`[Chat] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
          this.reconnectTimer = setTimeout(async () => {
            try {
              await this.connectToChannel(this.currentChannel);
            } catch (err) {
              console.error('[Chat] Reconnect failed:', err);
            }
          }, delay);
        } else {
          console.error('[Chat] Max reconnect attempts reached');
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('chat:error', { error: 'Chat connection lost permanently' });
          }
        }
      }
    });

    await this.chatClient.connect();
    this.currentChannel = channelName;
  }

  async sendChatMessage(message) {
    if (!this.chatClient || !this.currentChannel) throw new Error('Not connected to chat');
    await this.chatClient.say(this.currentChannel, message);
  }

  async disconnectChat() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.chatClient) {
      await this.chatClient.quit();
      this.chatClient = null;
      this.currentChannel = null;
    }
    this.reconnectAttempts = 0;
  }
}

const twitchChatService = new TwitchChatService();
module.exports = { twitchChatService, TwitchChatService };