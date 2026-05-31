// src/renderer/pages/stream-manager/hooks/useSceneManager.ts
import { useState, useEffect, useRef } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

// Global state outside React to persist across component remounts
let globalConnectionPromise: Promise<boolean> | null = null;
let globalConnected = false;
let globalScenes: Array<{ sceneName: string; sceneIndex: number }> = [];
let globalCurrentScene = '';

export const useSceneManager = () => {
  const [connected, setConnected] = useState(globalConnected);
  const [scenes, setScenes] = useState(globalScenes);
  const [currentScene, setCurrentScene] = useState(globalCurrentScene);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [obsPassword, setObsPassword] = useState('');
  const isMounted = useRef(true);

  // Update global state when local state changes
  useEffect(() => {
    globalConnected = connected;
    globalScenes = scenes;
    globalCurrentScene = currentScene;
  }, [connected, scenes, currentScene]);

  const loadScenes = async () => {
    if (!globalConnected) return;
    setLoading(true);
    try {
      const scenesRes = await streamManagerAPI.getScenes();
      if (scenesRes.status && scenesRes.data) {
        setScenes(scenesRes.data);
      }
      const currentRes = await streamManagerAPI.getCurrentScene();
      if (currentRes.status && currentRes.data) {
        setCurrentScene(currentRes.data);
      }
    } catch (err) {
      console.error('Failed to load scenes', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const connectOBS = async (password?: string) => {
    // If already connected, just load scenes
    if (globalConnected) {
      await loadScenes();
      return;
    }

    // If connection already in progress, wait for it
    if (globalConnectionPromise) {
      const success = await globalConnectionPromise;
      if (success && isMounted.current) {
        setConnected(true);
        await loadScenes();
      }
      return;
    }

    // Start new connection attempt
    globalConnectionPromise = (async () => {
      try {
        const res = await streamManagerAPI.obsConnect('localhost', 4455, password !== undefined ? password : '');
        if (res.status) {
          if (isMounted.current) {
            setConnected(true);
            setShowPasswordModal(false);
            setObsPassword('');
          }
          await loadScenes();
          return true;
        } else {
          if (res.message === 'AUTH_REQUIRED') {
            if (isMounted.current) setShowPasswordModal(true);
          } else {
            if (isMounted.current) alert(`Failed to connect: ${res.message}`);
          }
          return false;
        }
      } catch (err) {
        console.error('Connection error:', err);
        return false;
      } finally {
        globalConnectionPromise = null;
      }
    })();

    await globalConnectionPromise;
  };

  const handlePasswordSubmit = async () => {
    await streamManagerAPI.obsUpdatePassword(obsPassword);
    await connectOBS(obsPassword);
  };

  const refreshScenes = () => {
    if (globalConnected) loadScenes();
  };

  const switchScene = async (sceneName: string) => {
    const res = await streamManagerAPI.setCurrentScene(sceneName);
    if (res.status) {
      setCurrentScene(sceneName);
    }
  };

  // Periodically check connection status and sync global state
  useEffect(() => {
    isMounted.current = true;

    const checkStatus = async () => {
      const statusRes = await streamManagerAPI.getOBSStatus();
      if (statusRes.status && statusRes.data !== globalConnected) {
        if (statusRes.data) {
          // Now connected
          if (!globalConnected) {
            setConnected(true);
            await loadScenes();
          }
        } else {
          // Disconnected
          setConnected(false);
          setScenes([]);
          setCurrentScene('');
          globalScenes = [];
          globalCurrentScene = '';
        }
      }
    };

    // Initial connection attempt (will use stored password)
    connectOBS();

    const statusInterval = setInterval(checkStatus, 5000);
    const sceneInterval = setInterval(() => {
      if (globalConnected) loadScenes();
    }, 10000);

    return () => {
      isMounted.current = false;
      clearInterval(statusInterval);
      clearInterval(sceneInterval);
    };
  }, []);

  return {
    connected,
    scenes,
    currentScene,
    loading,
    showPasswordModal,
    obsPassword,
    setObsPassword,
    connectOBS,
    handlePasswordSubmit,
    refreshScenes,
    switchScene,
    setShowPasswordModal,
  };
};