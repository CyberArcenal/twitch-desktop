// src/renderer/pages/browse/clips/components/ClipModal.tsx
import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Clip } from '../../../../api/core/clips';

interface ClipModalProps {
  clip: Clip | null;
  onClose: () => void;
}

const ClipModal: React.FC<ClipModalProps> = ({ clip, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (clip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [clip]);

  if (!clip) return null;

  // Twitch clip embed URL (no autoplay by default)
  const embedUrl = `https://clips.twitch.tv/embed?clip=${clip.id}&parent=localhost`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="relative max-w-4xl w-full bg-[var(--card-bg)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">{clip.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">by {clip.creator_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Video embed */}
        <div className="aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            title={clip.title}
          />
        </div>

        {/* Footer with stats and open in browser button */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span>👁️ {clip.view_count.toLocaleString()} views</span>
            <span>📅 {new Date(clip.created_at).toLocaleDateString()}</span>
            <span>⏱️ {Math.floor(clip.duration / 60)}:{Math.floor(clip.duration % 60).toString().padStart(2, '0')}</span>
          </div>
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--primary-color)] text-white text-sm hover:bg-[var(--primary-hover)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open on Twitch
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClipModal;