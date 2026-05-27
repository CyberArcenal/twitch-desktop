import React from 'react';
import Switch from '../../../../components/UI/Switch';
import type { ChatSettings } from '../../../../api/core/chatSettings';

interface ModerationTogglesProps {
  settings: ChatSettings | null;
  saving: boolean;
  onToggle: (key: keyof ChatSettings, value: any) => void; // ← changed to any
}

const ModerationToggles: React.FC<ModerationTogglesProps> = ({ settings, saving, onToggle }) => {
  if (!settings) return null;

  return (
    <div className="space-y-4">
      {/* Slow Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--sidebar-text)]">Enable Slow Mode</p>
          <p className="text-sm text-[var(--text-secondary)]">Limit how often users can send messages</p>
        </div>
        <Switch
          checked={settings.slow_mode}
          onChange={(checked) => onToggle('slow_mode', checked)}
          disabled={saving}
        />
      </div>

      {/* Slow Mode Wait Time (only if enabled) */}
      {settings.slow_mode && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border-color)]">
          <label className="text-sm text-[var(--sidebar-text)]">Slow mode wait time (seconds)</label>
          <select
            value={settings.slow_mode_wait_time}
            onChange={(e) => onToggle('slow_mode_wait_time', parseInt(e.target.value))}
            disabled={saving}
            className="mt-1 block w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm"
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={20}>20 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={120}>120 seconds</option>
            <option value={300}>300 seconds</option>
          </select>
        </div>
      )}

      {/* Followers-Only Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--sidebar-text)]">Followers-Only Mode</p>
          <p className="text-sm text-[var(--text-secondary)]">Only users who have followed for a certain time can chat</p>
        </div>
        <Switch
          checked={settings.follower_mode}
          onChange={(checked) => onToggle('follower_mode', checked)}
          disabled={saving}
        />
      </div>

      {/* Followers-Only Duration (only if enabled) */}
      {settings.follower_mode && (
        <div className="ml-6 pl-4 border-l-2 border-[var(--border-color)]">
          <label className="text-sm text-[var(--sidebar-text)]">Follow time required (minutes)</label>
          <select
            value={settings.follower_mode_duration}
            onChange={(e) => onToggle('follower_mode_duration', parseInt(e.target.value))}
            disabled={saving}
            className="mt-1 block w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm"
          >
            <option value={0}>No restriction (any follower)</option>
            <option value={10}>10 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={1440}>1 day</option>
            <option value={10080}>1 week</option>
            <option value={43200}>1 month</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ModerationToggles;