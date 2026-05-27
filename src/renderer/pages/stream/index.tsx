// src/renderer/pages/stream/index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Users, Gamepad2, Calendar } from 'lucide-react';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import Player from './components/Player';
import ChatSidebar from './components/ChatSidebar';
import ChannelInfo from './components/ChannelInfo';
import PlayerControls from './components/PlayerControls';

const StreamPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    stream,
    loading,
    error,
    isChatConnected,
    isPlayerReady,
    volume,
    isMuted,
    quality,
    isPlaying,
    playerRef,
    setIsPlayerReady,
    setIsPlaying,
    handlePlay,
    handlePause,
    handleVolumeChange,
    handleToggleMute,
    handleFullscreen,
    handlePictureInPicture,
    handleQualityChange,
    addToWatchLater,
    goToChannel,
  } = useStreamPlayer();
 console.log("[StreamPlayerPage] Render state:", { loading, error, stream: stream?.user_login });
  if (loading) {
     console.log("[StreamPlayerPage] Showing loading spinner");
    return (
      <div className="flex justify-center items-center h-screen bg-[#0e0e10]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9147ff]" />
      </div>
    );
  }

  if (error || !stream) {
       console.log("[StreamPlayerPage] Showing error or offline message, stream =", stream);
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
  console.log("[StreamPlayerPage] Rendering player for channel:", stream.user_login);
  return (
    <div className="flex flex-col h-screen bg-[#0e0e10]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f1f23] border-b border-[#2a2a2e]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#adadb8] hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#adadb8]">
            <Users className="w-4 h-4" />
            <span>{stream.viewer_count?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#adadb8]">
            <Gamepad2 className="w-4 h-4" />
            <span>{stream.game_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#adadb8]">
            <Calendar className="w-4 h-4" />
            <span>Live since {new Date(stream.started_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main content: video + chat */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-black group">
     {stream?.user_login && (
  <Player
    ref={playerRef}
    channelName={stream.user_login}
    autoplay
    onLoad={() => setIsPlayerReady(true)}
    onPlaying={() => setIsPlaying(true)}
    onPause={() => setIsPlaying(false)}
  />
)}
          <PlayerControls
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            onPlay={handlePlay}
            onPause={handlePause}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onFullscreen={handleFullscreen}
            onPictureInPicture={handlePictureInPicture}
            onAddToWatchLater={addToWatchLater}
            onGoToChannel={goToChannel}
            quality={quality}
            onQualityChange={handleQualityChange}
          />
        </div>
        <div className="w-[340px] flex-shrink-0 bg-[#1f1f23] border-l border-[#2a2a2e] flex flex-col">
          <ChannelInfo channel={stream} />
          <ChatSidebar channelName={stream.user_login} isConnected={isChatConnected} />
        </div>
      </div>
    </div>
  );
};

export default StreamPlayerPage;