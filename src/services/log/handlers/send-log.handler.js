const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

const LOG_CHANNEL = 'log:entry';

/**
 * Send a log entry to all renderer windows
 * @param {Object} entry
 * @param {string} entry.category - 'automation' or 'moderation'
 * @param {string} entry.message - descriptive message
 * @param {string} [entry.type] - 'info', 'warning', 'error', 'success'
 * @param {Object} [entry.meta] - additional metadata (action, user, etc.)
 */
function sendLog(entry) {
  const logEntry = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    category: entry.category,
    message: entry.message,
    type: entry.type || 'info',
    ...(entry.meta || {}),
  };

  sendToRenderers(LOG_CHANNEL, logEntry);
  logger.debug(`[LogService] Sent ${entry.category} log: ${entry.message.substring(0, 100)}`);
}

module.exports = { sendLog };