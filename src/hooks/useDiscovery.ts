import { useState, useEffect, useCallback } from 'react';
import { Artist } from '@/types';

interface DiscoveryParams {
  lat: number | null;
  lng: number | null;
  radius: number;
  role: 'BAND' | 'VENUE';
  query?: string;
  genre?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 20;

export function useDiscovery({ lat, lng, radius, role, query, genre, limit = DEFAULT_LIMIT }: DiscoveryParams) {
  const [data, setData] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiscovery = useCallback(async (currentOffset: number, isInitial: boolean) => {
    if (lat === null || lng === null) return;

    if (isInitial) {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);
    try {
      const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
      const gParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
      const response = await fetch(
        `/api/discovery?lat=${lat}&lng=${lng}&radius=${radius}&role=${role}&limit=${limit}&offset=${currentOffset}${qParam}${gParam}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      const newData = result.data || [];
      
      if (isInitial) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      if (newData.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lat, lng, radius, role, query, genre, limit]);

  useEffect(() => {
    fetchDiscovery(0, true);
  }, [fetchDiscovery]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
      fetchDiscovery(nextOffset, false);
    }
  };

  return { data, loading, loadingMore, error, loadMore, hasMore };
}
