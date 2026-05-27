// src/renderer/pages/dashboard/types.ts
// src/renderer/pages/dashboard/types.ts
import type { Stream } from '../../api/core/streams';
import type { FollowedChannel } from '../../api/core/follows';
import type { HistoryEntry } from '../../api/core/history';

export interface LiveFollowed extends FollowedChannel {
  stream: Stream;
}

export interface Recommendation {
  id: string;
  type: 'stream' | 'game';
  title: string;
  subtitle: string;
  thumbnail: string;
  url: string;
}

export interface DashboardStats {
  totalFollowed: number;
  totalHoursWatched: number;
  liveCount: number;
}