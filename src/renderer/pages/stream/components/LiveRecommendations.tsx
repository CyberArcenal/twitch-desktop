// src/renderer/pages/stream/components/LiveRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Gamepad2 } from 'lucide-react';
import { streamsAPI, type Stream } from '../../../api/core/streams';

interface LiveRecommendationsProps {
  currentStreamLogin?: string;
  gameId?: string;
}

const LiveRecommendations: React.FC<LiveRecommendationsProps> = ({ currentStreamLogin, gameId }) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let response;
        if (gameId) {
          // Get streams by same game
          response = await streamsAPI.getTopStreamsWithFilters(12, undefined, gameId);
        } else {
          // Fallback to top streams
          response = await streamsAPI.getTopStreams(12);
        }
        if (response.status && response.data?.data) {
          let allStreams = response.data.data;
          // Filter out current stream if present
          if (currentStreamLogin) {
            allStreams = allStreams.filter(s => s.user_login !== currentStreamLogin);
          }
          setStreams(allStreams.slice(0, 12));
        } else {
          setError('No recommendations available');
        }
      } catch (err) {
        console.error('Failed to load recommendations', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [gameId, currentStreamLogin]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-white text-sm">Loading recommendations...</div>
      </div>
    );
  }

  if (error || streams.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 border-t border-[#2a2a2e] mt-4">
      <h3 className="text-white font-semibold text-base mb-3">Recommended Live Channels</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {streams.map((stream) => (
          <Link
            key={stream.id}
            to={`/stream/${stream.user_login}`}
            className="group block rounded-lg overflow-hidden bg-[#1f1f23] hover:bg-[#2a2a2e] transition-colors"
          >
            <div className="relative aspect-video">
              <img
                src={stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')}
                alt={stream.title}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                {stream.viewer_count?.toLocaleString()}
              </div>
            </div>
            <div className="p-2">
              <p className="text-white text-sm font-medium truncate">{stream.user_name}</p>
              <p className="text-[#adadb8] text-xs truncate">{stream.game_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LiveRecommendations;