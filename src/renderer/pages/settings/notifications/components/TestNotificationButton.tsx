import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import type { NotificationType } from '../types';

interface TestNotificationButtonProps {
  type: NotificationType;
  label: string;
  onTest: (type: NotificationType) => Promise<void>;
}

const TestNotificationButton: React.FC<TestNotificationButtonProps> = ({ type, label, onTest }) => {
  const [testing, setTesting] = useState(false);

  const handleClick = async () => {
    setTesting(true);
    await onTest(type);
    setTesting(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={testing}
      className="text-xs px-2 py-1 rounded bg-[var(--card-secondary-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition flex items-center gap-1"
    >
      <Bell className="w-3 h-3" />
      {testing ? 'Sending...' : `Test ${label}`}
    </button>
  );
};

export default TestNotificationButton;