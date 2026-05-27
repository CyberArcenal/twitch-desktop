import React from 'react';
import {
  RefreshCw,
  Tv,
  UserPlus,
  Crown,
  Gift,
  Sword,
  Flame,
} from 'lucide-react';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import NotificationToggle from './components/NotificationToggle';
import TestNotificationButton from './components/TestNotificationButton';
import Button from '../../../components/UI/Button';

const icons = {
  stream_live: <Tv className="w-5 h-5" />,
  new_follower: <UserPlus className="w-5 h-5" />,
  subscription: <Crown className="w-5 h-5" />,
  gift_sub: <Gift className="w-5 h-5" />,
  raid: <Sword className="w-5 h-5" />,
  hype_train: <Flame className="w-5 h-5" />,
};

const labels = {
  stream_live: { label: 'Stream Live', description: 'When a followed channel goes live' },
  new_follower: { label: 'New Follower', description: 'When someone follows your channel' },
  subscription: { label: 'Subscription', description: 'When someone subscribes to your channel' },
  gift_sub: { label: 'Gift Subscription', description: 'When someone gifts a subscription' },
  raid: { label: 'Raid', description: 'When another channel raids you' },
  hype_train: { label: 'Hype Train', description: 'When a hype train starts' },
};

const NotificationSettingsPage: React.FC = () => {
  const { preferences, loading, saving, togglePreference, testNotification, refresh } =
    useNotificationSettings();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Choose which events trigger desktop notifications
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        {Object.entries(labels).map(([key, { label, description }]) => (
          <div key={key} className="flex items-center justify-between p-4 border-b border-[var(--border-color)] last:border-0">
            <NotificationToggle
              label={label}
              description={description}
              icon={icons[key as keyof typeof icons]}
              checked={preferences[key as keyof typeof preferences]}
              onChange={(val) => togglePreference(key as any, val)}
              disabled={saving}
            />
            <TestNotificationButton
              type={key as any}
              label={label}
              onTest={testNotification}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[var(--card-secondary-bg)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
        <p className="font-medium mb-1">🔔 About Notifications</p>
        <p>
          Notifications require the app to be running in the background.
          You can also disable all notifications in the system tray menu.
        </p>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;