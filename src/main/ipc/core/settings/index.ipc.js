//@ts-check
const { ipcMain } = require("electron");
const { settingsService } = require("../../../../services/settings");
const { logger } = require('../../../../utils/logger');
/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handleSettingsRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case "get":
      // @ts-ignore
      return settingsService.get(params.key);
    case "set":
      // @ts-ignore
      settingsService.set(params.key, params.value);
      return true;
    case "getAll":
      return settingsService.getAll();
    case "addChatFilter":
      // @ts-ignore
      settingsService.addChatFilter(params.word);
      return true;
    case "removeChatFilter":
      // @ts-ignore
      settingsService.removeChatFilter(params.word);
      return true;
    case "reset":
      settingsService.reset();
      return true;
    case "testNotification":
      // @ts-ignore
      settingsService.testNotification(params.type);
      return true;
    default:
      throw new Error(`Unknown settings method: ${method}`);
  }
}

ipcMain.handle("settings", async (event, payload) => {
  try {
    const result = await handleSettingsRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    console.error("[IPC:settings]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Settings handler registered");
