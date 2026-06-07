// src/renderer/pages/channel/index.tsx
import React from 'react';
import { useChannel } from './hooks/useChannel';
import ChannelHeader from './components/ChannelHeader';
import TabNavigation from './components/TabNavigation';
import StreamsTab from './components/StreamsTab';
import ClipsTab from './components/ClipsTab';
import AboutTab from './components/AboutTab';
import type { Clip } from '../../api/core/clips';
import ClipModal from '../browse/clips/components/ClipModal';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const ChannelPage: React.FC = () => {
  const { user, isFollowing, liveStream, recentVideos, clips, loading, activeTab, setActiveTab, toggleFollow } = useChannel();
  const [selectedClip, setSelectedClip] = React.useState<Clip | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="medium" text="Loading channel..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--card-hover-bg)] flex items-center justify-center mb-4">
          <span className="text-4xl">😢</span>
        </div>
        <h2 className="text-xl font-semibold text-[var(--sidebar-text)] mb-1">Channel not found</h2>
        <p className="text-sm text-[var(--text-secondary)]">The channel you're looking for doesn't exist or is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-color)] m-2">
      <ChannelHeader user={user} isFollowing={isFollowing} liveStream={liveStream} onFollowToggle={toggleFollow} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-4">
        {activeTab === 'streams' && <StreamsTab liveStream={liveStream} recentVideos={recentVideos} />}
        {activeTab === 'clips' && <ClipsTab clips={clips} onClipClick={setSelectedClip} />}
        {activeTab === 'schedule' && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card-hover-bg)] text-[var(--text-secondary)] text-sm">
              🗓️ Schedule feature coming soon
            </div>
          </div>
        )}
        {activeTab === 'about' && <AboutTab user={user} />}
      </div>

      <ClipModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
    </div>
  );
};

export default ChannelPage;