// src/renderer/pages/settings/sections/NotificationsSection.tsx
import React from 'react';
import { RefreshCw, Tv, UserPlus, Crown, Gift, Sword, Flame } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { useNotificationSettings } from '../notifications/hooks/useNotificationSettings';
import NotificationToggle from '../notifications/components/NotificationToggle';
import TestNotificationButton from '../notifications/components/TestNotificationButton';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

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

const NotificationsSection: React.FC = () => {
  const { preferences, loading, saving, togglePreference, testNotification, refresh } =
    useNotificationSettings();

  if (loading) {
    return (
    <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-[#adadb8] mt-1">
            Choose which events trigger desktop notifications
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl overflow-hidden">
        {Object.entries(labels).map(([key, { label, description }]) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border-b border-[#2a2a2e] last:border-0"
          >
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

      <div className="mt-6 bg-[#0e0e10] rounded-lg p-4 text-sm text-[#adadb8]">
        <p className="font-medium mb-1">🔔 About Notifications</p>
        <p>
          Notifications require the app to be running in the background.
          You can also disable all notifications in the system tray menu.
        </p>
      </div>
    </div>
  );
};

export default NotificationsSection;