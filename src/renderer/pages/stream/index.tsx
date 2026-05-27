// src/renderer/pages/stream/index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import Player from './components/Player';
import ChatSidebar from './components/ChatSidebar';
import StreamInfoBar from './components/StreamInfoBar';
import LiveRecommendations from './components/LiveRecommendations';

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
      <div className="flex justify-center items-center h-screen bg-[#0e0e10]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9147ff]" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0e0e10] p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Stream Unavailable</h2>
        <p className="text-[#adadb8] mb-4">{error || 'Channel is offline'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#9147ff] rounded-lg text-white">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0e0e10] overflow-hidden">
      {/* LEFT COLUMN: Video + Info + Recommendations */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="relative bg-black flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          <Player
            ref={playerRef}
            channelName={stream.user_login}
            autoplay
            onLoad={() => setIsPlayerReady(true)}
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        <StreamInfoBar stream={stream} />
        <LiveRecommendations 
          currentStreamLogin={stream.user_login} 
          gameId={stream.game_id} 
        />
      </div>

      {/* RIGHT COLUMN: Chat */}
      <div className="w-[340px] flex-shrink-0 bg-[#1f1f23] border-l border-[#2a2a2e] flex flex-col">
        <ChatSidebar channelName={stream.user_login} isConnected={isChatConnected} />
      </div>
    </div>
  );
};

export default StreamPlayerPage;