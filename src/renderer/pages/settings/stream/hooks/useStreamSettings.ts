import { useState, useEffect, useCallback } from 'react';
import { streamSettingsAPI, type IngestServer } from '../../../../api/core/streamSettings';
import { showError, showSuccess } from '../../../../utils/notification';
import { dialogs } from '../../../../utils/dialogs';


export const useStreamSettings = () => {
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [ingests, setIngests] = useState<IngestServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchStreamKey = useCallback(async () => {
    try {
      const res = await streamSettingsAPI.getStreamKey();
      if (res.status && res.data) {
        setStreamKey(res.data.stream_key);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(`Failed to load stream key: ${err.message}`);
    }
  }, []);

  const fetchIngests = useCallback(async () => {
    try {
      const res = await streamSettingsAPI.getIngestServers();
      if (res.status && res.data) {
        setIngests(res.data);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(`Failed to load ingest servers: ${err.message}`);
    }
  }, []);

  const regenerateKey = useCallback(async () => {
    const confirmed = await dialogs.confirm({
      title: 'Regenerate Stream Key',
      message: 'Warning: Regenerating your stream key will disconnect any active stream. Your old key will stop working immediately. Are you sure?',
      confirmText: 'Yes, regenerate',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const res = await streamSettingsAPI.regenerateStreamKey();
      if (res.status && res.data) {
        setStreamKey(res.data.stream_key);
        showSuccess('Stream key regenerated successfully');
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showError(`Failed to regenerate: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStreamKey(), fetchIngests()]);
      setLoading(false);
    };
    load();
  }, [fetchStreamKey, fetchIngests]);

  return {
    streamKey,
    ingests,
    loading,
    regenerating,
    regenerateKey,
    refresh: () => {
      fetchStreamKey();
      fetchIngests();
    },
  };
};