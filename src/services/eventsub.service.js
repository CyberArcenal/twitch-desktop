// src/main/services/eventsub.service.js
//@ts-check
// @ts-ignore
const { twitchApiService } = require("./twitch-api.service");
const { twitchAuthService } = require("./twitch-auth.service");
const { settingsService } = require("./settings.service");
const { BrowserWindow } = require("electron");
const WebSocket = require("ws");
const { notificationStore } = require("./notification-store.service");
const { logger } = require("../utils/logger");
const EventEmitter = require("events");

class EventSubService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.sessionId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.keepAliveInterval = null;
    this.subscriptions = new Map(); // subscriptionId -> { type, condition, userId }
    this.mainWindow = null;
    this.autoSubscriptionsCreated = false;
    logger.debug("[EventSubService] Constructor - instance created");
  }

  /**
   * @param {BrowserWindow | null} mainWindow
   */
  initialize(mainWindow) {
    this.mainWindow = mainWindow;
    logger.info("[EventSubService] Initialized with mainWindow");
  }

  /**
   * @param {string} channel
   * @param {{ broadcasterId?: any; broadcasterName?: any; title?: any; gameId?: any; startedAt?: any; followerId?: any; followerName?: any; followedAt?: any; userId?: any; userName?: any; tier?: any; isGift?: any; fromBroadcasterId?: any; fromBroadcasterName?: any; viewers?: any; toBroadcasterId?: any; level?: any; total?: any; progress?: any; goal?: any; sessionId?: any; code?: number; reason?: Buffer<ArrayBufferLike>; }} data
   */
 _sendToRenderers(channel, data) {
    try {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, data);
        }
      });
    } catch (error) {
      // If running outside Electron (e.g., tests), ignore
      logger.warn(
        "Failed to send IPC event (maybe not in Electron):",
        // @ts-ignore
        error.message,
      );
    }
  }

  async getAppAccessToken() {
    const token = twitchAuthService.getAccessToken();
    if (!token) {
      logger.error("[EventSubService] getAppAccessToken - no access token");
      throw new Error("Not authenticated");
    }
    logger.debug("[EventSubService] getAppAccessToken - token obtained");
    return token;
  }

  /**
   * @param {string} type
   * @param {string} version
   * @param {{ broadcaster_user_id?: any; moderator_user_id?: any; to_broadcaster_user_id?: any; }} condition
   */
  async createSubscription(type, version, condition, transport = null) {
    if (!this.sessionId) {
      throw new Error(
        "No active EventSub session – please wait for connection",
      );
    }
    logger.info(
      `[EventSubService] createSubscription - type=${type}, version=${version}, condition=${JSON.stringify(condition)}`,
    );
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
      logger.error(
        `[EventSubService] Failed to create subscription ${type}:`,
        error,
      );
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
    const data = await response.json();
    logger.info(`[EventSubService] Subscription created: ${data.data[0]?.id}`);
    return data.data[0];
  }

  /**
   * @param {any} subscriptionId
   */
  async deleteSubscription(subscriptionId) {
    logger.info(`[EventSubService] deleteSubscription - id=${subscriptionId}`);
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
      logger.error(
        `[EventSubService] Failed to delete subscription ${subscriptionId}: ${response.status}`,
      );
    } else {
      logger.debug(`[EventSubService] Deleted subscription ${subscriptionId}`);
    }
  }

  /**
   * @param {any} userId
   */
  async subscribeToStreamOnline(userId) {
    logger.info(`[EventSubService] subscribeToStreamOnline - userId=${userId}`);
    const subscription = await this.createSubscription("stream.online", "1", {
      broadcaster_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "stream.online",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    logger.info(
      `[EventSubService] Subscribed to stream.online for ${userId} (id=${subscription.id})`,
    );
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToStreamOffline(userId) {
    logger.info(
      `[EventSubService] subscribeToStreamOffline - userId=${userId}`,
    );
    const subscription = await this.createSubscription("stream.offline", "1", {
      broadcaster_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "stream.offline",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToFollowEvents(userId) {
    logger.info(`[EventSubService] subscribeToFollowEvents - userId=${userId}`);
    const subscription = await this.createSubscription("channel.follow", "2", {
      broadcaster_user_id: userId,
      moderator_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "channel.follow",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    logger.info(
      `[EventSubService] Subscribed to channel.follow for ${userId} (id=${subscription.id})`,
    );
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToSubscriptionEvents(userId) {
    logger.info(
      `[EventSubService] subscribeToSubscriptionEvents - userId=${userId}`,
    );
    const subscription = await this.createSubscription(
      "channel.subscribe",
      "1",
      {
        broadcaster_user_id: userId,
      },
    );
    this.subscriptions.set(subscription.id, {
      type: "channel.subscribe",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    logger.info(
      `[EventSubService] Subscribed to channel.subscribe for ${userId} (id=${subscription.id})`,
    );
    return subscription;
  }

  async ensureEssentialSubscriptions() {
    const userId = settingsService.get("twitch")?.userId;
    if (!userId) {
      logger.warn(
        "[EventSubService] No user logged in, cannot create subscriptions",
      );
      return;
    }
    if (this.autoSubscriptionsCreated) {
      logger.debug(
        "[EventSubService] Subscriptions already created for this session",
      );
      return;
    }
    try {
      await this.subscribeToFollowEvents(userId);
      await this.subscribeToSubscriptionEvents(userId);
      await this.subscribeToStreamOnline(userId);
      await this.subscribeToStreamOffline(userId);
      this.autoSubscriptionsCreated = true;
      logger.success("[EventSubService] Essential subscriptions created");
    } catch (err) {
      logger.error(
        "[EventSubService] Failed to create essential subscriptions:",
        // @ts-ignore
        err,
      );
    }
  }

  /**
   * @param {{ metadata: any; payload: any; }} message
   */
  handleEvent(message) {
    const { metadata, payload } = message;
    const eventType = metadata.subscription_type;
    const eventData = payload.event;

    logger.info(`[EventSubService] Received event: ${eventType}`, eventData);

    switch (eventType) {
      case "stream.online":
        this._sendToRenderers("eventsub:stream-online", {
          broadcasterId: eventData.broadcaster_user_id,
          broadcasterName: eventData.broadcaster_user_login,
          title: eventData.title,
          gameId: eventData.game_id,
          startedAt: eventData.started_at,
        });
        this.emit("eventsub:stream-online", eventData);
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
      case "stream.offline":
        this._sendToRenderers("eventsub:stream-offline", {
          broadcasterId: eventData.broadcaster_user_id,
          broadcasterName: eventData.broadcaster_user_login,
        });
        this.emit("eventsub:stream-offline", eventData);
        break;
      case "channel.follow":
        this._sendToRenderers("eventsub:follow", {
          followerId: eventData.user_id,
          followerName: eventData.user_login,
          followedAt: eventData.followed_at,
          broadcasterId: eventData.broadcaster_user_id,
        });
        this.emit("eventsub:follow", eventData);
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
        this.emit("eventsub:subscription", eventData);
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
      case "channel.raid":
        this._sendToRenderers("eventsub:raid", {
          fromBroadcasterId: eventData.from_broadcaster_user_id,
          fromBroadcasterName: eventData.from_broadcaster_user_login,
          viewers: eventData.viewers,
          toBroadcasterId: eventData.to_broadcaster_user_id,
        });
        this.emit("eventsub:raid", eventData);
        break;
      case "channel.hype_train.begin":
        this._sendToRenderers("eventsub:hype_train", {
          level: eventData.level,
          total: eventData.total,
          progress: eventData.progress,
          goal: eventData.goal,
        });
        this.emit("eventsub:hype_train", eventData);
        break;
      default:
        logger.warn(`[EventSubService] Unhandled event type: ${eventType}`);
    }
  }

  /**
   * @param {WebSocket.RawData} data
   */
  async handleWebSocketMessage(data) {
    const message = JSON.parse(data.toString());
    const msgType = message.metadata.message_type;
    logger.debug(`[EventSubService] WebSocket message type: ${msgType}`);
    switch (msgType) {
      case "session_welcome":
        this.sessionId = message.payload.session.id;
        this.connected = true;
        logger.info(
          `[EventSubService] WebSocket connected, session: ${this.sessionId}`,
        );
        this._sendToRenderers("eventsub:connected", {
          sessionId: this.sessionId,
        });
        await this.ensureEssentialSubscriptions();
        break;
      case "session_keepalive":
        // Walang kailangang gawin – huwag magpadala ng pong
        logger.debug(
          "[EventSubService] Keepalive received, no response needed.",
        );
        break;
      case "notification":
        this.handleEvent(message);
        break;
      case "session_reconnect":
        logger.warn(
          "[EventSubService] Reconnect requested, new URL:",
          message.payload.session.reconnect_url,
        );
        break;
      case "revocation":
        logger.warn(
          "[EventSubService] Subscription revoked:",
          message.payload.subscription,
        );
        this.subscriptions.delete(message.payload.subscription.id);
        break;
      default:
        logger.debug("[EventSubService] Unknown message type:", msgType);
    }
  }

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      logger.debug("[EventSubService] Already connected or connecting");
      return;
    }
    const wsUrl = "wss://eventsub.wss.twitch.tv/ws";
    logger.info(`[EventSubService] Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);
    this.ws.on("open", () => {
      logger.info("[EventSubService] WebSocket opened");
      this.reconnectAttempts = 0;
    });
    this.ws.on("message", (data) => this.handleWebSocketMessage(data));
    this.ws.on("error", (err) => {
      // @ts-ignore
      logger.error("[EventSubService] WebSocket error:", err);
    });
    this.ws.on("close", (code, reason) => {
      logger.warn(`[EventSubService] WebSocket closed: ${code} - ${reason}`);
      this.connected = false;
      this.sessionId = null;
      this.autoSubscriptionsCreated = false;
      this._sendToRenderers("eventsub:disconnected", { code, reason });
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        "[EventSubService] Max reconnect attempts reached, giving up",
      );
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    logger.info(
      `[EventSubService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );
    setTimeout(() => this.connect(), delay);
  }

  async resubscribeAll() {
    logger.info(
      `[EventSubService] Resubscribing to ${this.subscriptions.size} stored subscriptions`,
    );
    for (const [id, sub] of this.subscriptions.entries()) {
      try {
        let newSub;
        switch (sub.type) {
          case "stream.online":
            newSub = await this.subscribeToStreamOnline(sub.userId);
            break;
          case "stream.offline":
            newSub = await this.subscribeToStreamOffline(sub.userId);
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
        this.subscriptions.delete(id);
        this.subscriptions.set(newSub.id, { ...sub, id: newSub.id });
        logger.debug(
          `[EventSubService] Resubscribed ${sub.type} (old=${id}, new=${newSub.id})`,
        );
      } catch (err) {
        logger.error(
          `[EventSubService] Failed to resubscribe ${sub.type}:`,
          // @ts-ignore
          err,
        );
      }
    }
  }

  disconnect() {
    logger.info("[EventSubService] Disconnecting WebSocket");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.sessionId = null;
    this.autoSubscriptionsCreated = false;
  }

  start() {
    // ✅ Huwag nang magsimula kung may active o nagko-connect na WebSocket
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      logger.info(
        "[EventSubService] Already connected or connecting, skipping start",
      );
      return;
    }
    logger.info("[EventSubService] Starting EventSub service");
    this.connect();
  }

  stop() {
    logger.info("[EventSubService] Stopping EventSub service");
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

  /**
   * @param {any} userId
   */
  async subscribeToRaidEvents(userId) {
    const subscription = await this.createSubscription("channel.raid", "1", {
      to_broadcaster_user_id: userId,
    });
    this.subscriptions.set(subscription.id, {
      type: "channel.raid",
      condition: { to_broadcaster_user_id: userId },
      userId,
    });
    return subscription;
  }

  /**
   * @param {any} userId
   */
  async subscribeToHypeTrainEvents(userId) {
    const subscription = await this.createSubscription(
      "channel.hype_train.begin",
      "1",
      {
        broadcaster_user_id: userId,
      },
    );
    this.subscriptions.set(subscription.id, {
      type: "channel.hype_train.begin",
      condition: { broadcaster_user_id: userId },
      userId,
    });
    return subscription;
  }
}

const eventSubService = new EventSubService();
module.exports = { eventSubService, EventSubService };
