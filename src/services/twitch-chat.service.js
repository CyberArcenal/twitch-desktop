// src/main/services/twitch-chat.service.js
//@ts-check
const { ChatClient } = require("@twurple/chat");
const { settingsService } = require("./settings.service");
const { twitchAuthService } = require("./twitch-auth.service");
const { twitchApiService } = require("./twitch-api.service"); // Add missing import
const { CLIENT_ID } = require("../shared/config");
const { BrowserWindow } = require("electron");

class TwitchChatService {
  constructor() {
    this.chatClient = null;
    this.currentChannel = null;
    this.mainWindow = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.reconnectTimer = null;
    this.whisperHistory = new Map(); // userId -> array of messages
    this.conversations = new Map(); // userId -> { userLogin, userName, lastMessage, lastTimestamp, unreadCount, messages }
    this.currentUserLogin = null; // Add missing property
    this.whisperListenersSetup = false;
  }

  /**
   * Send event to all renderer windows
   * @param {string} channel
   * @param {any} data
   */
  _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (err) {
      console.warn("[TwitchChatService] Failed to send event:", err);
    }
  }

  async connectToWhispers() {
    if (!this.chatClient || this.whisperListenersSetup) return;
    this.whisperListenersSetup = true;

    if (this.chatClient) {
      this.setupWhisperListeners();
    } else {
      // If chat client not connected, connect first (without joining a channel)
      await this.initWhisperOnly();
    }
  }

  async initWhisperOnly() {
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error("Not logged in");

    const userLogin = settingsService.get("twitch").login;
    if (!userLogin) throw new Error("User login not found");
    this.currentUserLogin = userLogin;

    const authProvider = {
      getAccessToken: async () => {
        await twitchAuthService.refreshTokenIfNeeded();
        const token = twitchAuthService.getAccessToken();
        if (!token) throw new Error("No access token");
        return token;
      },
      getUserId: async () => settingsService.get("twitch").userId,
      getClientId: async () => CLIENT_ID,
    };

    // Create chat client without joining any channel
    // @ts-ignore
    this.chatClient = new ChatClient({ authProvider, channels: [] });

    this.setupWhisperListeners();

    this.chatClient.onConnect(() => {
      console.log("[Chat] Connected for whispers");
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    });

    this.chatClient.onDisconnect(async (manually) => {
      console.log("[Chat] Disconnected from whispers, manually:", manually);
      if (!manually) {
        // Reconnect logic...
      }
    });

    await this.chatClient.connect();
  }

  /**
   * @param {any} window
   */
  initChatService(window) {
    this.mainWindow = window;
    // Set current user login
    this.currentUserLogin = settingsService.get("twitch")?.login || null;
  }

  setupWhisperListeners() {
    if (!this.chatClient || this.whisperListenersSetup) return;
    this.whisperListenersSetup = true;

    this.chatClient.onWhisper((sender, message, msg) => {
      // @ts-ignore
      const userId = sender.id;
      // @ts-ignore
      const userName = sender.name;
      // @ts-ignore
      const userLogin = sender.name;

      // Store message
      const whisperMsg = {
        // @ts-ignore
        id: msg.id || Date.now().toString(),
        from: userName,
        to: this.currentUserLogin,
        message: message,
        timestamp: new Date().toISOString(),
        isFromMe: false,
        read: false,
      };

      // Update conversation
      let conv = this.conversations.get(userId);
      if (!conv) {
        conv = {
          userId,
          userLogin,
          userName,
          lastMessage: message,
          lastTimestamp: whisperMsg.timestamp,
          unreadCount: 0,
          messages: [],
        };
        this.conversations.set(userId, conv);
      }
      conv.lastMessage = message;
      conv.lastTimestamp = whisperMsg.timestamp;
      conv.unreadCount += 1;
      conv.messages.push(whisperMsg);

      // Trim history (keep last 200 messages per conversation)
      if (conv.messages.length > 200) conv.messages = conv.messages.slice(-200);

      // Send to renderer
      this._sendToRenderers("whisper:received", whisperMsg);
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
    });
  }

  /**
   * @param {string} userLogin
   * @param {any} message
   */
  async sendWhisper(userLogin, message) {
    if (!this.chatClient) throw new Error("Chat not connected");
    // @ts-ignore
    await this.chatClient.whisper(userLogin, message);

    // Store sent message
    const user = await twitchApiService.getUserByName(userLogin);
    // @ts-ignore
    const userId = user?.id;
    if (userId) {
      const sentMsg = {
        id: Date.now().toString(),
        from: this.currentUserLogin,
        to: userLogin,
        message: message,
        timestamp: new Date().toISOString(),
        isFromMe: true,
        read: true,
      };
      let conv = this.conversations.get(userId);
      if (!conv) {
        conv = {
          userId,
          userLogin,
          userName: userLogin,
          lastMessage: message,
          lastTimestamp: sentMsg.timestamp,
          unreadCount: 0,
          messages: [],
        };
        this.conversations.set(userId, conv);
      }
      conv.lastMessage = message;
      conv.lastTimestamp = sentMsg.timestamp;
      conv.messages.push(sentMsg);
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
      this._sendToRenderers("whisper:sent", sentMsg);
    }
  }

  async getConversations() {
    return Array.from(this.conversations.values()).sort(
      // @ts-ignore
      (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
    );
  }

  /**
   * @param {any} userId
   */
  async getMessages(userId) {
    const conv = this.conversations.get(userId);
    return conv?.messages || [];
  }

  /**
   * @param {any} userId
   */
  async markConversationRead(userId) {
    const conv = this.conversations.get(userId);
    if (conv) {
      conv.unreadCount = 0;
      conv.messages.forEach((/** @type {{ isFromMe: any; read: boolean; }} */ m) => {
        if (!m.isFromMe) m.read = true;
      });
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
    }
  }

  /**
   * @param {string} channelName
   */
  async connectToChannel(channelName) {
    if (this.chatClient) {
      await this.disconnectChat();
    }

    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error("Not logged in");

    const userLogin = settingsService.get("twitch").login;
    if (!userLogin) throw new Error("User login not found");
    this.currentUserLogin = userLogin;

    const authProvider = {
      getAccessToken: async () => {
        await twitchAuthService.refreshTokenIfNeeded();
        const token = twitchAuthService.getAccessToken();
        if (!token) throw new Error("No access token");
        return token;
      },
      getUserId: async () => settingsService.get("twitch").userId,
      getClientId: async () => CLIENT_ID,
    };

    // @ts-ignore
    this.chatClient = new ChatClient({ authProvider, channels: [channelName] });

    this.chatClient.onMessage((channel, user, message, msg) => {
      const filters = settingsService.get("chatFilters") || [];
      const lowerMsg = message.toLowerCase();
      const isFiltered = filters.some((/** @type {string} */ filter) => lowerMsg.includes(filter));
      if (isFiltered) return;

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send("chat:message", {
          channel: channel.slice(1),
          user: user,
          message: message,
          badges: msg.userInfo.badges,
          emotes: msg.emoteOffsets,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.chatClient.onJoin((channel, user) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        if (user === userLogin) {
          this.mainWindow.webContents.send("chat:connected", {
            channel: channel.slice(1),
          });
          this.reconnectAttempts = 0;
        } else {
          this.mainWindow.webContents.send("chat:user-joined", {
            channel: channel.slice(1),
            user,
          });
        }
      }
    });

    this.chatClient.onConnect(() => {
      console.log(`[Chat] Connected to ${channelName}`);
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      // Also setup whisper listeners after connect
      this.setupWhisperListeners();
    });

    this.chatClient.onDisconnect(async (manually) => {
      console.log(
        `[Chat] Disconnected from ${channelName}, manually: ${manually}`,
      );
      if (!manually && this.currentChannel) {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            30000,
          );
          console.log(
            `[Chat] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
          );
          this.reconnectTimer = setTimeout(async () => {
            try {
              // @ts-ignore
              await this.connectToChannel(this.currentChannel);
            } catch (err) {
              console.error("[Chat] Reconnect failed:", err);
            }
          }, delay);
        } else {
          console.error("[Chat] Max reconnect attempts reached");
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send("chat:error", {
              error: "Chat connection lost permanently",
            });
          }
        }
      }
    });

    await this.chatClient.connect();
    this.currentChannel = channelName;
  }

  /**
   * @param {string} message
   */
  async sendChatMessage(message) {
    if (!this.chatClient || !this.currentChannel)
      throw new Error("Not connected to chat");
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
    this.whisperListenersSetup = false;
  }
}

const twitchChatService = new TwitchChatService();
module.exports = { twitchChatService, TwitchChatService };
