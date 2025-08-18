import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';

interface VehicleFiltersProps {
  filters: VehicleFiltersType;
  onFiltersChange: (filters: VehicleFiltersType) => void;
  brands: string[];
  loading?: boolean;
}

export default function VehicleFilters({ 
  filters, 
  onFiltersChange, 
  brands, 
  loading = false 
}: VehicleFiltersProps) {
  const [localFilters, setLocalFilters] = useState<VehicleFiltersType>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof VehicleFiltersType, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value === '' ? undefined : value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: VehicleFiltersType = {
      search: '',
      status: '',
      brand: '',
      minPrice: undefined,
      maxPrice: undefined,
      minYear: undefined,
      maxYear: undefined,
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v !== '' && v !== undefined).length;
  const statuses = [
    { value: 'available', label: 'متاحة' },
    { value: 'rented', label: 'مؤجرة' },
    { value: 'maintenance', label: 'صيانة' },
    { value: 'out_of_service', label: 'خارج الخدمة' }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في المركبات (رقم اللوحة، الماركة، الموديل)..."
              className="pr-10"
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              فلاتر متقدمة
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <Select value={localFilters.status || ''} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={localFilters.brand || ''} onValueChange={(value) => updateFilter('brand', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الماركة" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="أقل سعر (ريال)"
                value={localFilters.minPrice?.toString() || ''}
                onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || undefined)}
                type="number"
                disabled={loading}
              />

              <Input
                placeholder="أعلى سعر (ريال)"
                value={localFilters.maxPrice?.toString() || ''}
                onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || undefined)}
                type="number"
                disabled={loading}
              />

              <Input
                placeholder="من سنة"
                value={localFilters.minYear?.toString() || ''}
                onChange={(e) => updateFilter('minYear', parseInt(e.target.value) || undefined)}
                type="number"
                disabled={loading}
              />

              <Input
                placeholder="إلى سنة"
                value={localFilters.maxYear?.toString() || ''}
                onChange={(e) => updateFilter('maxYear', parseInt(e.target.value) || undefined)}
                type="number"
                disabled={loading}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
