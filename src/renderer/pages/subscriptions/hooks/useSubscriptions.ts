// src/renderer/pages/subscriptions/hooks/useSubscriptions.ts
import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../../api/core/user';
import type { Subscriber, SubscriberWithDetails } from '../types';
import { showError } from '../../../utils/notification';

export const useSubscriptions = () => {
  const [subscribers, setSubscribers] = useState<SubscriberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userAPI.getUserSubscriptions();
      if (!res.status) {
        throw new Error(res.message || 'Failed to fetch subscribers');
      }
      
      // ✅ Fix: extract the nested `data` array
      let subscriptions = res.data?.data || [];  // <-- key change
      if (!Array.isArray(subscriptions)) {
        subscriptions = [];
      }
      
      // Enrich with default avatar (optional – later we could fetch real ones)
      const enriched: SubscriberWithDetails[] = subscriptions.map((sub: Subscriber) => ({
        ...sub,
        profile_image_url: sub.profile_image_url || 
          'https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe41b43f5-profile_image-70x70.png',
      }));
      
      setSubscribers(enriched);
      setTotal(enriched.length);
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const refresh = useCallback(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return {
    subscribers,
    loading,
    error,
    total,
    refresh,
  };
};