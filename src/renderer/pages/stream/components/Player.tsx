// src/renderer/pages/stream/components/Player.tsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from "react";

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

const Player = forwardRef<PlayerRef, PlayerProps>(
  ({ channelName, autoplay = true, onLoad }, ref) => {
    const webviewRef = useRef<HTMLWebViewElement>(null);

    // ✅ Attach event listener para sa load event ng webview
    useEffect(() => {
      const webview = webviewRef.current;
      if (!webview) return;

      const handleLoad = () => {
        console.log("[Player] webview did-finish-load");
        onLoad?.();
      };

      webview.addEventListener("did-finish-load", handleLoad);
      return () => {
        webview.removeEventListener("did-finish-load", handleLoad);
      };
    }, [onLoad]);

    const requestFullscreen = () => {
      webviewRef.current?.requestFullscreen();
    };

    useImperativeHandle(ref, () => ({
      play: () => console.log("[Player] play() not supported"),
      pause: () => console.log("[Player] pause() not supported"),
      setVolume: () => console.log("[Player] setVolume() not supported"),
      setMuted: () => console.log("[Player] setMuted() not supported"),
      setQuality: () => console.log("[Player] setQuality() not supported"),
      requestFullscreen,
    }));

    const parents = ["localhost", "127.0.0.1"];
    const parentParams = parents
      .map((p) => `parent=${encodeURIComponent(p)}`)
      .join("&");

    const src = `https://player.twitch.tv/?channel=${encodeURIComponent(
      channelName
    )}&${parentParams}&autoplay=${autoplay}&muted=false`;

    return (
      <webview
        ref={webviewRef}
        src={src}
        className="w-full h-full"
        style={{ border: "none", backgroundColor: "#000" }}
        allowfullscreen
        title={`${channelName} live stream`}
      />
    );
  }
);

export default Player;