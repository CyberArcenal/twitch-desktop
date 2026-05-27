import React from 'react';
import { useChannel } from './hooks/useChannel';
import ChannelHeader from './components/ChannelHeader';
import TabNavigation from './components/TabNavigation';
import StreamsTab from './components/StreamsTab';
import ClipsTab from './components/ClipsTab';
import AboutTab from './components/AboutTab';
import type { Clip } from '../../api/core/clips';
import ClipModal from '../browse/clips/components/ClipModal';

const ChannelPage: React.FC = () => {
  const { user, isFollowing, liveStream, recentVideos, clips, loading, activeTab, setActiveTab, toggleFollow } = useChannel();
  const [selectedClip, setSelectedClip] = React.useState<Clip | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ChannelHeader user={user} isFollowing={isFollowing} liveStream={liveStream} onFollowToggle={toggleFollow} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'streams' && <StreamsTab liveStream={liveStream} recentVideos={recentVideos} />}
      {activeTab === 'clips' && <ClipsTab clips={clips} onClipClick={setSelectedClip} />}
      {activeTab === 'schedule' && <div className="p-6 text-center text-[var(--text-secondary)]">Schedule feature coming soon</div>}
      {activeTab === 'about' && <AboutTab user={user} />}
      <ClipModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
    </div>
  );
};

export default ChannelPage;