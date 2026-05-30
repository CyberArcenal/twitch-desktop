// src/renderer/pages/stream/components/ActivityFeedCard.tsx
import React, { useEffect, useState } from 'react';
import { UserPlus, Star, Rocket, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  type: 'follow' | 'subscribe' | 'raid';
  user: string;
  message: string;
  timestamp: Date;
}

interface ActivityFeedCardProps {
  channelId: string;
}

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ channelId }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Listen for EventSub events from backend
    const handleFollow = (data: any) => {
      setEvents(prev => [{
        id: `follow-${Date.now()}`,
        type: 'follow',
        user: data.followerName,
        message: `${data.followerName} followed!`,
        timestamp: new Date(),
      }, ...prev.slice(0, 4)]);
    };
    const handleSubscribe = (data: any) => {
      setEvents(prev => [{
        id: `sub-${Date.now()}`,
        type: 'subscribe',
        user: data.userName,
        message: `${data.userName} subscribed (Tier ${data.tier})!`,
        timestamp: new Date(),
      }, ...prev.slice(0, 4)]);
    };
    window.backendAPI?.on?.('eventsub:follow', handleFollow);
    window.backendAPI?.on?.('eventsub:subscribe', handleSubscribe);
    return () => {
      window.backendAPI?.off?.('eventsub:follow', handleFollow);
      window.backendAPI?.off?.('eventsub:subscribe', handleSubscribe);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'subscribe': return <Star className="w-4 h-4 text-purple-400" />;
      case 'raid': return <Rocket className="w-4 h-4 text-orange-400" />;
      default: return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e]">
      <h3 className="text-sm font-semibold text-white mb-2">Activity Feed</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.length === 0 && (
          <p className="text-xs text-[#adadb8] italic">No recent activity</p>
        )}
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-2 text-sm">
            {getIcon(ev.type)}
            <span className="text-white flex-1">{ev.message}</span>
            <span className="text-[#adadb8] text-xs">{formatDistanceToNow(ev.timestamp, { addSuffix: true })}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedCard;