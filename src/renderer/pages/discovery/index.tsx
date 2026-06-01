// src/renderer/pages/discovery/index.tsx
import React, { useEffect, useState } from "react";
import { Gamepad2, History, Tv } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDiscoveryData } from "./hooks/useDiscoveryData";
import VideoBannerCarousel from "./components/VideoBannerCarousel";
import LiveStreamsCarousel from "./components/LiveStreamsCarousel";
import WatchHistoryCarousel from "./components/WatchHistoryCarousel";
import LoginPrompt from "./components/LoginPrompt";
import { gamesAPI, type Game } from "../../api/core/games";
import CategorySectionCarousel from "./components/CategoriesCarousel";
import { LazySection } from "./components/LazySection";
import CategoriesCarousel from "./components/CategoriesCarousel";

// Limit initial visible sections to 4 (para hindi sabay-sabay lahat)
const INITIAL_VISIBLE_SECTIONS = 4;

const HARDCODED_CATEGORIES: { id: string; name: string }[] = [
  { id: "743", name: "Chess" },
  { id: "516575", name: "Team FPS" },
  { id: "509658", name: "Just Chatting" },
  { id: "21779", name: "MOBA Games" },
  { id: "18122", name: "MMORPGs" },
  { id: "33214", name: "Creative" },
  { id: "26936", name: "Music" },
];

const DiscoveryPage: React.FC = () => {
  const {
    topStreams,
    categories: globalCategories,
    watchHistory,
    isLoggedIn,
    loadingStreams,
    loadingCategories,
    loadingHistory,
    error,
  } = useDiscoveryData();

  const [dynamicCategories, setDynamicCategories] = useState<Game[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDynamicCategories = async () => {
      setLoadingDynamic(true);
      try {
        const res = await gamesAPI.getTopGames(10);
        if (res.status && res.data?.data) {
          setDynamicCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic categories", err);
      } finally {
        setLoadingDynamic(false);
      }
    };
    fetchDynamicCategories();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#9146ff] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Pagsamahin ang lahat ng category sections (hardcoded + dynamic)
  const allCategorySections = [
    ...HARDCODED_CATEGORIES.map(cat => ({ type: 'hardcoded' as const, ...cat })),
    ...dynamicCategories.map(cat => ({ type: 'dynamic' as const, id: cat.id, name: cat.name })),
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)] pb-10 overflow-x-hidden">
      {!loadingStreams && topStreams.length > 0 && (
        <VideoBannerCarousel streams={topStreams.slice(0, 5)} />
      )}

      <div className="px-4 md:px-8 space-y-12">
        {/* Live Now Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Tv className="w-6 h-6 text-[#9146ff]" />
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)]">
                Live Now
              </h2>
            </div>
            <button
              onClick={() => navigate("/browse/live")}
              className="text-sm text-[var(--text-secondary)] hover:text-[#9146ff] transition"
            >
              View all →
            </button>
          </div>
          <LiveStreamsCarousel streams={topStreams} loading={loadingStreams} />
        </section>

        {/* Category Sections - Lazy Loaded para hindi sabay-sabay */}
        {allCategorySections.map((category, idx) => (
          <LazySection key={`${category.type}-${category.id}`}>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-[#9146ff]" />
                <h2 className="text-xl font-semibold text-[var(--sidebar-text)]">
                  {category.name}
                </h2>
              </div>
              <CategorySectionCarousel
                gameId={category.id}
                categoryName={category.name}
              />
            </section>
          </LazySection>
        ))}

        {/* Popular Categories (grid) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-[#9146ff]" />
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)]">
                Popular Categories
              </h2>
            </div>
            <button
              onClick={() => navigate("/browse/categories")}
              className="text-sm text-[var(--text-secondary)] hover:text-[#9146ff] transition"
            >
              View all →
            </button>
          </div>
          <CategoriesCarousel
            categories={globalCategories}
            loading={loadingCategories}
          />
        </section>

        {/* Watch History */}
        {isLoggedIn && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-[#9146ff]" />
                <h2 className="text-2xl font-bold text-[var(--sidebar-text)]">
                  Continue Watching
                </h2>
              </div>
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-[var(--text-secondary)] hover:text-[#9146ff] transition"
              >
                View all →
              </button>
            </div>
            <WatchHistoryCarousel
              history={watchHistory}
              loading={loadingHistory}
              isLoggedIn={isLoggedIn}
            />
          </section>
        )}

        {!isLoggedIn && <LoginPrompt />}
      </div>
    </div>
  );
};

export default DiscoveryPage;