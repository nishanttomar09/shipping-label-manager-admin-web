import { useState, useCallback, useEffect, useRef } from 'react';
import { auditLogsApi } from '@/lib/api';
import type { AuditLog, AuditLogFilters, PaginationMeta } from '@/types';

export function useAuditLogs(filters?: AuditLogFilters) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersJson = JSON.stringify(filters);
  const inflightRef = useRef<Promise<{ data: AuditLog[]; meta: PaginationMeta }> | null>(null);

  const fetchData = useCallback(async (cancelled?: { current: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!inflightRef.current) {
        inflightRef.current = auditLogsApi.list(filters);
      }
      const result = await inflightRef.current;
      inflightRef.current = null;
      if (!cancelled?.current) {
        setData(result.data);
        setMeta(result.meta);
      }
    } catch (err: unknown) {
      inflightRef.current = null;
      if (!cancelled?.current) {
        const message = err instanceof Error ? err.message : 'Failed to load audit logs';
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

  return { data, meta, isLoading, error, refetch };
}
