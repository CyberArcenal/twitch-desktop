// src/components/Modals/GoLiveModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button';
import { BroadcastSettings } from '../../pages/Live/components/BroadcastSettings';
import { useStreamSession } from '../../pages/Live/hooks/useStreamSession';
import { Play, Loader2 } from 'lucide-react';
import Modal from '../UI/Modal';
import { StreamKeySection } from '../../pages/Live/components/StreamKeySection';
import { QuickTips } from '../../pages/Live/components/QuickTips';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoLiveModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { settings, updateSettings, startStream } = useStreamSession();
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    // Simulate a short delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    startStream();
    setStarting(false);
    onClose();
    navigate('/live'); // navigate to the live dashboard page
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Go Live" size="xl" blur>
      <div className="space-y-6">
        {/* Stream Title & Game */}
        <div className="windows-card p-6">
          <label className="block mb-4">
            <span className="text-sm font-semibold text-white mb-2 block">Stream Title</span>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => updateSettings({ title: e.target.value })}
              placeholder="Enter your stream title..."
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--twitch-purple)]"
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-white mb-2 block">Game Category</span>
            <select
              value={settings.gameName}
              onChange={(e) => updateSettings({ gameName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--twitch-purple)]"
            >
              {['Just Chatting', 'World of Warcraft', 'Valorant', 'League of Legends', 'Minecraft', 'Counter-Strike 2', 'PUBG: Battlegrounds', 'Elden Ring'].map(game => (
                <option key={game}>{game}</option>
              ))}
            </select>
          </label>
        </div>

        <BroadcastSettings settings={settings} onChange={updateSettings} />
        <StreamKeySection />
        <QuickTips />

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <Button variant="secondary" onClick={() => { onClose(); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleStart}
            disabled={starting}
            icon={Play}
            iconPosition="left"
          >
            {starting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {starting ? 'Starting...' : 'Go Live'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};