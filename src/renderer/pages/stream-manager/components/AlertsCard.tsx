// components/AlertsCard.tsx
import React, { useState } from 'react';
import { useStreamEvents } from '../hooks/useStreamEvents';
import { UserPlus, Star, Rocket, Bell, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertsCardProps {
  isLive: boolean;
  channelId?: string;
}

const AlertsCard: React.FC<AlertsCardProps> = ({ isLive, channelId }) => {
  const { events } = useStreamEvents(channelId || '');
  const [alertsActive, setAlertsActive] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'subscribe': return <Star className="w-4 h-4 text-purple-400" />;
      case 'raid': return <Rocket className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-yellow-400" />;
    }
  };

  // Use only latest 5 events
  const latestEvents = events.slice(0, 5);

  return (
    <div className="bg-[#1f1f23] rounded-xl shadow-lg border border-[#2a2a2e] flex flex-col overflow-hidden flex-1">
      <div className="p-3 border-b border-[#2a2a2e] flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Alerts</h3>
        <button
          onClick={() => setAlertsActive(!alertsActive)}
          className="px-2 py-0.5 rounded text-xs bg-[#2a2a2e] hover:bg-[#3a3a4a] transition"
        >
          {alertsActive ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
        </button>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {!isLive ? (
          <p className="text-center text-[#adadb8] text-sm italic">No live stream → no alerts</p>
        ) : latestEvents.length === 0 ? (
          <p className="text-center text-[#adadb8] text-sm italic">No recent alerts</p>
        ) : (
          latestEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-2 text-sm">
              {getIcon(event.type)}
              <div className="flex-1">
                <span className="text-white">{event.message}</span>
                <span className="text-[#adadb8] text-xs ml-2">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-[#2a2a2e]">
        <button className="w-full text-center text-sm bg-[#9147ff] py-1.5 rounded-lg hover:bg-[#772ce8] transition">
          {alertsActive ? 'Stop' : 'Start'} Alerts
        </button>
      </div>
    </div>
  );
};

export default AlertsCard;