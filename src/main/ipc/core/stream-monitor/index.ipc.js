//@ts-check
const { ipcMain } = require('electron');
const { streamMonitorService } = require('../../../../services/stream-monitor.service');


/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
async function handleStreamMonitorRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'start':
      // @ts-ignore
      streamMonitorService.startStreamMonitor(params.intervalSeconds);
      return true;
    case 'stop':
      streamMonitorService.stopStreamMonitor();
      return true;
    case 'checkNow':
      await streamMonitorService.checkFollowedStreams();
      return true;
    default:
      throw new Error(`Unknown streamMonitor method: ${method}`);
  }
}

ipcMain.handle('stream-monitor', async (event, payload) => {
  try {
    const result = await handleStreamMonitorRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:stream-monitor]', err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log('[IPC] Stream Monitor handler registered');