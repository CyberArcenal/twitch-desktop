const { ipcMain } = require("electron");
const { twitchApiService } = require("../../services/twitch-api.service");

function registerTwitchHandlers() {
  ipcMain.handle("twitch:getUser", () => twitchApiService.getCurrentUser());
  ipcMain.handle("twitch:getFollowed", (_, userId, after) =>
    twitchApiService.getFollowedChannels(userId, after),
  );
  ipcMain.handle("twitch:getStreams", (_, userIds) =>
    twitchApiService.getStreams(userIds),
  );
  ipcMain.handle("twitch:searchChannels", (_, query) =>
    twitchApiService.searchChannels(query),
  );
  ipcMain.handle("twitch:getChannelInfo", (_, broadcasterId) =>
    twitchApiService.getChannelInfo(broadcasterId),
  );
  ipcMain.handle("twitch:getGameInfo", (_, gameId) =>
    twitchApiService.getGameInfo(gameId),
  );
  // Main process (main/index.ts)
  ipcMain.handle("get-user-followers", async (event, broadcasterId) => {
    const accessToken = await getValidAccessToken(); // your token retrieval logic
    const response = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&first=1`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = await response.json();
    return { total: data.total, data: data.data };
  });
}

module.exports = { registerTwitchHandlers };
