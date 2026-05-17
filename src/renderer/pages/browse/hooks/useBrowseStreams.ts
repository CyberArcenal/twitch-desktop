// src/pages/Browse/hooks/useBrowseStreams.ts
import { useState, useEffect, useCallback, useRef } from "react";
import twitchAPI from "../../../api/core/twitch";
import type { BrowseStream } from "../types";

export function useBrowseStreams() {
  const [streams, setStreams] = useState<BrowseStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(0);

  const loadStreams = useCallback(
    async (searchTerm: string, cursorParam?: string | null, isLoadMore = false) => {
      try {
        if (!isLoadMore) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        let response;
        if (searchTerm?.trim()) {
          response = await twitchAPI.searchChannels(searchTerm, cursorParam);
        } else {
          response = await twitchAPI.getStreams(undefined, cursorParam);
        }

        const newStreams = response.data || [];
        const newCursor = response.pagination?.cursor || null;

        if (isLoadMore) {
          setStreams((prev) => [...prev, ...newStreams]);
        } else {
          setStreams(newStreams);
        }

        setCursor(newCursor);
        setHasMore(!!newCursor);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load streams:", err);
        setError(err.message || "Failed to load streams");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadStreams(searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, loadStreams]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && cursor) {
      loadStreams(searchQuery, cursor, true);
    }
  }, [hasMore, loadingMore, cursor, searchQuery, loadStreams]);

  const retry = useCallback(() => {
    loadStreams(searchQuery);
  }, [searchQuery, loadStreams]);

  return {
    streams,
    loading,
    loadingMore,
    error,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
    retry,
  };
}