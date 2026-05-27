import React, { useState } from 'react';
import { RefreshCw, KeyRound } from 'lucide-react';
import { useStreamSettings } from './hooks/useStreamSettings';
import StreamKeyCard from './components/StreamKeyCard';
import IngestServerList from './components/IngestServerList';
import RegenerateKeyModal from './components/RegenerateKeyModal';
import Button from '../../../components/UI/Button';

const StreamSettingsPage: React.FC = () => {
  const { streamKey, ingests, loading, regenerating, regenerateKey, refresh } = useStreamSettings();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Stream Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure your stream key and ingest server
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        <StreamKeyCard streamKey={streamKey} loading={loading} />
        
        <div className="flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowRegenerateModal(true)}
            icon={KeyRound}
            disabled={loading || !streamKey}
          >
            Regenerate Stream Key
          </Button>
        </div>

        <IngestServerList ingests={ingests} loading={loading} />

        <div className="bg-[var(--card-secondary-bg)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-medium mb-2">📺 Need help?</p>
          <p>
            Learn how to set up your stream key in{' '}
            <a
              href="https://obsproject.com/wiki/Stream-Settings#twitch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-color)] hover:underline"
            >
              OBS Studio
            </a>{' '}
            or{' '}
            <a
              href="https://streamlabs.com/content-hub/post/connecting-streamlabs-obs-to-twitch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-color)] hover:underline"
            >
              Streamlabs Desktop
            </a>.
          </p>
        </div>
      </div>

      <RegenerateKeyModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={() => {
          setShowRegenerateModal(false);
          regenerateKey();
        }}
        regenerating={regenerating}
      />
    </div>
  );
};

export default StreamSettingsPage;