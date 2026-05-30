// src/renderer/pages/stream/index.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useStreamPlayer } from "./hooks/useStreamPlayer";
import Player from "./components/Player";
import ChatSidebar from "./components/ChatSidebar";
import StreamInfoCard from "./components/StreamInfoCard";
import ActivityFeedCard from "./components/ActivityFeedCard";
import QuickActionsCard from "./components/QuickActionsCard";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";

const StreamPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    stream,
    loading,
    error,
    isChatConnected,
    isPlayerReady,
    playerRef,
    setIsPlayerReady,
    setIsPlaying,
  } = useStreamPlayer();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0e0e10] p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Stream Unavailable
        </h2>
        <p className="text-[#adadb8] mb-4">{error || "Channel is offline"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#9147ff] rounded-lg text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0e0e10] gap-4 p-4 overflow-hidden">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col justify-between min-w-0 overflow-y-auto">
        {/* Player container */}
        <div className="rounded-xl w-full shadow-2xl bg-black overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <Player
              ref={playerRef}
              channelName={stream.user_login}
              autoplay
              onLoad={() => setIsPlayerReady(true)}
              onPlaying={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        </div>

        {/* 3‑column grid for cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StreamInfoCard stream={stream} />
          <ActivityFeedCard channelId={stream.user_id} />
          <QuickActionsCard stream={stream} onShare={() => {}} />
        </div>
      </div>

      {/* RIGHT COLUMN: Chat */}
      <div className="w-[380px] flex-shrink-0 rounded-xl shadow-lg overflow-hidden bg-[#1f1f23] border border-[#2a2a2e]">
        <ChatSidebar
          channelName={stream.user_login}
          isConnected={isChatConnected}
        />
      </div>
    </div>
  );
};

export default StreamPlayerPage;
