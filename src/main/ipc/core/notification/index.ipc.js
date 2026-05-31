//@ts-check
const { ipcMain } = require("electron");
const {
  notificationService,
} = require("../../../../services/notification.service");
const { settingsService } = require("../../../../services/settings.service");

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
// @ts-ignore
async function handleNotificationRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case "show":
      // @ts-ignore
      return notificationService.show(params.title, params.body);
    case "notifyStreamLive":
      // @ts-ignore
      return notificationService.notifyStreamLive(
        // @ts-ignore
        params.channelName,
        // @ts-ignore
        params.gameName,
      );
    case "notifyFollow":
      // @ts-ignore
      return notificationService.notifyFollow(params.userName);
    case "isEnabled":
      return notificationService.isEnabled();
    case "setEnabled":
      // @ts-ignore
      return notificationService.setEnabled(params.enabled);
    case "updateNotificationPreferences":
      // @ts-ignore
      settingsService.updateNotificationPreferences(params.prefs);
      return true;
    default:
      throw new Error(`Unknown notification method: ${method}`);
  }
}

ipcMain.handle("notification", async (event, payload) => {
  try {
    const result = await handleNotificationRequest(event, payload);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    console.error("[IPC:notification]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Notification handler registered");
