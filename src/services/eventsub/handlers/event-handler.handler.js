const { sendToRenderers } = require('../../../utils/ipc-sender');
const { notificationStore } = require('../../notification-store');
const { logger } = require('../../../utils/logger');

function handleEvent(eventEmitter, message) {
  const { metadata, payload } = message;
  const eventType = metadata.subscription_type;
  const eventData = payload.event;

  logger.info(`[EventSub] Received event: ${eventType}`, eventData);

  switch (eventType) {
    case 'stream.online':
      sendToRenderers('eventsub:stream-online', {
        broadcasterId: eventData.broadcaster_user_id,
        broadcasterName: eventData.broadcaster_user_login,
        title: eventData.title,
        gameId: eventData.game_id,
        startedAt: eventData.started_at,
      });
      eventEmitter.emit('eventsub:stream-online', eventData);
      notificationStore.add({
        type: 'stream_online',
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
    case 'stream.offline':
      sendToRenderers('eventsub:stream-offline', {
        broadcasterId: eventData.broadcaster_user_id,
        broadcasterName: eventData.broadcaster_user_login,
      });
      eventEmitter.emit('eventsub:stream-offline', eventData);
      break;
    case 'channel.follow':
      sendToRenderers('eventsub:follow', {
        followerId: eventData.user_id,
        followerName: eventData.user_login,
        followedAt: eventData.followed_at,
        broadcasterId: eventData.broadcaster_user_id,
      });
      eventEmitter.emit('eventsub:follow', eventData);
      notificationStore.add({
        type: 'follow',
        title: 'New follower',
        message: `${eventData.user_login} followed you!`,
        data: {
          followerId: eventData.user_id,
          followerName: eventData.user_login,
          broadcasterId: eventData.broadcaster_user_id,
        },
      });
      break;
    case 'channel.subscribe':
      sendToRenderers('eventsub:subscription', {
        userId: eventData.user_id,
        userName: eventData.user_login,
        tier: eventData.tier,
        isGift: eventData.is_gift,
        broadcasterId: eventData.broadcaster_user_id,
      });
      eventEmitter.emit('eventsub:subscription', eventData);
      notificationStore.add({
        type: 'subscription',
        title: eventData.is_gift ? 'Gift subscription' : 'New subscription',
        message: `${eventData.user_login} subscribed with tier ${parseInt(eventData.tier) / 1000}${eventData.is_gift ? ' (gift)' : ''}`,
        data: {
          userId: eventData.user_id,
          userName: eventData.user_login,
          tier: eventData.tier,
          isGift: eventData.is_gift,
        },
      });
      break;
    case 'channel.raid':
      sendToRenderers('eventsub:raid', {
        fromBroadcasterId: eventData.from_broadcaster_user_id,
        fromBroadcasterName: eventData.from_broadcaster_user_login,
        viewers: eventData.viewers,
        toBroadcasterId: eventData.to_broadcaster_user_id,
      });
      eventEmitter.emit('eventsub:raid', eventData);
      break;
    case 'channel.hype_train.begin':
      sendToRenderers('eventsub:hype_train', {
        level: eventData.level,
        total: eventData.total,
        progress: eventData.progress,
        goal: eventData.goal,
      });
      eventEmitter.emit('eventsub:hype_train', eventData);
      break;
    default:
      logger.warn(`[EventSub] Unhandled event type: ${eventType}`);
  }
}

module.exports = { handleEvent };