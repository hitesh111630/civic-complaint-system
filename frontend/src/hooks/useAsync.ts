import { useState, useCallback } from 'react';

export function useAsync<T>(fn: (...args: any[]) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const run = useCallback(async (...args: any[]) => {
    setLoading(true); setError(null);
    try {
      const result = await fn(...args);
      setData(result); return result;
    } catch (e: any) {
      setError(e?.message || 'An error occurred');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { loading, error, data, run };
}
