import { useState, useEffect } from 'react';
import { eventsubAPI } from '../../../api/core/eventsub';

export interface StreamEvent {
  id: string;
  type: 'follow' | 'subscribe' | 'raid';
  user: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export const useAlertsFeed = (channelId: string) => {
  const [events, setEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    if (!channelId) return;
    eventsubAPI.start().catch(console.error);
    eventsubAPI.subscribeFollows(channelId).catch(console.error);
    eventsubAPI.subscribeSubscriptions(channelId).catch(console.error);

    const handleFollow = (data: any) => {
      setEvents(prev => [{
        id: `follow-${Date.now()}`,
        type: 'follow',
        user: data.followerName,
        message: `${data.followerName} followed you!`,
        timestamp: new Date(),
      }, ...prev.slice(0, 49)]);
    };

    const handleSubscribe = (data: any) => {
      setEvents(prev => [{
        id: `sub-${Date.now()}`,
        type: 'subscribe',
        user: data.userName,
        message: `${data.userName} subscribed (Tier ${data.tier})!`,
        timestamp: new Date(),
      }, ...prev.slice(0, 49)]);
    };

    window.backendAPI?.on?.('eventsub:follow', handleFollow);
    window.backendAPI?.on?.('eventsub:subscribe', handleSubscribe);

    return () => {
      window.backendAPI?.off?.('eventsub:follow', handleFollow);
      window.backendAPI?.off?.('eventsub:subscribe', handleSubscribe);
    };
  }, [channelId]);

  const clearEvents = () => setEvents([]);

  return { events, clearEvents };
};