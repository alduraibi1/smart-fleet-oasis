import { useState } from 'react';
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

interface VehicleFiltersProps {
  onFiltersChange: (filters: VehicleFilters) => void;
}

export interface VehicleFilters {
  search: string;
  status: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  year: string;
}

export default function VehicleFilters({ onFiltersChange }: VehicleFiltersProps) {
  const [filters, setFilters] = useState<VehicleFilters>({
    search: '',
    status: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    year: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof VehicleFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: VehicleFilters = {
      search: '',
      status: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      year: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const brands = ['تويوتا', 'هيونداي', 'نيسان', 'كيا', 'مازدا', 'فولكس واجن'];
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
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
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
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
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

              <Select value={filters.brand} onValueChange={(value) => updateFilter('brand', value)}>
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
                placeholder="أقل سعر (ش.ج)"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                type="number"
              />

              <Input
                placeholder="أعلى سعر (ش.ج)"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                type="number"
              />

              <Input
                placeholder="سنة الصنع"
                value={filters.year}
                onChange={(e) => updateFilter('year', e.target.value)}
                type="number"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}