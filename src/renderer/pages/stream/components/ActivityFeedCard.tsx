// src/renderer/pages/stream/components/ActivityFeedCard.tsx
import React, { useEffect, useState, useRef } from 'react';
import { UserPlus, Star, Rocket, Zap, Sparkles, BellRing, Tv } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  type: 'follow' | 'subscribe' | 'stream_online' | 'raid' | 'hype_train';
  user: string;
  message: string;
  timestamp: Date;
  tier?: string;
}

interface ActivityFeedCardProps {
  channelId: string;
  channelName?: string;
}

const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ channelId, channelName }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);

    // --- Listen to actual events from your EventSub service ---
    const handleFollow = (data: any) => {
      const newEvent: Event = {
        id: `follow-${Date.now()}-${Math.random()}`,
        type: 'follow',
        user: data.followerName || 'Someone',
        message: `${data.followerName} followed the channel!`,
        timestamp: new Date(),
      };
      addEvent(newEvent);
    };

    const handleSubscription = (data: any) => {
      const tierMap: Record<string, string> = { '1000': 'Tier 1', '2000': 'Tier 2', '3000': 'Tier 3' };
      const tierDisplay = tierMap[data.tier] || `Tier ${parseInt(data.tier) / 1000}`;
      const newEvent: Event = {
        id: `sub-${Date.now()}-${Math.random()}`,
        type: 'subscribe',
        user: data.userName || 'Someone',
        message: `${data.userName} subscribed (${tierDisplay})${data.isGift ? ' as a gift' : ''}!`,
        timestamp: new Date(),
        tier: data.tier,
      };
      addEvent(newEvent);
    };

    const handleStreamOnline = (data: any) => {
      const newEvent: Event = {
        id: `live-${Date.now()}-${Math.random()}`,
        type: 'stream_online',
        user: data.broadcasterName || 'Streamer',
        message: `${data.broadcasterName} is now live: ${data.title}`,
        timestamp: new Date(),
      };
      addEvent(newEvent);
    };

    // --- Optional: listen to raid/hype_train if you add them later ---
    // For now, we'll just define dummy handlers but not attach them
    // or you can leave them out.

    if (window.backendAPI?.on) {
      window.backendAPI.on('eventsub:follow', handleFollow);
      window.backendAPI.on('eventsub:subscription', handleSubscription);
      window.backendAPI.on('eventsub:stream-online', handleStreamOnline);
      // window.backendAPI.on('eventsub:raid', handleRaid);
      // window.backendAPI.on('eventsub:hype_train', handleHypeTrain);
    }

    return () => {
      if (window.backendAPI?.off) {
        window.backendAPI.off('eventsub:follow', handleFollow);
        window.backendAPI.off('eventsub:subscription', handleSubscription);
        window.backendAPI.off('eventsub:stream-online', handleStreamOnline);
      }
    };
  }, [channelId]);

  const addEvent = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev].slice(0, 20));
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 50);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'subscribe': return <Star className="w-4 h-4 text-purple-400" />;
      case 'stream_online': return <Tv className="w-4 h-4 text-red-400" />;
      case 'raid': return <Rocket className="w-4 h-4 text-orange-400" />;
      case 'hype_train': return <Sparkles className="w-4 h-4 text-yellow-400" />;
      default: return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBackgroundClass = (type: string) => {
    switch (type) {
      case 'follow': return 'hover:bg-green-500/10';
      case 'subscribe': return 'hover:bg-purple-500/10';
      case 'stream_online': return 'hover:bg-red-500/10';
      case 'raid': return 'hover:bg-orange-500/10';
      case 'hype_train': return 'hover:bg-yellow-500/10';
      default: return 'hover:bg-gray-500/10';
    }
  };

  return (
    <div className="bg-[#1f1f23] rounded-xl p-4 shadow-lg border border-[#2a2a2e] flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#9147ff]" />
          Activity Feed
          {!isConnected && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
              Reconnecting...
            </span>
          )}
        </h3>
        {events.length > 0 && (
          <button onClick={() => setEvents([])} className="text-xs text-[#adadb8] hover:text-red-400 transition">
            Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 transition-all">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-[#adadb8] text-xs italic">
            <Zap className="w-8 h-8 mb-2 opacity-30" />
            <p>No recent activity</p>
            <p className="text-[10px]">Follows, subscriptions, and live notifications will appear here.</p>
          </div>
        )}
        {events.map((ev, idx) => (
          <div
            key={ev.id}
            className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-all duration-200 animate-slideInRight ${getBackgroundClass(ev.type)}`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {getIcon(ev.type)}
            <span className="text-white flex-1 text-xs sm:text-sm break-words">{ev.message}</span>
            <span className="text-[#adadb8] text-xs whitespace-nowrap ml-2">
              {formatDistanceToNow(ev.timestamp, { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>

      {events.length > 0 && (
        <div className="mt-2 text-[10px] text-center text-[#adadb8] border-t border-[#2a2a2e] pt-2">
          Live updates • Real‑time
        </div>
      )}
    </div>
  );
};

export default ActivityFeedCard;