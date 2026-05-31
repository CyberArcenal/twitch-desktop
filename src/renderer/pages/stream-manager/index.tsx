// src/renderer/pages/stream-manager/index.tsx
import React from "react";
import { useLiveStatus } from "./hooks/useLiveStatus";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import MainVideoCard from "./components/MainVideoCard";
import QuickActionsCard from "./components/QuickActionsCard";
import ConnectionHubCard from "./components/ConnectionHubCard";
import ConnectedSoftwareCard from "./components/ConnectedSoftwareCard";
import StreamHealthCard from "./components/StreamHealthCard";
import ChatCard from "./components/ChatCard";
import CustomAutomationsCard from "./components/CustomAutomationsCard";
import AlertsCard from "./components/AlertsCard";
import CollaborationCard from "./components/CollaborationCard";

const StreamManagerPage: React.FC = () => {
  const { isLive, streamData, loading, refresh } = useLiveStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream manager..." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 h-full p-4 bg-[#0e0e10] overflow-auto">
      <MainVideoCard
        isLive={isLive || false}
        streamData={streamData}
        onRefresh={refresh}
      />
      <div className="flex flex-col gap-4">
        <ConnectionHubCard isLive={isLive || false} onRefresh={refresh} />
        <ConnectedSoftwareCard isLive={isLive || false} />
        <QuickActionsCard isLive={isLive || false} />
        <AlertsCard isLive={isLive || false} channelId={streamData?.user_id} />
      </div>
      <div className="flex flex-col gap-4">
        <StreamHealthCard isLive={isLive || false} />
        <ChatCard
          channelName={streamData?.user_login}
          broadcasterId={streamData?.user_id}
          isLive={isLive || false}
        />
      </div>
      <div className="flex flex-col gap-4">
        <CustomAutomationsCard isLive={isLive || false} />
        <CollaborationCard />
      </div>
    </div>
  );
};

export default StreamManagerPage;
