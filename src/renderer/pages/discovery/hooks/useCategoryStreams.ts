import { useEffect, useState } from 'react';
import { streamsAPI, type Stream } from '../../../api/core/streams';

interface CategoryStreamsMap {
  [gameId: string]: Stream[] | null;
}

const cache: CategoryStreamsMap = {};
const pendingRequests: { [gameId: string]: Promise<Stream[]> } = {};

export const useCategoryStreams = (gameId: string) => {
  const [streams, setStreams] = useState<Stream[] | null>(cache[gameId] ?? null);
  const [loading, setLoading] = useState(!cache[gameId]);

  useEffect(() => {
    if (cache[gameId]) {
      setStreams(cache[gameId]);
      setLoading(false);
      return;
    }

    if (pendingRequests[gameId]) {
      pendingRequests[gameId].then((data) => {
        cache[gameId] = data;
        setStreams(data);
        setLoading(false);
      });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const promise = streamsAPI
        .getTopStreamsWithFilters(20, undefined, gameId)
        .then((res) => (res.status && res.data?.data ? res.data.data : []));
      pendingRequests[gameId] = promise;
      const data = await promise;
      delete pendingRequests[gameId];
      cache[gameId] = data;
      setStreams(data);
      setLoading(false);
    };
    fetchData();
  }, [gameId]);

  return { streams: streams ?? [], loading };
};