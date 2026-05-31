import React from 'react';
import { Radio, Zap, Target, Megaphone } from 'lucide-react';
import { useQuickActions } from '../hooks/useQuickActions';

interface QuickActionsCardProps {
  isLive: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ isLive }) => {
  const { runAds, openGoals, raidShortcut, shoutout } = useQuickActions(isLive);

  const actions = [
    { icon: Megaphone, label: 'Shoutout', onClick: shoutout, color: '#9147ff' },
    { icon: Radio, label: 'Run ads', onClick: runAds, color: '#2a2a2e' },
    { icon: Zap, label: 'Raid shortcuts', onClick: raidShortcut, color: '#2a2a2e' },
    { icon: Target, label: 'Stream Goals', onClick: openGoals, color: '#2a2a2e' },
  ];

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: action.color, color: 'white' }}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;