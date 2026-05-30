// src/renderer/pages/stream/components/Player.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export interface PlayerRef {
  play: () => void;
  pause: () => void;
  setVolume: (level: number) => void;
  setMuted: (muted: boolean) => void;
  setQuality: (quality: string) => void;
  requestFullscreen: () => void;
}

interface PlayerProps {
  channelName: string;
  autoplay?: boolean;
  onLoad?: () => void;
  onPlaying?: () => void;
  onPause?: () => void;
}

const Player = forwardRef<PlayerRef, PlayerProps>(({
  channelName,
  autoplay = true,
  onLoad,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const parentHost = window.location.hostname || 'localhost';

  // Removed controls=false to show the default player controls
  const src = `https://player.twitch.tv/?channel=${encodeURIComponent(channelName)}&parent=${parentHost}&autoplay=${autoplay}`;

  const handleLoad = () => {
    onLoad?.();
  };

  useImperativeHandle(ref, () => ({
    play: () => console.log('[Player] play() not supported'),
    pause: () => console.log('[Player] pause() not supported'),
    setVolume: () => console.log('[Player] setVolume() not supported'),
    setMuted: () => console.log('[Player] setMuted() not supported'),
    setQuality: () => console.log('[Player] setQuality() not supported'),
    requestFullscreen: () => iframeRef.current?.requestFullscreen(),
  }));

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className="w-full h-full"
      style={{ border: 'none', backgroundColor: '#000' }}
      allowFullScreen
      title={`${channelName} live stream`}
      onLoad={handleLoad}
    />
  );
});

export default Player;