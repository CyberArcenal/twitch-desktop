// src/renderer/pages/stream/components/Player.tsx
import React, { useRef, useEffect } from 'react';

interface PlayerProps {
  channelName: string;
  autoplay?: boolean;
  onLoad?: () => void;
}

const Player: React.FC<PlayerProps> = ({ channelName, autoplay = true, onLoad }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => onLoad?.();
    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [onLoad]);

  const src = `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&autoplay=${autoplay}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className="w-full h-full"
      allowFullScreen
      title={`${channelName} live stream`}
    />
  );
};

export default Player;