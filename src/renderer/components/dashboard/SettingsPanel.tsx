import React, { useState } from 'react';
import { Settings, Zap, Loader } from 'lucide-react';
import Button from '../UI/Button';

interface Platform {
  name: string;
  enabled: boolean;
  connected: boolean;
}

interface SettingsPanelProps {
  platforms?: Platform[];
  onPlatformToggle?: (platformName: string, enabled: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  platforms = [
    { name: 'Twitch', enabled: true, connected: true },
    { name: 'YouTube', enabled: false, connected: false },
    { name: 'TikTok', enabled: false, connected: false },
  ],
  onPlatformToggle
}) => {
  const [localPlatforms, setLocalPlatforms] = useState(platforms);
  const [loadingPlugin, setLoadingPlugin] = useState<string | null>(null);

  const handlePlatformToggle = (platformName: string) => {
    const updated = localPlatforms.map(p =>
      p.name === platformName ? { ...p, enabled: !p.enabled } : p
    );
    setLocalPlatforms(updated);
    onPlatformToggle?.(platformName, !localPlatforms.find(p => p.name === platformName)?.enabled);
  };

  const handlePluginLoad = async (pluginName: string) => {
    setLoadingPlugin(pluginName);
    // Simulate plugin loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoadingPlugin(null);
  };

  return (
    <div className="windows-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings size={20} />
        Settings & Integrations
      </h2>

      {/* Multi-Platform Toggle */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Streaming Platforms</h3>
        <div className="space-y-2">
          {localPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={platform.enabled}
                  onChange={() => handlePlatformToggle(platform.name)}
                  disabled={!platform.connected}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium text-white">{platform.name}</p>
                  <p className={`text-xs ${platform.connected ? 'text-green-400' : 'text-red-400'}`}>
                    {platform.connected ? '✓ Connected' : '⚠ Not Connected'}
                  </p>
                </div>
              </div>
              {!platform.connected && (
                <button className="text-xs text-[var(--brand-color)] hover:underline">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plugin Loader */}
      <div className="space-y-3 border-t border-[var(--bg-secondary)] pt-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap size={16} />
          Plugins
        </h3>
        <div className="space-y-2">
          {['Chatbot', 'Overlays', 'Analytics', 'Monetization'].map((plugin) => (
            <div
              key={plugin}
              className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded"
            >
              <span className="text-sm text-white">{plugin}</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePluginLoad(plugin)}
                disabled={loadingPlugin === plugin}
                className="min-w-24"
              >
                {loadingPlugin === plugin ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="space-y-3 border-t border-[var(--bg-secondary)] pt-4">
        <h3 className="text-sm font-semibold text-white">Quick Settings</h3>
        <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded transition-colors">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          <span className="text-sm text-[var(--text-secondary)]">Auto-save stream settings</span>
        </label>
        <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded transition-colors">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          <span className="text-sm text-[var(--text-secondary)]">Show notifications</span>
        </label>
        <label className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded transition-colors">
          <input type="checkbox" className="w-4 h-4" />
          <span className="text-sm text-[var(--text-secondary)]">Enable advanced metrics</span>
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;
