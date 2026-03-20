import { useState, useCallback, useEffect, useRef } from 'react';
import { auditLogsApi } from '@/lib/api';
import type { AuditLog } from '@/types';

export function useAuditLog(id: string) {
  const [data, setData] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Promise<AuditLog> | null>(null);

  const fetchData = useCallback(async (cancelled?: { current: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!inflightRef.current) {
        inflightRef.current = auditLogsApi.get(id);
      }
      const result = await inflightRef.current;
      inflightRef.current = null;
      if (!cancelled?.current) setData(result);
    } catch (err: unknown) {
      inflightRef.current = null;
      if (!cancelled?.current) {
        const message = err instanceof Error ? err.message : 'Failed to load audit log';
        setError(message);
      }
    } finally {
      if (!cancelled?.current) setIsLoading(false);
    }
  }, [id]);

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
