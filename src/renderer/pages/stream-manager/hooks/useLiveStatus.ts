// src/renderer/pages/stream-manager/hooks/useLiveStatus.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { userAPI } from "../../../api/core/user";
import { streamsAPI } from "../../../api/core/streams";

export const useLiveStatus = () => {
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const checkLiveStatus = useCallback(async () => {
    try {
      const userRes = await userAPI.getCurrentUser();
      if (!userRes.status || !userRes.data) {
        setIsLive(false);
        setStreamData(null);
        return;
      }
      const streamRes = await streamsAPI.getStreamByUserLogin(userRes.data.login);
      if (streamRes.status && streamRes.data) {
        setIsLive(true);
        setStreamData(streamRes.data);
      } else {
        setIsLive(false);
        setStreamData(null);
      }
    } catch (err) {
      console.error("Failed to check live status:", err);
      setIsLive(false);
      setStreamData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    checkLiveStatus();
  }, [checkLiveStatus]);

  // Auto‑refresh on mount and every 30 seconds
  useEffect(() => {
    checkLiveStatus();

    // Poll every 30 seconds
    intervalRef.current = window.setInterval(() => {
      checkLiveStatus();
    }, 30000);

    // Also refresh when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkLiveStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkLiveStatus]);

  return { isLive: isLive ?? false, streamData, loading, refresh };
};