// components/StreamHealthCard.tsx
import React from 'react';

interface StreamHealthCardProps {
  isLive: boolean;
}

const StreamHealthCard: React.FC<StreamHealthCardProps> = ({ isLive }) => {
  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-2">Stream Health</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-[#adadb8] mb-1">
            <span>Bitrate</span>
            <span>0 kbps</span>
          </div>
          <div className="w-full bg-[#2a2a2e] rounded-full h-2">
            <div className="bg-[#9147ff] h-2 rounded-full w-0"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-[#adadb8] mb-1">
            <span>FPS</span>
            <span>0</span>
          </div>
          <div className="w-full bg-[#2a2a2e] rounded-full h-2">
            <div className="bg-[#9147ff] h-2 rounded-full w-0"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-[#adadb8] mb-1">
            <span>Dropped Frames</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-[#2a2a2e] rounded-full h-2">
            <div className="bg-[#9147ff] h-2 rounded-full w-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamHealthCard;