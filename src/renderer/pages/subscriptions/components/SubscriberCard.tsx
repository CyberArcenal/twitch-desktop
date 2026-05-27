// src/renderer/pages/subscriptions/components/SubscriberCard.tsx
import React, { type JSX } from 'react';
import { Gift, Crown, Sparkles } from 'lucide-react';
import type { SubscriberWithDetails } from '../types';

interface SubscriberCardProps {
  subscriber: SubscriberWithDetails;
}

const SubscriberCard: React.FC<SubscriberCardProps> = ({ subscriber }) => {
  const tierMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    '1000': { label: 'Tier 1', color: 'bg-blue-600', icon: <Crown className="w-4 h-4" /> },
    '2000': { label: 'Tier 2', color: 'bg-purple-600', icon: <Crown className="w-4 h-4" /> },
    '3000': { label: 'Tier 3', color: 'bg-orange-600', icon: <Sparkles className="w-4 h-4" /> },
  };
  const tierInfo = tierMap[subscriber.tier] || { label: `Tier ${parseInt(subscriber.tier) / 1000}`, color: 'bg-gray-600', icon: <Crown className="w-4 h-4" /> };

  // Format subscription start? Not available; use plan name
  const subscriptionDate = new Date().toLocaleDateString(); // placeholder

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--primary-color)] transition-all group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={subscriber.profile_image_url}
          alt={subscriber.user_name}
          className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] group-hover:border-[var(--primary-color)] transition-all"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--sidebar-text)] truncate">
              {subscriber.user_name}
            </h3>
            {subscriber.is_gift && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full">
                <Gift className="w-3 h-3" />
                Gift
              </span>
            )}
            <span className={`inline-flex items-center gap-1 text-xs ${tierInfo.color} text-white px-2 py-0.5 rounded-full`}>
              {tierInfo.icon}
              {tierInfo.label}
            </span>
          </div>
          {subscriber.plan_name && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">{subscriber.plan_name}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-tertiary)]">
            <span>Subscribed {subscriptionDate}</span>
            {subscriber.gifter_name && (
              <span> • Gifted by {subscriber.gifter_name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;