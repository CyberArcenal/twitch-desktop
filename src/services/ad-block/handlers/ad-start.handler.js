const { sendToRenderers } = require('../../../utils/ipc-sender');
const { sendLog, LogCategory } = require('../../log');

function handleAdStart(state) {
  state.setAdPlaying(true);
  sendToRenderers('ad:start', {});
  sendLog({
    category: LogCategory.AUTOMATION,
    message: 'Ad detected - player muted/blocked',
    type: 'info',
    meta: { action: 'ad_start' },
  });
}

module.exports = { handleAdStart };