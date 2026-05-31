import { streamManagerAPI } from '../../../api/core/streamManager';

export const useClip = () => {
  const createClip = async (broadcasterId: string) => {
    if (!broadcasterId) return false;
    try {
      const res = await streamManagerAPI.createClip(broadcasterId);
      if (res.status) {
        alert(`Clip created! Edit here: ${res.data.edit_url}`);
        return true;
      } else {
        alert(`Failed to create clip: ${res.message}`);
        return false;
      }
    } catch (err) {
      alert('Error creating clip');
      return false;
    }
  };
  return { createClip };
};