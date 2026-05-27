import React from 'react';

type Tab = 'streams' | 'clips' | 'schedule' | 'about';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'streams', label: 'Streams & VODs' },
  { id: 'clips', label: 'Clips' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'about', label: 'About' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-[var(--border-color)] px-4 md:px-6">
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;