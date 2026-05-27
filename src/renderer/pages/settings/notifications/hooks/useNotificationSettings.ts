import { useState, useEffect, useCallback } from 'react';
import type { NotificationPreferences, NotificationType } from '../types';
import { settingsAPI } from '../../../../api/core/settings';
import { showError, showSuccess } from '../../../../utils/notification';

export const useNotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    stream_live: true,
    new_follower: true,
    subscription: true,
    gift_sub: true,
    raid: true,
    hype_train: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get('notificationPreferences');
      if (res.status && res.data) {
        setPreferences(res.data);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const togglePreference = useCallback(async (key: NotificationType, value: boolean) => {
    setSaving(true);
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs); // optimistic update
    try {
      const res = await settingsAPI.set('notificationPreferences', newPrefs);
      if (res.status) {
        showSuccess(`${key.replace(/_/g, ' ')} notifications ${value ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(err.message);
      // revert
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  const testNotification = useCallback(async (type: NotificationType) => {
    try {
      const res = await settingsAPI.testNotification(type);
      if (!res.status) throw new Error(res.message);
    } catch (err: any) {
      showError(err.message);
    }
  }, []);

  return {
    preferences,
    loading,
    saving,
    togglePreference,
    testNotification,
    refresh: loadPreferences,
  };
};