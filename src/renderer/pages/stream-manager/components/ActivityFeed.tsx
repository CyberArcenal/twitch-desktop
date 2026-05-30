// components/ActivityFeed.tsx
import React, { useState, useEffect } from 'react';
import { useStreamEvents } from '../hooks/useStreamEvents';
import { UserPlus, Star, Rocket, Zap, Filter, Copy, ExternalLink, RefreshCw, EyeOff, Clipboard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getStoredStreamKey, saveStreamKey } from '../utils/streamKeyStorage';

interface ActivityFeedProps {
  isLive: boolean;
  channelId?: string;
  onRefresh: () => void; // passed from parent to refresh live status
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isLive, channelId, onRefresh }) => {
  const { events } = useStreamEvents(channelId || '');
  const [filter, setFilter] = useState<'all' | 'follows' | 'subs' | 'raids'>('all');

  // Stream key state (only used when offline)
  const [streamKey, setStreamKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (!isLive) {
      const saved = getStoredStreamKey();
      if (saved) setStreamKey(saved);
    }
  }, [isLive]);

  // Dashboard closed listener
  useEffect(() => {
    const handleDashboardClosed = () => {
      onRefresh();
    };
    window.backendAPI?.on?.('dashboard:closed', handleDashboardClosed);
    return () => window.backendAPI?.off?.('dashboard:closed', handleDashboardClosed);
  }, [onRefresh]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(streamKey);
    // optional toast
  };

  const handleSaveKey = () => {
    if (streamKey) saveStreamKey(streamKey);
  };

  const handleOpenDashboard = () => {
    window.backendAPI.openDashboard('https://dashboard.twitch.tv/settings/stream');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('live_') || /^[a-zA-Z0-9_]+$/.test(text))) {
        setStreamKey(text);
        saveStreamKey(text);
      } else {
        console.log('Clipboard content does not look like a stream key');
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.startsWith('live_') || /^[a-zA-Z0-9_]+$/.test(pastedText))) {
      setStreamKey(pastedText);
      saveStreamKey(pastedText);
    }
  };

  // Filtered events for live mode
  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'follows') return e.type === 'follow';
    if (filter === 'subs') return e.type === 'subscribe';
    if (filter === 'raids') return e.type === 'raid';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'subscribe': return <Star className="w-4 h-4 text-purple-400" />;
      case 'raid': return <Rocket className="w-4 h-4 text-orange-400" />;
      default: return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  // When offline, render the stream key setup UI
  if (!isLive) {
    return (
      <div className="bg-[#1f1f23] rounded-xl flex flex-col overflow-hidden h-full">
        <div className="p-3 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#adadb8]" />
            <h3 className="text-sm font-semibold text-white">Offline Setup</h3>
          </div>
          <p className="text-xs text-[#adadb8] mt-1">
            Enter your stream key to get ready for going live.
          </p>
        </div>

        <div className="p-3 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Stream Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                onBlur={handleSaveKey}
                onPaste={handlePaste}
                placeholder="Paste your stream key"
                className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm text-white"
              />
              <button onClick={() => setShowKey(!showKey)} className="px-2 py-1 bg-[#2a2a2e] rounded-lg text-xs">
                {showKey ? 'Hide' : 'Show'}
              </button>
              <button onClick={handleCopyKey} className="px-2 py-1 bg-[#9147ff] rounded-lg">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={handlePasteFromClipboard} className="px-2 py-1 bg-[#3a3a4a] rounded-lg" title="Paste from clipboard">
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleOpenDashboard}
              className="flex-1 flex items-center justify-center gap-1 bg-[#2a2a2e] py-2 rounded-lg text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Get Key
            </button>
            <button
              onClick={onRefresh}
              className="flex-1 flex items-center justify-center gap-1 bg-[#9147ff] py-2 rounded-lg text-sm"
            >
              <RefreshCw className="w-4 h-4" /> I'm Live
            </button>
          </div>

          <div className="text-xs text-[#adadb8] text-center">
            After going live in OBS, click "I'm Live" to refresh.
          </div>
        </div>
      </div>
    );
  }

  // When live – show activity feed
  return (
    <div className="bg-[#1f1f23] rounded-xl flex flex-col overflow-hidden h-full">
      <div className="p-3 border-b border-[#2a2a2e]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
          <Filter className="w-4 h-4 text-[#adadb8]" />
        </div>
        <div className="flex gap-2 text-xs mt-2">
          {['all', 'follows', 'subs', 'raids'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-2 py-0.5 rounded-full transition ${
                filter === f ? 'bg-[#9147ff] text-white' : 'bg-[#2a2a2e] text-[#adadb8] hover:bg-[#3a3a4a]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-[#adadb8] text-sm italic">It’s quiet. Too quiet…</p>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-2 text-sm">
                {getIcon(event.type)}
                <div className="flex-1">
                  <span className="text-white">{event.message}</span>
                  <span className="text-[#adadb8] text-xs ml-2">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;