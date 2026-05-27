// src/renderer/pages/stream/hooks/useStreamPlayer.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { streamsAPI, type Stream } from "../../../api/core/streams";
import { chatAPI } from "../../../api/core/chat";
import { watchLaterAPI, type WatchLaterItem } from "../../../api/core/watch-later";
import { showSuccess, showError } from "../../../utils/notification";
import type { PlayerRef } from "../components/Player";

export const useStreamPlayer = () => {
  const { login } = useParams<{ login: string }>();
  console.log("[useStreamPlayer] URL param login =", login);
  
  const navigate = useNavigate();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

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

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

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