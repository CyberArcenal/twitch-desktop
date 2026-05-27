// src/renderer/pages/following/types.ts

import type { FollowedChannel } from "../../api/core/follows";
import type { Stream } from "../../api/core/games";


export interface FollowingChannel extends FollowedChannel {
  stream?: Stream | null;
  isLive: boolean;
}

export type SortOption = 'name' | 'viewers' | 'followedAt';
export type FilterOption = 'all' | 'live' | 'offline';

export interface FollowingFilters {
  search: string;
  status: FilterOption;
  sortBy: SortOption;
}