import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Trash2, Eye, Users, Gift, Radio, Bell } from 'lucide-react';
import type { StoredNotification } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: StoredNotification;
  onMarkRead: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onDelete }) => {
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  const getIcon = () => {
    switch (notification.type) {
      case 'stream_online': return <Radio className="w-5 h-5 text-red-500" />;
      case 'follow': return <Users className="w-5 h-5 text-green-500" />;
      case 'subscription': return <Gift className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-[var(--primary-color)]" />;
    }
  };

  const handleAction = () => {
    if (notification.type === 'stream_online' && notification.data?.broadcasterName) {
      navigate(`/stream/${notification.data.broadcasterName}`);
    } else if (notification.type === 'follow' && notification.data?.followerName) {
      navigate(`/channel/${notification.data.followerName}`);
    } else if (notification.type === 'subscription' && notification.data?.userName) {
      navigate(`/channel/${notification.data.userName}`);
    }
  };

  return (
    <div className={`p-4 rounded-xl transition-all ${!notification.read ? 'bg-[var(--primary-color)]/10 border-l-4 border-l-[var(--primary-color)]' : 'bg-[var(--card-secondary-bg)]'}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-[var(--sidebar-text)]">{notification.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{notification.message}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">{timeAgo}</p>
            </div>
            <div className="flex gap-1">
              {!notification.read && (
                <button onClick={onMarkRead} className="p-1.5 hover:bg-[var(--card-hover-bg)] rounded" title="Mark read">
                  <CheckCheck className="w-4 h-4 text-[var(--primary-color)]" />
                </button>
              )}
              <button onClick={onDelete} className="p-1.5 hover:bg-[var(--card-hover-bg)] rounded" title="Delete">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
          {notification.type === 'stream_online' && (
            <button onClick={handleAction} className="mt-3 flex items-center gap-1.5 text-sm text-[var(--primary-color)] hover:underline">
              <Eye className="w-4 h-4" /> Watch stream
            </button>
          )}
          {(notification.type === 'follow' || notification.type === 'subscription') && (
            <button onClick={handleAction} className="mt-3 flex items-center gap-1.5 text-sm text-[var(--primary-color)] hover:underline">
              <Users className="w-4 h-4" /> View profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;