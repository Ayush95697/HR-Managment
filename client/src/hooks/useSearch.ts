import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import { useState, useEffect } from 'react';

export function useSearch(query: string, delay: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute
  });
}
