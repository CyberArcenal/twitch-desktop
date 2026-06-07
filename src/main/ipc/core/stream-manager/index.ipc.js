// src/main/ipc/core/stream-manager/index.ipc.js
//@ts-check
const { ipcMain } = require("electron");
const { settingsService } = require("../../../../services/settings");
const {
  streamManagerService,
} = require("../../../../services/stream-manager");
const { logger } = require("../../../../utils/logger");
const {
  obsDetectionService,
} = require("../../../../services/obs-detection");
const {
  automationService,
} = require("../../../../services/automation");
const {
  obsWebSocketService,
} = require("../../../../services/obs-websocket");

/**
 * @param {Electron.IpcMainInvokeEvent} event
 */
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
async function handleStreamManagerRequest(event, { method, params = {} }) {
  const broadcasterId = settingsService.get("twitch")?.userId;
  if (
    !broadcasterId &&
    method !== "getStreamKey" &&
    method !== "saveStreamKey"
  ) {
    throw new Error("Not logged in");
  }
  const moderatorId = broadcasterId; // streamer is moderator of own channel

  switch (method) {
    case "updateStreamInfo":
      return await streamManagerService.updateStreamInfo(broadcasterId, {
        // @ts-ignore
        title: params.title,
        // @ts-ignore
        game_id: params.game_id,
        // @ts-ignore
        go_live_notification: params.go_live_notification,
        // @ts-ignore
        broadcaster_language: params.broadcaster_language,
        // @ts-ignore
        tags: params.tags,
        // @ts-ignore
        is_branded_content: params.is_branded_content,
        // @ts-ignore
        content_classification_labels: params.content_classification_labels,
        // @ts-ignore
        is_rerun: params.is_rerun,
      });
    case "createClip":
      return await streamManagerService.createClip(broadcasterId);
    case "startRaid":
      return await streamManagerService.startRaid(
        broadcasterId,
        // @ts-ignore
        params.toBroadcasterLogin,
      );
    case "banUser":
      return await streamManagerService.banUser(
        broadcasterId,
        moderatorId,
        // @ts-ignore
        params.userName,
      );
    case "timeoutUser":
      return await streamManagerService.timeoutUser(
        broadcasterId,
        moderatorId,
        // @ts-ignore
        params.userName,
        // @ts-ignore
        params.duration,
      );
    case "clearChat":
      return await streamManagerService.clearChat(broadcasterId, moderatorId);
    case "getGoals":
      return streamManagerService.getGoals();
    case "addGoal":
      // @ts-ignore
      return streamManagerService.addGoal(params.goal);
    case "updateGoalProgress":
      return streamManagerService.updateGoalProgress(
        // @ts-ignore
        params.goalId,
        // @ts-ignore
        params.currentValue,
      );
    case "deleteGoal":
      // @ts-ignore
      return streamManagerService.deleteGoal(params.goalId);
    case "getStreamKey":
      return streamManagerService.getStreamKey();
    case "saveStreamKey":
      // @ts-ignore
      streamManagerService.saveStreamKey(params.key);
      return true;
    case "isOBSRunning":
      return await obsDetectionService.isOBSRunning();
    case "runCommercial":
      return await streamManagerService.runCommercial(
        // @ts-ignore
        params.broadcasterId,
        // @ts-ignore
        params.length,
      );

    case "startAutomation":
      // @ts-ignore
      automationService.start(params.config);
      return true;
    case "stopAutomation":
      automationService.stop();
      return true;
    case "getAutomationStatus":
      return {
        running: automationService.running,
        config: automationService.config,
      };
    case "obsConnect":
      try {
        const result = await obsWebSocketService.connect(
          // @ts-ignore
          params.host,
          // @ts-ignore
          params.port,
          // @ts-ignore
          params.password,
        );
        return result;
      } catch (err) {
        // Throw error so outer handler returns { status: false, message: err.message }
        // @ts-ignore
        throw new Error(err.message);
      }
    case "obsDisconnect":
      await obsWebSocketService.disconnect();
      return true;
    case "getOBSStatus":
      return obsWebSocketService.getConnectionStatus();
    case "getScenes":
      return await obsWebSocketService.getScenes();
    case "getCurrentScene":
      return await obsWebSocketService.getCurrentScene();
    case "setCurrentScene":
      // @ts-ignore
      return await obsWebSocketService.setCurrentScene(params.sceneName);
    case "getStreamStatus":
      return await obsWebSocketService.getStreamStatus();
    case "getOBSStats":
      return await obsWebSocketService.getStats();
    case "obsUpdatePassword":
      // @ts-ignore
      return await obsWebSocketService.updatePassword(params.password);
    case "obsClearPassword":
      return await obsWebSocketService.clearPassword();

    case "getModerators":
      return await streamManagerService.getModerators(broadcasterId);
    case "addModerator":
      // params.userId is the Twitch user ID (obtained from a username lookup)
      return await streamManagerService.addModerator(
        broadcasterId,
        // @ts-ignore
        params.userId,
      );
    case "removeModerator":
      return await streamManagerService.removeModerator(
        broadcasterId,
        // @ts-ignore
        params.userId,
      );
    case "getUserByName":
      // Re‑use the existing method from twitchApiService
      const {
        twitchApiService,
      } = require("../../../../services/twitch-api");
      // @ts-ignore
      return await twitchApiService.getUserByName(params.username);
    default:
      throw new Error(`Unknown stream-manager method: ${method}`);
  }
}

ipcMain.handle("stream-manager", async (event, payload) => {
  try {
    const result = await handleStreamManagerRequest(event, payload);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    // @ts-ignore
    logger.error("[IPC:stream-manager]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Stream manager handler registered");
