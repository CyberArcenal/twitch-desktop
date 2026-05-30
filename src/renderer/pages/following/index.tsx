// src/renderer/pages/following/index.tsx
import React from "react";
import { RefreshCw } from "lucide-react";
import { useFollowing } from "./hooks/useFollowing";
import FilterBar from "./components/FilterBar";
import EmptyState from "./components/EmptyState";
import Button from "../../components/UI/Button";
import FollowingGrid from "../../components/Shared/FollowingGrid";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";

const FollowingPage: React.FC = () => {
  const {
    channels,
    loading,
    refreshing,
    error,
    filters,
    updateFilter,
    resetFilters,
    refresh,
  } = useFollowing();

  const liveCount = channels.filter((c) => c.isLive).length;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Following</h1>
          <p className="text-sm text-[#adadb8] mt-1">
            {channels.length} channels followed • {liveCount} live now
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading || refreshing}
          icon={RefreshCw}
          iconPosition="left"
          className="bg-[#2a2a2e] hover:bg-[#3a3a4a] text-white border-none"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="medium" text="Loading your followed channels..." />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-[#1f1f23] rounded-xl">
          <p className="text-red-500 mb-2">Something went wrong</p>
          <p className="text-sm text-[#adadb8]">{error}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={refresh}
          >
            Try again
          </Button>
        </div>
      ) : channels.length === 0 ? (
        <EmptyState />
      ) : (
        <FollowingGrid channels={channels} />
      )}
    </div>
  );
};

export default FollowingPage;