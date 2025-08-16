
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Search, Filter, X, Download, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";

export interface CustomerFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  blacklisted?: boolean;
  rating?: number;
  city?: string;
  nationality?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dateRange?: DateRange;
}

interface EnhancedCustomerFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onExport: () => void;
  onRefresh: () => void;
  totalCount: number;
  filteredCount: number;
}

export const EnhancedCustomerFilters = ({
  filters,
  onFiltersChange,
  onExport,
  onRefresh,
  totalCount,
  filteredCount
}: EnhancedCustomerFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof CustomerFilters];
    return value !== undefined && value !== '' && value !== 'all';
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      default: return 'جميع العملاء';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* البحث الأساسي */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث بالاسم، رقم الهاتف، أو البريد الإلكتروني..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pr-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                فلاتر متقدمة
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>

          {/* الفلاتر المتقدمة */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="حالة العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="active">عملاء نشطين</SelectItem>
                  <SelectItem value="inactive">عملاء غير نشطين</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.blacklisted === undefined ? 'all' : filters.blacklisted ? 'blacklisted' : 'normal'}
                onValueChange={(value) => 
                  handleFilterChange('blacklisted', value === 'all' ? undefined : value === 'blacklisted')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="القائمة السوداء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="normal">عملاء عاديين</SelectItem>
                  <SelectItem value="blacklisted">قائمة سوداء</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.rating?.toString() || 'all'}
                onValueChange={(value) => handleFilterChange('rating', value === 'all' ? undefined : Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="التقييم الأدنى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التقييمات</SelectItem>
                  <SelectItem value="5">5 نجوم</SelectItem>
                  <SelectItem value="4">4 نجوم فأكثر</SelectItem>
                  <SelectItem value="3">3 نجوم فأكثر</SelectItem>
                  <SelectItem value="2">نجمتان فأكثر</SelectItem>
                  <SelectItem value="1">نجمة واحدة فأكثر</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="المدينة"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />

              <div className="sm:col-span-2">
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={handleDateRangeChange}
                  placeholder="فترة التسجيل"
                />
              </div>

              <Input
                placeholder="الجنسية"
                value={filters.nationality || ''}
                onChange={(e) => handleFilterChange('nationality', e.target.value)}
              />
            </div>
          )}

          {/* إحصائيات النتائج والإجراءات */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                إجمالي العملاء: {totalCount}
              </Badge>
              <Badge variant="default">
                النتائج المعروضة: {filteredCount}
              </Badge>
              
              {hasActiveFilters && (
                <Badge variant="outline">
                  تم تطبيق فلاتر
                </Badge>
              )}

              {/* عرض الفلاتر النشطة */}
              {filters.status && filters.status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getStatusLabel(filters.status)}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleFilterChange('status', undefined)}
                  />
                </Badge>
              )}

              {filters.blacklisted !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  {filters.blacklisted ? 'قائمة سوداء' : 'عملاء عاديين'}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleFilterChange('blacklisted', undefined)}
                  />
                </Badge>
              )}

              {filters.rating && (
                <Badge variant="secondary" className="gap-1">
                  {filters.rating} نجوم فأكثر
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleFilterChange('rating', undefined)}
                  />
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير النتائج
              </Button>
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
