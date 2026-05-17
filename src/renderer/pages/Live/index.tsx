import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StreamControlPanel from '../../components/dashboard/StreamControlPanel';
import ChatPanel from '../../components/dashboard/ChatPanel';
import AnalyticsPanel from '../../components/dashboard/AnalyticsPanel';
import NotificationsPanel from '../../components/dashboard/NotificationsPanel';
import SettingsPanel from '../../components/dashboard/SettingsPanel';

interface DashboardLayoutConfig {
  layout: 'compact' | 'balanced' | 'expanded';
}

const LiveDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<DashboardLayoutConfig>({ layout: 'balanced' });

  // Mock stream state
  const [streamHealth] = useState({
    bitrate: 6000,
    fps: 60,
    dropped: 0,
  });

  const handleStartStream = () => {
    setIsStreaming(true);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    // Optionally redirect after stopping
    // navigate('/');
  };

  // Responsive layout classes based on screen size
  const getLayoutClasses = () => {
    switch (layoutConfig.layout) {
      case 'compact':
        return 'grid-cols-1';
      case 'expanded':
        return 'grid-cols-1 lg:grid-cols-2';
      case 'balanced':
      default:
        return 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Live Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {isStreaming ? 'You are currently broadcasting' : 'Ready to start streaming'}
          </p>
        </div>

        {/* Layout Toggle (Optional) */}
        <div className="mb-6 flex gap-2">
          {(['compact', 'balanced', 'expanded'] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => setLayoutConfig({ layout })}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors capitalize ${
                layoutConfig.layout === layout
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80'
              }`}
            >
              {layout}
            </button>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className={`grid gap-6 ${getLayoutClasses()}`}>
          {/* Stream Control Panel - Top Priority */}
          <div className="lg:col-span-1">
            <StreamControlPanel
              isStreaming={isStreaming}
              onStart={handleStartStream}
              onStop={handleStopStream}
              streamHealth={isStreaming ? streamHealth : undefined}
            />
          </div>

          {/* Chat Panel - Full Height, Takes 1-2 columns */}
          <div className="lg:col-span-1 lg:row-span-2 flex flex-col">
            <ChatPanel />
          </div>

          {/* Analytics Panel */}
          <div className="lg:col-span-1">
            <AnalyticsPanel />
          </div>

          {/* Notifications Panel */}
          <div className="lg:col-span-1">
            <NotificationsPanel />
          </div>

          {/* Settings Panel - Full Width on Mobile, Spans 2 columns on Desktop */}
          <div className="lg:col-span-2 xl:col-span-2">
            <SettingsPanel />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            All panels are modular and can be rearranged. Use the layout buttons above to change dashboard density.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboardPage;
