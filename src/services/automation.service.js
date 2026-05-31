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
  }

  start(config) {
    this.config = { ...this.config, ...config };
    this.running = true;
    this.attachEventListeners();
    logger.info('[Automation] Started');
  }

  stop() {
    this.running = false;
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
    if (this.config.autoMessage) {
      const msg = `@${data.followerName} ${this.config.autoMessageText}`;
      await this.sendChatMessage(msg);
    }
  }

  async handleSubscription(data) {
    if (!this.running) return;
    if (this.config.autoMessage) {
      const msg = `@${data.userName} ${this.config.autoMessageText}`;
      await this.sendChatMessage(msg);
    }
  }

  async handleStreamOffline() {
    if (!this.running) return;
    const userId = settingsService.get('twitch')?.userId;
    if (!userId) return;
    if (this.config.autoRaid && this.config.raidTarget) {
      await streamManagerService.startRaid(userId, this.config.raidTarget);
    }
    if (this.config.autoClip) {
      await streamManagerService.createClip(userId);
    }
  }

  async sendChatMessage(message) {
    if (twitchChatService.currentChannel) {
      await twitchChatService.sendChatMessage(message);
    }
  }
}

const automationService=new AutomationService()

module.exports = {  automationService, AutomationService };