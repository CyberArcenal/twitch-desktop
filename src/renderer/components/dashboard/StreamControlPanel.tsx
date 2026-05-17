import React, { useState } from 'react';
import { Play, Square, AlertCircle, Settings } from 'lucide-react';
import Button from '../UI/Button';

interface StreamControlPanelProps {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  streamHealth?: {
    bitrate: number;
    fps: number;
    dropped: number;
  };
}

const StreamControlPanel: React.FC<StreamControlPanelProps> = ({
  isStreaming,
  onStart,
  onStop,
  streamHealth
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [streamTitle, setStreamTitle] = useState('My Stream');
  const [streamCategory, setStreamCategory] = useState('Just Chatting');

  return (
    <div className="windows-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Stream Control</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors"
        >
          <Settings size={20} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Stream Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-sm text-[var(--text-secondary)]">
          {isStreaming ? 'Currently Live' : 'Not Streaming'}
        </span>
      </div>

      {/* Stream Title & Category Editor */}
      {showSettings && (
        <div className="space-y-4 border-t border-[var(--border-default)] pt-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)]">Stream Title</label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              disabled={isStreaming}
              className="w-full mt-2 px-3 py-2 bg-[var(--bg-elevated)] text-white rounded border border-[var(--border-default)] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-secondary)]">Category</label>
            <input
              type="text"
              value={streamCategory}
              onChange={(e) => setStreamCategory(e.target.value)}
              disabled={isStreaming}
              className="w-full mt-2 px-3 py-2 bg-[var(--bg-elevated)] text-white rounded border border-[var(--border-default)] disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Stream Health Stats */}
      {isStreaming && streamHealth && (
        <div className="bg-[var(--bg-elevated)] p-4 rounded space-y-2">
          <h3 className="text-sm font-semibold text-white">Stream Health</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[var(--text-secondary)]">Bitrate</p>
              <p className="text-white font-semibold">{streamHealth.bitrate} kbps</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">FPS</p>
              <p className="text-white font-semibold">{streamHealth.fps}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)]">Dropped</p>
              <p className={`font-semibold ${streamHealth.dropped > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {streamHealth.dropped}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        <Button
          variant={isStreaming ? 'secondary' : 'primary'}
          onClick={onStart}
          disabled={isStreaming}
          icon={Play}
          iconPosition="left"
          className="flex-1"
        >
          Start
        </Button>
        <Button
          variant="danger"
          onClick={onStop}
          disabled={!isStreaming}
          icon={Square}
          iconPosition="left"
          className="flex-1"
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default StreamControlPanel;
