// src/pages/Live/components/QuickTips.tsx
import React from 'react';
import { Lightbulb, Activity, Users, Bell } from 'lucide-react';

export const QuickTips: React.FC = () => {
  const tips = [
    {
      icon: Activity,
      text: "Check your internet speed before going live – at least 5 Mbps upload is recommended for 1080p.",
    },
    {
      icon: Users,
      text: "Interact with your chat early to build engagement and keep viewers around.",
    },
    {
      icon: Bell,
      text: "Set up Stream Alerts (follows, subs, bits) to thank your community in real time.",
    },
  ];

  return (
    <div className="windows-card p-6 space-y-3">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
        <Lightbulb size={18} className="text-yellow-500" />
        <h3 className="text-white font-semibold">Quick Tips</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <tip.icon size={14} className="mt-0.5 flex-shrink-0 text-[var(--twitch-purple)]" />
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 bg-[var(--bg-elevated)] p-2 rounded text-xs text-center text-[var(--text-secondary)]">
        💡 Pro tip: Use the "Go Live" button in the sidebar to quickly start a session.
      </div>
    </div>
  );
};