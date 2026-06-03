// src/renderer/pages/stream/components/LiveChannelsSwiper.tsx
import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { streamsAPI, type Stream } from "../../../api/core/streams";

import "swiper/css";
import "swiper/css/autoplay";

interface LiveChannelsSwiperProps {
  currentStreamLogin: string;
  gameId?: string;
}

const LiveChannelsSwiper: React.FC<LiveChannelsSwiperProps> = ({
  currentStreamLogin,
  gameId,
}) => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = gameId
          ? await streamsAPI.getTopStreamsWithFilters(12, undefined, gameId)
          : await streamsAPI.getTopStreams(12);
        if (res.status && res.data?.data) {
          const filtered = res.data.data.filter(
            (s) => s.user_login !== currentStreamLogin
          );
          setStreams(filtered.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch live streams", err);
      }
    };
    fetchStreams();
  }, [gameId, currentStreamLogin]);

  if (streams.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="bg-[#1f1f23] rounded-xl p-3 shadow-lg border border-[#2a2a2e] w-full max-h-[165px] h-full"
    >
      <h3 className="text-sm font-semibold text-white mb-2">
        Other Live Channels
      </h3>
      <div className="h-[110px]">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={12}
          slidesPerView="auto"
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={streams.length > 3}
          className="w-full h-full"
        >
          {streams.map((stream) => (
            <SwiperSlide
              key={stream.id}
              style={{ width: "130px" }} // fixed card width (150–180px range)
            >
              <button
                onClick={() => navigate(`/stream/${stream.user_login}`)}
                className="w-full text-left group"
              >
                <div className="relative rounded-lg overflow-hidden bg-[#0e0e10]">
                  <img
                    src={stream.thumbnail_url
                      .replace("{width}", "130")
                      .replace("{height}", "60")}
                    alt={stream.user_name}
                    className="w-full aspect-[16/9] object-cover group-hover:opacity-90 transition"
                  />
                  {/* Live badge */}
                  <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                    <span className="relative flex h-1 w-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-red-500"></span>
                    </span>
                    LIVE
                  </div>
                  {/* Viewer count */}
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5">
                    <Eye className="w-2 h-2" />
                    {stream.viewer_count.toLocaleString()}
                  </div>
                </div>
                <p className="text-white text-[11px] font-medium mt-1 truncate">
                  {stream.user_name}
                </p>
                <p className="text-[#adadb8] text-[9px] truncate">
                  {stream.game_name}
                </p>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default LiveChannelsSwiper;