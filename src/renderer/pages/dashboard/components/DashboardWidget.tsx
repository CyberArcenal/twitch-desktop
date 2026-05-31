// src/renderer/pages/dashboard/components/DashboardWidget.tsx
import React from 'react';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, children, className = '', action }) => {
  return (
    <div className={`bg-[var(--card-bg)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border-color)]">
        <h3 className="text-lg font-semibold text-[var(--sidebar-text)] flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[var(--primary-color)] to-[var(--accent-purple)]"></span>
          {title}
        </h3>
        {action && <div className="text-sm">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default DashboardWidget;