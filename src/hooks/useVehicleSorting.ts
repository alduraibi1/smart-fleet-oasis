import { useState, useMemo } from 'react';
import { Vehicle } from '@/types/vehicle';

type SortField = 'plate_number' | 'year' | 'mileage' | 'daily_rate' | 'owner_name' | 'brand' | 'status';
type SortDirection = 'asc' | 'desc';

export const useVehicleSorting = (vehicles: Vehicle[]) => {
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default directions for specific fields
      if (field === 'year') {
        setSortDirection('desc'); // الأحدث أولاً
      } else if (field === 'mileage' || field === 'daily_rate') {
        setSortDirection('asc'); // الأقل أولاً
      } else {
        setSortDirection('asc');
      }
    }
  };

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'plate_number':
          aValue = a.plate_number?.toLowerCase() || '';
          bValue = b.plate_number?.toLowerCase() || '';
          break;
        
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        
        case 'mileage':
          aValue = a.mileage || 0;
          bValue = b.mileage || 0;
          break;
        
        case 'daily_rate':
          aValue = a.daily_rate || 0;
          bValue = b.daily_rate || 0;
          break;
        
        case 'owner_name':
          aValue = a.owner?.name?.toLowerCase() || '';
          bValue = b.owner?.name?.toLowerCase() || '';
          break;
        
        case 'brand':
          aValue = `${a.brand} ${a.model}`.toLowerCase();
          bValue = `${b.brand} ${b.model}`.toLowerCase();
          break;
        
        case 'status':
          // ترتيب الحالات حسب الأولوية
          const statusOrder = { available: 1, rented: 2, maintenance: 3, out_of_service: 4 };
          aValue = statusOrder[a.status] || 5;
          bValue = statusOrder[b.status] || 5;
          break;
        
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [vehicles, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    sortedVehicles,
    handleSort
  };
};