import React, { useState, useEffect } from "react";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import settingsAPI from "../../api/core/settings";

type ThemeMode = "light" | "dark" | "system";

const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [fontSize, setFontSize] = useState(14);
  const [compactMode, setCompactMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsAPI.getSettings();
        if (settings.theme) setTheme(settings.theme);
        if (settings.fontSize) setFontSize(settings.fontSize);
        if (settings.compactMode) setCompactMode(settings.compactMode);
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
        theme,
        fontSize,
        compactMode,
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
        <Palette className="w-8 h-8 text-[var(--twitch-purple)]" />
        <h1 className="text-3xl font-bold text-white">Appearance</h1>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Theme</h2>
          <div className="space-y-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={(e) => setTheme(e.target.value as ThemeMode)}
                  className="w-4 h-4"
                />
                <Icon className="w-5 h-5 text-[var(--twitch-purple)]" />
                <span className="text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Font Size</h2>
          <div className="space-y-3">
            <input
              type="range"
              min="12"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Small (12px)</span>
              <span className="font-semibold">Current: {fontSize}px</span>
              <span>Large (18px)</span>
            </div>
            <p
              className="p-3 rounded-lg bg-[var(--bg-overlay)]"
              style={{ fontSize: `${fontSize}px` }}
            >
              Preview text to see the font size
            </p>
          </div>
        </div>

        {/* Compact Mode */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Layout</h2>
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <span className="text-white">Compact Mode</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Reduce spacing and padding for a more compact interface
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
