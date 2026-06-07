const { ipcMain } = require('electron');
const { themesService } = require('../../../../services/themes');

async function handleThemesRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'get':
      return themesService.getCurrentTheme();
    case 'set':
      return themesService.setTheme(params.theme);
    case 'toggle':
      return themesService.toggleTheme();
    default:
      throw new Error(`Unknown themes method: ${method}`);
  }
}

ipcMain.handle('themes', async (event, payload) => {
  try {
    const result = await handleThemesRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:themes]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Themes handler registered');