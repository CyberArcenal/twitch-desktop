// src/pages/Following/hooks/useFollowedChannels.ts
import { useState, useEffect, useCallback } from "react";
import twitchAPI from "../../../api/core/twitch";
import type { ChannelWithStream } from "../types";

export function useFollowedChannels(userId: string | null) {
  const [channels, setChannels] = useState<ChannelWithStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadChannels = useCallback(
    async (cursorParam?: string | null, isLoadMore = false) => {
      if (!userId) return;

      try {
        if (!isLoadMore) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await twitchAPI.getFollowedChannels(
          userId,
          cursorParam || undefined
        );
        const followedData = response.data;
        const newCursor = response.pagination?.cursor || null;

        if (followedData.length === 0) {
          setHasMore(false);
          if (!isLoadMore) setChannels([]);
          return;
        }

        // Fetch stream info for these channels
        const userIds = followedData.map((ch) => ch.broadcaster_id);
        let streamsMap = new Map<string, any>();
        try {
          const streamsRes = await twitchAPI.getStreams(userIds);
          streamsRes.data.forEach((stream) => {
            streamsMap.set(stream.user_id, stream);
          });
        } catch (streamErr) {
          console.warn("Failed to fetch streams:", streamErr);
        }

        const newChannels: ChannelWithStream[] = followedData.map((ch) => {
          const stream = streamsMap.get(ch.broadcaster_id);
          return {
            id: ch.broadcaster_id,
            login: ch.broadcaster_login,
            displayName: ch.broadcaster_name,
            followedAt: ch.followed_at,
            isLive: !!stream,
            stream: stream
              ? {
                  title: stream.title,
                  gameName: stream.game_name,
                  viewerCount: stream.viewer_count,
                  thumbnailUrl: stream.thumbnail_url
                    .replace("{width}", "320")
                    .replace("{height}", "180"),
                }
              : undefined,
          };
        });

        if (isLoadMore) {
          setChannels((prev) => [...prev, ...newChannels]);
        } else {
          setChannels(newChannels);
        }
        setCursor(newCursor);
        setHasMore(!!newCursor);
      } catch (err: any) {
        setError(err.message || "Failed to load followed channels");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && cursor) {
      loadChannels(cursor, true);
    }
  }, [hasMore, loadingMore, cursor, loadChannels]);

  const retry = useCallback(() => {
    setError(null);
    loadChannels();
  }, [loadChannels]);

  // Auto-load when userId changes
  useEffect(() => {
    if (userId) {
      loadChannels();
    }
  }, [userId, loadChannels]);

  return {
    channels,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    retry,
  };
}