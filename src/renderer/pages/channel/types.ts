import type { TwitchUser } from '../../api/core/user';
import type { Clip } from '../../api/core/clips';
import type { Stream } from '../../api/core/streams';

export interface Video {
  id: string;
  stream_id: string | null;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: 'archive' | 'highlight' | 'upload';
  duration: string;
}

export interface ScheduleSegment {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  category_id: string | null;
  category_name: string | null;
  is_recurring: boolean;
}

export interface ChannelData {
  user: TwitchUser;
  isFollowing: boolean;
  liveStream: Stream | null;
  recentVideos: Video[];
  clips: Clip[];
  schedule: ScheduleSegment[];
}