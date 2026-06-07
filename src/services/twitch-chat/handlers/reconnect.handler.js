const { logger } = require('../../../utils/logger');

function handleReconnect(state, connectFunction) {
  if (state.getReconnectAttempts() >= state.getMaxReconnectAttempts()) {
    logger.error(`[Chat] Max reconnect attempts reached, giving up`);
    return;
  }
  state.incrementReconnectAttempts();
  const delay = Math.min(1000 * Math.pow(2, state.getReconnectAttempts()), 30000);
  logger.info(`[Chat] Reconnecting in ${delay}ms (attempt ${state.getReconnectAttempts()})`);
  const timer = setTimeout(() => {
    connectFunction(state, state.getCurrentChannel()).catch(err =>
      logger.error('[Chat] Reconnect attempt failed:', err)
    );
  }, delay);
  state.setReconnectTimer(timer);
}

module.exports = { handleReconnect };