import { useState } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useStreamInfo = (streamData: any, onRefresh: () => void) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [title, setTitle] = useState(streamData?.title || '');
  const [category, setCategory] = useState(streamData?.game_name || '');

  const saveStreamInfo = async () => {
    if (!streamData?.user_id) return false;
    try {
      await streamManagerAPI.updateStreamInfo(streamData.user_id, title, category);
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
    title,
    setTitle,
    category,
    setCategory,
    saveStreamInfo,
  };
};