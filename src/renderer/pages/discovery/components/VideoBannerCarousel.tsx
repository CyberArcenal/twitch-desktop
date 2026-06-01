// src/renderer/pages/discovery/components/VideoBannerCarousel.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Stream } from "../../../api/core/streams";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface VideoBannerCarouselProps {
  streams: Stream[];
}

const VideoBannerCarousel: React.FC<VideoBannerCarouselProps> = ({
  streams,
}) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const webviewRef = useRef<HTMLWebViewElement>(null);

  // Update webview src when active stream changes
  useEffect(() => {
    if (streams.length === 0) return;
    const currentStream = streams[activeIndex];
    if (!currentStream || !webviewRef.current) return;

    const parents = ["localhost", "127.0.0.1"];
    const parentParams = parents
      .map((p) => `parent=${encodeURIComponent(p)}`)
      .join("&");
    const newSrc = `https://player.twitch.tv/?channel=${encodeURIComponent(
      currentStream.user_login
    )}&${parentParams}&autoplay=true&muted=true`;

    // Use direct property assignment instead of setAttribute for better reliability
    webviewRef.current.src = newSrc;
  }, [activeIndex, streams]);

  const handleSlideChange = (swiper: any) => {
    // Use realIndex to get the correct index even when loop is enabled
    const realIdx = swiper.realIndex;
    setActiveIndex(realIdx);
  };

  const handleBannerClick = () => {
    const activeStream = streams[activeIndex];
    if (activeStream) {
      navigate(`/stream/${activeStream.user_login}`);
    }
  };

  const initialStream = streams[0];
  const initialSrc = initialStream
    ? `https://player.twitch.tv/?channel=${encodeURIComponent(
        initialStream.user_login
      )}&parent=localhost&parent=127.0.0.1&autoplay=true&muted=true`
    : "";

  if (streams.length === 0) return null;

  return (
    <div className="relative w-full h-72 md:h-96 mb-8">
      {/* Background webview - not interactive directly */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
        <webview
          ref={webviewRef}
          src={initialSrc}
          className="w-full h-full"
          style={{
            border: "none",
            backgroundColor: "#000",
            pointerEvents: "none",
          }}
          allowFullScreen
          title="Live stream banner"
        />
      </div>

      {/* Clickable overlay for the whole banner area */}
      <div
        onClick={handleBannerClick}
        className="absolute inset-0 z-5 cursor-pointer"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-black/30 via-transparent to-transparent z-10 pointer-events-none" />

      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".swiper-button-next-banner",
          prevEl: ".swiper-button-prev-banner",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          el: ".swiper-pagination-banner",
        }}
        spaceBetween={16}
        slidesPerView={1.2}
        centeredSlides={true}
        onSlideChange={handleSlideChange}
        loop
        className="w-full h-full z-20"
      >
        {streams.map((stream) => (
          <SwiperSlide key={stream.id}>
            <div
              onClick={() => navigate(`/stream/${stream.user_login}`)}
              className="relative flex flex-col items-start justify-center h-full px-6 md:px-12 text-white rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "1rem",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
              }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                {stream.user_name}
              </h2>
              <p className="text-base md:text-lg max-w-2xl mb-2 drop-shadow truncate">
                {stream.title}
              </p>
              <p className="text-sm md:text-base text-[#adadb8] mb-4 drop-shadow">
                {stream.game_name} • {stream.viewer_count.toLocaleString()}{" "}
                viewers
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/stream/${stream.user_login}`);
                }}
                className="px-6 py-2.5 bg-[#9146ff] hover:bg-[#772ce8] rounded-full font-semibold transition shadow-lg"
              >
                Watch Now
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons - stop propagation to avoid banner click */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="swiper-button-prev-banner absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => e.stopPropagation()}
        className="swiper-button-next-banner absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#9146ff] hover:scale-110 transition-all duration-200 shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination with stop propagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="swiper-pagination-banner absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30"
      />

      <style>{`
        .swiper-pagination-banner .swiper-pagination-bullet {
          width: 32px;
          height: 4px;
          border-radius: 4px;
          background-color: rgba(255,255,255,0.5);
          opacity: 1;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .swiper-pagination-banner .swiper-pagination-bullet-active {
          background-color: #9146ff;
          width: 48px;
          box-shadow: 0 0 8px rgba(145,70,255,0.6);
        }
      `}</style>
    </div>
  );
};

export default React.memo(VideoBannerCarousel);