// src/hooks/useUpdater.ts
import { useEffect, useState } from 'react';
import type { DownloadProgress, UpdateInfo } from '../api/utils/updater';
import updaterAPI from '../api/utils/updater';

export type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';

export const useUpdater = () => {
  const [state, setState] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up listeners
    const unsubChecking = updaterAPI.onChecking(() => {
      setState('checking');
      setError(null);
    });
    const unsubAvailable = updaterAPI.onUpdateAvailable((info) => {
      setState('available');
      setUpdateInfo(info);
      setError(null);
    });
    const unsubNotAvailable = updaterAPI.onUpdateNotAvailable(() => {
      setState('idle');
      setUpdateInfo(null);
    });
    const unsubProgress = updaterAPI.onDownloadProgress((p) => {
      setState('downloading');
      setProgress(p);
    });
    const unsubDownloaded = updaterAPI.onUpdateDownloaded((info) => {
      setState('downloaded');
      setUpdateInfo(info);
    });
    const unsubError = updaterAPI.onError((msg) => {
      setState('error');
      setError(msg);
    });

    // Trigger a check on mount (optional – you can remove this if you rely on the periodic check)
    checkForUpdates();

    return () => {
      unsubChecking();
      unsubAvailable();
      unsubNotAvailable();
      unsubProgress();
      unsubDownloaded();
      unsubError();
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await updaterAPI.checkForUpdates();
      if (response.status && response.data) {
        setUpdateInfo(response.data);
      }
    } catch (err: any) {
      setState('error');
      setError(err.message);
    }
  };

const downloadUpdate = async () => {
  try {
    setState('downloading');        // ← Important: optimistic update
    await updaterAPI.downloadUpdate();
    // Do NOT set state back to 'available' here
  } catch (err: any) {
    setState('error');
    setError(err.message);
    throw err; // rethrow so component can catch
  }
};

  const installUpdate = async () => {
    try {
      await updaterAPI.quitAndInstall();
    } catch (err: any) {
      setState('error');
      setError(err.message);
    }
  };

  return {
    state,
    updateInfo,
    progress,
    error,
    setState, // Expose setState if you want to allow manual state overrides (e.g., for UI feedback)
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  };
};