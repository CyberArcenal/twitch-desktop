const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function handleWhisper(state, sender, message, msg) {
  const userId = sender.id;
  const userName = sender.name;
  logger.debug(`[Chat] Whisper from ${userName}: "${message}"`);

  const whisperMsg = {
    id: msg.id || Date.now().toString(),
    from: userName,
    to: state.getCurrentUserLogin(),
    message: message,
    timestamp: new Date().toISOString(),
    isFromMe: false,
    read: false,
  };

  let conv = state.getConversations().get(userId);
  if (!conv) {
    conv = {
      userId,
      userLogin: userName,
      userName,
      lastMessage: message,
      lastTimestamp: whisperMsg.timestamp,
      unreadCount: 0,
      messages: [],
    };
    state.getConversations().set(userId, conv);
    logger.debug(`[Chat] New conversation for ${userName}`);
  }

  conv.lastMessage = message;
  conv.lastTimestamp = whisperMsg.timestamp;
  conv.unreadCount += 1;
  conv.messages.push(whisperMsg);
  if (conv.messages.length > 200) conv.messages = conv.messages.slice(-200);

  sendToRenderers('whisper:received', whisperMsg);
  sendToRenderers('whisper:conversations-updated', Array.from(state.getConversations().values()));
}

module.exports = { handleWhisper };