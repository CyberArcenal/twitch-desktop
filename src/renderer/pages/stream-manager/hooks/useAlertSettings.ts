import { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api/core/settings';

interface AlertSettings {
  stream_live: boolean;
  new_follower: boolean;
  subscription: boolean;
  gift_sub: boolean;
  raid: boolean;
  hype_train: boolean;
}

export const useAlertSettings = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    stream_live: true,
    new_follower: true,
    subscription: true,
    gift_sub: true,
    raid: true,
    hype_train: true,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const prefsRes = await settingsAPI.get('notificationPreferences');
        if (prefsRes.status && prefsRes.data) setSettings(prefsRes.data);
        const soundRes = await settingsAPI.get('notificationsEnabled');
        if (soundRes.status) setSoundEnabled(soundRes.data);
      } catch (err) {
        console.error('Failed to load alert settings', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateSetting = async (key: keyof AlertSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await settingsAPI.updateNotificationPreferences(newSettings);
  };

  const toggleSound = async () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    await settingsAPI.set('notificationsEnabled', newSound);
  };

  return { settings, soundEnabled, loading, updateSetting, toggleSound };
};