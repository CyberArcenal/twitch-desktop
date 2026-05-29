// src/renderer/pages/subscriptions/types.ts
import type { Subscription } from '../../api/core/user';

// Base subscriber = the subscription object from API
export interface Subscriber extends Subscription {
  profile_image_url?: string;   // added for UI (default avatar)
}

export interface SubscriberWithDetails extends Subscriber {
  tenureMonths?: number;        // optional, if you later compute subscription tenure
}