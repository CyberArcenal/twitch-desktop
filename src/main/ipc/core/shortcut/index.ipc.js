const { ipcMain } = require('electron');
const { shortcutService } = require('../../../../services/shortcut.service');

async function handleShortcutRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case 'register':
      shortcutService.registerShortcuts(params.shortcuts);
      return true;
    case 'unregisterAll':
      shortcutService.unregisterAll();
      return true;
    case 'unregister':
      shortcutService.unregister(params.accelerators);
      return true;
    case 'isRegistered':
      return shortcutService.isRegistered(params.accelerator);
    default:
      throw new Error(`Unknown shortcut method: ${method}`);
  }
}

ipcMain.handle('shortcut', async (event, payload) => {
  try {
    const result = await handleShortcutRequest(event, payload);
    return { status: true, message: 'OK', data: result };
  } catch (err) {
    console.error('[IPC:shortcut]', err);
    return { status: false, message: err.message, data: null };
  }
});
console.log('[IPC] Shortcut handler registered');