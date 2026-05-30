// components/ConnectedSoftwareCard.tsx
import React from 'react';
import { Monitor } from 'lucide-react';

interface ConnectedSoftwareCardProps {
  isLive: boolean;
}

const ConnectedSoftwareCard: React.FC<ConnectedSoftwareCardProps> = ({ isLive }) => {
  // Auto‑detect would be implemented via WebSocket or scanning processes
  const isConnected = false; // placeholder

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <div className="flex items-center gap-2">
        <Monitor className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-semibold text-white">Connected Software</h3>
        <span className={`ml-auto text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '● Connected' : '● Not connected'}
        </span>
      </div>
      <p className="text-xs text-[#adadb8] mt-2">
        {isConnected ? 'OBS Studio • Streaming to Twitch' : 'No streaming software detected'}
      </p>
    </div>
  );
};

export default ConnectedSoftwareCard;