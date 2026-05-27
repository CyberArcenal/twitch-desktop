//@ts-check
const { ipcMain } = require('electron');
const { eventSubService } = require('../../../../services/eventsub.service');

async function handleEventSubRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'start':
      eventSubService.start();
      return true;
    case 'stop':
      eventSubService.stop();
      return true;
    case 'subscribeStream':
      return await eventSubService.subscribeToStream(params.userId);
    case 'subscribeFollows':
      return await eventSubService.subscribeToFollows(params.userId);
    case 'subscribeSubscriptions':
      return await eventSubService.subscribeToSubscriptions(params.userId);
    default:
      throw new Error(`Unknown eventsub method: ${method}`);
  }
}

ipcMain.handle('eventsub', async (event, payload) => {
  try {
    const result = await handleEventSubRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:eventsub]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] EventSub handler registered');