// components/CenterPanel.tsx
import React, { useState } from 'react';
import { Edit3, Scissors, Users, Target, UsersRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CenterPanelProps {
  isLive: boolean;
  streamData: any;
  onRefresh: () => void;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ isLive, streamData, onRefresh }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState(streamData?.title || '');
  const [category, setCategory] = useState(streamData?.game_name || '');
  const [uptime, setUptime] = useState('');

  React.useEffect(() => {
    if (!isLive || !streamData?.started_at) return;
    const update = () => {
      const diff = formatDistanceToNow(new Date(streamData.started_at), { addSuffix: true });
      setUptime(diff);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isLive, streamData]);

  const handleEditSave = () => {
    console.log('Update title:', title, 'category:', category);
    setShowEditModal(false);
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full bg-[#1f1f23] rounded-xl overflow-hidden">
      {/* Top stats bar */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-[#2a2a2e]">
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Session Time</div>
          <div className="text-white font-semibold">{isLive ? uptime : '00:00:00'}</div>
        </div>
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Viewers</div>
          <div className="text-white font-semibold">{streamData?.viewer_count?.toLocaleString() || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Followers</div>
          <div className="text-white font-semibold">--</div>
        </div>
        <div className="text-center">
          <div className="text-[#adadb8] text-xs">Bitrate</div>
          <div className="text-white font-semibold">-- kbps</div>
        </div>
      </div>

      {/* Stream preview */}
      <div className="relative bg-black flex-1 min-h-[300px]">
        {!isLive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-[#adadb8] mb-2">OFFLINE</div>
            <p className="text-sm text-[#adadb8]">Stream is not currently live</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white">🔴 LIVE</span>
            {/* <Player channelName={streamData.user_login} autoplay /> */}
          </div>
        )}
      </div>

      {/* Quick actions grid (2 rows, 3 columns) */}
      <div className="p-3 border-t border-[#2a2a2e]">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-center gap-2 bg-[#9147ff] px-3 py-2 rounded-lg hover:bg-[#772ce8] transition"
          >
            <Edit3 className="w-4 h-4" /> Edit Stream Info
          </button>
          <button disabled className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-3 py-2 rounded-lg opacity-50 cursor-not-allowed">
            <Scissors className="w-4 h-4" /> Clip That
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-3 py-2 rounded-lg hover:bg-[#3a3a4a] transition">
            <Users className="w-4 h-4" /> Raid Channel
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-3 py-2 rounded-lg hover:bg-[#3a3a4a] transition">
            <UsersRound className="w-4 h-4" /> Stream Together
          </button>
          <div className="bg-[#2a2a2e] rounded-lg opacity-30" /> {/* empty slot */}
          <button className="flex items-center justify-center gap-2 bg-[#2a2a2e] px-3 py-2 rounded-lg hover:bg-[#3a3a4a] transition">
            <Target className="w-4 h-4" /> Manage Goals
          </button>
        </div>
      </div>

      {/* Edit modal (same as before) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1f1f23] rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold text-white mb-4">Edit Stream Info</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Stream Title"
                className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white"
              />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Game / Category"
                className="w-full bg-[#0e0e10] border border-[#2a2a2e] rounded-lg px-3 py-2 text-white"
              />
              <div className="flex gap-2">
                <button onClick={handleEditSave} className="flex-1 py-2 bg-[#9147ff] rounded-lg">Save</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-[#2a2a2e] rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterPanel;