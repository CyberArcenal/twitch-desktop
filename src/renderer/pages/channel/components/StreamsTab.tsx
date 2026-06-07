// src/renderer/pages/channel/components/StreamsTab.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Play, Calendar as CalendarIcon, Eye } from 'lucide-react';
import type { Video as VideoType } from '../types';

interface StreamsTabProps {
  liveStream: any;
  recentVideos: VideoType[];
}

const StreamsTab: React.FC<StreamsTabProps> = ({ liveStream, recentVideos }) => {
  const navigate = useNavigate();

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    const seconds = match[3] ? `${match[3]}s` : '';
    return `${hours} ${minutes} ${seconds}`.trim() || '0s';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Live Section */}
      {liveStream && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-red-500 rounded-full" />
            <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">Live Now</h3>
          </div>
          <div
            onClick={() => navigate(`/stream/${liveStream.user_login}`)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#9146ff]/20"
          >
            <div className="relative aspect-video">
              <img
                src={liveStream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720')}
                alt={liveStream.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-[#9146ff] rounded-full p-4 transform transition-transform group-hover:scale-110">
                  <Play className="w-8 h-8 text-white" fill="white" />
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" /> {liveStream.viewer_count.toLocaleString()}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <h4 className="text-white font-bold text-lg truncate">{liveStream.title}</h4>
              <p className="text-white/80 text-sm">{liveStream.game_name}</p>
            </div>
          </div>
        </section>
      )}

      {/* Past VODs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-[var(--primary-color)]" />
          <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">Past Broadcasts</h3>
        </div>
        {recentVideos.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)] bg-[var(--card-secondary-bg)] rounded-xl">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No past broadcasts available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recentVideos.map(video => (
              <div
                key={video.id}
                onClick={() => navigate(`/vod/${video.id}`)}
                className="group cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-[#9146ff]/50"
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180')}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-mono">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-[var(--sidebar-text)] line-clamp-2 text-sm">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-2">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(video.published_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StreamsTab;