export interface NotificationPreferences {
  stream_live: boolean;
  new_follower: boolean;
  subscription: boolean;
  gift_sub: boolean;
  raid: boolean;
  hype_train: boolean;
}

export type NotificationType = keyof NotificationPreferences;