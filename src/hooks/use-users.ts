import { useState, useCallback, useEffect, useRef } from 'react';
import { usersApi } from '@/lib/api';
import type { User, UserFilters } from '@/types';

export function useUsers(filters?: UserFilters) {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersJson = JSON.stringify(filters);
  const inflightRef = useRef<Promise<User[]> | null>(null);

  const fetchData = useCallback(async (cancelled?: { current: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!inflightRef.current) {
        inflightRef.current = usersApi.list(filters);
      }
      const result = await inflightRef.current;
      inflightRef.current = null;
      if (!cancelled?.current) setData(result);
    } catch (err: unknown) {
      inflightRef.current = null;
      if (!cancelled?.current) {
        const message = err instanceof Error ? err.message : 'Failed to load users';
        setError(message);
      }
    } finally {
      if (!cancelled?.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersJson]);

  useEffect(() => {
    const cancelled = { current: false };
    fetchData(cancelled);
    return () => { cancelled.current = true; };
  }, [fetchData]);

  const refetch = useCallback(() => {
    inflightRef.current = null;
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}
