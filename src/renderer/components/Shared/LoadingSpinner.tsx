// src/renderer/components/Shared/LoadingSpinner.tsx

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean; // renamed from fullScreen to be clearer
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Loading...',
  overlay = false,
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-14 h-14 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full border-t-transparent
            border-[var(--primary-color)]
            animate-spin
          `}
          style={{
            animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
        <div
          className={`
            absolute inset-0 rounded-full
            border-2 border-[var(--primary-color)]/30
            animate-pulse
          `}
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-white/80 tracking-wide">
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;