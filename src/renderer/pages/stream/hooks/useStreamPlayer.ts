import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamsAPI, type Stream } from '../../../api/core/streams';
import { chatAPI } from '../../../api/core/chat';
import { playerAPI, type LoadStreamOptions } from '../../../api/core/player';
import { watchLaterAPI, type WatchLaterItem } from '../../../api/core/watch-later';
import { showSuccess, showError } from '../../../utils/notification';

export const useStreamPlayer = () => {
  const { login } = useParams<{ login: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch stream info
  const fetchStream = useCallback(async () => {
    if (!login) return;
    setLoading(true);
    try {
      const res = await streamsAPI.getStreamByUserLogin(login);
      if (res.status && res.data) {
        setStream(res.data);
      } else {
        // Channel may be offline – maybe redirect to channel page?
        setError('Channel is not live right now');
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

  // Load player when we have stream
  useEffect(() => {
    if (!stream) return;
    const loadPlayer = async () => {
      try {
        const options: LoadStreamOptions = { autoplay: true, quality };
        await playerAPI.loadStream(stream.user_login, options);
        setIsPlayerReady(true);
        setIsPlaying(true);
      } catch (err: any) {
        showError(`Failed to load player: ${err.message}`);
      }
    };
    loadPlayer();
    return () => {
      playerAPI.close();
    };
  }, [stream, quality]);

  // Connect to chat when player is ready
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

  // Listen to player events
  useEffect(() => {
    const onStateChange = (data: any) => {
      if (data.isPlaying !== undefined) setIsPlaying(data.isPlaying);
      if (data.volume !== undefined) setVolume(data.volume * 100);
      if (data.muted !== undefined) setIsMuted(data.muted);
    };
    const onQualityChange = (data: any) => {
      setQuality(data.quality);
    };
    window.backendAPI?.on?.('player:state-change', onStateChange);
    window.backendAPI?.on?.('player:quality-change', onQualityChange);
    return () => {
      window.backendAPI?.off?.('player:state-change', onStateChange);
      window.backendAPI?.off?.('player:quality-change', onQualityChange);
    };
  }, []);

  const handlePlay = () => playerAPI.play();
  const handlePause = () => playerAPI.pause();
  const handleVolumeChange = (val: number) => playerAPI.setVolume(val / 100);
  const handleToggleMute = () => playerAPI.toggleMute();
  const handleFullscreen = () => playerAPI.fullscreen();
  const handlePictureInPicture = () => {
    // Use pipAPI to open PiP window
    // For simplicity, we can open a new window with the same stream
    window.backendAPI.pip?.({ method: 'create' });
    window.backendAPI.pip?.({ method: 'setSource', params: { streamUrl: `https://player.twitch.tv/?channel=${login}&parent=localhost` } });
  };
  const handleQualityChange = (q: string) => playerAPI.setQuality(q);

  const addToWatchLater = async () => {
    if (!stream) return;
    const item: Omit<WatchLaterItem, 'addedAt'> = {
      id: `stream_${stream.user_id}`,
      type: 'stream',
      channelName: stream.user_name,
      title: stream.title,
      thumbnail: stream.thumbnail_url,
      url: `/stream/${stream.user_login}`,
    };
    const res = await watchLaterAPI.add(item);
    if (res.status) showSuccess('Added to Watch Later');
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