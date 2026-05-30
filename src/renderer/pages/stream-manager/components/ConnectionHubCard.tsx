// components/ConnectionHubCard.tsx
import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { getStoredStreamKey, saveStreamKey } from '../utils/streamKeyStorage';

interface ConnectionHubCardProps {
  isLive: boolean;
  onRefresh: () => void;
}

const ConnectionHubCard: React.FC<ConnectionHubCardProps> = ({ isLive, onRefresh }) => {
  const [streamKey, setStreamKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const saved = getStoredStreamKey();
    if (saved) setStreamKey(saved);
  }, []);

  const handleSaveKey = () => {
    if (streamKey) saveStreamKey(streamKey);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(streamKey);
  };

  const handleOpenDashboard = () => {
    window.backendAPI.openDashboard('https://dashboard.twitch.tv/settings/stream');
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-2">Connection Hub</h3>
      <div className="mb-3">
        <label className="text-xs text-[#adadb8] block mb-1">Stream Key</label>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            onBlur={handleSaveKey}
            placeholder="Your stream key"
            className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-2 py-1 text-sm text-white"
          />
          <button onClick={() => setShowKey(!showKey)} className="px-2 py-1 bg-[#2a2a2e] rounded text-xs">
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button onClick={handleCopyKey} className="px-2 py-1 bg-[#9147ff] rounded">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleOpenDashboard} className="px-2 py-1 bg-[#3a3a4a] rounded">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button onClick={onRefresh} className="w-full flex items-center justify-center gap-1 bg-[#9147ff] py-1.5 rounded-lg text-sm">
        <RefreshCw className="w-3 h-3" /> I'm Live
      </button>
    </div>
  );
};

export default ConnectionHubCard;