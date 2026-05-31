// src/main/services/twitch-chat.service.js
//@ts-check
const { ChatClient, parseChatMessage } = require("@twurple/chat");
const { RefreshingAuthProvider } = require("@twurple/auth");
const { settingsService } = require("./settings.service");
// @ts-ignore
// @ts-ignore
// @ts-ignore
const { twitchAuthService } = require("./twitch-auth.service");
const { twitchApiService } = require("./twitch-api.service");
// @ts-ignore
// @ts-ignore
const { CLIENT_ID, CLIENT_SECRET, SCOPES } = require("../shared/config");
const { BrowserWindow } = require("electron");
const { logger } = require("../utils/logger");

class TwitchChatService {
  constructor() {
    this.chatClient = null; // channel chat client
    this.whisperClient = null; // whispers client
    this.currentChannel = null;
    this.mainWindow = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.reconnectTimer = null;
    this.conversations = new Map();
    this.currentUserLogin = null;
    this.whisperListenersSetup = false;
    this.authProvider = null;
    /**
     * @type {{ messageId: string; channel: string; user: string; message: string; parsedMessage: import("@twurple/chat").ParsedMessagePart[]; badges: { name: string; version: any; }[]; emotes: Map<string, string[]>; timestamp: string; isFromMe: boolean; replyParentMsgId: string | null; }[]}
     */
    this.messageBuffer = []; // store recent messages (max 200)
    this.maxBufferSize = 200;
    this.globalBadges = null; // cache
    this.channelBadges = null;

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

    // ✅ FIXED: Proper token store with all required fields
    const tokenStore = {
      // @ts-ignore
      getUserToken: async (userId) => {
        const data = settingsService.get("twitch");
        if (data && data.userId === userId) {
          // Convert scope to string if it's an array
          let scopeString = data.scope || "chat:read chat:edit";
          if (Array.isArray(scopeString)) {
            scopeString = scopeString.join(" ");
          }
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn || 3600,
            obtainmentTimestamp: data.obtainmentTimestamp || Date.now(),
            scope: scopeString,
          };
        }
        return null;
      },
      // @ts-ignore
      setUserToken: async (userId, token) => {
        const existing = settingsService.get("twitch") || {};
        settingsService.setTwitchTokens(
          token.accessToken,
          token.refreshToken || existing.refreshToken || "",
          userId,
          existing.login || "",
          token.expiresIn,
          token.obtainmentTimestamp,
          token.scope || "chat:read chat:edit",
        );
        logger.info(`[Chat] setUserToken - token updated for ${userId}`);
      },
      // @ts-ignore
      removeUserToken: async (userId) => {
        logger.warn(`[Chat] removeUserToken called for ${userId}`);
      },
    };

    this.authProvider = new RefreshingAuthProvider(
      { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET },
      // @ts-ignore
      tokenStore,
    );

    // ✅ FIXED: Use addUserForToken with proper intent array
    const tokenData = {
      accessToken: twitchData.accessToken,
      refreshToken: twitchData.refreshToken,
      expiresIn: twitchData.expiresIn || 3600,
      obtainmentTimestamp: twitchData.obtainmentTimestamp || Date.now(),
    };

    // ✅ FIXED: Add user with 'chat' intent - this is the key!
    await this.authProvider.addUserForToken(tokenData, ["chat"]);

    logger.info("[Chat] AuthProvider - user added with 'chat' intent");

    // ✅ FIXED: Event handling for token refresh
    this.authProvider.onRefresh(async (userId, newTokenData) => {
      if (userId === twitchData.userId) {
        logger.info(`[Chat] Token refreshed for user ${userId}`);
        settingsService.setTwitchTokens(
          newTokenData.accessToken,
          newTokenData.refreshToken || twitchData.refreshToken,
          twitchData.userId,
          twitchData.login,
          // @ts-ignore
          newTokenData.expiresIn,
          newTokenData.obtainmentTimestamp,
          newTokenData.scope || "chat:read chat:edit",
        );
      }
    });

    this.authProvider.onRefreshFailure(async (userId, error) => {
      // @ts-ignore
      logger.error(`[Chat] Token refresh failed for ${userId}:`, error);
    });

    return this.authProvider;
  }

  async connectToWhispers() {
    if (this.whisperClient) return;

    logger.info("[Chat] connectToWhispers - starting whisper connection");
    try {
      const authProvider = await this.getAuthProvider();
      this.whisperClient = new ChatClient({ authProvider, channels: [] });
      this.setupWhisperListeners(); // attaches to this.whisperClient
      await this.whisperClient.connect();

      // Auto-reconnect for whispers
      this.whisperClient.onDisconnect(async (manually) => {
        if (!manually) {
          logger.warn("[Chat] Whisper client disconnected, reconnecting...");
          await this.connectToWhispers();
        }
      });

      logger.success(
        "[Chat] connectToWhispers - whisper service connected successfully",
      );
    } catch (err) {
      // @ts-ignore
      logger.error("[Chat] connectToWhispers - whisper init failed:", err);
    }
  }

  /**
   * @param {BrowserWindow | null} window
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
    if (!this.whisperClient) {
      logger.warn("[Chat] setupWhisperListeners - whisperClient not ready");
      return;
    }
    this.whisperListenersSetup = true;
    logger.debug(
      "[Chat] setupWhisperListeners - attaching whisper event handlers",
    );

    this.whisperClient.onWhisper((sender, message, msg) => {
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
      logger.debug(`[Chat] connectToChannel - disconnecting existing chat`);
      await this.disconnectChat();
    }

    logger.info(
      `[Chat] connectToChannel - attempting connection to #${channelName}`,
    );
    try {
      const authProvider = await this.getAuthProvider();

      // ✅ FIXED: Simplified ChatClient configuration
      this.chatClient = new ChatClient({
        authProvider,
        channels: [channelName],
        webSocket: true,
        // @ts-ignore
        isBot: false,
        logger: {
          minLevel: "debug",
        },
      });

      // ✅ FIXED: Setup listeners before connecting
      this.setupChatListeners(channelName);

      await this.chatClient.connect();
      this.currentChannel = channelName;
      logger.success(`[Chat] Successfully connected to #${channelName}`);
    } catch (err) {
      // @ts-ignore
      logger.error(`[Chat] Failed to connect to ${channelName}:`, err);
      throw err;
    }
  }

  // @ts-ignore
  async fetchBadgeSets(broadcasterId) {
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
    try {
      const token = twitchData.accessToken; // need a method to get app token
      const { CLIENT_ID } = require("../shared/config");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      };

      // Global badges
      const globalRes = await fetch(
        "https://api.twitch.tv/helix/chat/badges/global",
        // @ts-ignore
        { headers },
      );
      const globalData = await globalRes.json();
      this.globalBadges = globalData.data || [];

      // Channel badges (requires broadcaster_id)
      const channelRes = await fetch(
        `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcasterId}`,
        // @ts-ignore
        { headers },
      );
      const channelData = await channelRes.json();
      this.channelBadges = channelData.data || [];

      logger.debug("[Chat] Badge sets fetched");
    } catch (err) {
      // @ts-ignore
      logger.warn("[Chat] Failed to fetch badge sets:", err);
    }
  }

  // @ts-ignore
  getBadgeImageUrl(badgeName, badgeVersion) {
    // Hanapin sa channel badges, then global badges
    const allSets = [
      ...(this.channelBadges || []),
      ...(this.globalBadges || []),
    ];
    const set = allSets.find((s) => s.set_id === badgeName);
    if (set && set.versions) {
      // @ts-ignore
      const version = set.versions.find((v) => v.id === badgeVersion);
      if (version) return version.image_url_1x || version.image_url_2x;
    }
    return null;
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
    this.chatClient.onConnect(async () => {
      logger.info(`[Chat] Connected and authenticated to ${channelName}`);
      // Get numeric broadcaster ID from stored twitch data
      const twitchData = settingsService.get("twitch");
      const broadcasterId = twitchData?.userId; // numeric ID, e.g., "1500235096"
      if (broadcasterId) {
        await this.fetchBadgeSets(broadcasterId);
      } else {
        logger.warn("[Chat] No broadcaster ID found, cannot fetch badges");
      }
      // @ts-ignore
      this._sendToRenderers("chat:connected", { channel: channelName });
    });

    // @ts-ignore
    this.chatClient.onMessage((channel, user, message, msg) => {
      logger.debug(
        `[Chat] RAW MESSAGE: channel=${channel}, user=${user}, msg=${message}`,
      );
      const filters = settingsService.get("chatFilters") || [];
      if (
        filters.some((/** @type {string} */ f) =>
          message.toLowerCase().includes(f),
        )
      ) {
        logger.debug(`[Chat] Message filtered (${user}): "${message}"`);
        return;
      }

      // @ts-ignore
      logger.debug("[Chat] Full msg object:", JSON.stringify(msg, null, 2));
      // @ts-ignore
      logger.debug("[Chat] msg.tags:", JSON.stringify(msg.tags, null, 2));

      // ✅ Kunin ang badges mula sa msg._raw (dahil walang laman ang msg.tags)
      // @ts-ignore
      let badgesArray = [];
      try {
        // @ts-ignore
        const raw = msg._raw;
        if (raw && typeof raw === "string") {
          // Hanapin ang "badges=..." sa raw string
          const badgesMatch = raw.match(/badges=([^;]+)/);
          if (badgesMatch && badgesMatch[1]) {
            const badgesStr = badgesMatch[1];
            // Halimbawa: "subscriber/0,premium/1"
            const parts = badgesStr.split(",");
            for (const part of parts) {
              const [name, version] = part.split("/");
              if (name && version) {
                badgesArray.push({ name, version });
              }
            }
          }
        }
        // Fallback: kung sakaling may userInfo.badges (hindi sa kasalukuyan)
        if (badgesArray.length === 0 && msg.userInfo?.badges) {
          const userBadges = msg.userInfo.badges;
          if (typeof userBadges === "object") {
            badgesArray = Object.entries(userBadges).map(([name, version]) => ({
              name,
              version,
            }));
          }
        }
      } catch (err) {
        // @ts-ignore
        logger.warn("[Chat] Failed to parse badges:", err);
      }
      logger.debug(
        // @ts-ignore
        `[Chat] Final badges for ${user}: ${JSON.stringify(badgesArray)}`,
      );

      logger.debug(
        // @ts-ignore
        `[Chat] Final badges for ${user}: ${JSON.stringify(badgesArray)}`,
      );

      // @ts-ignore
      const badgesWithUrl = badgesArray.map((b) => ({
        name: b.name,
        version: b.version,
        imageUrl: this.getBadgeImageUrl(b.name, b.version),
      }));

      const isFromMe = user === this.currentUserLogin;

      const chatMessage = {
        messageId: msg.id,
        channel: channel.slice(1),
        user: user,
        message: message,
        parsedMessage: parseChatMessage(message, msg.emoteOffsets),
        badges: badgesWithUrl,
        emotes: msg.emoteOffsets,
        timestamp: new Date().toISOString(),
        isFromMe: isFromMe,
        replyParentMsgId: msg.parentMessageId || null,
      };

      if (isFromMe) {
        logger.success(
          `[Chat] OWN MESSAGE received via onMessage: "${message}" (ID: ${msg.id})`,
        );
      }

      this.messageBuffer.push(chatMessage);
      if (this.messageBuffer.length > this.maxBufferSize) {
        this.messageBuffer.shift();
      }

      // Use unified sender
      // @ts-ignore
      this._sendToRenderers("chat:message", chatMessage);
    });

    // @ts-ignore
    this.chatClient.onJoin((channel, user) => {
      if (user === userLogin) {
        logger.info(`[Chat] Own user ${user} joined ${channel}`);
        this._sendToRenderers("chat:connected", {
          // @ts-ignore
          channel: channel.slice(1),
        });
        this.reconnectAttempts = 0;
      } else {
        logger.debug(`[Chat] User ${user} joined ${channel}`);
        this._sendToRenderers("chat:user-joined", {
          // @ts-ignore
          channel: channel.slice(1),
          user,
        });
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
   */
  async sendChatMessage(message, replyParentMsgId = null) {
    if (!this.chatClient || !this.currentChannel)
      throw new Error("Not connected");

    try {
      await this.chatClient.say(this.currentChannel, message, {
        // @ts-ignore
        replyTo: replyParentMsgId,
      });

      // --- LOCAL ECHO ---
      // Siguraduhin na hindi mapuputol ang pangalan ng channel kung wala itong '#'
      const cleanChannel = this.currentChannel.startsWith("#")
        ? this.currentChannel.slice(1)
        : this.currentChannel;

      // --- LOCAL ECHO ---
      const syntheticMessage = {
        messageId: `local-${Date.now()}`,
        channel: cleanChannel,
        user: this.currentUserLogin,
        message: message,
        parsedMessage: [{ type: "text", text: message }],
        badges: [],
        emotes: new Map(),
        timestamp: new Date().toISOString(),
        isFromMe: true,
        replyParentMsgId: replyParentMsgId || null,
      };
      // @ts-ignore
      this._sendToRenderers("chat:message", syntheticMessage);
      // --- END LOCAL ECHO ---

      logger.success(`Message sent: "${message}"`);
    } catch (err) {
      // @ts-ignore
      let friendlyMessage = err.message;
      // @ts-ignore
      if (err.message.includes("message was denied")) {
        friendlyMessage =
          "Message blocked by Twitch (slow mode, banned word, or duplicate).";
        // @ts-ignore
      } else if (err.message.includes("ratelimit")) {
        friendlyMessage = "You're sending messages too fast. Please wait.";
      }
      this._sendToRenderers("chat:send-error", {
        // @ts-ignore
        message,
        error: friendlyMessage,
      });
      throw err;
    }
  }

  /**
   * @param {string} userLogin
   * @param {any} message
   */
  async sendWhisper(userLogin, message) {
    if (!this.whisperClient) {
      logger.error("[Chat] sendWhisper - whisper client not connected");
      throw new Error("Whisper not connected");
    }
    logger.info(`[Chat] Sending whisper to ${userLogin}: "${message}"`);
    // @ts-ignore
    await this.whisperClient.whisper(userLogin, message);
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
    }
    if (this.chatClient) {
      await this.chatClient.quit();
      this.chatClient = null;
    }
    this.currentChannel = null;
    this.reconnectAttempts = 0;
  }

  async disconnectWhispers() {
    if (this.whisperClient) {
      await this.whisperClient.quit();
      this.whisperClient = null;
    }
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
      // logger.debug(`[Chat] Sent event "${channel}" to renderers`);
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
   * @param {string} channelName
   */
  async getRecentMessages(channelName) {
    const cleanChannel = channelName.startsWith("#")
      ? channelName.slice(1)
      : channelName;
    const recent = this.messageBuffer.filter((m) => m.channel === cleanChannel);
    logger.debug(
      `[Chat] getRecentMessages for ${cleanChannel}: ${recent.length} messages`,
    );
    return recent;
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
