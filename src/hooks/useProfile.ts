import { useState, useEffect } from 'react';

export function useProfile() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbUser, setDbUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const result = await res.json();
          setDbUser(result.data);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return { dbUser, loading, error, refresh: () => setLoading(true) };
}
