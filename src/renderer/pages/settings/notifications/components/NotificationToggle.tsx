import React from 'react';
import Switch from '../../../../components/UI/Switch';

interface NotificationToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  description,
  icon,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[var(--primary-color)]">{icon}</div>
        <div>
          <p className="font-medium text-[var(--sidebar-text)]">{label}</p>
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
};

export default NotificationToggle;