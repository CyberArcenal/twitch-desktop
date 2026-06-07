const { twitchApiService } = require('../../twitch-api');
const { logger } = require('../../../utils/logger');

async function createSubscription(state, type, version, condition, transport = null) {
  if (!state.getSessionId()) {
    throw new Error('No active EventSub session – please wait for connection');
  }
  logger.info(`[EventSub] createSubscription - type=${type}, version=${version}, condition=${JSON.stringify(condition)}`);
  
  const body = {
    type,
    version,
    condition,
    transport: transport || {
      method: 'websocket',
      session_id: state.getSessionId(),
    },
  };
  
  const result = await twitchApiService.fetchTwitch('eventsub/subscriptions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  logger.info(`[EventSub] Subscription created: ${result.data[0]?.id}`);
  return result.data[0];
}

async function deleteSubscription(state, subscriptionId) {
  logger.info(`[EventSub] deleteSubscription - id=${subscriptionId}`);
  try {
    await twitchApiService.fetchTwitch(`eventsub/subscriptions?id=${subscriptionId}`, {
      method: 'DELETE',
    });
    logger.debug(`[EventSub] Deleted subscription ${subscriptionId}`);
  } catch (err) {
    if (err.message?.includes('404')) {
      logger.debug(`[EventSub] Subscription ${subscriptionId} already gone`);
    } else {
      logger.error(`[EventSub] Failed to delete subscription ${subscriptionId}:`, err);
    }
  }
}

async function subscribeToStreamOnline(state, userId) {
  logger.info(`[EventSub] subscribeToStreamOnline - userId=${userId}`);
  const subscription = await createSubscription(state, 'stream.online', '1', {
    broadcaster_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'stream.online',
    condition: { broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function subscribeToStreamOffline(state, userId) {
  logger.info(`[EventSub] subscribeToStreamOffline - userId=${userId}`);
  const subscription = await createSubscription(state, 'stream.offline', '1', {
    broadcaster_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'stream.offline',
    condition: { broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function subscribeToFollowEvents(state, userId) {
  logger.info(`[EventSub] subscribeToFollowEvents - userId=${userId}`);
  const subscription = await createSubscription(state, 'channel.follow', '2', {
    broadcaster_user_id: userId,
    moderator_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'channel.follow',
    condition: { broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function subscribeToSubscriptionEvents(state, userId) {
  logger.info(`[EventSub] subscribeToSubscriptionEvents - userId=${userId}`);
  const subscription = await createSubscription(state, 'channel.subscribe', '1', {
    broadcaster_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'channel.subscribe',
    condition: { broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function subscribeToRaidEvents(state, userId) {
  const subscription = await createSubscription(state, 'channel.raid', '1', {
    to_broadcaster_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'channel.raid',
    condition: { to_broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function subscribeToHypeTrainEvents(state, userId) {
  const subscription = await createSubscription(state, 'channel.hype_train.begin', '1', {
    broadcaster_user_id: userId,
  });
  state.addSubscription(subscription.id, {
    type: 'channel.hype_train.begin',
    condition: { broadcaster_user_id: userId },
    userId,
  });
  return subscription;
}

async function ensureEssentialSubscriptions(state) {
  const { settingsService } = require('../../settings');
  const userId = settingsService.get('twitch')?.userId;
  if (!userId) {
    logger.warn('[EventSub] No user logged in, cannot create subscriptions');
    return;
  }
  if (state.areAutoSubscriptionsCreated()) {
    logger.debug('[EventSub] Subscriptions already created for this session');
    return;
  }
  try {
    await subscribeToFollowEvents(state, userId);
    await subscribeToSubscriptionEvents(state, userId);
    await subscribeToStreamOnline(state, userId);
    await subscribeToStreamOffline(state, userId);
    state.setAutoSubscriptionsCreated(true);
    logger.success('[EventSub] Essential subscriptions created');
  } catch (err) {
    logger.error('[EventSub] Failed to create essential subscriptions:', err);
  }
}

async function resubscribeAll(state) {
  logger.info(`[EventSub] Resubscribing to ${state.getSubscriptions().size} stored subscriptions`);
  for (const [id, sub] of state.getSubscriptions().entries()) {
    try {
      let newSub;
      switch (sub.type) {
        case 'stream.online':
          newSub = await subscribeToStreamOnline(state, sub.userId);
          break;
        case 'stream.offline':
          newSub = await subscribeToStreamOffline(state, sub.userId);
          break;
        case 'channel.follow':
          newSub = await subscribeToFollowEvents(state, sub.userId);
          break;
        case 'channel.subscribe':
          newSub = await subscribeToSubscriptionEvents(state, sub.userId);
          break;
        default:
          continue;
      }
      state.deleteSubscription(id);
      state.addSubscription(newSub.id, { ...sub, id: newSub.id });
      logger.debug(`[EventSub] Resubscribed ${sub.type} (old=${id}, new=${newSub.id})`);
    } catch (err) {
      logger.error(`[EventSub] Failed to resubscribe ${sub.type}:`, err);
    }
  }
}

module.exports = {
  createSubscription,
  deleteSubscription,
  subscribeToStreamOnline,
  subscribeToStreamOffline,
  subscribeToFollowEvents,
  subscribeToSubscriptionEvents,
  subscribeToRaidEvents,
  subscribeToHypeTrainEvents,
  ensureEssentialSubscriptions,
  resubscribeAll,
};