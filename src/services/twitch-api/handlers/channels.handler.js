const { BrowserWindow } = require('electron');
const { fetchTwitch } = require('./core-fetch.handler');
const { settingsService } = require('../../settings');
const { sendToRenderers } = require('../../../utils/ipc-sender');
const { logger } = require('../../../utils/logger');

async function getChannelInfo(broadcasterId) {
  logger.debug(`[TwitchApi] getChannelInfo called for broadcasterId=${broadcasterId}`);
  const result = await fetchTwitch(`channels?broadcaster_id=${broadcasterId}`);
  logger.debug(`[TwitchApi] getChannelInfo - result ${result.data?.length ? 'found' : 'not found'}`);
  return result;
}

async function getStreamKey() {
  const userId = settingsService.get('twitch')?.userId;
  if (!userId) {
    logger.error('[TwitchApi] getStreamKey - no userId in settings');
    throw new Error('Not logged in');
  }
  logger.debug(`[TwitchApi] getStreamKey called for userId=${userId}`);
  const result = await fetchTwitch(`streams/key?broadcaster_id=${userId}`);
  logger.info('[TwitchApi] getStreamKey - success (key obtained)');
  return result;
}

async function getIngestServers() {
  logger.debug('[TwitchApi] getIngestServers called');
  const result = await fetchTwitch('ingests');
  logger.debug(`[TwitchApi] getIngestServers - found ${result.data?.length || 0} ingest servers`);
  return result;
}

async function regenerateStreamKey() {
  const userId = settingsService.get('twitch')?.userId;
  if (!userId) {
    logger.error('[TwitchApi] regenerateStreamKey - no userId');
    throw new Error('Not logged in');
  }

  logger.info(`[TwitchApi] regenerateStreamKey - opening dashboard for user ${userId}`);
  const dashboardUrl = 'https://dashboard.twitch.tv/settings/stream';

  const keyWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    parent: BrowserWindow.getFocusedWindow(),
    modal: false,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  keyWindow.on('closed', () => {
    logger.info('[TwitchApi] regenerateStreamKey - dashboard window closed, notifying renderers');
    sendToRenderers('dashboard:closed', { action: 'refresh_live_status' });
  });

  await keyWindow.loadURL(dashboardUrl);
  logger.info('[TwitchApi] regenerateStreamKey - dashboard window loaded');
  return {
    status: true,
    message: 'Opened Twitch Dashboard. Please manually regenerate your stream key there.',
  };
}

module.exports = { getChannelInfo, getStreamKey, getIngestServers, regenerateStreamKey };