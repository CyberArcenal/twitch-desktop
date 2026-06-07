const { handleEvent } = require('./event-handler.handler');
const { ensureEssentialSubscriptions } = require('./subscription-manager.handler');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function handleWebSocketMessage(state, eventEmitter, data) {
  const message = JSON.parse(data.toString());
  const msgType = message.metadata.message_type;
  logger.debug(`[EventSub] WebSocket message type: ${msgType}`);

  switch (msgType) {
    case 'session_welcome':
      state.setSessionId(message.payload.session.id);
      state.setConnected(true);
      logger.info(`[EventSub] WebSocket connected, session: ${state.getSessionId()}`);
      sendToRenderers('eventsub:connected', { sessionId: state.getSessionId() });
      await ensureEssentialSubscriptions(state);
      break;
    case 'session_keepalive':
      logger.debug('[EventSub] Keepalive received, no response needed.');
      break;
    case 'notification':
      handleEvent(eventEmitter, message);
      break;
    case 'session_reconnect':
      logger.warn('[EventSub] Reconnect requested, new URL:', message.payload.session.reconnect_url);
      break;
    case 'revocation':
      logger.warn('[EventSub] Subscription revoked:', message.payload.subscription);
      state.deleteSubscription(message.payload.subscription.id);
      break;
    default:
      logger.debug('[EventSub] Unknown message type:', msgType);
  }
}

module.exports = { handleWebSocketMessage };