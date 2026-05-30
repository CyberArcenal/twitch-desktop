// src/renderer/pages/stream/components/RecommendedVideoSlider.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { streamsAPI, type Stream } from '../../../api/core/streams';

interface RecommendedVideoSliderProps {
  currentStreamLogin: string;
  gameId?: string;
}

const RecommendedVideoSlider: React.FC<RecommendedVideoSliderProps> = ({ currentStreamLogin, gameId }) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await streamsAPI.getTopStreamsWithFilters(20, undefined, gameId);
      if (response.status && response.data?.data) {
        let allStreams = response.data.data;
        allStreams = allStreams.filter(s => s.user_login !== currentStreamLogin);
        setStreams(allStreams.slice(0, 10));
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoading(false);
    }
  }, [gameId, currentStreamLogin]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Auto‑play logic
  useEffect(() => {
    if (!isAutoPlaying || streams.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % streams.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, streams.length]);

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + streams.length) % streams.length);
    // Reset auto‑play timer (optional: restart interval)
    restartAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % streams.length);
    restartAutoPlay();
  };

  const restartAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (isAutoPlaying) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex(prev => (prev + 1) % streams.length);
        }, 5000);
      }
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev);
  };

  if (loading || streams.length === 0) return null;

  const currentStream = streams[currentIndex];

  return (
    <div className="bg-[#1f1f23] rounded-xl shadow-lg border border-[#2a2a2e] overflow-hidden h-full flex flex-col">
      {/* Thumbnail area */}
      <div className="relative flex-1">
        <img
          src={currentStream.thumbnail_url.replace('{width}', '480').replace('{height}', '270')}
          alt={currentStream.user_name}
          className="w-full h-full object-cover"
        />
        {/* Live badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE
        </div>
        {/* Viewer count */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {currentStream.viewer_count.toLocaleString()}
        </div>
        {/* Overlay info (visible always) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-bold text-sm truncate">{currentStream.user_name}</p>
          <p className="text-[#adadb8] text-xs truncate">{currentStream.game_name}</p>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#2a2a2e] bg-[#1f1f23]">
        <div className="flex gap-1">
          <button
            onClick={goToPrev}
            className="p-1 rounded-full hover:bg-[#2a2a2e] transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="p-1 rounded-full hover:bg-[#2a2a2e] transition"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-xs text-[#adadb8]">
          {currentIndex + 1} / {streams.length}
        </div>
        <button
          onClick={toggleAutoPlay}
          className="p-1 rounded-full hover:bg-[#2a2a2e] transition"
          aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
        >
          {isAutoPlaying ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
        </button>
      </div>

      {/* Clickable link (entire card) */}
      <a
        href={`/stream/${currentStream.user_login}`}
        className="absolute inset-0 z-10"
        aria-label={`Watch ${currentStream.user_name}`}
      />
    </div>
  );
};

export default RecommendedVideoSlider;