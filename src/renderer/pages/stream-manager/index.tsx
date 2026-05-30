// src/renderer/pages/stream-manager/index.tsx
import React, { useState, useEffect } from "react";
import { userAPI } from "../../api/core/user";
import { streamsAPI } from "../../api/core/streams";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import MainVideoCard from "./components/MainVideoCard";
import QuickActionsCard from "./components/QuickActionsCard";
import ConnectionHubCard from "./components/ConnectionHubCard";
import ConnectedSoftwareCard from "./components/ConnectedSoftwareCard";
import StreamHealthCard from "./components/StreamHealthCard";
import ChatCard from "./components/ChatCard";
import CustomAutomationsCard from "./components/CustomAutomationsCard";
import AlertsCard from "./components/AlertsCard";

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
      const streamRes = await streamsAPI.getStreamByUserLogin(
        userRes.data.login,
      );
      if (streamRes.status && streamRes.data) {
        setIsLive(true);
        setStreamData(streamRes.data);
      } else {
        setIsLive(false);
        setStreamData(null);
      }
    } catch (err) {
      console.error("Failed to check live status:", err);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 h-full p-4 bg-[#0e0e10] overflow-auto">
      {/* Column 1 */}
      <MainVideoCard
        isLive={isLive}
        streamData={streamData}
        onRefresh={checkLiveStatus}
      />

      {/* Column 2 */}
      <div className="flex flex-col gap-4">
        <ConnectionHubCard isLive={isLive} onRefresh={checkLiveStatus} />
        <ConnectedSoftwareCard isLive={isLive} />
        <QuickActionsCard isLive={isLive} />
       <AlertsCard isLive={isLive} channelId={streamData?.user_id} />
      </div>

      {/* Column 3 */}
      <div className="flex flex-col gap-4">
        <StreamHealthCard isLive={isLive} />
        <ChatCard channelName={streamData?.user_login} isLive={isLive} />
      </div>

      {/* Column 4 */}
      <div className="flex flex-col gap-4">
        <CustomAutomationsCard isLive={isLive} />
        
      </div>
    </div>
  );
};

export default StreamManagerPage;
