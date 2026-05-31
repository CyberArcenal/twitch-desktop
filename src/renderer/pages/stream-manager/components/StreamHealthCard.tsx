import React from 'react';
import { useStreamHealth } from '../hooks/useStreamHealth';

interface StreamHealthCardProps {
  isLive: boolean;
}

const StreamHealthCard: React.FC<StreamHealthCardProps> = ({ isLive }) => {
  const { bitrate, fps, droppedFrames, cpuUsage, connected } = useStreamHealth(isLive);

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-2">Stream Health</h3>
      {!connected ? (
        <p className="text-xs text-[#adadb8] text-center py-2">
          OBS not connected. Enable WebSocket server in OBS (port 4455).
        </p>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-[#adadb8] mb-1">
              <span>Bitrate</span>
              <span>{bitrate.toLocaleString()} kbps</span>
            </div>
            <div className="w-full bg-[#2a2a2e] rounded-full h-2">
              <div className="bg-[#9147ff] h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (bitrate / 6000) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#adadb8] mb-1">
              <span>FPS</span>
              <span>{fps}</span>
            </div>
            <div className="w-full bg-[#2a2a2e] rounded-full h-2">
              <div className="bg-[#9147ff] h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#adadb8] mb-1">
              <span>Dropped Frames</span>
              <span>{droppedFrames}%</span>
            </div>
            <div className="w-full bg-[#2a2a2e] rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${droppedFrames > 5 ? 'bg-red-500' : 'bg-[#9147ff]'}`} style={{ width: `${Math.min(100, droppedFrames)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#adadb8] mb-1">
              <span>CPU Usage</span>
              <span>{cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#2a2a2e] rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${cpuUsage > 80 ? 'bg-red-500' : 'bg-[#9147ff]'}`} style={{ width: `${Math.min(100, cpuUsage)}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamHealthCard;