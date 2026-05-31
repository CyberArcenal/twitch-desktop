// src/renderer/pages/stream-manager/hooks/useStreamInfo.ts
import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';
import { settingsAPI } from '../../../api/core/settings'; // ✅ idagdag

export interface StreamInfo {
  title: string;
  game_id: string;
  game_name: string;
  broadcaster_language: string;
  tags: string[];
  is_branded_content: boolean;
  is_rerun: boolean;
  content_classification_labels: string[];
  go_live_notification: string;
}

export const useStreamInfo = (streamData: any, onRefresh: () => void) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [info, setInfo] = useState<StreamInfo>({
    title: streamData?.title || '',
    game_id: streamData?.game_id || '',
    game_name: streamData?.game_name || '',
    broadcaster_language: streamData?.broadcaster_language || 'en',
    tags: streamData?.tags || [],
    is_branded_content: streamData?.is_branded_content || false,
    is_rerun: streamData?.is_rerun || false,
    content_classification_labels: streamData?.content_classification_labels || [],
    go_live_notification: '',
  });

  // Load saved go_live_notification from settings
  useEffect(() => {
    const loadGoLiveMessage = async () => {
      const res = await settingsAPI.get('go_live_notification');
      if (res.status && res.data) {
        setInfo(prev => ({ ...prev, go_live_notification: res.data }));
      } else {
        // default message
        const defaultMsg = `${streamData?.user_login || 'channel'} went live!`;
        setInfo(prev => ({ ...prev, go_live_notification: defaultMsg }));
      }
    };
    loadGoLiveMessage();
  }, [streamData?.user_login]);

  useEffect(() => {
    setInfo({
      title: streamData?.title || '',
      game_id: streamData?.game_id || '',
      game_name: streamData?.game_name || '',
      broadcaster_language: streamData?.broadcaster_language || 'en',
      tags: streamData?.tags || [],
      is_branded_content: streamData?.is_branded_content || false,
      is_rerun: streamData?.is_rerun || false,
      content_classification_labels: streamData?.content_classification_labels || [],
      go_live_notification: info.go_live_notification, // retain existing message
    });
  }, [streamData]);

  const updateField = (field: keyof StreamInfo, value: any) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  const saveStreamInfo = async () => {
    if (!streamData?.user_id) return false;
    try {
      // Update Twitch stream info (API fields only)
      await streamManagerAPI.updateStreamInfo(streamData.user_id, {
        title: info.title,
        game_id: info.game_id,
        broadcaster_language: info.broadcaster_language,
        tags: info.tags,
        is_branded_content: info.is_branded_content,
        is_rerun: info.is_rerun,
        content_classification_labels: info.content_classification_labels,
        go_live_notification: info.go_live_notification,
      });
      // Save go_live_notification locally
      await settingsAPI.set('go_live_notification', info.go_live_notification);
      setShowEditModal(false);
      onRefresh();
      return true;
    } catch (err) {
      alert('Failed to update stream info');
      return false;
    }
  };

  return {
    showEditModal,
    setShowEditModal,
    info,
    updateField,
    saveStreamInfo,
  };
};