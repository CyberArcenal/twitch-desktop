class EventSubState {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.subscriptions = new Map(); // subscriptionId -> { type, condition, userId }
    this.autoSubscriptionsCreated = false;
  }

  setWs(ws) { this.ws = ws; }
  getWs() { return this.ws; }
  setSessionId(id) { this.sessionId = id; }
  getSessionId() { return this.sessionId; }
  setConnected(connected) { this.connected = connected; }
  isConnected() { return this.connected; }
  resetReconnectAttempts() { this.reconnectAttempts = 0; }
  incrementReconnectAttempts() { this.reconnectAttempts++; }
  getReconnectAttempts() { return this.reconnectAttempts; }
  getMaxReconnectAttempts() { return this.maxReconnectAttempts; }
  getSubscriptions() { return this.subscriptions; }
  addSubscription(id, data) { this.subscriptions.set(id, data); }
  deleteSubscription(id) { this.subscriptions.delete(id); }
  setAutoSubscriptionsCreated(flag) { this.autoSubscriptionsCreated = flag; }
  areAutoSubscriptionsCreated() { return this.autoSubscriptionsCreated; }
}

module.exports = { EventSubState };