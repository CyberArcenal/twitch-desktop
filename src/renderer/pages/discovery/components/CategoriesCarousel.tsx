// src/renderer/pages/discovery/components/CategorySectionCarousel.tsx
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { streamsAPI, type Stream } from "../../../api/core/streams";
import LiveStreamCard from "../../browse/live/components/LiveStreamCard";
import "swiper/css";
import "swiper/css/navigation";
import LiveStreamCardSkeleton from "../../../components/Shared/LiveStreamCardSkeleton";

interface CategorySectionCarouselProps {
  gameId: string;
  categoryName: string;
  icon?: React.ReactNode;
}

const CategorySectionCarousel: React.FC<CategorySectionCarouselProps> = ({
  gameId,
  categoryName,
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        const res = await streamsAPI.getTopStreamsWithFilters(
          20,
          undefined,
          gameId,
        );
        if (res.status && res.data?.data) {
          setStreams(res.data.data);
        }
      } catch (err) {
        console.error(`Failed to fetch streams for ${categoryName}`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [gameId, categoryName]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <LiveStreamCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
        No live streams available for {categoryName}
      </div>
    );
  }

  return (
    <div className="relative group/section">
      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: `.swiper-button-next-${gameId}`,
          prevEl: `.swiper-button-prev-${gameId}`,
        }}
        spaceBetween={12}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
          1280: { slidesPerView: 5.2 },
        }}
        className="!px-1"
      >
        {streams.map((stream) => (
          <SwiperSlide key={stream.id}>
            <LiveStreamCard stream={stream} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation buttons */}
      <button
        className={`swiper-button-prev-${gameId} absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/section:opacity-100 transition-all hover:bg-[#9146ff] hover:scale-110 shadow-lg`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        className={`swiper-button-next-${gameId} absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/section:opacity-100 transition-all hover:bg-[#9146ff] hover:scale-110 shadow-lg`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CategorySectionCarousel;
