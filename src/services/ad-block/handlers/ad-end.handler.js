const { sendToRenderers } = require('../../../utils/ipc-sender');
const { sendLog, LogCategory } = require('../../log');

function handleAdEnd(state) {
  state.setAdPlaying(false);
  sendToRenderers('ad:end', {});
  sendLog({
    category: LogCategory.AUTOMATION,
    message: 'Ad ended - player restored',
    type: 'info',
    meta: { action: 'ad_end' },
  });
}

module.exports = { handleAdEnd };