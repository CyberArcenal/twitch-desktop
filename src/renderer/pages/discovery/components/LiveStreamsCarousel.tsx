// src/renderer/pages/discovery/components/LiveStreamsCarousel.tsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Stream } from '../../../api/core/streams';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import LiveStreamCard from '../../browse/live/components/LiveStreamCard';
import 'swiper/css';
import 'swiper/css/navigation';

interface LiveStreamsCarouselProps {
  streams: Stream[];
  loading: boolean;
}

const LiveStreamsCarousel: React.FC<LiveStreamsCarouselProps> = ({ streams, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)]">
        No live streams available right now.
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next-live',
          prevEl: '.swiper-button-prev-live',
        }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="!px-1"
      >
        {streams.map((stream) => (
          <SwiperSlide key={stream.id}>
            <LiveStreamCard stream={stream} />
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="swiper-button-prev-live absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button className="swiper-button-next-live absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg">
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      <style>{`
        .swiper-button-prev-live,
        .swiper-button-next-live {
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .swiper-button-prev-live.swiper-button-disabled,
        .swiper-button-next-live.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default React.memo(LiveStreamsCarousel);