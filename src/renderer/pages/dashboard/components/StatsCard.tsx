// src/renderer/pages/dashboard/components/StatsCard.tsx
import React from 'react';
import { Users, Tv, Eye, Clock } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsCardProps {
  stats: DashboardStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const items = [
    { label: 'Following', value: stats.totalFollowed, icon: Users, color: 'text-[var(--primary-color)]' },
    { label: 'Live Now', value: stats.liveCount, icon: Tv, color: 'text-red-500' },
    { label: 'Hours Watched', value: stats.totalHoursWatched, icon: Clock, color: 'text-[var(--accent-green)]' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-[var(--card-secondary-bg)] rounded-lg p-3 text-center">
          <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
          <p className="text-2xl font-bold text-[var(--sidebar-text)]">{item.value}</p>
          <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;