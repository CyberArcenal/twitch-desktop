// src/renderer/pages/subscriptions/index.tsx
import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { useSubscriptions } from './hooks/useSubscriptions';
import SubscriberCard from './components/SubscriberCard';
import Button from '../../components/UI/Button';

const SubscriptionsPage: React.FC = () => {
  const { subscribers, loading, error, total, refresh } = useSubscriptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Failed to load subscribers</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Button variant="primary" size="sm" className="mt-4" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Subscriptions</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {total} {total === 1 ? 'subscriber' : 'subscribers'} to your channel
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Subscriber grid */}
      {subscribers.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
          <Users className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-lg font-medium text-[var(--sidebar-text)]">No subscribers yet</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            When viewers subscribe to your channel, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscribers.map((sub) => (
            <SubscriberCard key={sub.user_id} subscriber={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;