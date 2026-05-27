// src/renderer/pages/stream/index.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Users, Gamepad2, Calendar, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import Player from './components/Player';
import ChatSidebar from './components/ChatSidebar';
import ChannelInfo from './components/ChannelInfo';

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
      {/* LEFT COLUMN: Video + Channel Info */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Video Player - fixed aspect ratio 16:9 */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          <Player
            ref={playerRef}
            channelName={stream.user_login}
            autoplay
            onLoad={() => setIsPlayerReady(true)}
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Channel Info & Stream Details (below video) */}
        <div className="p-4 space-y-4">
          {/* Channel header: avatar + name + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={stream.user_id 
                  ? `https://static-cdn.jtvnw.net/jtv_user_pictures/${stream.user_id}-profile_image-70x70.png`
                  : './icon.png'
                }
                className="w-12 h-12 rounded-full"
                alt={stream.user_name}
              />
              <div>
                <h2 className="text-xl font-bold text-white">{stream.user_name}</h2>
                <div className="flex items-center gap-2 text-sm text-[#adadb8]">
                  <span>{stream.viewer_count?.toLocaleString()} viewers</span>
                  <span>•</span>
                  <span>{stream.game_name}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#9147ff] rounded-lg text-white text-sm font-semibold hover:bg-[#772ce8] transition">
                Follow
              </button>
              <button className="p-2 rounded-lg bg-[#2a2a2e] text-white hover:bg-[#3a3a3e] transition">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-[#2a2a2e] text-white hover:bg-[#3a3a3e] transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stream Title */}
          <div>
            <h3 className="text-lg font-semibold text-white">{stream.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-[#adadb8]">
              <div className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4" />
                <span>{stream.game_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Live since {new Date(stream.started_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Sidebar (fixed width, scrollable) */}
      <div className="w-[340px] flex-shrink-0 bg-[#1f1f23] border-l border-[#2a2a2e] flex flex-col">
        <ChatSidebar channelName={stream.user_login} isConnected={isChatConnected} />
      </div>
    </div>
  );
};

export default StreamPlayerPage;