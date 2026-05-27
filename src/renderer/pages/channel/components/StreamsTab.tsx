import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Play } from 'lucide-react';
import type { Video as VideoType } from '../types';

interface StreamsTabProps {
  liveStream: any;
  recentVideos: VideoType[];
}

const StreamsTab: React.FC<StreamsTabProps> = ({ liveStream, recentVideos }) => {
  const navigate = useNavigate();

  const formatDuration = (duration: string) => {
    // duration format: PT1H2M3S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    const seconds = match[3] ? `${match[3]}s` : '';
    return `${hours} ${minutes} ${seconds}`.trim();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Live section if live */}
      {liveStream && (
        <div>
          <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-3">Live Now</h3>
          <div
            onClick={() => navigate(`/stream/${liveStream.user_login}`)}
            className="group relative rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={liveStream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720')}
              alt={liveStream.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <h4 className="text-white font-bold text-lg">{liveStream.title}</h4>
              <p className="text-white/80 text-sm">{liveStream.game_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Past VODs */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-3">Past Broadcasts</h3>
        {recentVideos.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">No past broadcasts available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map(video => (
              <div
                key={video.id}
                onClick={() => navigate(`/vod/${video.id}`)}
                className="cursor-pointer group rounded-lg overflow-hidden bg-[var(--card-secondary-bg)] hover:scale-105 transition"
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-[var(--sidebar-text)] truncate">{video.title}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(video.published_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamsTab;