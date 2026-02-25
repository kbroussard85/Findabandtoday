import { useState, useEffect } from 'react';

interface DiscoveryParams {
  lat: number | null;
  lng: number | null;
  radius: number;
  role: 'BAND' | 'VENUE';
}

export function useDiscovery({ lat, lng, radius, role }: DiscoveryParams) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) return;

    const fetchDiscovery = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/discovery?lat=${lat}&lng=${lng}&radius=${radius}&role=${role}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscovery();
  }, [lat, lng, radius, role]);

  return { data, loading, error };
}
