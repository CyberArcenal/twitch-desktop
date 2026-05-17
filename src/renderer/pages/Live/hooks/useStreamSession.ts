// src/pages/Live/hooks/useStreamSession.ts
import { useState, useEffect } from 'react';
import type { BroadcastSettingsType } from '../components/BroadcastSettings';

export interface StreamSession {
  isLive: boolean;
  settings: BroadcastSettingsType;
  startTime: Date | null;
  updateSettings: (newSettings: Partial<BroadcastSettingsType>) => void;
  startStream: () => void;
  stopStream: () => void;
}

const defaultSettings: BroadcastSettingsType = {
  title: 'My Awesome Stream!',
  gameName: 'Just Chatting',
  audioDevice: 'Default Microphone (Realtek)',
  videoDevice: 'Logitech C920',
  bitrate: 6000,
  encoder: 'NVENC H.264 (NVIDIA)',
  server: 'Auto (Recommended)',
};

export const useStreamSession = (): StreamSession => {
  const [isLive, setIsLive] = useState(false);
  const [settings, setSettings] = useState<BroadcastSettingsType>(() => {
    const saved = localStorage.getItem('streamSessionSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('streamSessionSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<BroadcastSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startStream = () => {
    setIsLive(true);
    setStartTime(new Date());
    // In a real app, you would call Electron main process to start OBS/Kiwi or send RTMP
    console.log('Stream started with settings:', settings);
  };

  const stopStream = () => {
    setIsLive(false);
    setStartTime(null);
    console.log('Stream stopped');
  };

  return {
    isLive,
    settings,
    startTime,
    updateSettings,
    startStream,
    stopStream,
  };
};