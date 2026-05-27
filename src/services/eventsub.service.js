// src/main/services/eventsub.service.js
//@ts-check
const { twitchApiService } = require('./twitch-api.service');
const { twitchAuthService } = require('./twitch-auth.service');
const { settingsService } = require('./settings.service');
const { BrowserWindow } = require('electron');
const WebSocket = require('ws');

class EventSubService {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.keepAliveInterval = null;
    this.subscriptions = new Map(); // subscriptionId -> { type, condition, userId }
    this.mainWindow = null;
  }

  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    console.log('[EventSubService] Initialized');
  }

  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn('[EventSubService] send error:', err);
    }
  }

  async getAppAccessToken() {
    // For now, use the user's access token (needs appropriate scopes)
    // In production, you'd get an app access token using client credentials
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return token;
  }

  async createSubscription(type, version, condition, transport = null) {
    const token = await this.getAppAccessToken();
    const { CLIENT_ID } = require('../shared/config');
    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    const body = {
      type,
      version,
      condition,
      transport: transport || {
        method: 'websocket',
        session_id: this.sessionId
      }
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
    const data = await response.json();
    return data.data[0];
  }

  async deleteSubscription(subscriptionId) {
    const token = await this.getAppAccessToken();
    const { CLIENT_ID } = require('../shared/config');
    const url = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID
      }
    });
    if (!response.ok && response.status !== 404) {
      console.error(`Failed to delete subscription ${subscriptionId}: ${response.status}`);
    }
  }

  async subscribeToStreamOnline(userId) {
    const subscription = await this.createSubscription(
      'stream.online',
      '1',
      { broadcaster_user_id: userId }
    );
    this.subscriptions.set(subscription.id, {
      type: 'stream.online',
      condition: { broadcaster_user_id: userId },
      userId
    });
    console.log(`[EventSub] Subscribed to stream.online for ${userId}`);
    return subscription;
  }

  async subscribeToFollowEvents(userId) {
    // Requires moderator:read:followers scope
    const subscription = await this.createSubscription(
      'channel.follow',
      '2',
      { broadcaster_user_id: userId, moderator_user_id: userId }
    );
    this.subscriptions.set(subscription.id, {
      type: 'channel.follow',
      condition: { broadcaster_user_id: userId },
      userId
    });
    console.log(`[EventSub] Subscribed to channel.follow for ${userId}`);
    return subscription;
  }

  async subscribeToSubscriptionEvents(userId) {
    // Requires channel:read:subscriptions scope
    const subscription = await this.createSubscription(
      'channel.subscribe',
      '1',
      { broadcaster_user_id: userId }
    );
    this.subscriptions.set(subscription.id, {
      type: 'channel.subscribe',
      condition: { broadcaster_user_id: userId },
      userId
    });
    console.log(`[EventSub] Subscribed to channel.subscribe for ${userId}`);
    return subscription;
  }

  handleEvent(message) {
    const { metadata, payload } = message;
    const eventType = metadata.subscription_type;
    const eventData = payload.event;

    console.log(`[EventSub] Received event: ${eventType}`, eventData);

    switch (eventType) {
      case 'stream.online':
        this._sendToRenderers('eventsub:stream-online', {
          broadcasterId: eventData.broadcaster_user_id,
          broadcasterName: eventData.broadcaster_user_login,
          title: eventData.title,
          gameId: eventData.game_id,
          startedAt: eventData.started_at
        });
        break;
      case 'channel.follow':
        this._sendToRenderers('eventsub:follow', {
          followerId: eventData.user_id,
          followerName: eventData.user_login,
          followedAt: eventData.followed_at,
          broadcasterId: eventData.broadcaster_user_id
        });
        break;
      case 'channel.subscribe':
        this._sendToRenderers('eventsub:subscription', {
          userId: eventData.user_id,
          userName: eventData.user_login,
          tier: eventData.tier,
          isGift: eventData.is_gift,
          broadcasterId: eventData.broadcaster_user_id
        });
        break;
      default:
        console.log(`[EventSub] Unhandled event type: ${eventType}`);
    }
  }

  async handleWebSocketMessage(data) {
    const message = JSON.parse(data.toString());
    switch (message.metadata.message_type) {
      case 'session_welcome':
        this.sessionId = message.payload.session.id;
        this.connected = true;
        console.log(`[EventSub] WebSocket connected, session: ${this.sessionId}`);
        this._sendToRenderers('eventsub:connected', { sessionId: this.sessionId });
        // Resubscribe to previously stored subscriptions if any
        await this.resubscribeAll();
        break;
      case 'session_keepalive':
        // Send pong to keep connection alive (not required by spec, but we can respond)
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'pong' }));
        }
        break;
      case 'notification':
        this.handleEvent(message);
        break;
      case 'session_reconnect':
        console.log('[EventSub] Reconnect requested, new URL:', message.payload.session.reconnect_url);
        // Optionally reconnect using provided URL
        break;
      case 'revocation':
        console.warn('[EventSub] Subscription revoked:', message.payload.subscription);
        // Remove from our map
        this.subscriptions.delete(message.payload.subscription.id);
        break;
      default:
        console.log('[EventSub] Unknown message type:', message.metadata.message_type);
    }
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('[EventSub] Already connected or connecting');
      return;
    }

    const wsUrl = 'wss://eventsub.wss.twitch.tv/ws';
    this.ws = new WebSocket(wsUrl);
    this.ws.on('open', () => {
      console.log('[EventSub] WebSocket opened');
      this.reconnectAttempts = 0;
    });
    this.ws.on('message', (data) => this.handleWebSocketMessage(data));
    this.ws.on('error', (err) => {
      console.error('[EventSub] WebSocket error:', err);
    });
    this.ws.on('close', (code, reason) => {
      console.log(`[EventSub] WebSocket closed: ${code} - ${reason}`);
      this.connected = false;
      this.sessionId = null;
      this._sendToRenderers('eventsub:disconnected', { code, reason });
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[EventSub] Max reconnect attempts reached, giving up');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.log(`[EventSub] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  async resubscribeAll() {
    for (const [id, sub] of this.subscriptions.entries()) {
      try {
        // Refresh each subscription
        let newSub;
        switch (sub.type) {
          case 'stream.online':
            newSub = await this.subscribeToStreamOnline(sub.userId);
            break;
          case 'channel.follow':
            newSub = await this.subscribeToFollowEvents(sub.userId);
            break;
          case 'channel.subscribe':
            newSub = await this.subscribeToSubscriptionEvents(sub.userId);
            break;
          default:
            continue;
        }
        // Replace old subscription id with new one
        this.subscriptions.delete(id);
        this.subscriptions.set(newSub.id, { ...sub, id: newSub.id });
      } catch (err) {
        console.error(`[EventSub] Failed to resubscribe ${sub.type}:`, err);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.sessionId = null;
  }

  // Public methods
  async start() {
    this.connect();
  }

  stop() {
    this.disconnect();
  }

  async subscribeToStream(userId) {
    if (!this.sessionId) throw new Error('EventSub not connected');
    return await this.subscribeToStreamOnline(userId);
  }

  async subscribeToFollows(userId) {
    if (!this.sessionId) throw new Error('EventSub not connected');
    return await this.subscribeToFollowEvents(userId);
  }

  async subscribeToSubscriptions(userId) {
    if (!this.sessionId) throw new Error('EventSub not connected');
    return await this.subscribeToSubscriptionEvents(userId);
  }
}

const eventSubService = new EventSubService();
module.exports = { eventSubService, EventSubService };