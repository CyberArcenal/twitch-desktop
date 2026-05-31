// src/renderer/pages/dashboard/components/QuickActions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Compass, Search, Flame, Clock } from 'lucide-react';

interface QuickActionsProps {
  onGoLive?: () => void;
}

const ActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}> = ({ icon: Icon, label, onClick, variant = 'secondary' }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    primary: "bg-gradient-to-r from-[#9146ff] to-[#772ce8] text-white shadow-md hover:shadow-lg hover:shadow-[#9146ff]/20",
    secondary: "bg-[var(--card-secondary-bg)] border border-[var(--border-color)] text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)] hover:border-[var(--primary-color)]/50",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--sidebar-text)] hover:bg-[var(--card-hover-bg)]"
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const QuickActions: React.FC<QuickActionsProps> = ({ onGoLive }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      {onGoLive && (
        <ActionButton
          icon={Radio}
          label="Go Live"
          onClick={onGoLive}
          variant="primary"
        />
      )}
      <ActionButton
        icon={Compass}
        label="Browse Categories"
        onClick={() => navigate('/browse/categories')}
      />
      <ActionButton
        icon={Search}
        label="Search Streams"
        onClick={() => navigate('/browse/live')}
      />
      <ActionButton
        icon={Flame}
        label="Top Games"
        onClick={() => navigate('/browse/top-games')}
      />
      <ActionButton
        icon={Clock}
        label="Watch Later"
        onClick={() => navigate('/watch-later')}
        variant="ghost"
      />
    </div>
  );
};

export default QuickActions;