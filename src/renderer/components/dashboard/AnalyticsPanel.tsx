import React from 'react';
import { BarChart3, TrendingUp, Heart, Eye } from 'lucide-react';

interface AnalyticsPanelProps {
  viewerCount?: number;
  engagement?: number;
  followers?: number;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  viewerCount = 1234,
  engagement = 87,
  followers = 5420
}) => {
  // Mock activity data for simple visualization
  const activityData = [
    { label: 'Now', value: 45, height: '80%' },
    { label: '5m ago', value: 38, height: '65%' },
    { label: '10m ago', value: 32, height: '50%' },
    { label: '15m ago', value: 28, height: '40%' },
    { label: '20m ago', value: 25, height: '35%' },
  ];

  return (
    <div className="windows-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <BarChart3 size={20} />
        Analytics & Activity
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Viewers</p>
              <p className="text-2xl font-bold text-white mt-1">{viewerCount.toLocaleString()}</p>
            </div>
            <Eye size={24} className="text-[var(--brand-color)] opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Engagement</p>
              <p className="text-2xl font-bold text-white mt-1">{engagement}%</p>
            </div>
            <TrendingUp size={24} className="text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Followers</p>
              <p className="text-2xl font-bold text-white mt-1">{followers.toLocaleString()}</p>
            </div>
            <Heart size={24} className="text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Simple Activity Chart */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Viewer Activity (Last 20 minutes)</h3>
        <div className="flex items-end gap-2 h-24 bg-[var(--bg-secondary)] p-3 rounded">
          {activityData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-[var(--brand-color)] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                style={{ height: data.height }}
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">{data.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
            <span className="text-[var(--text-secondary)]">New follower: StreamFan42</span>
            <span className="text-xs text-[var(--text-secondary)]">2m ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
            <span className="text-[var(--text-secondary)]">5 new subscribers</span>
            <span className="text-xs text-[var(--text-secondary)]">5m ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
            <span className="text-[var(--text-secondary)]">Raid from OtherStreamer</span>
            <span className="text-xs text-[var(--text-secondary)]">8m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
