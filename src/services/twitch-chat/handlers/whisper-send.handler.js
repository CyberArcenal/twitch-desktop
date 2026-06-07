const { twitchApiService } = require('../../twitch-api');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function sendWhisper(state, userLogin, message) {
  const whisperClient = state.getWhisperClient();
  if (!whisperClient) {
    logger.error('[Chat] Whisper client not connected');
    throw new Error('Whisper not connected');
  }

  logger.info(`[Chat] Sending whisper to ${userLogin}: "${message}"`);
  await whisperClient.whisper(userLogin, message);

  const user = await twitchApiService.getUserByName(userLogin);
  const userId = user?.id;
  if (userId) {
    const sentMsg = {
      id: Date.now().toString(),
      from: state.getCurrentUserLogin(),
      to: userLogin,
      message,
      timestamp: new Date().toISOString(),
      isFromMe: true,
      read: true,
    };

    let conv = state.getConversations().get(userId);
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
      state.getConversations().set(userId, conv);
      logger.debug(`[Chat] New conversation for whisper with ${userLogin}`);
    }
    conv.lastMessage = message;
    conv.lastTimestamp = sentMsg.timestamp;
    conv.messages.push(sentMsg);

    sendToRenderers('whisper:conversations-updated', Array.from(state.getConversations().values()));
    sendToRenderers('whisper:sent', sentMsg);
  }
}

module.exports = { sendWhisper };