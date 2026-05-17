// src/components/TitleBar.tsx
import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Get initial window state
    const fetchState = async () => {
      const state = await window.electronAPI.getWindowState();
      setIsMaximized(state.isMaximized);
    };
    fetchState();

    // Listen for window state changes
    const removeMax = window.electronAPI.onWindowMaximized(() => setIsMaximized(true));
    const removeRestore = window.electronAPI.onWindowRestored(() => setIsMaximized(false));

    return () => {
      removeMax();
      removeRestore();
    };
  }, []);

  return (
    <div className="draggable bg-[var(--bg-elevated)] border-b border-[var(--border-default)] flex items-center justify-between px-4 h-10 select-none">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-[var(--twitch-purple)] rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">T</span>
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)]">Twitch Desktop</span>
      </div>
      <div className="flex items-center gap-1 non-draggable">
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="p-1.5 hover:bg-[var(--bg-overlay)] rounded-md transition-colors"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        <button
          onClick={() => window.electronAPI.maximizeWindow()}
          className="p-1.5 hover:bg-[var(--bg-overlay)] rounded-md transition-colors"
          aria-label="Maximize"
        >
          {isMaximized ? (
            <Maximize2 className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <Square className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="p-1.5 hover:bg-[var(--accent-red)] rounded-md transition-colors group"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;