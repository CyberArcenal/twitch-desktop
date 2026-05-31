import { useState, useEffect } from 'react';
import { streamManagerAPI } from '../../../api/core/streamManager';

interface AutomationLog {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error";
}

export const useAutomation = () => {
  const [autoRaidEnabled, setAutoRaidEnabled] = useState(false);
  const [autoClipEnabled, setAutoClipEnabled] = useState(false);
  const [autoMessageEnabled, setAutoMessageEnabled] = useState(false);
  const [autoMessageText, setAutoMessageText] = useState("Thanks for the follow/sub! 🎉");
  const [raidTarget, setRaidTarget] = useState("");
  const [automationRunning, setAutomationRunning] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      const res = await streamManagerAPI.getAutomationStatus();
      if (res.status && res.data) {
        setAutomationRunning(res.data.running);
        setAutoRaidEnabled(res.data.config.autoRaid);
        setAutoClipEnabled(res.data.config.autoClip);
        setAutoMessageEnabled(res.data.config.autoMessage);
        setAutoMessageText(res.data.config.autoMessageText);
        setRaidTarget(res.data.config.raidTarget || "");
      }
    };
    loadStatus();
  }, []);

  // Listen for automation logs
  useEffect(() => {
    const handleLog = (data: AutomationLog) => {
      setLogs(prev => [{ id: data.id, timestamp: new Date(data.timestamp), message: data.message, type: data.type }, ...prev.slice(0, 49)]);
    };
    window.backendAPI?.on?.("automation:log", handleLog);
    return () => window.backendAPI?.off?.("automation:log", handleLog);
  }, []);

  const startAutomation = async () => {
    const config = { autoRaid: autoRaidEnabled, autoClip: autoClipEnabled, autoMessage: autoMessageEnabled, autoMessageText, raidTarget: raidTarget || null };
    const res = await streamManagerAPI.startAutomation(config);
    if (res.status) setAutomationRunning(true);
    return res.status;
  };

  const stopAutomation = async () => {
    const res = await streamManagerAPI.stopAutomation();
    if (res.status) setAutomationRunning(false);
    return res.status;
  };

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date(), message, type }, ...prev.slice(0, 49)]);
  };

  const clearLogs = () => setLogs([]);

  return {
    autoRaidEnabled, setAutoRaidEnabled,
    autoClipEnabled, setAutoClipEnabled,
    autoMessageEnabled, setAutoMessageEnabled,
    autoMessageText, setAutoMessageText,
    raidTarget, setRaidTarget,
    automationRunning, setAutomationRunning,
    logs, setLogs,
    startAutomation,
    stopAutomation,
    addLog,
    clearLogs,
  };
};