// src/renderer/pages/friends/types.ts
export interface FollowRelation {
  from_id: string;
  from_login: string;
  from_name: string;
  to_id: string;
  to_login: string;
  to_name: string;
  followed_at: string;
}

export interface MutualFriend {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  followed_at: string; // when you followed them
  isLive: boolean;
  liveGame?: string;
  liveTitle?: string;
  viewerCount?: number;
}