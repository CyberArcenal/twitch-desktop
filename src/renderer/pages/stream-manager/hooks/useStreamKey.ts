import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useStreamKey = () => {
  const [streamKey, setStreamKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      const res = await streamManagerAPI.getStoredStreamKey();
      if (res.status && res.data) setStreamKey(res.data);
    };
    loadKey();
  }, []);

  const saveKey = async () => {
    await streamManagerAPI.saveStreamKey(streamKey);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(streamKey);
  };

  const openDashboard = () => {
    window.backendAPI.openDashboard('https://dashboard.twitch.tv/settings/stream');
  };

  return {
    streamKey,
    setStreamKey,
    showKey,
    setShowKey,
    saveKey,
    copyKey,
    openDashboard,
  };
};