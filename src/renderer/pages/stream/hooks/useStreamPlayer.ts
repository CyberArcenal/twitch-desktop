// src/renderer/pages/stream/hooks/useStreamPlayer.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { streamsAPI, type Stream } from "../../../api/core/streams";
import { chatAPI } from "../../../api/core/chat";
import { watchLaterAPI, type WatchLaterItem } from "../../../api/core/watch-later";
import { historyAPI } from "../../../api/core/history";
import { showSuccess, showError } from "../../../utils/notification";
import type { PlayerRef } from "../components/Player";

export const useStreamPlayer = () => {
  const { login } = useParams<{ login: string }>();
  const navigate = useNavigate();

  // State declarations (always in same order)
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const historyAddedRef = useRef(false);

  // Fetch stream – this is a callback, not a hook
  const fetchStream = useCallback(async () => {
    if (!login) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await streamsAPI.getStreamByUserLogin(login);
      if (res.status && res.data) {
        setStream(res.data);
      } else {
        setError("Channel is not live right now");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Effect 1: fetch stream on mount/login change
  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Effect 2: add to history after 30 seconds (ONCE per stream)
  useEffect(() => {
    if (!stream) return;
    const timer = setTimeout(async () => {
      if (!historyAddedRef.current) {
        try {
          // console.log('[WatchHistory] Adding stream:', stream.user_name);
          await historyAPI.add({
            type: 'stream',
            channelName: stream.user_name,
            vodId: null,
            title: stream.title,
            thumbnail: stream.thumbnail_url?.replace('{width}', '320').replace('{height}', '180'),
            watchedAt: new Date().toISOString(),
            duration: null,
          });
          historyAddedRef.current = true;
          // console.log('[WatchHistory] Added successfully');
        } catch (err) {
          console.error('[WatchHistory] Error:', err);
        }
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [stream]); // Only depends on stream, no other changing values

  // Effect 3: connect chat when player ready
  useEffect(() => {
    if (!isPlayerReady || !login) return;
    const connectChat = async () => {
      try {
        await chatAPI.connect(login);
        setIsChatConnected(true);
      } catch (err: any) {
        showError(`Chat connection failed: ${err.message}`);
      }
    };
    connectChat();
    return () => {
      chatAPI.disconnect();
    };
  }, [isPlayerReady, login]);

  // Helper functions
  const addToWatchLater = async () => {
    if (!stream) return;
    const item: Omit<WatchLaterItem, "addedAt"> = {
      id: `stream_${stream.user_id}`,
      type: "stream",
      channelName: stream.user_name,
      title: stream.title,
      thumbnail: stream.thumbnail_url,
      url: `/stream/${stream.user_login}`,
    };
    const res = await watchLaterAPI.add(item);
    if (res.status) showSuccess("Added to Watch Later");
    else showError(res.message);
  };

  const goToChannel = () => navigate(`/channel/${login}`);

  return {
    stream,
    loading,
    error,
    isChatConnected,
    isPlayerReady,
    isPlaying,
    playerRef,
    setIsPlaying,
    setIsPlayerReady,
    addToWatchLater,
    goToChannel,
  };
};