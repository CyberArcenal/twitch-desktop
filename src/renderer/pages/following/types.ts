// src/pages/Following/types.ts
export interface ChannelWithStream {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl?: string;
  followedAt: string;
  isLive: boolean;
  stream?: {
    title: string;
    gameName: string;
    viewerCount: number;
    thumbnailUrl: string;
  };
}