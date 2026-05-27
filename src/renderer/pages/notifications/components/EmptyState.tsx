import React from 'react';
import { Bell } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <Bell className="w-16 h-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
      <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">No notifications yet</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        When you get follows, subscriptions, or when channels you follow go live, you'll see them here.
      </p>
    </div>
  );
};

export default EmptyState;