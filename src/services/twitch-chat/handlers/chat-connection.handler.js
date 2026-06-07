// src/renderer/api/chat/handlers/chat-connection.handler.js
const { ChatClient } = require("@twurple/chat");
const { getAuthProvider } = require("./auth-provider.handler");
const { fetchBadgeSets } = require("./badge.handler");
const { handleChatMessage } = require("./chat-message.handler");
const { handleReconnect } = require("./reconnect.handler");
const { handleChatClear } = require("./chat-clear.handler");
const { handleBan } = require("./chat-ban.handler");
const { handleAction } = require("./chat-action.handler");
const { handleAnnouncement } = require("./chat-announcement.handler");
const { handleMessageRemove } = require("./chat-message-remove.handler");
const { sendToRenderers } = require("../../../utils/ipc-sender");
const { logger } = require("../../../utils/logger");

/**
 * @param {{ getChatClient: () => any; setChatClient: (arg0: ChatClient) => void; setCurrentChannel: (arg0: any) => void; }} state
 * @param {string} channelName
 */
async function connectToChannel(state, channelName) {
  if (state.getChatClient()) {
    logger.debug(`[Chat] Disconnecting existing chat`);
    await disconnectChat(state);
  }

  logger.info(`[Chat] Connecting to #${channelName}`);
  try {
    const authProvider = await getAuthProvider(state);
    const chatClient = new ChatClient({
      authProvider,
      channels: [channelName],
      webSocket: true,
      logger: { minLevel: "debug" },
    });

    state.setChatClient(chatClient);
    setupChatListeners(state, channelName);
    await chatClient.connect();
    state.setCurrentChannel(channelName);
    logger.success(`[Chat] Connected to #${channelName}`);
  } catch (err) {
    logger.error(`[Chat] Failed to connect to ${channelName}:`, err);
    throw err;
  }
}

/**
 * @param {{ getChatClient: () => any; getCurrentUserLogin: () => any; resetReconnectAttempts: () => void; getCurrentChannel: () => any; }} state
 * @param {any} channelName
 */
function setupChatListeners(state, channelName) {
  const chatClient = state.getChatClient();
  const userLogin = state.getCurrentUserLogin();

  chatClient.onConnect(async () => {
    logger.info(`[Chat] Authenticated to ${channelName}`);
    const twitchData = require("../../settings").settingsService.get("twitch");
    const broadcasterId = twitchData?.userId;
    if (broadcasterId) {
      await fetchBadgeSets(state, broadcasterId);
    } else {
      logger.warn("[Chat] No broadcaster ID, cannot fetch badges");
    }
    sendToRenderers("chat:connected", { channel: channelName });
  });

  chatClient.onMessage((/** @type {any} */ channel, /** @type {any} */ user, /** @type {any} */ text, /** @type {any} */ msg) => {
    handleChatMessage(state, channel, user, text, msg);
  });

  chatClient.onJoin((/** @type {string | any[]} */ channel, /** @type {any} */ user) => {
    if (user === userLogin) {
      logger.info(`[Chat] Own user ${user} joined ${channel}`);
      sendToRenderers("chat:connected", { channel: channel.slice(1) });
      state.resetReconnectAttempts();
    } else {
      logger.debug(`[Chat] User ${user} joined ${channel}`);
      sendToRenderers("chat:user-joined", { channel: channel.slice(1), user });
    }
  });

  // Single message deletion
  if (typeof chatClient.onMessageRemove === "function") {
    chatClient.onMessageRemove((/** @type {any} */ channel, /** @type {any} */ messageId, /** @type {any} */ msg) => {
      handleMessageRemove(state, channel, messageId, msg);
    });
  } else {
    logger.warn("[Chat] onMessageRemove not available");
  }

  // Chat clear / timeout / ban
  if (typeof chatClient.onChatClear === "function") {
    chatClient.onChatClear((/** @type {any} */ channel, /** @type {any} */ userName, /** @type {any} */ msg) => {
      handleChatClear(state, channel, userName, msg);
    });
  } else {
    logger.warn("[Chat] onChatClear not available – trying fallback onBan");
    // Fallback to onBan if available
    if (typeof chatClient.onBan === "function") {
      chatClient.onBan((/** @type {any} */ channel, /** @type {any} */ user, /** @type {any} */ msg) => {
        handleBan(state, channel, user, msg);
      });
    }
  }

  // Permanent ban (additional handler if onChatClear already covers it)
  if (typeof chatClient.onBan === "function") {
    // We already set it inside the else block; but to avoid double firing,
    // we only attach if onChatClear does NOT exist, or we can attach always
    // and deduplicate? Safer to attach only if not already covered.
    // Actually, onChatClear already handles bans, so we only attach onBan as a fallback.
    // To keep it simple, we attach onBan only when onChatClear is missing.
    // The else block above already does that.
  }

  // Action messages (/me)
  if (typeof chatClient.onAction === "function") {
    chatClient.onAction((/** @type {any} */ channel, /** @type {any} */ user, /** @type {any} */ text, /** @type {any} */ msg) => {
      handleAction(state, channel, user, text, msg);
    });
  } else {
    logger.warn("[Chat] onAction not available");
  }

  // Announcements (/announce)
  if (typeof chatClient.onAnnouncement === "function") {
    chatClient.onAnnouncement((/** @type {any} */ channel, /** @type {any} */ user, /** @type {any} */ announcementInfo, /** @type {any} */ msg) => {
      handleAnnouncement(state, channel, user, announcementInfo, msg);
    });
  } else {
    logger.warn("[Chat] onAnnouncement not available");
  }

  chatClient.onDisconnect(async (/** @type {any} */ manually, /** @type {null | undefined} */ reason) => {
    if (!manually && state.getCurrentChannel()) {
      logger.warn(
        `[Chat] Disconnected from ${state.getCurrentChannel()}, reconnecting...`,
        reason,
      );
      handleReconnect(state, connectToChannel);
    } else {
      logger.info(
        `[Chat] Disconnected manually from ${state.getCurrentChannel() || "unknown"}`,
      );
    }
  });
}

/**
 * @param {{ clearReconnectTimer: () => void; getChatClient: () => { (): any; new (): any; quit: { (): any; new (): any; }; }; setChatClient: (arg0: null) => void; setCurrentChannel: (arg0: null) => void; resetReconnectAttempts: () => void; }} state
 */
async function disconnectChat(state) {
  state.clearReconnectTimer();
  if (state.getChatClient()) {
    await state.getChatClient().quit();
    state.setChatClient(null);
  }
  state.setCurrentChannel(null);
  state.resetReconnectAttempts();
}

module.exports = { connectToChannel, disconnectChat };