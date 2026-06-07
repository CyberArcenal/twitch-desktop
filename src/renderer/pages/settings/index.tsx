// src/renderer/pages/settings/index.tsx
import React, { useState } from 'react';
import {
  MessageSquare,
  Bell,
  Shield,
  MonitorPlay,
  Users,
  Palette,
} from 'lucide-react';
import NotificationsSection from './sections/NotificationsSection';
import SecuritySection from './sections/SecuritySection';
import AppearanceSection from './sections/AppearanceSection';

type SettingsTab =
  | 'chat'
  | 'notifications'
  | 'security'
  | 'stream'
  | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      case 'appearance':
        return <AppearanceSection />;
      default:
        return <NotificationsSection />;
    }
  };

  return (
    <div className="flex h-full bg-[#0e0e10]">
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0 bg-[#1f1f23] border-r border-[#2a2a2e] overflow-y-auto m-2 rounded-2xl">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-[#adadb8] uppercase tracking-wider mb-3">
            Settings
          </h2>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-[#9147ff] text-white shadow-md'
                      : 'text-[#efeff1] hover:bg-[#2a2a2e]'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;