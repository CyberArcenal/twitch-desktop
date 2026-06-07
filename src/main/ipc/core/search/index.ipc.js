const { ipcMain } = require('electron');
const { searchService } = require('../../../../services/search');
const { logger } = require('../../../../utils/logger');
async function handleSearchRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'searchChannels':
      return await searchService.searchChannels(params.query, params.limit);
    case 'searchStreams':
      return await searchService.searchStreams(params.query, params.limit);
    case 'searchGames':
      return await searchService.searchGames(params.query, params.limit);
    case 'searchAll':
      return await searchService.searchAll(params.query, params.limitPerType);
    default:
      throw new Error(`Unknown search method: ${method}`);
  }
}

ipcMain.handle('search', async (event, payload) => {
  try {
    const result = await handleSearchRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:search]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Search handler registered');