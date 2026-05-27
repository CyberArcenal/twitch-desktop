// src/renderer/pages/subscriptions/types.ts
export interface Subscriber {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  gifter_id?: string;
  gifter_login?: string;
  gifter_name?: string;
  tier: string;           // '1000' = Tier 1, '2000' = Tier 2, '3000' = Tier 3
  is_gift: boolean;
  user_id: string;
  user_login: string;
  user_name: string;
  plan_name?: string;
}

export interface SubscriberWithDetails extends Subscriber {
  profile_image_url?: string;
  tenureMonths?: number;
}