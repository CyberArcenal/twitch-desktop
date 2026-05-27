// src/main/services/eventsub.service.js
//@ts-check
// @ts-ignore
const { twitchApiService } = require("./twitch-api.service");
const { twitchAuthService } = require("./twitch-auth.service");
// @ts-ignore
const { settingsService } = require("./settings.service");
const { BrowserWindow } = require("electron");
const WebSocket = require("ws");
const { notificationStore } = require("./notification-store.service");

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

  /**
   * @param {BrowserWindow | null} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    console.log("[EventSubService] Initialized");
  }

  /**
   * @param {string} channel
   * @param {{ broadcasterId?: any; broadcasterName?: any; title?: any; gameId?: any; startedAt?: any; followerId?: any; followerName?: any; followedAt?: any; userId?: any; userName?: any; tier?: any; isGift?: any; sessionId?: any; code?: number; reason?: Buffer<ArrayBufferLike>; }} data
   */
  _sendToRenderers(channel, data) {
    try {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) win.webContents.send(channel, data);
      });
    } catch (err) {
      console.warn("[EventSubService] send error:", err);
    }
  }

  async getAppAccessToken() {
    // For now, use the user's access token (needs appropriate scopes)
    // In production, you'd get an app access token using client credentials
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  }

  /**
   * @param {string} type
   * @param {string} version
   * @param {{ broadcaster_user_id: any; moderator_user_id?: any; }} condition
   */
  async createSubscription(type, version, condition, transport = null) {
    const token = await this.getAppAccessToken();
    const { CLIENT_ID } = require("../shared/config");
    const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
    const body = {
      type,
      version,
      condition,
      transport: transport || {
        method: "websocket",
        session_id: this.sessionId,
      },
    };
    const response = await fetch(url, {
      method: "POST",
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
    const data = await response.json();
    return data.data[0];
  }

  /**
   * @param {any} subscriptionId
   */
  async deleteSubscription(subscriptionId) {
    const token = await this.getAppAccessToken();
    const { CLIENT_ID } = require("../shared/config");
    const url = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subscriptionId}`;
    const response = await fetch(url, {
      method: "DELETE",
      // @ts-ignore
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": CLIENT_ID,
      },
    });
    if (!response.ok && response.status !== 404) {
      console.error(
        `Failed to delete subscription ${subscriptionId}: ${response.status}`,
      );
    }
  }

  /**
   * @param {any} userId
   */
  async subscribeToStreamOnline(userId) {
    const subscription = await this.createSubscription("stream.online", "1", {
      broadcaster_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "stream.online",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    console.log(`[EventSub] Subscribed to stream.online for ${userId}`);
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToFollowEvents(userId) {
    // Requires moderator:read:followers scope
    const subscription = await this.createSubscription("channel.follow", "2", {
      broadcaster_user_id: userId,
      moderator_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "channel.follow",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    console.log(`[EventSub] Subscribed to channel.follow for ${userId}`);
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToSubscriptionEvents(userId) {
    // Requires channel:read:subscriptions scope
    const subscription = await this.createSubscription(
      "channel.subscribe",
      "1",
      { broadcaster_user_id: userId },
    );
    this.subscriptions.set(subscription.id, {
      type: "channel.subscribe",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    console.log(`[EventSub] Subscribed to channel.subscribe for ${userId}`);
    return subscription;
  }

  /**
   * @param {{ metadata: any; payload: any; }} message
   */
  handleEvent(message) {
    const { metadata, payload } = message;
    const eventType = metadata.subscription_type;
    const eventData = payload.event;

    console.log(`[EventSub] Received event: ${eventType}`, eventData);

    switch (eventType) {
      case "stream.online":
        this._sendToRenderers("eventsub:stream-online", {
          broadcasterId: eventData.broadcaster_user_id,
          broadcasterName: eventData.broadcaster_user_login,
          title: eventData.title,
          gameId: eventData.game_id,
          startedAt: eventData.started_at,
        });
        notificationStore.add({
          type: "stream_online",
          title: `${eventData.broadcaster_user_login} is live!`,
          message: eventData.title,
          data: {
            broadcasterId: eventData.broadcaster_user_id,
            broadcasterName: eventData.broadcaster_user_login,
            title: eventData.title,
            gameId: eventData.game_id,
          },
        });
        break;
      case "channel.follow":
        this._sendToRenderers("eventsub:follow", {
          followerId: eventData.user_id,
          followerName: eventData.user_login,
          followedAt: eventData.followed_at,
          broadcasterId: eventData.broadcaster_user_id,
        });
        notificationStore.add({
          type: "follow",
          title: "New follower",
          message: `${eventData.user_login} followed you!`,
          data: {
            followerId: eventData.user_id,
            followerName: eventData.user_login,
            broadcasterId: eventData.broadcaster_user_id,
          },
        });
        break;
      case "channel.subscribe":
        this._sendToRenderers("eventsub:subscription", {
          userId: eventData.user_id,
          userName: eventData.user_login,
          tier: eventData.tier,
          isGift: eventData.is_gift,
          broadcasterId: eventData.broadcaster_user_id,
        });
        notificationStore.add({
          type: "subscription",
          title: eventData.is_gift ? "Gift subscription" : "New subscription",
          message: `${eventData.user_login} subscribed with tier ${parseInt(eventData.tier) / 1000}${eventData.is_gift ? " (gift)" : ""}`,
          data: {
            userId: eventData.user_id,
            userName: eventData.user_login,
            tier: eventData.tier,
            isGift: eventData.is_gift,
          },
        });
        break;
      default:
        console.log(`[EventSub] Unhandled event type: ${eventType}`);
    }
  }

  /**
   * @param {WebSocket.RawData} data
   */
  async handleWebSocketMessage(data) {
    const message = JSON.parse(data.toString());
    switch (message.metadata.message_type) {
      case "session_welcome":
        this.sessionId = message.payload.session.id;
        this.connected = true;
        console.log(
          `[EventSub] WebSocket connected, session: ${this.sessionId}`,
        );
        this._sendToRenderers("eventsub:connected", {
          sessionId: this.sessionId,
        });
        // Resubscribe to previously stored subscriptions if any
        await this.resubscribeAll();
        break;
      case "session_keepalive":
        // Send pong to keep connection alive (not required by spec, but we can respond)
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "pong" }));
        }
        break;
      case "notification":
        this.handleEvent(message);
        break;
      case "session_reconnect":
        console.log(
          "[EventSub] Reconnect requested, new URL:",
          message.payload.session.reconnect_url,
        );
        // Optionally reconnect using provided URL
        break;
      case "revocation":
        console.warn(
          "[EventSub] Subscription revoked:",
          message.payload.subscription,
        );
        // Remove from our map
        this.subscriptions.delete(message.payload.subscription.id);
        break;
      default:
        console.log(
          "[EventSub] Unknown message type:",
          message.metadata.message_type,
        );
    }
  }

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      console.log("[EventSub] Already connected or connecting");
      return;
    }

    const wsUrl = "wss://eventsub.wss.twitch.tv/ws";
    this.ws = new WebSocket(wsUrl);
    this.ws.on("open", () => {
      console.log("[EventSub] WebSocket opened");
      this.reconnectAttempts = 0;
    });
    this.ws.on("message", (data) => this.handleWebSocketMessage(data));
    this.ws.on("error", (err) => {
      console.error("[EventSub] WebSocket error:", err);
    });
    this.ws.on("close", (code, reason) => {
      console.log(`[EventSub] WebSocket closed: ${code} - ${reason}`);
      this.connected = false;
      this.sessionId = null;
      this._sendToRenderers("eventsub:disconnected", { code, reason });
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[EventSub] Max reconnect attempts reached, giving up");
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    console.log(
      `[EventSub] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );
    setTimeout(() => this.connect(), delay);
  }

  async resubscribeAll() {
    for (const [id, sub] of this.subscriptions.entries()) {
      try {
        // Refresh each subscription
        let newSub;
        switch (sub.type) {
          case "stream.online":
            newSub = await this.subscribeToStreamOnline(sub.userId);
            break;
          case "channel.follow":
            newSub = await this.subscribeToFollowEvents(sub.userId);
            break;
          case "channel.subscribe":
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

  /**
   * @param {any} userId
   */
  async subscribeToStream(userId) {
    if (!this.sessionId) throw new Error("EventSub not connected");
    return await this.subscribeToStreamOnline(userId);
  }

  /**
   * @param {any} userId
   */
  async subscribeToFollows(userId) {
    if (!this.sessionId) throw new Error("EventSub not connected");
    return await this.subscribeToFollowEvents(userId);
  }

  /**
   * @param {any} userId
   */
  async subscribeToSubscriptions(userId) {
    if (!this.sessionId) throw new Error("EventSub not connected");
    return await this.subscribeToSubscriptionEvents(userId);
  }
}

const eventSubService = new EventSubService();
module.exports = { eventSubService, EventSubService };
