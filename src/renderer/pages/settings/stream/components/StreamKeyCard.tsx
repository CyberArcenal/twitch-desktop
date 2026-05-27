import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { copyToClipboard } from '../../../../utils/clipboard';


interface StreamKeyCardProps {
  streamKey: string | null;
  loading: boolean;
}

const StreamKeyCard: React.FC<StreamKeyCardProps> = ({ streamKey, loading }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!streamKey) return;
    const success = await copyToClipboard(streamKey);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedKey = streamKey
    ? `${streamKey.slice(0, 8)}${'•'.repeat(Math.min(streamKey.length - 8, 24))}`
    : '';

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--card-secondary-bg)] rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-[var(--card-secondary-bg)] rounded mb-4"></div>
          <div className="h-8 bg-[var(--card-secondary-bg)] rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!streamKey) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
        <div className="flex items-center gap-2 text-yellow-500 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Unable to load stream key</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Make sure you have the required scope: <code className="bg-[var(--card-secondary-bg)] px-1 rounded">channel:read:stream_key</code>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-2">Stream Key</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Use this key in your broadcasting software (OBS, Streamlabs, etc.) to go live.
      </p>

      <div className="flex items-center gap-2 bg-[var(--card-secondary-bg)] rounded-lg p-3 font-mono text-sm">
        <span className="flex-1 break-all">
          {revealed ? streamKey : maskedKey}
        </span>
        <button
          onClick={() => setRevealed(!revealed)}
          className="p-1.5 hover:bg-[var(--card-hover-bg)] rounded transition-colors"
          title={revealed ? 'Hide' : 'Reveal'}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-[var(--card-hover-bg)] rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-[var(--text-tertiary)] mt-3">
        Keep this key private. Anyone with it can stream to your channel.
      </p>
    </div>
  );
};

export default StreamKeyCard;