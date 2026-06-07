class TwitchChatState {
  constructor() {
    this.chatClient = null;
    this.whisperClient = null;
    this.currentChannel = null;
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 5;
    this.reconnectTimer = null;
    this.conversations = new Map(); // userId -> conversation object
    this.currentUserLogin = null;
    this.whisperListenersSetup = false;
    this.authProvider = null;
    this.messageBuffer = []; // recent chat messages
    this.maxBufferSize = 200;
    this.globalBadges = null;
    this.channelBadges = null;
  }

  // Getters and setters
  setChatClient(client) { this.chatClient = client; }
  getChatClient() { return this.chatClient; }
  setWhisperClient(client) { this.whisperClient = client; }
  getWhisperClient() { return this.whisperClient; }
  setCurrentChannel(channel) { this.currentChannel = channel; }
  getCurrentChannel() { return this.currentChannel; }
  resetReconnectAttempts() { this.reconnectAttempts = 0; }
  incrementReconnectAttempts() { this.reconnectAttempts++; }
  getReconnectAttempts() { return this.reconnectAttempts; }
  getMaxReconnectAttempts() { return this.MAX_RECONNECT_ATTEMPTS; }
  setReconnectTimer(timer) { this.reconnectTimer = timer; }
  clearReconnectTimer() { if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  getConversations() { return this.conversations; }
  setCurrentUserLogin(login) { this.currentUserLogin = login; }
  getCurrentUserLogin() { return this.currentUserLogin; }
  setWhisperListenersSetup(flag) { this.whisperListenersSetup = flag; }
  isWhisperListenersSetup() { return this.whisperListenersSetup; }
  setAuthProvider(provider) { this.authProvider = provider; }
  getAuthProvider() { return this.authProvider; }
  addToMessageBuffer(message) { this.messageBuffer.push(message); if (this.messageBuffer.length > this.maxBufferSize) this.messageBuffer.shift(); }
  getMessageBuffer() { return this.messageBuffer; }
  setGlobalBadges(badges) { this.globalBadges = badges; }
  setChannelBadges(badges) { this.channelBadges = badges; }
  getGlobalBadges() { return this.globalBadges; }
  getChannelBadges() { return this.channelBadges; }
}

module.exports = { TwitchChatState };