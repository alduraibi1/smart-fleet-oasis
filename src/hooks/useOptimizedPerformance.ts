
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';

// Hook للبحث المحسن
export function useOptimizedSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  initialQuery: string = ''
) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // تأخير البحث لتحسين الأداء
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedQuery.toLowerCase());
        }
        return String(value || '').toLowerCase().includes(debouncedQuery.toLowerCase());
      })
    );
  }, [data, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    filteredData,
    isSearching: query !== debouncedQuery
  };
}

// Hook للترقيم المحسن
export function useOptimizedPagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // إعادة تعيين الصفحة عند تغيير البيانات
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

// Hook للفرز المحسن
export function useOptimizedSorting<T>(
  data: T[],
  initialSortKey?: keyof T,
  initialDirection: 'asc' | 'desc' = 'asc'
) {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialDirection);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // التعامل مع القيم الفارغة
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // الفرز الرقمي
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // الفرز النصي
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'ar');
      } else {
        return bStr.localeCompare(aStr, 'ar');
      }
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey]);

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort
  };
}

// Hook لمراقبة الأداء
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  renderCount.current += 1;

  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`
      });
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current
  };
}

// Hook للـ Lazy Loading
export function useLazyLoading<T>(
  data: T[],
  initialItemsCount: number = 20,
  loadMoreCount: number = 20
) {
  const [visibleItemsCount, setVisibleItemsCount] = useState(initialItemsCount);
  
  const visibleData = useMemo(() => {
    return data.slice(0, visibleItemsCount);
  }, [data, visibleItemsCount]);

  const loadMore = useCallback(() => {
    setVisibleItemsCount(prev => Math.min(prev + loadMoreCount, data.length));
  }, [data.length, loadMoreCount]);

  const hasMore = visibleItemsCount < data.length;

  // إعادة تعيين العد عند تغيير البيانات
  useEffect(() => {
    setVisibleItemsCount(initialItemsCount);
  }, [data.length, initialItemsCount]);

  return {
    visibleData,
    loadMore,
    hasMore,
    visibleItemsCount,
    totalItemsCount: data.length
  };
}
