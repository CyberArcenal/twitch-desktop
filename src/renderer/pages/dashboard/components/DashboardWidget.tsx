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
    <div className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardWidget;