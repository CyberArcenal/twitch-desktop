//@ts-check
const { ipcMain } = require("electron");
const {
  streamMonitorService,
} = require("../../../../services/stream-monitor.service");
const { twitchApiService } = require("../../../../services/twitch-api.service");
const {
  streamManagerService,
} = require("../../../../services/stream-manager.service");

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
async function handleStreamMonitorRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case "start":
      // @ts-ignore
      streamMonitorService.startStreamMonitor(params.intervalSeconds);
      return true;
    case "stop":
      streamMonitorService.stopStreamMonitor();
      return true;
    case "checkNow":
      await streamMonitorService.checkFollowedStreams();
      return true;
    case "sendShoutout":
      // params.targetUsername is the channel name to shoutout
      const targetUser = await twitchApiService.getUserByName(
        params.targetUsername,
      );
      if (!targetUser) throw new Error("Target channel not found");
      return await streamManagerService.sendShoutout(
        broadcasterId,
        targetUser.id,
        moderatorId,
      );
    default:
      throw new Error(`Unknown streamMonitor method: ${method}`);
  }
}

ipcMain.handle("stream-monitor", async (event, payload) => {
  try {
    const result = await handleStreamMonitorRequest(event, payload);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    console.error("[IPC:stream-monitor]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Stream Monitor handler registered");
