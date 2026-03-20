import { useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import type { CreateUserRequest } from '@/types';

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersApi.create(data);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}
