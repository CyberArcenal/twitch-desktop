// src/renderer/pages/stream/hooks/useStreamPlayer.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { streamsAPI, type Stream } from "../../../api/core/streams";
import { chatAPI } from "../../../api/core/chat";
import {
  watchLaterAPI,
  type WatchLaterItem,
} from "../../../api/core/watch-later";
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
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  // Fetch stream info
  const fetchStream = useCallback(async () => {
    if (!login) {
      console.warn("[useStreamPlayer] No login param, aborting fetch");
      setLoading(false);
      return;
    }
    console.log("[useStreamPlayer] Fetching stream for login:", login);
    setLoading(true);
    try {
      const res = await streamsAPI.getStreamByUserLogin(login);
      console.log("[useStreamPlayer] API response:", res);
      if (res.status && res.data) {
        const streamData = res.data.data;
        if (streamData) {
          console.log("[useStreamPlayer] Stream data extracted:", streamData);
          setStream(streamData);
        } else {
          setError("Channel is not live right now");
        }
        console.log("[useStreamPlayer] Stream data received:", res.data);
        setStream(res.data);
      } else {
        console.warn("[useStreamPlayer] No stream data, setting error");
        setError("Channel is not live right now");
      }
    } catch (err: any) {
      console.error("[useStreamPlayer] Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Log when stream changes
  useEffect(() => {
    console.log("[useStreamPlayer] stream state changed:", stream);
  }, [stream]);

  // Connect to chat when player is ready
  useEffect(() => {
    if (!isPlayerReady || !login) return;
    console.log(
      "[useStreamPlayer] Player ready, connecting to chat for",
      login,
    );
    const connectChat = async () => {
      try {
        await chatAPI.connect(login);
        setIsChatConnected(true);
        console.log("[useStreamPlayer] Chat connected");
      } catch (err: any) {
        console.error("[useStreamPlayer] Chat connection failed:", err);
        showError(`Chat connection failed: ${err.message}`);
      }
    };
    connectChat();
    return () => {
      chatAPI.disconnect();
    };
  }, [isPlayerReady, login]);

  // Player control methods
  const handlePlay = () => playerRef.current?.play();
  const handlePause = () => playerRef.current?.pause();
  const handleVolumeChange = (val: number) =>
    playerRef.current?.setVolume(val / 100);
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    playerRef.current?.setMuted(newMuted);
    setIsMuted(newMuted);
  };
  const handleFullscreen = () => playerRef.current?.requestFullscreen();
  const handleQualityChange = (q: string) => playerRef.current?.setQuality(q);

  const handlePictureInPicture = () => {
    window.backendAPI.pip?.({ method: "create" });
    window.backendAPI.pip?.({
      method: "setSource",
      params: {
        streamUrl: `https://player.twitch.tv/?channel=${login}&parent=localhost`,
      },
    });
  };

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
    volume,
    isMuted,
    quality,
    isPlaying,
    playerRef,
    setIsPlaying,
    setIsPlayerReady,
    handlePlay,
    handlePause,
    handleVolumeChange,
    handleToggleMute,
    handleFullscreen,
    handlePictureInPicture,
    handleQualityChange,
    addToWatchLater,
    goToChannel,
  };
};
