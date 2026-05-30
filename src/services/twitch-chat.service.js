// src/main/services/twitch-chat.service.js
//@ts-check
const { ChatClient, parseChatMessage } = require("@twurple/chat");
const { RefreshingAuthProvider } = require("@twurple/auth");
const { settingsService } = require("./settings.service");
// @ts-ignore
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
    logger.debug("[TwitchChatService] Constructor - instance created");
  }

  async getAuthProvider() {
    if (this.authProvider) {
      logger.debug("[Chat] getAuthProvider - returning existing auth provider");
      return this.authProvider;
    }

    const twitchData = settingsService.get("twitch");
    if (
      !twitchData?.accessToken ||
      !twitchData?.refreshToken ||
      !twitchData?.userId
    ) {
      logger.error(
        "[Chat] getAuthProvider - missing Twitch tokens in settings",
      );
      throw new Error("No Twitch tokens found");
    }

    logger.info(
      `[Chat] getAuthProvider - creating new RefreshingAuthProvider for user ${twitchData.userId}`,
    );
    this.authProvider = new RefreshingAuthProvider(
      { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET },
      // @ts-ignore
      {},
    );

    await this.authProvider.addUser(
      twitchData.userId,
      {
        accessToken: twitchData.accessToken,
        refreshToken: twitchData.refreshToken,
        expiresIn: 0,
        obtainmentTimestamp: Date.now(),
      },
      ["chat", "whispers"],
    );
    logger.info(
      "[Chat] getAuthProvider - user added with intents: chat, whispers",
    );

    this.authProvider.onRefresh(async (userId, newTokenData) => {
      if (userId === twitchData.userId) {
        logger.info(
          `[Chat] AuthProvider onRefresh - refreshing tokens for user ${userId}`,
        );
        settingsService.setTwitchTokens(
          newTokenData.accessToken,
          newTokenData.refreshToken || twitchData.refreshToken,
          twitchData.userId,
          twitchData.login,
        );
        logger.debug(
          "[Chat] AuthProvider onRefresh - tokens updated in settings",
        );
      }
    });

    return this.authProvider;
  }

  async connectToWhispers() {
    if (this.chatClient && this.whisperListenersSetup) {
      logger.debug("[Chat] connectToWhispers - already connected");
      return;
    }

    logger.info("[Chat] connectToWhispers - starting whisper connection");
    try {
      const authProvider = await this.getAuthProvider();
      this.chatClient = new ChatClient({ authProvider, channels: [] });
      logger.debug("[Chat] connectToWhispers - ChatClient created");

      this.setupWhisperListeners();
      await this.chatClient.connect();
      this.whisperListenersSetup = true;
      logger.success(
        "[Chat] connectToWhispers - whisper service connected successfully",
      );
    } catch (err) {
      // @ts-ignore
      logger.error("[Chat] connectToWhispers - whisper init failed:", err);
    }
  }

  /**
   * @param {any} window
   */
  async initChatService(window) {
    this.mainWindow = window;
    this.currentUserLogin = settingsService.get("twitch")?.login || null;
    logger.debug(
      `[Chat] initChatService - mainWindow set, currentUserLogin=${this.currentUserLogin}`,
    );
  }

  setupWhisperListeners() {
    if (this.whisperListenersSetup) return;
    this.whisperListenersSetup = true;
    logger.debug(
      "[Chat] setupWhisperListeners - attaching whisper event handlers",
    );

    // @ts-ignore
    this.chatClient.onWhisper((sender, message, msg) => {
      // @ts-ignore
      const userId = sender.id;
      // @ts-ignore
      const userName = sender.name;
      // @ts-ignore
      const userLogin = sender.name;

      logger.debug(
        `[Chat] Whisper received from ${userName} (${userId}): "${message}"`,
      );

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
        logger.debug(`[Chat] New conversation created for ${userName}`);
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
    logger.info("[Chat] setupWhisperListeners - whisper listeners active");
  }

  /**
   * @param {string} channelName
   */
  async connectToChannel(channelName) {
    if (this.chatClient) {
      logger.debug(
        `[Chat] connectToChannel - disconnecting existing chat before connecting to ${channelName}`,
      );
      await this.disconnectChat();
    }

    logger.info(
      `[Chat] connectToChannel - attempting connection to #${channelName}`,
    );
    try {
      const authProvider = await this.getAuthProvider();
      this.chatClient = new ChatClient({
        authProvider,
        channels: [channelName],
      });
      logger.debug(
        `[Chat] connectToChannel - ChatClient created for channel ${channelName}`,
      );

      this.setupChatListeners(channelName);
      await this.chatClient.connect();
      this.currentChannel = channelName;
      logger.success(
        `[Chat] connectToChannel - successfully connected to #${channelName}`,
      );
    } catch (err) {
      logger.error(
        `[Chat] connectToChannel - failed to connect to ${channelName}:`,
        // @ts-ignore
        err,
      );
      throw err;
    }
  }

  /**
   * @param {any} channelName
   */
  setupChatListeners(channelName) {
    const userLogin = this.currentUserLogin;
    logger.debug(
      `[Chat] setupChatListeners - attaching listeners for channel ${channelName}`,
    );

    // @ts-ignore
    this.chatClient.onMessage((channel, user, message, msg) => {
      const filters = settingsService.get("chatFilters") || [];
      // @ts-ignore
      if (filters.some((f) => message.toLowerCase().includes(f))) {
        logger.debug(`[Chat] Message filtered (${user}): "${message}"`);
        return;
      }

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const parsedMessage = parseChatMessage(message, msg.emoteOffsets);
        logger.debug(
          `[Chat] Message from ${user} in ${channel}: "${message}" (emotes: ${msg.emoteOffsets?.size || 0})`,
        );

        this.mainWindow.webContents.send("chat:message", {
          messageId: msg.id,
          channel: channel.slice(1),
          user,
          message,
          parsedMessage,
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
          logger.info(`[Chat] Own user ${user} joined ${channel}`);
          this.mainWindow.webContents.send("chat:connected", {
            channel: channel.slice(1),
          });
          this.reconnectAttempts = 0;
        } else {
          logger.debug(`[Chat] User ${user} joined ${channel}`);
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
        logger.warn(
          `[Chat] Disconnected from ${this.currentChannel}, will attempt reconnect (attempt ${this.reconnectAttempts + 1})`,
        );
        this.handleReconnect();
      } else {
        logger.info(
          `[Chat] Disconnected manually from ${this.currentChannel || "unknown"}`,
        );
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      logger.error(
        `[Chat] Max reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached, giving up`,
      );
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    logger.info(
      `[Chat] Reconnecting to ${this.currentChannel} in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );
    this.reconnectTimer = setTimeout(() => {
      // @ts-ignore
      this.connectToChannel(this.currentChannel).catch((err) =>
        logger.error("[Chat] Reconnect attempt failed:", err),
      );
    }, delay);
  }

  /**
   * @param {string} message
   * @param {string | null} replyParentMsgId
   */
  async sendChatMessage(message, replyParentMsgId = null) {
    if (!this.chatClient || !this.currentChannel) {
      logger.error("[Chat] sendChatMessage - not connected to chat");
      throw new Error("Not connected to chat");
    }

    const attributes = {};
    if (replyParentMsgId) {
      attributes.replyTo = replyParentMsgId;
      logger.info(
        `[Chat] Sending reply message (replying to ${replyParentMsgId})`,
      );
    }

    logger.debug(
      `[Chat] Sending message to ${this.currentChannel}: "${message}"`,
    );
    await this.chatClient.say(this.currentChannel, message, attributes);
    logger.info(`[Chat] Message sent to ${this.currentChannel}`);
  }

  /**
   * @param {string} userLogin
   * @param {any} message
   */
  async sendWhisper(userLogin, message) {
    if (!this.chatClient) {
      logger.error("[Chat] sendWhisper - chat client not connected");
      throw new Error("Chat not connected");
    }
    logger.info(`[Chat] Sending whisper to ${userLogin}: "${message}"`);
    // @ts-ignore
    await this.chatClient.whisper(userLogin, message);
    logger.debug(`[Chat] Whisper sent to ${userLogin}`);

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
        logger.debug(
          `[Chat] Created new conversation for whisper with ${userLogin}`,
        );
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
      logger.debug("[Chat] disconnectChat - cleared reconnect timer");
    }
    if (this.chatClient) {
      logger.info("[Chat] disconnectChat - quitting chat client");
      await this.chatClient.quit();
      this.chatClient = null;
      this.currentChannel = null;
      logger.info("[Chat] disconnectChat - chat client disconnected");
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
      logger.debug(`[Chat] Sent event "${channel}" to renderers`);
    } catch (err) {
      logger.warn(
        `[Chat] Failed to send event "${channel}" to renderers:`,
        // @ts-ignore
        err,
      );
    }
  }

  async getConversations() {
    const convs = Array.from(this.conversations.values()).sort(
      // @ts-ignore
      (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
    );
    logger.debug(
      `[Chat] getConversations - returning ${convs.length} conversations`,
    );
    return convs;
  }

  /**
   * @param {any} userId
   */
  async getMessages(userId) {
    const conv = this.conversations.get(userId);
    const msgs = conv?.messages || [];
    logger.debug(
      `[Chat] getMessages for user ${userId} - ${msgs.length} messages`,
    );
    return msgs;
  }

  /**
   * @param {any} userId
   */
  async markConversationRead(userId) {
    const conv = this.conversations.get(userId);
    if (conv) {
      conv.unreadCount = 0;
      // @ts-ignore
      conv.messages.forEach((m) => {
        if (!m.isFromMe) m.read = true;
      });
      this._sendToRenderers(
        "whisper:conversations-updated",
        Array.from(this.conversations.values()),
      );
      logger.debug(
        `[Chat] markConversationRead - marked conversation with ${userId} as read`,
      );
    } else {
      logger.warn(
        `[Chat] markConversationRead - conversation not found for userId ${userId}`,
      );
    }
  }
}

const twitchChatService = new TwitchChatService();
module.exports = { twitchChatService, TwitchChatService };
