import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture, Download, Clock, User } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onPictureInPicture: () => void;
  onAddToWatchLater: () => void;
  onGoToChannel: () => void;
  quality: string;
  onQualityChange: (quality: string) => void;
}

const qualities = ['auto', '160p', '360p', '480p', '720p', '1080p', 'source'];

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  volume,
  isMuted,
  onPlay,
  onPause,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  onPictureInPicture,
  onAddToWatchLater,
  onGoToChannel,
  quality,
  onQualityChange,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button onClick={isPlaying ? onPause : onPlay} className="text-white hover:text-[var(--primary-color)]">
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleMute} className="text-white hover:text-[var(--primary-color)]">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quality */}
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value)}
          className="bg-black/50 text-white text-xs rounded px-2 py-1 border border-white/30"
        >
          {qualities.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        <div className="flex-1" />

        {/* Other buttons */}
        <button onClick={onAddToWatchLater} title="Watch Later" className="text-white hover:text-[var(--primary-color)]">
          <Clock className="w-5 h-5" />
        </button>
        <button onClick={onGoToChannel} title="Channel Page" className="text-white hover:text-[var(--primary-color)]">
          <User className="w-5 h-5" />
        </button>
        <button onClick={onPictureInPicture} title="Picture in Picture" className="text-white hover:text-[var(--primary-color)]">
          <PictureInPicture className="w-5 h-5" />
        </button>
        <button onClick={onFullscreen} title="Fullscreen" className="text-white hover:text-[var(--primary-color)]">
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;