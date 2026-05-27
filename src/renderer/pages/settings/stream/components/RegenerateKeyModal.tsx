import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';

interface RegenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  regenerating: boolean;
}

const RegenerateKeyModal: React.FC<RegenerateKeyModalProps> = ({ isOpen, onClose, onConfirm, regenerating }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Regenerate Stream Key" size="sm">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[var(--sidebar-text)]">
            Regenerating your stream key will:
          </p>
          <ul className="text-sm text-[var(--text-secondary)] list-disc ml-4 mt-2 space-y-1">
            <li>Disconnect your current stream immediately</li>
            <li>Make your old stream key invalid</li>
            <li>Require updating your broadcasting software</li>
          </ul>
          <p className="text-sm text-red-400 mt-3 font-medium">This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="secondary" onClick={onClose} disabled={regenerating}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={regenerating}>
          {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
        </Button>
      </div>
    </Modal>
  );
};

export default RegenerateKeyModal;