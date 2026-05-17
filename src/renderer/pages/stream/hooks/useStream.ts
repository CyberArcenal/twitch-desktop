// src/renderer/pages/WatchStreamPage/hooks/useStream.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import twitchAPI from '../../../api/core/twitch';
import authAPI from '../../../api/core/auth';
import type { StreamWithUser } from '../types';

export const useStream = () => {
  const { channel } = useParams<{ channel: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<StreamWithUser | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadStream = async () => {
      try {
        setLoading(true);
        const loggedIn = await authAPI.isLoggedIn();
        if (!loggedIn) {
          navigate('/login');
          return;
        }

        const userData = await authAPI.getCurrentUser();
        setUser(userData);

        if (!channel) {
          setError('Channel not found');
          return;
        }

        const streams = await twitchAPI.getStreams([channel]);
        if (streams.data.length === 0) {
          setError('Stream not found or channel is offline');
          return;
        }

        const streamData = streams.data[0] as StreamWithUser;
        setStream(streamData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load stream:', err);
        setError(err.message || 'Failed to load stream');
      } finally {
        setLoading(false);
      }
    };

    loadStream();
  }, [channel, navigate]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement actual follow/unfollow API
  };

  const handleShare = () => {
    // TODO: Implement share dialog
    console.log('Share stream');
  };

  const handleMore = () => {
    // TODO: Implement more options menu
    console.log('More options');
  };

  return {
    stream,
    user,
    loading,
    error,
    isFollowing,
    imageError,
    setImageError,
    handleFollow,
    handleShare,
    handleMore,
  };
};