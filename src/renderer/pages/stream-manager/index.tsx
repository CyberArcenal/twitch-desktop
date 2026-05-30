// src/renderer/pages/stream-manager/index.tsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../api/core/user';
import { streamsAPI } from '../../api/core/streams';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import CenterPanel from './components/CenterPanel';
import ActivityFeed from './components/ActivityFeed';
import ChatPanel from './components/ChatPanel';
import AutomationPanel from './components/AutomationPanel';

const StreamManagerPage: React.FC = () => {
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkLiveStatus = async () => {
    try {
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) {
        setIsLive(false);
        return;
      }
      const streamRes = await streamsAPI.getStreamByUserLogin(userRes.data.login);
      if (streamRes.status && streamRes.data) {
        setIsLive(true);
        setStreamData(streamRes.data);
      } else {
        setIsLive(false);
        setStreamData(null);
      }
    } catch (err) {
      console.error('Failed to check live status:', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream manager..." />
      </div>
    );
  }

  // Always render the grid – ActivityFeed will show offline setup when !isLive
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 h-full p-4 bg-[#0e0e10] overflow-auto">
      <CenterPanel isLive={isLive} streamData={streamData} onRefresh={checkLiveStatus} />
      <ActivityFeed isLive={isLive} onRefresh={checkLiveStatus} />
      <ChatPanel channelName={streamData?.user_login} isLive={isLive} />
      <AutomationPanel isLive={isLive} />
    </div>
  );
};

export default StreamManagerPage;