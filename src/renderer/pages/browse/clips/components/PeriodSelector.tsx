// src/renderer/pages/browse/clips/components/PeriodSelector.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import type { Period } from '../types';

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-[var(--card-secondary-bg)] rounded-lg p-1">
      <Calendar className="w-4 h-4 text-[var(--text-tertiary)] ml-2" />
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            period === p.value
              ? 'bg-[var(--primary-color)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;