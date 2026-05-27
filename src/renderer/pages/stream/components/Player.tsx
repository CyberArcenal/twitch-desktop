// src/renderer/pages/stream/components/Player.tsx
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

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
  onPlaying,
  onPause
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const fallbackIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
  const [scriptError, setScriptError] = React.useState(false);

  // Load Twitch Embed script
  useEffect(() => {
    if (document.getElementById('twitch-embed-script')) {
      setIsScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'twitch-embed-script';
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;
    script.onload = () => {
      console.log('[Player] Twitch embed script loaded');
      setIsScriptLoaded(true);
    };
    script.onerror = (err) => {
      console.error('[Player] Failed to load Twitch embed script', err);
      setScriptError(true);
    };
    document.body.appendChild(script);
  }, []);

  // Create player or fallback iframe
  useEffect(() => {
    if (!containerRef.current) return;
    if (!channelName || typeof channelName !== 'string' || channelName.trim() === '') {
      console.warn('[Player] Skipping: invalid channelName', channelName);
      return;
    }

    // Clean up previous player/iframe
    if (playerRef.current) {
      try {
        const iframe = containerRef.current?.querySelector('iframe');
        if (iframe) iframe.remove();
        playerRef.current = null;
      } catch (e) {}
    }
    if (fallbackIframeRef.current) {
      fallbackIframeRef.current.remove();
      fallbackIframeRef.current = null;
    }

    const parentHost = window.location.hostname || 'localhost';
    const src = `https://player.twitch.tv/?channel=${encodeURIComponent(channelName)}&parent=${parentHost}&autoplay=${autoplay}`;

    // If script failed or not loaded after timeout, use fallback iframe
    if (scriptError || (!isScriptLoaded && !window.Twitch)) {
      console.log('[Player] Using fallback iframe');
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.allowFullscreen = true;
      iframe.title = `${channelName} live stream`;
      containerRef.current.appendChild(iframe);
      fallbackIframeRef.current = iframe;
      onLoad?.();
      return;
    }

    // Use Twitch embed API
    const tryCreatePlayer = () => {
      // @ts-ignore
      const { Twitch } = window;
      if (!Twitch) {
        console.warn('[Player] Twitch global not available, retrying in 500ms');
        setTimeout(tryCreatePlayer, 500);
        return;
      }

      try {
        playerRef.current = new Twitch.Player(containerRef.current, {
          channel: channelName.trim(),
          parent: [parentHost],
          autoplay: false,
          muted: false,
          width: '100%',
          height: '100%'
        });

        playerRef.current.addEventListener(Twitch.Player.READY, () => {
          console.log('[Player] Twitch player ready');
          onLoad?.();
          if (autoplay) {
            setTimeout(() => {
              try { playerRef.current?.play(); } catch (e) { console.warn(e); }
            }, 200);
          }
        });
        playerRef.current.addEventListener(Twitch.Player.PLAY, () => onPlaying?.());
        playerRef.current.addEventListener(Twitch.Player.PAUSE, () => onPause?.());
      } catch (err) {
        console.error('[Player] Failed to create Twitch player, falling back to iframe', err);
        // Fallback to iframe
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.allowFullscreen = true;
        containerRef.current!.appendChild(iframe);
        fallbackIframeRef.current = iframe;
        onLoad?.();
      }
    };

    if (isScriptLoaded) {
      tryCreatePlayer();
    }
  }, [isScriptLoaded, scriptError, channelName, autoplay, onLoad, onPlaying, onPause]);

  // Expose methods (works for both embed and fallback iframe)
  useImperativeHandle(ref, () => ({
    play: () => {
      if (playerRef.current?.play) {
        playerRef.current.play();
      } else if (fallbackIframeRef.current) {
        // For iframe, we can't control via API, but we can try to send message (not reliable)
        console.log('[Player] Play requested on fallback iframe (no control)');
      }
    },
    pause: () => {
      if (playerRef.current?.pause) {
        playerRef.current.pause();
      }
    },
    setVolume: (level) => {
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(level);
      }
    },
    setMuted: (muted) => {
      if (playerRef.current?.setMuted) {
        playerRef.current.setMuted(muted);
      }
    },
    setQuality: (quality) => {
      if (playerRef.current?.setQuality) {
        playerRef.current.setQuality(quality);
      }
    },
    requestFullscreen: () => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe) iframe.requestFullscreen();
    }
  }));

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '360px', backgroundColor: '#000' }} />;
});

export default Player;