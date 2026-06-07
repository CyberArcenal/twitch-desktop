
const WebSocket = require('ws');
const { handleWebSocketMessage } = require('./message-handler.handler');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

function connect(state, eventEmitter) {
  if (
    state.getWs() &&
    (state.getWs().readyState === WebSocket.OPEN || state.getWs().readyState === WebSocket.CONNECTING)
  ) {
    logger.debug('[EventSub] Already connected or connecting');
    return;
  }
  const wsUrl = 'wss://eventsub.wss.twitch.tv/ws';
  logger.info(`[EventSub] Connecting to WebSocket: ${wsUrl}`);
  const ws = new WebSocket(wsUrl);
  state.setWs(ws);

  ws.on('open', () => {
    logger.info('[EventSub] WebSocket opened');
    state.resetReconnectAttempts();
  });

  ws.on('message', (data) => handleWebSocketMessage(state, eventEmitter, data));

  ws.on('error', (err) => {
    logger.error('[EventSub] WebSocket error:', err);
  });

  ws.on('close', (code, reason) => {
    logger.warn(`[EventSub] WebSocket closed: ${code} - ${reason}`);
    state.setConnected(false);
    state.setSessionId(null);
    state.setAutoSubscriptionsCreated(false);
    sendToRenderers('eventsub:disconnected', { code, reason });
    reconnect(state, eventEmitter);
  });
}

function reconnect(state, eventEmitter) {
  if (state.getReconnectAttempts() >= state.getMaxReconnectAttempts()) {
    logger.error('[EventSub] Max reconnect attempts reached, giving up');
    return;
  }
  const delay = Math.min(1000 * Math.pow(2, state.getReconnectAttempts()), 30000);
  state.incrementReconnectAttempts();
  logger.info(`[EventSub] Reconnecting in ${delay}ms (attempt ${state.getReconnectAttempts()})`);
  setTimeout(() => connect(state, eventEmitter), delay);
}

function disconnect(state) {
  logger.info('[EventSub] Disconnecting WebSocket');
  if (state.getWs()) {
    state.getWs().close();
    state.setWs(null);
  }
  state.setConnected(false);
  state.setSessionId(null);
  state.setAutoSubscriptionsCreated(false);
}

module.exports = { connect, disconnect };