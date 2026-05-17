import React, { useState } from 'react';
import { Bell, Zap, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'follow' | 'subscribe' | 'raid' | 'host' | 'alert';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications?: Notification[];
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications = []
}) => {
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>(
    notifications.length > 0
      ? notifications
      : [
          { id: '1', type: 'follow', message: 'NewUser123 followed!', timestamp: new Date(Date.now() - 60000), read: false },
          { id: '2', type: 'subscribe', message: 'User456 subscribed at Tier 1', timestamp: new Date(Date.now() - 120000), read: false },
          { id: '3', type: 'raid', message: 'Streamer789 raided with 50 viewers', timestamp: new Date(Date.now() - 300000), read: true },
          { id: '4', type: 'alert', message: 'EventSub connection established', timestamp: new Date(Date.now() - 600000), read: true },
        ]
  );

  const removeNotification = (id: string) => {
    setDisplayNotifications(displayNotifications.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setDisplayNotifications(
      displayNotifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'subscribe':
        return 'bg-purple-500/10 border-purple-500/30';
      case 'raid':
      case 'host':
        return 'bg-orange-500/10 border-orange-500/30';
      case 'alert':
        return 'bg-green-500/10 border-green-500/30';
      default:
        return 'bg-[var(--bg-secondary)]';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return '👥';
      case 'subscribe':
        return '⭐';
      case 'raid':
      case 'host':
        return '🎯';
      case 'alert':
        return '🔔';
      default:
        return '•';
    }
  };

  return (
    <div className="windows-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell size={20} />
          Notifications & Alerts
        </h2>
        <span className="bg-[var(--brand-color)] text-white text-xs font-bold px-2 py-1 rounded">
          {displayNotifications.filter(n => !n.read).length}
        </span>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-3 rounded border transition-all cursor-pointer ${getNotificationColor(notif.type)} ${
                !notif.read ? 'border-l-4' : 'opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{notif.message}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {Math.round((Date.now() - notif.timestamp.getTime()) / 60000)}m ago
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                  className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Bell size={32} className="mx-auto text-[var(--text-secondary)] opacity-50 mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No notifications</p>
          </div>
        )}
      </div>

      {/* EventSub Status */}
      <div className="border-t border-[var(--bg-secondary)] pt-4">
        <div className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-[var(--text-secondary)]">EventSub Connected</span>
          </div>
          <Zap size={14} className="text-green-500" />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
