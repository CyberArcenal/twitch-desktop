const { ChatClient } = require('@twurple/chat');
const { getAuthProvider } = require('./auth-provider.handler');
const { fetchBadgeSets } = require('./badge.handler');
const { handleChatMessage } = require('./chat-message.handler');
const { handleReconnect } = require('./reconnect.handler'); // will create
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

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
      isBot: false,
      logger: { minLevel: 'debug' },
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

function setupChatListeners(state, channelName) {
  const chatClient = state.getChatClient();
  const userLogin = state.getCurrentUserLogin();

  chatClient.onConnect(async () => {
    logger.info(`[Chat] Authenticated to ${channelName}`);
    const twitchData = require('../../settings').settingsService.get('twitch');
    const broadcasterId = twitchData?.userId;
    if (broadcasterId) {
      await fetchBadgeSets(state, broadcasterId);
    } else {
      logger.warn('[Chat] No broadcaster ID, cannot fetch badges');
    }
    sendToRenderers('chat:connected', { channel: channelName });
  });

  chatClient.onMessage((channel, user, message, msg) => {
    handleChatMessage(state, channel, user, message, msg);
  });

  chatClient.onJoin((channel, user) => {
    if (user === userLogin) {
      logger.info(`[Chat] Own user ${user} joined ${channel}`);
      sendToRenderers('chat:connected', { channel: channel.slice(1) });
      state.resetReconnectAttempts();
    } else {
      logger.debug(`[Chat] User ${user} joined ${channel}`);
      sendToRenderers('chat:user-joined', { channel: channel.slice(1), user });
    }
  });

  chatClient.onDisconnect(async (manually) => {
    if (!manually && state.getCurrentChannel()) {
      logger.warn(`[Chat] Disconnected from ${state.getCurrentChannel()}, reconnecting...`);
      handleReconnect(state, connectToChannel);
    } else {
      logger.info(`[Chat] Disconnected manually from ${state.getCurrentChannel() || 'unknown'}`);
    }
  });
}

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