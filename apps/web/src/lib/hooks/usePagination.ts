import { useCallback, useMemo, useState } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 25 } = options;

  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / state.limit)),
    [state.total, state.limit],
  );

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setTotal = useCallback((total: number) => {
    setState((prev) => ({ ...prev, total }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, Math.ceil(prev.total / prev.limit)),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  return {
    page: state.page,
    limit: state.limit,
    total: state.total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
  };
}
