// src/renderer/pages/channel/components/AboutTab.tsx
import React from 'react';
import type { TwitchUser } from '../../../api/core/user';
import { Calendar, Info, Users, Award, Globe, Mail } from 'lucide-react';

interface AboutTabProps {
  user: TwitchUser;
}

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  const stats = [
    { icon: Calendar, label: 'Joined', value: new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) },
    { icon: Users, label: 'Channel Type', value: user.broadcaster_type ? user.broadcaster_type.charAt(0).toUpperCase() + user.broadcaster_type.slice(1) : 'Normal' },
    { icon: Award, label: 'View Count', value: user.view_count?.toLocaleString() || '0' },
    { icon: Globe, label: 'User ID', value: user.id },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Bio Section */}
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)]">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--primary-color)]" />
              <h3 className="font-semibold text-[var(--sidebar-text)]">About</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {user.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-4 transition-all hover:border-[#9146ff]/30 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                  <stat.icon className="w-5 h-5 text-[var(--primary-color)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                  <p className="text-base font-medium text-[var(--sidebar-text)] mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Social links placeholder if needed */}
        {user.email && (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--text-secondary)]" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Contact Email</p>
                <p className="text-sm text-[var(--sidebar-text)]">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutTab;