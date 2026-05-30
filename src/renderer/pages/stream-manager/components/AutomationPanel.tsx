// components/AutomationPanel.tsx
import React, { useState, useEffect } from "react";
import { Upload, Trash2, Play, Square } from "lucide-react";

interface AutomationLog {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error";
}

interface AutomationPanelProps {
  isLive: boolean;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ isLive }) => {
  const [autoRaidEnabled, setAutoRaidEnabled] = useState(false);
  const [autoClipEnabled, setAutoClipEnabled] = useState(false);
  const [autoMessageEnabled, setAutoMessageEnabled] = useState(false);
  const [scripts, setScripts] = useState<{ name: string; enabled: boolean }[]>([]);
  const [scriptName, setScriptName] = useState("");
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [automationRunning, setAutomationRunning] = useState(true);

  useEffect(() => {
    const handleAutomationLog = (data: AutomationLog) => {
      const logWithTimestamp = { ...data, timestamp: data.timestamp ? new Date(data.timestamp) : new Date() };
      setLogs((prev) => [logWithTimestamp, ...prev.slice(0, 49)]);
    };
    window.backendAPI?.on?.("automation:log", handleAutomationLog);
    return () => window.backendAPI?.off?.("automation:log", handleAutomationLog);
  }, []);

  const addLocalLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [{ id: Date.now().toString(), timestamp: new Date(), message, type }, ...prev.slice(0, 49)]);
  };

  const handleToggleAutoRaid = () => {
    const newState = !autoRaidEnabled;
    setAutoRaidEnabled(newState);
    addLocalLog(`Auto‑raid ${newState ? "enabled" : "disabled"}`, newState ? "success" : "info");
  };

  const handleToggleAutoClip = () => {
    const newState = !autoClipEnabled;
    setAutoClipEnabled(newState);
    addLocalLog(`Auto‑clip ${newState ? "enabled" : "disabled"}`, newState ? "success" : "info");
  };

  const handleToggleAutoMessage = () => {
    const newState = !autoMessageEnabled;
    setAutoMessageEnabled(newState);
    addLocalLog(`Auto‑message ${newState ? "enabled" : "disabled"}`, newState ? "success" : "info");
  };

  const handleAddScript = () => {
    if (!scriptName.trim()) return;
    setScripts((prev) => [...prev, { name: scriptName.trim(), enabled: true }]);
    addLocalLog(`Custom script "${scriptName.trim()}" added`, "success");
    setScriptName("");
  };

  const handleToggleScript = (index: number) => {
    setScripts((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
    const script = scripts[index];
    addLocalLog(`Script "${script.name}" ${script.enabled ? "disabled" : "enabled"}`, "info");
  };

  const handleRemoveScript = (index: number) => {
    const script = scripts[index];
    setScripts((prev) => prev.filter((_, i) => i !== index));
    addLocalLog(`Script "${script.name}" removed`, "error");
  };

  const handleStartAutomation = () => {
    setAutomationRunning(true);
    addLocalLog("Automation system started", "success");
  };

  const handleStopAutomation = () => {
    setAutomationRunning(false);
    addLocalLog("Automation system stopped", "error");
  };

  const handleResetLogs = () => {
    setLogs([]);
    addLocalLog("Automation logs cleared", "info");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Triggers */}
        <div>
          <h4 className="text-xs font-medium text-[#adadb8] uppercase mb-2">Triggers</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Auto‑raid when stream ends</span>
              <button
                onClick={handleToggleAutoRaid}
                disabled={!isLive}
                className={`relative w-10 h-5 rounded-full transition-colors ${autoRaidEnabled ? "bg-[#9147ff]" : "bg-[#2a2a2e]"} ${!isLive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoRaidEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Auto‑clip on viewer spike</span>
              <button
                onClick={handleToggleAutoClip}
                disabled={!isLive}
                className={`relative w-10 h-5 rounded-full transition-colors ${autoClipEnabled ? "bg-[#9147ff]" : "bg-[#2a2a2e]"} ${!isLive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoClipEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Auto‑message on new follower/sub</span>
              <button
                onClick={handleToggleAutoMessage}
                disabled={!isLive}
                className={`relative w-10 h-5 rounded-full transition-colors ${autoMessageEnabled ? "bg-[#9147ff]" : "bg-[#2a2a2e]"} ${!isLive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoMessageEnabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Scripts */}
        <div>
          <h4 className="text-xs font-medium text-[#adadb8] uppercase mb-2">Custom Scripts</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Script name (e.g., 'greeting.js')"
              className="flex-1 bg-[#0e0e10] border border-[#2a2a2e] rounded px-2 py-1 text-sm text-white"
            />
            <button onClick={handleAddScript} className="p-1 bg-[#9147ff] rounded hover:bg-[#772ce8]">
              <Upload className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {scripts.length === 0 ? (
              <p className="text-xs text-[#adadb8] italic">No custom scripts loaded</p>
            ) : (
              scripts.map((script, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#0e0e10] p-1 rounded">
                  <span className="text-xs text-white truncate">{script.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggleScript(idx)} className="text-xs text-[#adadb8] hover:text-white">
                      {script.enabled ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => handleRemoveScript(idx)} className="text-xs text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-medium text-[#adadb8] uppercase">Automation Logs</h4>
            <button onClick={handleResetLogs} className="text-xs text-[#adadb8] hover:text-white">Clear</button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-[#adadb8] italic">No automation events yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-[#9147ff] pl-2">
                  <span className="text-[#adadb8]">{log.timestamp.toLocaleTimeString()}</span>
                  <span className={`ml-2 ${log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-white"}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Buttons always at bottom */}
      <div className="p-3 border-t border-[#2a2a2e] flex gap-2">
        <button
          onClick={handleStartAutomation}
          disabled={automationRunning}
          className="flex-1 flex items-center justify-center gap-1 bg-[#9147ff] py-1.5 rounded-lg hover:bg-[#772ce8] disabled:opacity-50 text-sm"
        >
          <Play className="w-3 h-3" /> Start
        </button>
        <button
          onClick={handleStopAutomation}
          disabled={!automationRunning}
          className="flex-1 flex items-center justify-center gap-1 bg-[#2a2a2e] py-1.5 rounded-lg hover:bg-[#3a3a4a] disabled:opacity-50 text-sm"
        >
          <Square className="w-3 h-3" /> Stop
        </button>
      </div>
    </div>
  );
};

export default AutomationPanel;