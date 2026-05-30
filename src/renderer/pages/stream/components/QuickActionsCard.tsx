// src/renderer/pages/stream/components/QuickActionsCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Clock, UsersRound, Radio } from 'lucide-react';
import type { Stream } from '../../../api/core/streams';

interface QuickActionsCardProps {
  stream: Stream;
  onShare: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ stream, onShare }) => {
  const navigate = useNavigate();

  const handleGoToChannel = () => navigate(`/channel/${stream.user_login}`);

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-2">Quick Actions</h3>
      <div className="space-y-2">
        <button onClick={handleGoToChannel} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2a2e] text-white text-sm hover:bg-[#3a3a4a] transition">
          <ExternalLink className="w-4 h-4" /> Channel Page
        </button>
        <button onClick={onShare} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2a2e] text-white text-sm hover:bg-[#3a3a4a] transition">
          <Radio className="w-4 h-4" /> Share Stream
        </button>
        {/* You can add more actions like “Add to Watch Later” here – but it's already in the info card */}
      </div>
    </div>
  );
};

export default QuickActionsCard;