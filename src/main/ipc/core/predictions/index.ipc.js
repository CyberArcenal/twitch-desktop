const { ipcMain } = require('electron');
const { predictionsService } = require('../../../../services/twitch-predictions');
const { logger } = require('../../../../utils/logger');
async function handlePredictionsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'getActive':
      return await predictionsService.getActivePredictions(params.broadcasterId);
    case 'create':
      return await predictionsService.createPrediction(params.broadcasterId, params.title, params.outcomes, params.predictionWindowSeconds);
    case 'resolve':
      return await predictionsService.resolvePrediction(params.predictionId, params.winningOutcomeId);
    default:
      throw new Error(`Unknown predictions method: ${method}`);
  }
}

ipcMain.handle('predictions', async (event, payload) => {
  try {
    const result = await handlePredictionsRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:predictions]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Predictions handler registered');