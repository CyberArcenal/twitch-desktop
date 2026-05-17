import React, { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import settingsAPI from "../../api/core/settings";

const NotificationsSettings: React.FC = () => {
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [followAlerts, setFollowAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState(70);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsAPI.getSettings();
        if (settings.liveAlerts !== undefined) setLiveAlerts(settings.liveAlerts);
        if (settings.followAlerts !== undefined)
          setFollowAlerts(settings.followAlerts);
        if (settings.soundEnabled !== undefined)
          setSoundEnabled(settings.soundEnabled);
        if (settings.desktopNotifications !== undefined)
          setDesktopNotifications(settings.desktopNotifications);
        if (settings.notificationVolume)
          setNotificationVolume(settings.notificationVolume);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSettings({
        liveAlerts,
        followAlerts,
        soundEnabled,
        desktopNotifications,
        notificationVolume,
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-[var(--twitch-purple)]" />
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
      </div>

      <div className="space-y-8">
        {/* Alert Types */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Alert Types
          </h2>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors mb-3">
            <input
              type="checkbox"
              checked={liveAlerts}
              onChange={(e) => setLiveAlerts(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Live Alerts</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Get notified when your followed channels go live
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors">
            <input
              type="checkbox"
              checked={followAlerts}
              onChange={(e) => setFollowAlerts(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Follow Alerts</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Get notified when someone follows you
              </p>
            </div>
          </label>
        </div>

        {/* Desktop Notifications */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Desktop Notifications
          </h2>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors mb-4">
            <input
              type="checkbox"
              checked={desktopNotifications}
              onChange={(e) => setDesktopNotifications(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Enable Desktop Notifications</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Show desktop toasts for alerts
              </p>
            </div>
          </label>

          {desktopNotifications && (
            <div className="ml-7 p-3 rounded-lg bg-[var(--bg-overlay)] text-sm text-[var(--text-secondary)]">
              <p>
                💡 Desktop notifications will appear even when the app is in the
                background
              </p>
            </div>
          )}
        </div>

        {/* Sound Settings */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Sound Settings
          </h2>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors mb-4">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Enable Notification Sounds</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Play sound effects for alerts
              </p>
            </div>
          </label>

          {soundEnabled && (
            <div className="ml-7 space-y-3">
              <div>
                <label className="flex items-center gap-3 mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">
                    Volume
                  </span>
                  <span className="text-white font-semibold">
                    {notificationVolume}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={notificationVolume}
                  onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <button className="px-4 py-2 bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                🔊 Test Sound
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
