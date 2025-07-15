import { useState, useMemo } from 'react';
import { Customer } from '@/types';

type SortField = 'name' | 'created_at' | 'rating' | 'total_rentals' | 'license_expiry';
type SortDirection = 'asc' | 'desc';

export const useCustomerSorting = (customers: Customer[]) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // معالجة التواريخ
      if (sortField === 'created_at' || sortField === 'license_expiry') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // معالجة الأرقام
      if (sortField === 'rating' || sortField === 'total_rentals') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      // معالجة النصوص
      if (sortField === 'name') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [customers, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    sortedCustomers,
    handleSort
  };
};