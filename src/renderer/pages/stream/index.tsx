// src/renderer/pages/WatchStreamPage/index.tsx
import React, { useState } from 'react';
import { AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { StreamPlayer } from './components/StreamPlayer';
import { StreamInfo } from './components/StreamInfo';
import { ChatPanel } from './components/ChatPanel';
import { useStream } from './hooks/useStream';
import { useChat } from './hooks/useChat';
import type { ChatMessageType } from './types';

const WatchStreamPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const {
    stream,
    user,
    loading,
    error,
    isFollowing,
    imageError,
    setImageError,
    handleFollow,
    handleShare,
    handleMore,
  } = useStream();

  const {
    messages,
    sendMessage,
    isConnecting,
    connectionError,
  } = useChat(stream?.user_login, !loading && !!stream);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg-base)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--twitch-purple)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-base)] p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Stream Unavailable</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {error || 'This channel is offline or does not exist.'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--bg-base)]">
      <div className="container mx-auto px-4 py-6 max-w-[1800px]">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video + Info */}
          <div className="lg:col-span-2 space-y-6">
            <StreamPlayer
              stream={stream}
              imageError={imageError}
              onImageError={() => setImageError(true)}
            />
            <StreamInfo
              stream={stream}
              user={user}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onShare={handleShare}
              onMore={handleMore}
            />
          </div>

          {/* Right Column: Chat (Desktop) */}
          <div className="hidden lg:block">
            <ChatPanel
              isOpen={true}
              onClose={() => {}}
              messages={messages as ChatMessageType[]}
              onSendMessage={sendMessage}
              currentUser={user}
            />
          </div>
        </div>
      </div>

      {/* Mobile Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages as ChatMessageType[]}
        onSendMessage={sendMessage}
        currentUser={user}
      />
    </div>
  );
};

export default WatchStreamPage;