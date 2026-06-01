// src/renderer/pages/stream/components/HlsPlayer.tsx
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  streamUrl: string;
  autoplay?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onPlaying?: () => void;
  onPause?: () => void;
}

export const HlsPlayer = ({ 
  streamUrl, 
  autoplay = true, 
  onLoad, 
  onError,
  onPlaying,
  onPause 
}: HlsPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current || !streamUrl) return;
    const video = videoRef.current;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Event listeners para sa play/pause
    const handlePlay = () => onPlaying?.();
    const handlePause = () => onPause?.();
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play().catch(e => console.warn('Autoplay failed', e));
        }
        onLoad?.(); // ✅ tawagin ang onLoad kapag handa na ang stream
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          onError?.(new Error(`HLS error: ${data.type}`));
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoplay) video.play().catch(e => console.warn('Autoplay failed', e));
        onLoad?.();
      }, { once: true });
      video.addEventListener('error', (e) => {
        onError?.(new Error('Failed to load stream'));
      });
    } else {
      onError?.(new Error('HLS not supported in this browser'));
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoplay, onLoad, onError, onPlaying, onPause]);

  return <video ref={videoRef} className="w-full h-full" controls />;
};