import { useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import type { UpdateUserRoleRequest } from '@/types';

export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, data: UpdateUserRoleRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersApi.updateRole(id, data);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
}
