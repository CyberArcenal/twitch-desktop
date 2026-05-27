import React from 'react';
import type { TwitchUser } from '../../../api/core/user';
import { Calendar, Info, Users } from 'lucide-react';

interface AboutTabProps {
  user: TwitchUser;
}

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--primary-color)] mt-0.5" />
        <div>
          <h3 className="font-medium text-[var(--sidebar-text)]">Bio</h3>
          <p className="text-sm text-[var(--text-secondary)]">{user.description || 'No description provided.'}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-[var(--primary-color)] mt-0.5" />
        <div>
          <h3 className="font-medium text-[var(--sidebar-text)]">Joined</h3>
          <p className="text-sm text-[var(--text-secondary)]">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Users className="w-5 h-5 text-[var(--primary-color)] mt-0.5" />
        <div>
          <h3 className="font-medium text-[var(--sidebar-text)]">Channel Type</h3>
          <p className="text-sm text-[var(--text-secondary)] capitalize">{user.broadcaster_type || 'Normal'}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;