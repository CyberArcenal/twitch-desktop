// src/main/ipc/core/player/index.ipc.js
//@ts-check
const { ipcMain } = require("electron");
const { playerService } = require("../../../../services/player");
const { logger } = require('../../../../utils/logger');
/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
async function handlePlayerRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case "loadStream":
      const { channelName, options } = params;
      if (
        !channelName ||
        typeof channelName !== "string" ||
        channelName.trim() === ""
      ) {
        throw new Error(`Invalid channel name: ${channelName}`);
      }
      return await playerService.loadStream(channelName.trim(), options);
    case "loadVod":
      // @ts-ignore
      return await playerService.loadVod(params.vodId, params.options);
    case "play":
      return await playerService.play();
    case "pause":
      return await playerService.pause();
    case "setVolume":
      // @ts-ignore
      return await playerService.setVolume(params.level);
    case "toggleMute":
      return await playerService.toggleMute();
    case "setQuality":
      // @ts-ignore
      return await playerService.setQuality(params.quality);
    case "fullscreen":
      return await playerService.fullscreen();
    case "close":
      return playerService.closePlayer();
    default:
      throw new Error(`Unknown player method: ${method}`);
  }
}

ipcMain.handle("player", async (event, payload) => {
  try {
    const result = await handlePlayerRequest(event, payload);logger.debug(`[IPC] request: ${JSON.stringify(payload)}`);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    console.error("[IPC:player]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Player handler registered");
