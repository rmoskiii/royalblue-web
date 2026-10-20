import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

export function useStaffListParams(defaults?: { status?: string; pageSize?: number }) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.max(1, Number(params.get('pageSize')) || defaults?.pageSize || 20);
  const qParam = params.get('q') ?? '';
  const [q, setQ] = useState(qParam);
  const debouncedQ = useDebouncedValue(q, 400);
  const status = params.get('status') ?? defaults?.status ?? '';
  const decidedBy = params.get('decidedBy') ?? '';

  const setListParams = useCallback(
    (patch: Record<string, string | number | undefined>, resetPage = true) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage) next.set('page', '1');
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  useEffect(() => {
    if (debouncedQ === qParam) return;
    setListParams({ q: debouncedQ });
  }, [debouncedQ, qParam, setListParams]);

  const query = useMemo(
    () => ({
      page,
      pageSize,
      q: debouncedQ || undefined,
      status: status || undefined,
      decidedBy: decidedBy || undefined,
    }),
    [page, pageSize, debouncedQ, status, decidedBy],
  );

  return { page, pageSize, q, setQ, status, decidedBy, query, setListParams };
}
