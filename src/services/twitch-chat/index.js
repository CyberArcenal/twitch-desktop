const { TwitchChatState } = require('./twitch-chat.state');
const { getAuthProvider } = require('./handlers/auth-provider.handler');
const { connectToChannel, disconnectChat } = require('./handlers/chat-connection.handler');
const { sendChatMessage } = require('./handlers/chat-send.handler');
const { connectToWhispers, disconnectWhispers } = require('./handlers/whisper-connection.handler');
const { sendWhisper } = require('./handlers/whisper-send.handler');
const { settingsService } = require('../settings');
const { logger } = require('../../utils/logger');

class TwitchChatService {
  constructor() {
    this.state = new TwitchChatState();
    logger.debug('[TwitchChatService] Constructor - instance created');
  }

  async initChatService(window) {
    // window parameter kept for compatibility but not used (IPC is global)
    this.state.setCurrentUserLogin(settingsService.get('twitch')?.login || null);
    logger.debug(`[Chat] initChatService - currentUserLogin=${this.state.getCurrentUserLogin()}`);
  }

  async connectToChannel(channelName) {
    return connectToChannel(this.state, channelName);
  }

  async disconnectChat() {
    return disconnectChat(this.state);
  }

  async sendChatMessage(message, replyParentMsgId = null) {
    return sendChatMessage(this.state, message, replyParentMsgId);
  }

  async connectToWhispers() {
    return connectToWhispers(this.state);
  }

  async disconnectWhispers() {
    return disconnectWhispers(this.state);
  }

  async sendWhisper(userLogin, message) {
    return sendWhisper(this.state, userLogin, message);
  }

  async getConversations() {
    const convs = Array.from(this.state.getConversations().values()).sort(
      (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
    );
    logger.debug(`[Chat] getConversations - ${convs.length} conversations`);
    return convs;
  }

  async getMessages(userId) {
    const conv = this.state.getConversations().get(userId);
    const msgs = conv?.messages || [];
    logger.debug(`[Chat] getMessages for ${userId} - ${msgs.length} messages`);
    return msgs;
  }

  async getRecentMessages(channelName) {
    const cleanChannel = channelName.startsWith('#') ? channelName.slice(1) : channelName;
    const recent = this.state.getMessageBuffer().filter(m => m.channel === cleanChannel);
    logger.debug(`[Chat] getRecentMessages for ${cleanChannel}: ${recent.length} messages`);
    return recent;
  }

  async markConversationRead(userId) {
    const conv = this.state.getConversations().get(userId);
    if (conv) {
      conv.unreadCount = 0;
      conv.messages.forEach(m => { if (!m.isFromMe) m.read = true; });
      const { sendToRenderers } = require('../../utils/ipc-sender');
      sendToRenderers('whisper:conversations-updated', Array.from(this.state.getConversations().values()));
      logger.debug(`[Chat] Marked conversation ${userId} as read`);
    } else {
      logger.warn(`[Chat] Conversation ${userId} not found`);
    }
  }

  // Expose auth provider if needed elsewhere
  async getAuthProvider() {
    return getAuthProvider(this.state);
  }
}

const twitchChatService = new TwitchChatService();
module.exports = { twitchChatService, TwitchChatService };