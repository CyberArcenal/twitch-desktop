// src/renderer/pages/watch-later/components/WatchLaterItem.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Clock, GripVertical, Loader2, ImageOff } from 'lucide-react';
import type { WatchLaterItem as WatchLaterItemType } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface WatchLaterItemProps {
  item: WatchLaterItemType;
  onRemove: () => void;
  onMarkAsWatched: () => void;
  dragHandleProps?: any;
}

const WatchLaterItem: React.FC<WatchLaterItemProps> = ({
  item,
  onRemove,
  onMarkAsWatched,
  dragHandleProps,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addedAgo = formatDistanceToNow(new Date(item.addedAt), { addSuffix: true });

  // Fix thumbnail URL – replace dimensions if placeholders exist
  const getThumbnailUrl = () => {
    if (!item.thumbnail) return '';
    // Replace common dimension placeholders
    let url = item.thumbnail
      .replace('{width}', '160')
      .replace('{height}', '90')
      .replace('%{width}', '160')
      .replace('%{height}', '90');
    // If still contains braces, use a fallback
    if (url.includes('{') || url.includes('%')) {
      return '';
    }
    return url;
  };

  const thumbnailUrl = getThumbnailUrl();

  const handleClick = () => {
    navigate(item.url);
  };

  return (
    <div className="group relative flex items-center gap-3 p-3 bg-[#1f1f23] border border-[#2a2a2e] rounded-xl hover:border-[#9147ff]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#9147ff]/10">
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing text-[#adadb8] hover:text-white transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Thumbnail with loading and error states */}
      <div
        className="flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-[#0e0e10] cursor-pointer relative"
        onClick={handleClick}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0e0e10] z-10">
            <Loader2 className="w-4 h-4 text-[#9147ff] animate-spin" />
          </div>
        )}
        {!imageError && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.channelName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1f1f23]">
            <ImageOff className="w-5 h-5 text-[#adadb8]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
        <h3 className="font-semibold text-white truncate group-hover:text-[#9147ff] transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-[#adadb8] mt-0.5">
          <span>{item.channelName}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {addedAgo}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={onMarkAsWatched}
          className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#adadb8] hover:text-green-400 transition-colors"
          title="Mark as watched"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-[#2a2a2e] text-[#adadb8] hover:text-red-400 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WatchLaterItem;