
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<T>;
  keepPreviousData?: boolean;
}

export const useOptimizedQuery = <T>(options: OptimizedQueryOptions<T>) => {
  const memoizedQueryKey = useMemo(() => options.queryKey, [JSON.stringify(options.queryKey)]);
  
  const queryOptions: UseQueryOptions<T> = {
    ...options,
    queryKey: memoizedQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  };

  // Use placeholderData correctly for the new version
  if (options.keepPreviousData) {
    queryOptions.placeholderData = (previousData) => previousData;
  }

  return useQuery(queryOptions);
};
