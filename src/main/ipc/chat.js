const { ipcMain } = require('electron');
const { connectToChannel, sendChatMessage, disconnectChat } = require('../../services/twitch-chat.service');

function registerChatHandlers() {
  ipcMain.handle('chat:connect', (_, channelName) => connectToChannel(channelName));
  ipcMain.handle('chat:send', (_, message) => sendChatMessage(message));
  ipcMain.handle('chat:disconnect', () => disconnectChat());
}

module.exports = { registerChatHandlers };