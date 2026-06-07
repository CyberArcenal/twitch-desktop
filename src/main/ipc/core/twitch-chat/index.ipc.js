//@ts-check
const { ipcMain } = require("electron");
const {
  twitchChatService,
} = require("../../../../services/twitch-chat");
const { twitchApiService } = require("../../../../services/twitch-api");

/**
 * @param {Electron.IpcMainInvokeEvent} event
 * @param {{ method: any; params?: {} | undefined; }} payload
 */
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
async function handleChatRequest(event, payload) {
  const { method, params = {} } = payload;

  switch (method) {
    case "connect":
      // @ts-ignore
      return await twitchChatService.connectToChannel(params.channelName);
    case "disconnect":
      return await twitchChatService.disconnectChat();
    case "send":
      // @ts-ignore
      return await twitchChatService.sendChatMessage(
        // @ts-ignore
        params.message,
        // @ts-ignore
        params.replyParentMsgId,
      );
    case "connectWhispers":
      await twitchChatService.connectToWhispers();
      return true;
    case "sendWhisper":
      // @ts-ignore
      await twitchChatService.sendWhisper(params.toLogin, params.message);
      return true;
    case "getConversations":
      return await twitchChatService.getConversations();
    case "getMessages":
      // @ts-ignore
      return await twitchChatService.getMessages(params.userId);
    case "markRead":
      // @ts-ignore
      await twitchChatService.markConversationRead(params.userId);
      return true;
    case "getChatSettings":
      return await twitchApiService.getChatSettings(
        // @ts-ignore
        params.broadcasterId,
        // @ts-ignore
        params.moderatorId,
      );
    case "updateChatSettings":
      return await twitchApiService.updateChatSettings(
        // @ts-ignore
        params.broadcasterId,
        // @ts-ignore
        params.moderatorId,
        // @ts-ignore
        params.settings,
      );
    // Sa chat IPC handler
    case "getRecentMessages":
      // @ts-ignore
      return await twitchChatService.getRecentMessages(params.channelName);
    default:
      throw new Error(`Unknown chat method: ${method}`);
  }
}

ipcMain.handle("twitch-chat", async (event, payload) => {
  try {
    const result = await handleChatRequest(event, payload);
    return { status: true, message: "OK", data: result };
  } catch (err) {
    console.error("[IPC:twitch-chat]", err);
    // @ts-ignore
    return { status: false, message: err.message, data: null };
  }
});

console.log("[IPC] Twitch Chat handler registered");
