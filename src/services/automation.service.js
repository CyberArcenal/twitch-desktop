// src/main/services/automation.service.js
const { eventSubService } = require('./eventsub.service');
const { streamManagerService } = require('./stream-manager.service');
const { twitchChatService } = require('./twitch-chat.service');
const { settingsService } = require('./settings.service');
const { logger } = require('../utils/logger');

class AutomationService {
  constructor() {
    this.running = false;
    this.config = {
      autoRaid: false,
      autoClip: false,
      autoMessage: false,
      autoMessageText: 'Thanks for the follow/sub! 🎉',
      raidTarget: null,
    };
    this.listenersAttached = false;
    this.offlineHandled = false; // para iwas multiple raid/clip
  }

  start(config) {
    this.config = { ...this.config, ...config };
    this.running = true;
    this.offlineHandled = false;
    this.attachEventListeners();
    logger.info('[Automation] Started');
  }

  stop() {
    this.running = false;
    this.offlineHandled = false;
    logger.info('[Automation] Stopped');
  }

  attachEventListeners() {
    if (this.listenersAttached) return;
    eventSubService.on('eventsub:follow', this.handleFollow.bind(this));
    eventSubService.on('eventsub:subscription', this.handleSubscription.bind(this));
    eventSubService.on('eventsub:stream-offline', this.handleStreamOffline.bind(this));
    this.listenersAttached = true;
    logger.debug('[Automation] Event listeners attached');
  }

  async handleFollow(data) {
    if (!this.running) return;
    if (this.config.autoMessage && data?.followerName) {
      const msg = `@${data.followerName} ${this.config.autoMessageText}`;
      await this.sendChatMessage(msg);
    }
  }

  async handleSubscription(data) {
    if (!this.running) return;
    if (this.config.autoMessage && data?.userName) {
      const msg = `@${data.userName} ${this.config.autoMessageText}`;
      await this.sendChatMessage(msg);
    }
  }

  async handleStreamOffline(data) {
    if (!this.running) return;
    // Iwas multiple triggers
    if (this.offlineHandled) return;
    this.offlineHandled = true;

    const broadcasterId = data?.broadcasterId || settingsService.get('twitch')?.userId;
    if (!broadcasterId) {
      logger.warn('[Automation] No broadcaster ID for offline event');
      return;
    }

    if (this.config.autoRaid && this.config.raidTarget) {
      try {
        await streamManagerService.startRaid(broadcasterId, this.config.raidTarget);
        logger.info(`[Automation] Auto-raid to ${this.config.raidTarget} triggered`);
      } catch (err) {
        logger.error('[Automation] Auto-raid failed:', err);
      }
    }
    if (this.config.autoClip) {
      try {
        await streamManagerService.createClip(broadcasterId);
        logger.info('[Automation] Auto-clip triggered');
      } catch (err) {
        logger.error('[Automation] Auto-clip failed:', err);
      }
    }
  }

  async sendChatMessage(message) {
    if (!twitchChatService.currentChannel) {
      logger.warn('[Automation] Chat not connected, cannot send auto-message');
      return;
    }
    try {
      await twitchChatService.sendChatMessage(message);
      logger.debug(`[Automation] Auto-message sent: "${message}"`);
    } catch (err) {
      logger.error('[Automation] Failed to send auto-message:', err);
    }
  }
}

const automationService = new AutomationService();
module.exports = { automationService, AutomationService };