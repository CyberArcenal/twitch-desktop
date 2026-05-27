import React from 'react';
import { Server, CheckCircle2 } from 'lucide-react';
import type { IngestServer } from '../types';

interface IngestServerListProps {
  ingests: IngestServer[];
  loading: boolean;
}

const IngestServerList: React.FC<IngestServerListProps> = ({ ingests, loading }) => {
  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--card-secondary-bg)] rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-12 bg-[var(--card-secondary-bg)] rounded"></div>
            <div className="h-12 bg-[var(--card-secondary-bg)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const recommended = ingests.find(i => i.default);
  const others = ingests.filter(i => !i.default);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-2">Ingest Servers</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Choose the closest ingest server for best performance.
      </p>

      {recommended && (
        <div className="mb-4 p-3 bg-[var(--primary-color)]/10 rounded-lg border border-[var(--primary-color)]/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary-color)]" />
            <span className="font-medium text-[var(--sidebar-text)]">Recommended: {recommended.name}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Automatically selected for best latency</p>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {others.map(ingest => (
          <div key={ingest.id} className="flex items-center justify-between p-2 rounded hover:bg-[var(--card-hover-bg)]">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-sm text-[var(--sidebar-text)]">{ingest.name}</span>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {ingest.availability === 1 ? 'Available' : 'Degraded'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngestServerList;