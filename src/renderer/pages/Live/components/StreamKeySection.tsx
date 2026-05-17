// src/pages/Live/components/StreamKeySection.tsx
import React, { useState } from 'react';
import { Key, Copy, Eye, EyeOff } from 'lucide-react';

export const StreamKeySection: React.FC = () => {
  const [showKey, setShowKey] = useState(false);
  const streamKey = 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // dummy, would be fetched from Twitch API

  const copyToClipboard = () => {
    navigator.clipboard.writeText(streamKey);
    alert('Stream key copied to clipboard!');
  };

  return (
    <div className="windows-card p-6 space-y-3">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
        <Key size={18} className="text-[var(--twitch-purple)]" />
        <h3 className="text-white font-semibold">Stream Key</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] rounded-lg p-3 flex items-center justify-between">
        <code className="text-sm font-mono text-[var(--text-primary)]">
          {showKey ? streamKey : '•'.repeat(32)}
        </code>
        <div className="flex gap-2">
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1 text-[var(--text-secondary)] hover:text-white transition"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 text-[var(--text-secondary)] hover:text-white transition"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        Keep your stream key secret. Never share it with anyone.
      </p>
    </div>
  );
};