// src/renderer/pages/discovery/components/WatchHistoryCarousel.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Tv, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HistoryEntry } from '../../../api/core/history';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import 'swiper/css';
import 'swiper/css/navigation';

interface WatchHistoryCarouselProps {
  history: HistoryEntry[];
  loading: boolean;
  isLoggedIn: boolean;
}

const WatchHistoryCarousel: React.FC<WatchHistoryCarouselProps> = ({ history, loading, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleHistoryClick = (entry: HistoryEntry) => {
    if (entry.type === 'stream') {
      navigate(`/stream/${entry.channelName}`);
    } else if (entry.type === 'vod' && entry.vodId) {
      navigate(`/vod/${entry.vodId}`);
    }
  };

  const getHistoryThumbnail = (entry: HistoryEntry) => {
    if (entry.thumbnail) return entry.thumbnail;
    return `https://static-cdn.jtvnw.net/previews-avatars/default-video-${entry.type === 'stream' ? 'live' : 'vod'}.jpg`;
  };

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)] bg-[var(--card-secondary-bg)] rounded-xl">
        <Flame className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Your watch history will appear here once you watch something.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: '.swiper-button-next-history',
          prevEl: '.swiper-button-prev-history',
        }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="!px-1"
      >
        {history.map((entry) => (
          <SwiperSlide key={entry.id}>
            <div
              onClick={() => handleHistoryClick(entry)}
              className="group cursor-pointer rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="relative aspect-video">
                <img
                  src={getHistoryThumbnail(entry)}
                  alt={entry.title || entry.channelName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="bg-[#9146ff] rounded-full p-3">
                    <Tv className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-[var(--sidebar-text)] truncate">
                  {entry.channelName}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {entry.title || (entry.type === 'vod' ? 'VOD' : 'Stream')}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Watched {new Date(entry.watchedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="swiper-button-prev-history absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button className="swiper-button-next-history absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg">
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      <style>{`
        .swiper-button-prev-history,
        .swiper-button-next-history {
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .swiper-button-prev-history.swiper-button-disabled,
        .swiper-button-next-history.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default React.memo(WatchHistoryCarousel);