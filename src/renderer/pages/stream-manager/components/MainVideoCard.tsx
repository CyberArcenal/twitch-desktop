// src/renderer/pages/stream-manager/components/MainVideoCard.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Edit3, Scissors, Users, Target, UsersRound, RefreshCw } from 'lucide-react';
import { useUptime } from '../hooks/useUptime';
import { useStreamInfo } from '../hooks/useStreamInfo';
import { useClip } from '../hooks/useClip';
import { useRaid } from '../hooks/useRaid';

interface MainVideoCardProps {
  isLive: boolean;
  streamData: any;
  onRefresh: () => void;
}

const MainVideoCard: React.FC<MainVideoCardProps> = ({ isLive, streamData, onRefresh }) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const uptime = useUptime(isLive, streamData?.started_at);
  const { showEditModal, setShowEditModal, title, setTitle, category, setCategory, saveStreamInfo } = useStreamInfo(streamData, onRefresh);
  const { createClip } = useClip();
  const { startRaid } = useRaid();

  const channelName = streamData?.user_login?.toLowerCase();
  const iframeSrc = isLive && channelName
    ? `https://player.twitch.tv/?channel=${channelName}&parent=localhost&autoplay=false&muted=true`
    : '';

  // Reload iframe when coming from offline to live
  useEffect(() => {
    if (isLive && channelName && videoRef.current && !videoRef.current.src) {
      videoRef.current.src = iframeSrc;
    }
  }, [isLive, channelName, iframeSrc]);

  // Detect if iframe got redirected to login and reload
  useEffect(() => {
    if (!isLive || !videoRef.current) return;
    const iframe = videoRef.current;
    const handleLoad = () => {
      try {
        const iframeUrl = iframe.contentWindow?.location.href;
        if (iframeUrl && (iframeUrl.includes('id.twitch.tv') || iframeUrl.includes('login'))) {
          console.log('Detected login redirect, reloading iframe...');
          setTimeout(() => {
            if (iframe.src) iframe.src = iframeSrc;
          }, 1000);
        }
      } catch (e) {
        // Cross-origin means it's a valid Twitch page – good
      }
    };
    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [isLive, iframeSrc]);

  // Manual preview reload (only iframe)
  const handleRefreshPreview = () => {
    if (videoRef.current && iframeSrc) {
      videoRef.current.src = '';
      setTimeout(() => {
        if (videoRef.current) videoRef.current.src = iframeSrc;
      }, 100);
    }
  };

  // Manual status refresh (calls parent's onRefresh)
  const handleStatusRefresh = () => {
    onRefresh();
  };

  const handleCreateClip = () => createClip(streamData?.user_id);
  const handleRaid = () => startRaid(streamData?.user_id);

  return (
    <div className="bg-[#1f1f23] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2e] h-full flex flex-col">
      {/* Stats row with refresh button */}
      <div className="grid grid-cols-4 gap-2 p-2 border-b border-[#2a2a2e] items-center">
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Session Time</div>
          <div className="text-white font-semibold text-sm">{isLive ? uptime : '00:00:00'}</div>
        </div>
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Viewers</div>
          <div className="text-white font-semibold">{streamData?.viewer_count?.toLocaleString() || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Bitrate</div>
          <div className="text-white font-semibold">-- kbps</div>
        </div>
        <div className="flex justify-end items-center gap-2">
          <div className="text-center">
            <div className="text-[#adadb8] text-xs">Speed</div>
            <div className="text-white font-semibold">--</div>
          </div>
          <button
            onClick={handleStatusRefresh}
            className="p-1 rounded-full hover:bg-[#2a2a2e] transition"
            title="Check live status now"
          >
            <RefreshCw className="w-4 h-4 text-[#adadb8]" />
          </button>
        </div>
      </div>

      {/* Video preview area with overlay refresh button */}
      <div
        className="relative bg-black flex-1 min-h-[250px] group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!isLive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-[#adadb8] mb-2">OFFLINE</div>
            <p className="text-sm text-[#adadb8]">Stream is not currently live</p>
          </div>
        ) : (
          <>
            <iframe
              ref={videoRef}
              src={iframeSrc}
              className="w-full h-full"
              allowFullScreen
              title="Stream Preview"
            />
            {/* Video reload button – appears on hover */}
            <button
              onClick={handleRefreshPreview}
              className={`absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-200 backdrop-blur-sm ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              title="Reload video preview"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Action buttons row */}
      <div className="p-3 border-t border-[#2a2a2e]">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setShowEditModal(true)} className="flex items-center justify-center gap-2 bg-[#9147ff] px-2 py-1.5 rounded-lg text-sm hover:bg-[#772ce8] transition">
            <Edit3 className="w-4 h-4" /> Edit Stream Info
          </button>
          <button onClick={handleCreateClip} className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-2 py-1.5 rounded-lg text-sm hover:bg-[#3a3a4a] transition">
            <Scissors className="w-4 h-4" /> Clip That
          </button>
          <button onClick={handleRaid} className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-2 py-1.5 rounded-lg text-sm hover:bg-[#3a3a4a] transition">
            <Users className="w-4 h-4" /> Raid Channel
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-2 py-1.5 rounded-lg text-sm hover:bg-[#3a3a4a] transition">
            <UsersRound className="w-4 h-4" /> Stream Together
          </button>
          <div className="bg-[#2a2a2e] rounded-lg opacity-30" />
          <button className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-2 py-1.5 rounded-lg text-sm hover:bg-[#3a3a4a] transition">
            <Target className="w-4 h-4" /> Manage Goals
          </button>
        </div>
      </div>

      {/* Edit modal (unchanged) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1f1f23] rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold text-white mb-4">Edit Stream Info</h3>
            <div className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Stream Title" className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white" />
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Game / Category" className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white" />
              <div className="flex gap-2">
                <button onClick={saveStreamInfo} className="flex-1 py-2 bg-[#9147ff] rounded-lg">Save</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-[#2a2a2e] rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainVideoCard;