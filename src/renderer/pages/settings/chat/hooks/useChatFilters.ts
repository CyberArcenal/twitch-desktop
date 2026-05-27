import { useState, useEffect, useCallback } from "react";
import { userAPI } from "../../../../api/core/user";
import { settingsAPI } from "../../../../api/core/settings";
import {
  chatSettingsAPI,
  type ChatSettings,
} from "../../../../api/core/chatSettings";
import { showError, showSuccess } from "../../../../utils/notification";
import { dialogs } from "../../../../utils/dialogs";

export const useChatFilters = () => {
  const [filterWords, setFilterWords] = useState<string[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load filter words from settings
  const loadFilterWords = useCallback(async () => {
    const res = await settingsAPI.get("chatFilters");
    if (res.status && Array.isArray(res.data)) {
      setFilterWords(res.data);
    } else {
      setFilterWords([]);
    }
  }, []);

  // Load chat moderation settings from Twitch API
  const loadChatSettings = useCallback(async () => {
    try {
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) return;
      const broadcasterId = userRes.data.id;
      const moderatorId = broadcasterId; // same for own channel
      const res = await chatSettingsAPI.get(broadcasterId, moderatorId);
      if (res.status && res.data) {
        setChatSettings(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load chat settings", err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadFilterWords(), loadChatSettings()]);
    setLoading(false);
  }, [loadFilterWords, loadChatSettings]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Add filter word
  const addFilterWord = async (word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return false;
    if (filterWords.includes(trimmed)) {
      showError("Word already in filter list");
      return false;
    }
    const res = await settingsAPI.addChatFilter(trimmed);
    if (res.status) {
      setFilterWords((prev) => [...prev, trimmed]);
      showSuccess(`Added "${trimmed}" to filter list`);
      return true;
    } else {
      showError(res.message);
      return false;
    }
  };

  // Remove filter word
  const removeFilterWord = async (word: string) => {
    const confirmed = await dialogs.confirm({
      title: "Remove filter",
      message: `Remove "${word}" from block list?`,
    });
    if (!confirmed) return;
    const res = await settingsAPI.removeChatFilter(word);
    if (res.status) {
      setFilterWords((prev) => prev.filter((w) => w !== word));
      showSuccess(`Removed "${word}" from filter list`);
    } else {
      showError(res.message);
    }
  };

  // Update moderation setting (slow mode, follower mode)

  const updateModerationSetting = async (
    key: keyof ChatSettings,
    value: any,
  ) => {
    if (!chatSettings) return;
    setSaving(true);
    try {
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.data) throw new Error("Not logged in");
      const broadcasterId = userRes.data.id;
      const moderatorId = broadcasterId;
      const update: Partial<ChatSettings> = { [key]: value };
      const res = await chatSettingsAPI.update(
        broadcasterId,
        moderatorId,
        update,
      );
      if (res.status && res.data) {
        setChatSettings(res.data);
        showSuccess(`${key.replace(/_/g, " ")} updated`);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    filterWords,
    chatSettings,
    loading,
    saving,
    addFilterWord,
    removeFilterWord,
    updateModerationSetting,
    refresh: loadAll,
  };
};
