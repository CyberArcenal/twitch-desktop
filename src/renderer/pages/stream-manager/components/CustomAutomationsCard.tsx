// components/CustomAutomationsCard.tsx
import React, { useState } from "react";
import AutomationPanel from "./AutomationPanel";

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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content area – takes all remaining space and scrolls if needed */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "automations" && <AutomationPanel isLive={isLive} />}
        {activeTab === "scenes" && (
          <div className="h-full flex items-center justify-center text-[#adadb8]">Scene management coming soon</div>
        )}
        {activeTab === "alerts" && (
          <div className="h-full flex items-center justify-center text-[#adadb8]">Alert configuration coming soon</div>
        )}
      </div>
    </div>
  );
};

export default CustomAutomationsCard;