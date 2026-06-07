const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function sendChatMessage(state, message, replyParentMsgId = null) {
  const chatClient = state.getChatClient();
  const currentChannel = state.getCurrentChannel();
  if (!chatClient || !currentChannel) throw new Error('Not connected');

  try {
    await chatClient.say(currentChannel, message, { replyTo: replyParentMsgId });

    const cleanChannel = currentChannel.startsWith('#') ? currentChannel.slice(1) : currentChannel;
    const syntheticMessage = {
      messageId: `local-${Date.now()}`,
      channel: cleanChannel,
      user: state.getCurrentUserLogin(),
      message: message,
      parsedMessage: [{ type: 'text', text: message }],
      badges: [],
      emotes: new Map(),
      timestamp: new Date().toISOString(),
      isFromMe: true,
      replyParentMsgId: replyParentMsgId || null,
    };
    sendToRenderers('chat:message', syntheticMessage);
    logger.success(`Message sent: "${message}"`);
  } catch (err) {
    let friendlyMessage = err.message;
    if (err.message.includes('message was denied')) {
      friendlyMessage = 'Message blocked by Twitch (slow mode, banned word, or duplicate).';
    } else if (err.message.includes('ratelimit')) {
      friendlyMessage = "You're sending messages too fast. Please wait.";
    }
    sendToRenderers('chat:send-error', { message, error: friendlyMessage });
    throw err;
  }
}

module.exports = { sendChatMessage };