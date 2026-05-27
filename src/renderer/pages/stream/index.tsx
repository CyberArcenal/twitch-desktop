import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import Player from './components/Player';
import ChatSidebar from './components/ChatSidebar';
import PlayerControls from './components/PlayerControls';

const StreamPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    stream,
    loading,
    error,
    isChatConnected,
    volume,
    isMuted,
    quality,
    isPlaying,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[var(--sidebar-text)] mb-2">Stream Unavailable</h2>
        <p className="text-[var(--text-secondary)] mb-4">{error || 'Channel is offline'}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[var(--primary-color)] rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Back button bar */}
      <div className="p-2 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      {/* Main content: 70% video, 30% chat */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative group bg-black">
          <Player channelName={stream.user_login} autoplay />
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
        <div className="w-80 flex-shrink-0">
          <ChatSidebar channelName={stream.user_login} isConnected={isChatConnected} />
        </div>
      </div>
    </div>
  );
};

export default StreamPlayerPage;