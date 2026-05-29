// src/main/services/twitch-chat.service.js
//@ts-check
const { ChatClient, parseChatMessage } = require("@twurple/chat");
const { RefreshingAuthProvider } = require("@twurple/auth");
const { settingsService } = require("./settings.service");
// @ts-ignore
const { twitchAuthService } = require("./twitch-auth.service");
const { twitchApiService } = require("./twitch-api.service");
const { CLIENT_ID, CLIENT_SECRET } = require("../shared/config");
const { BrowserWindow } = require("electron");
const { logger } = require("../utils/logger");

class TwitchChatService {
  constructor() {
    this.chatClient = null;
    this.currentChannel = null;
    this.mainWindow = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.reconnectTimer = null;
    this.conversations = new Map();
    this.currentUserLogin = null;
    this.whisperListenersSetup = false;
    this.authProvider = null;
  }

  async getAuthProvider() {
    if (this.authProvider) return this.authProvider;

    const twitchData = settingsService.get("twitch");
    if (
      !twitchData?.accessToken ||
      !twitchData?.refreshToken ||
      !twitchData?.userId
    ) {
      throw new Error("No Twitch tokens found");
    }

    this.authProvider = new RefreshingAuthProvider(
      { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET },
      // @ts-ignore
      {},
    );

    // ✅ Add user with the correct intents: 'chat' and 'whispers'
    await this.authProvider.addUser(
      twitchData.userId,
      {
        accessToken: twitchData.accessToken,
        refreshToken: twitchData.refreshToken,
        expiresIn: 0,
        obtainmentTimestamp: Date.now(),
      },
      ["chat", "whispers"], // meta-intents, not scopes
    );

    this.authProvider.onRefresh(async (userId, newTokenData) => {
      if (userId === twitchData.userId) {
        settingsService.setTwitchTokens(
          newTokenData.accessToken,
          newTokenData.refreshToken || twitchData.refreshToken,
          twitchData.userId,
          twitchData.login,
        );
      }
    });

    return this.authProvider;
  }

  async connectToWhispers() {
    if (this.chatClient && this.whisperListenersSetup) return;

    try {
      const authProvider = await this.getAuthProvider();
      this.chatClient = new ChatClient({ authProvider, channels: [] });

      this.setupWhisperListeners();
      await this.chatClient.connect();
      this.whisperListenersSetup = true;
      console.log("[Chat] Whisper service connected");
    } catch (err) {
      console.error("[TwitchChatService] Whisper init failed:", err);
    }
  }

  /**
   * @param {any} window
   */
  async initChatService(window) {
    this.mainWindow = window;
    this.currentUserLogin = settingsService.get("twitch")?.login || null;
  }

  setupWhisperListeners() {
    if (this.whisperListenersSetup) return;
    this.whisperListenersSetup = true;

    // @ts-ignore
    this.chatClient.onWhisper((sender, message, msg) => {
      // @ts-ignore
      const userId = sender.id;
      // @ts-ignore
      const userName = sender.name;
      // @ts-ignore
      const userLogin = sender.name;

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
      if (conv.messages.length > 200) conv.messages = conv.messages.slice(-200);

      // @ts-ignore
      this._sendToRenderers("whisper:received", whisperMsg);
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
    });
  }

  /**
   * @param {string} channelName
   */
  async connectToChannel(channelName) {
    if (this.chatClient) {
      await this.disconnectChat();
    }

    try {
      const authProvider = await this.getAuthProvider();

      this.chatClient = new ChatClient({
        authProvider,
        channels: [channelName],
      });

      this.setupChatListeners(channelName);
      await this.chatClient.connect();
      this.currentChannel = channelName;
      console.log(`[Chat] Connected to ${channelName}`);
    } catch (err) {
      console.error("[Chat] Connect to channel failed:", err);
      throw err;
    }
  }

  /**
   * @param {any} channelName
   */
  // @ts-ignore
  setupChatListeners(channelName) {
    const userLogin = this.currentUserLogin;

    // @ts-ignore
    this.chatClient.onMessage((channel, user, message, msg) => {
      const filters = settingsService.get("chatFilters") || [];
      if (filters.some((/** @type {string} */ f) => message.toLowerCase().includes(f))) return;

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        // ✅ Correct: pass message text and emoteOffsets (Map)
        const parsedMessage = parseChatMessage(message, msg.emoteOffsets);

        this.mainWindow.webContents.send("chat:message", {
          messageId: msg.id,
          channel: channel.slice(1),
          user,
          message,
          parsedMessage, // structured parts for emotes
          badges: msg.userInfo.badges,
          emotes: msg.emoteOffsets,
          timestamp: new Date().toISOString(),
           // @ts-ignore
           replyParentMsgId: msg.replyParentMsgId || null,
        });
      }
    });

    // @ts-ignore
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

    // @ts-ignore
    this.chatClient.onDisconnect(async (manually) => {
      if (!manually && this.currentChannel) {
        this.handleReconnect();
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) return;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectTimer = setTimeout(() => {
      // @ts-ignore
      this.connectToChannel(this.currentChannel).catch(console.error);
    }, delay);
  }

  /**
   * @param {string} message
   * @param {string | null} replyParentMsgId
   */
  async sendChatMessage(message, replyParentMsgId = null) {
    if (!this.chatClient || !this.currentChannel) {
      throw new Error("Not connected to chat");
    }

    const attributes = {};
    if (replyParentMsgId) {
      attributes.replyTo = replyParentMsgId;
      logger.info(`[Chat] Sending message as reply to ${replyParentMsgId}`);
    }

    await this.chatClient.say(this.currentChannel, message, attributes);
    logger.info(`[Chat] Sent message to ${this.currentChannel}: ${message}`);
  }

  /**
   * @param {string} userLogin
   * @param {any} message
   */
  async sendWhisper(userLogin, message) {
    if (!this.chatClient) throw new Error("Chat not connected");
    // @ts-ignore
    await this.chatClient.whisper(userLogin, message);
    logger.info(`[Chat] Sent whisper to ${userLogin}: ${message}`);
    const user = await twitchApiService.getUserByName(userLogin);
    // @ts-ignore
    const userId = user?.id;
    if (userId) {
      const sentMsg = {
        id: Date.now().toString(),
        from: this.currentUserLogin,
        to: userLogin,
        message,
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
      // @ts-ignore
      this._sendToRenderers("whisper:sent", sentMsg);
    }
  }

  async disconnectChat() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.chatClient) {
      await this.chatClient.quit();
      this.chatClient = null;
      this.currentChannel = null;
    }
    this.reconnectAttempts = 0;
    this.whisperListenersSetup = false;
  }

  /**
   * @param {string} channel
   * @param {any[]} data
   */
  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn("[TwitchChatService] Failed to send event:", err);
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
      conv.messages.forEach(
        (/** @type {{ isFromMe: any; read: boolean; }} */ m) => {
          if (!m.isFromMe) m.read = true;
        },
      );
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
    }
  }
}

const twitchChatService = new TwitchChatService();
module.exports = { twitchChatService, TwitchChatService };
