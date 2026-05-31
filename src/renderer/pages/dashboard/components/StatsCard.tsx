// src/renderer/pages/dashboard/components/StatsCard.tsx
import React from 'react';
import { Users, Tv, Clock, TrendingUp } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsCardProps {
  stats: DashboardStats;
}

const StatItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
}> = ({ icon: Icon, label, value, color, trend }) => (
  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--card-secondary-bg)] to-[var(--card-bg)] border border-[var(--border-color)] p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[var(--primary-color)]/50 hover:shadow-lg hover:shadow-[var(--primary-color)]/10">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--sidebar-text)] mt-1 tracking-tight">
          {typeof value === 'number' && value > 999 ? `${(value / 1000).toFixed(1)}K` : value}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </div>
      <div className={`rounded-full p-2.5 bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {/* Animated gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-color)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </div>
);

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const items = [
    { 
      label: 'Following', 
      value: stats.totalFollowed, 
      icon: Users, 
      color: 'from-[#9146ff] to-[#772ce8]',
      trend: stats.totalFollowed > 0 ? 'Active channels' : undefined
    },
    { 
      label: 'Live Now', 
      value: stats.liveCount, 
      icon: Tv, 
      color: 'from-red-500 to-red-600',
      trend: stats.liveCount > 0 ? 'Streaming now' : undefined
    },
    { 
      label: 'Hours Watched', 
      value: stats.totalHoursWatched, 
      icon: Clock, 
      color: 'from-[#00b5b8] to-[#008a8c]',
      trend: 'This month'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <StatItem key={idx} {...item} />
      ))}
    </div>
  );
};

export default StatsCard;