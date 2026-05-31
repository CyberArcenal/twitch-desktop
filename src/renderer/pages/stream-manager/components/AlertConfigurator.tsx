import React from 'react';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { useAlertSettings } from '../hooks/useAlertSettings';

const AlertConfigurator: React.FC = () => {
  const { settings, soundEnabled, loading, updateSetting, toggleSound } = useAlertSettings();

  if (loading) return <div className="text-center text-[#adadb8] p-4">Loading alert settings...</div>;

  const alertTypes = [
    { key: 'stream_live', label: 'Stream Live', icon: '🔴' },
    { key: 'new_follower', label: 'New Follower', icon: '👤' },
    { key: 'subscription', label: 'Subscription', icon: '⭐' },
    { key: 'gift_sub', label: 'Gift Subscription', icon: '🎁' },
    { key: 'raid', label: 'Raid', icon: '🚀' },
    { key: 'hype_train', label: 'Hype Train', icon: '🚂' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#9147ff]" />
          <h3 className="text-sm font-semibold text-white">Alert Configuration</h3>
        </div>
        <button onClick={toggleSound} className="flex items-center gap-1 bg-[#2a2a2e] px-2 py-1 rounded text-xs hover:bg-[#3a3a4a]">
          {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          {soundEnabled ? 'Sound ON' : 'Sound OFF'}
        </button>
      </div>
      <div className="space-y-2">
        {alertTypes.map(({ key, label, icon }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-white flex items-center gap-2"><span>{icon}</span> {label}</span>
            <button
              onClick={() => updateSetting(key as keyof typeof settings, !settings[key as keyof typeof settings])}
              className={`relative w-10 h-5 rounded-full transition-colors ${settings[key as keyof typeof settings] ? 'bg-[#9147ff]' : 'bg-[#2a2a2e]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        ))}
      </div>
      <div className="text-xs text-[#adadb8] border-t border-[#2a2a2e] pt-3 mt-2">
        Alerts appear in the Alerts card and as desktop notifications (if enabled).
      </div>
    </div>
  );
};

export default AlertConfigurator;