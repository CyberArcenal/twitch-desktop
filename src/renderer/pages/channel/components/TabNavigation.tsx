// src/renderer/pages/channel/components/TabNavigation.tsx
import React from 'react';

type Tab = 'streams' | 'clips' | 'schedule' | 'about';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
  { id: 'streams', label: 'Streams & VODs' },
  { id: 'clips', label: 'Clips' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'about', label: 'About' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="sticky top-0 z-20 bg-[var(--sidebar-bg)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-8">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group relative py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-[var(--primary-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)] rounded-full animate-fadeInUp" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;