// src/renderer/pages/stream-manager/components/CustomAutomationsCard.tsx
import React, { useState } from "react";
import AutomationPanel from "./AutomationPanel";
import SceneManager from "./SceneManager";
import AlertConfigurator from "./AlertConfigurator";

interface CustomAutomationsCardProps {
  isLive: boolean;
}

const CustomAutomationsCard: React.FC<CustomAutomationsCardProps> = ({ isLive }) => {
  const [activeTab, setActiveTab] = useState<"automations" | "scenes" | "alerts">("automations");

  return (
    <div className="bg-[#1f1f23] rounded-xl shadow-lg border border-[#2a2a2e] flex flex-col overflow-hidden h-full">
      {/* Tab bar */}
      <div className="flex border-b border-[#2a2a2e]">
        {["automations", "scenes", "alerts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-white border-b-2 border-[#9147ff] bg-[#9147ff]/10"
                : "text-[#adadb8] hover:text-white"
            }`}
          >
            {tab === "automations" ? "Automations" : tab === "scenes" ? "Scenes" : "Alerts"}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "automations" && <AutomationPanel isLive={isLive} />}
        {activeTab === "scenes" && <SceneManager />}
        {activeTab === "alerts" && <AlertConfigurator />}
      </div>
    </div>
  );
};

export default CustomAutomationsCard;