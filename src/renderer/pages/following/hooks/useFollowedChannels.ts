// src/pages/Following/hooks/useFollowedChannels.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import twitchAPI from "../../../api/core/twitch";
import authAPI from "../../../api/core/auth";
import type { ChannelWithStream } from "../types";

export function useFollowedChannels() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<ChannelWithStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID and check auth
  useEffect(() => {
    const init = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (!loggedIn) {
        navigate("/login");
        return;
      }
      const user = await authAPI.getCurrentUser();
      if (user?.id) {
        setUserId(user.id);
      } else {
        setError("Unable to get user information");
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const loadFollowedChannels = useCallback(
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
        const userIds = followedData.map((ch: any) => ch.broadcaster_id);
        let streamsMap = new Map();
        try {
          const streamsRes = await twitchAPI.getStreams(userIds);
          streamsRes.data.forEach((stream: any) => {
            streamsMap.set(stream.user_id, stream);
          });
        } catch (streamErr) {
          console.warn("Failed to fetch streams:", streamErr);
        }

        const newChannels: ChannelWithStream[] = followedData.map((ch: any) => {
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

  // Load initial followed channels once userId is available
  useEffect(() => {
    if (userId) {
      loadFollowedChannels();
    }
  }, [userId, loadFollowedChannels]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && cursor) {
      loadFollowedChannels(cursor, true);
    }
  }, [hasMore, loadingMore, cursor, loadFollowedChannels]);

  const retry = useCallback(() => {
    loadFollowedChannels();
  }, [loadFollowedChannels]);

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