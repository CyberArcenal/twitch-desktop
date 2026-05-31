import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export const useUptime = (isLive: boolean, startedAt?: string) => {
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    if (!isLive || !startedAt) {
      setUptime('');
      return;
    }
    const update = () => {
      const diff = formatDistanceToNow(new Date(startedAt), { addSuffix: true });
      setUptime(diff);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isLive, startedAt]);

  return uptime;
};