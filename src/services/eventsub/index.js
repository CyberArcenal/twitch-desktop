
const EventEmitter = require('events');
const { EventSubState } = require('./eventsub.state');
const { connect, disconnect } = require('./handlers/websocket.handler');
const {
  subscribeToStreamOnline,
  subscribeToStreamOffline,
  subscribeToFollowEvents,
  subscribeToSubscriptionEvents,
  subscribeToRaidEvents,
  subscribeToHypeTrainEvents,
  resubscribeAll,
} = require('./handlers/subscription-manager.handler');
const { logger } = require('../../utils/logger');

class EventSubService extends EventEmitter {
  constructor() {
    super();
    this.state = new EventSubState();
  }

  initialize(mainWindow) {
    // mainWindow is no longer used directly; IPC uses shared sendToRenderers.
    logger.info('[EventSubService] Initialized');
  }

  start() {
    if (
      this.state.getWs() &&
      (this.state.getWs().readyState === 1 || this.state.getWs().readyState === 0) // OPEN or CONNECTING
    ) {
      logger.info('[EventSubService] Already connected or connecting, skipping start');
      return;
    }
    logger.info('[EventSubService] Starting EventSub service');
    connect(this.state, this);
  }

  stop() {
    logger.info('[EventSubService] Stopping EventSub service');
    disconnect(this.state);
  }

  async subscribeToStream(userId) {
    if (!this.state.getSessionId()) throw new Error('EventSub not connected');
    return subscribeToStreamOnline(this.state, userId);
  }

  async subscribeToFollows(userId) {
    if (!this.state.getSessionId()) throw new Error('EventSub not connected');
    return subscribeToFollowEvents(this.state, userId);
  }

  async subscribeToSubscriptions(userId) {
    if (!this.state.getSessionId()) throw new Error('EventSub not connected');
    return subscribeToSubscriptionEvents(this.state, userId);
  }

  async subscribeToRaidEvents(userId) {
    return subscribeToRaidEvents(this.state, userId);
  }

  async subscribeToHypeTrainEvents(userId) {
    return subscribeToHypeTrainEvents(this.state, userId);
  }

  async resubscribeAll() {
    return resubscribeAll(this.state);
  }
}

const eventSubService = new EventSubService();
module.exports = { eventSubService, EventSubService };