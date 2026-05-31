import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

export const useStreamHealth = (isLive: boolean) => {
  const [bitrate, setBitrate] = useState(0);
  const [fps, setFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    const fetchStats = async () => {
      try {
        const statusRes = await streamManagerAPI.getOBSStatus();
        if (!statusRes.status || !statusRes.data) {
          setConnected(false);
          return;
        }
        setConnected(true);

        const statsRes = await streamManagerAPI.getOBSStats();
        if (statsRes.status && statsRes.data) {
          const totalFrames = statsRes.data.outputTotalFrames || 1;
          const skipped = statsRes.data.outputSkippedFrames || 0;
          const droppedPercent = (skipped / totalFrames) * 100;
          setDroppedFrames(Math.min(100, Math.round(droppedPercent)));
          setCpuUsage(statsRes.data.cpuUsage || 0);
          setFps(statsRes.data.activeFps || 0);
        }

        const streamStatus = await streamManagerAPI.getStreamStatus();
        if (streamStatus.status && streamStatus.data?.outputActive) {
          setBitrate(3500); // placeholder – compute real bitrate if needed
        } else {
          setBitrate(0);
        }
      } catch (err) {
        console.error('Failed to fetch OBS stats', err);
        setConnected(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  return { bitrate, fps, droppedFrames, cpuUsage, connected };
};