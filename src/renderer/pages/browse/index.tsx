// src/pages/Browse/index.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../../api/core/auth";
import { useBrowseStreams } from "./hooks/useBrowseStreams";
import { SearchBar } from "./components/SearchBar";
import { StreamCard } from "./components/StreamCard";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { LoadMoreButton } from "./components/LoadMoreButton";

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    streams,
    loading,
    loadingMore,
    error,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
    retry,
  } = useBrowseStreams();

  // Redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  const handleStreamClick = (login: string) => {
    navigate(`/stream/${login}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6">
        {/* Header with search */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Browse
          </h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {streams.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
              {streams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onClick={() => handleStreamClick(stream.user_login)}
                />
              ))}
            </div>

            {hasMore && <LoadMoreButton loading={loadingMore} onClick={loadMore} />}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;