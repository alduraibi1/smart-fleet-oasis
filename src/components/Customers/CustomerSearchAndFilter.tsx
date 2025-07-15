import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { CustomerFilters } from '@/types';

interface CustomerSearchAndFilterProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClearFilters: () => void;
  totalResults: number;
}

export const CustomerSearchAndFilter: React.FC<CustomerSearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value || undefined });
  }, [filters, onFiltersChange]);

  const handleFilterChange = useCallback((key: keyof CustomerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }, [filters, onFiltersChange]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  const clearFilter = (key: keyof CustomerFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* شريط البحث الأساسي */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن عميل (الاسم، الهاتف، البريد الإلكتروني...)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                فلترة
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              مسح
            </Button>
          )}
        </div>

        {/* الفلاتر المتقدمة */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-t pt-4">
              {/* فلتر الحالة */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  الحالة
                </label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر التقييم */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  التقييم الأدنى
                </label>
                <Select
                  value={filters.rating?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('rating', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع التقييمات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4+ نجوم</SelectItem>
                    <SelectItem value="3">3+ نجوم</SelectItem>
                    <SelectItem value="2">2+ نجوم</SelectItem>
                    <SelectItem value="1">1+ نجوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر المدينة */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  المدينة
                </label>
                <Select
                  value={filters.city || ''}
                  onValueChange={(value) => handleFilterChange('city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المدن" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المدن</SelectItem>
                    <SelectItem value="الرياض">الرياض</SelectItem>
                    <SelectItem value="جدة">جدة</SelectItem>
                    <SelectItem value="الدمام">الدمام</SelectItem>
                    <SelectItem value="مكة">مكة</SelectItem>
                    <SelectItem value="المدينة">المدينة</SelectItem>
                    <SelectItem value="الطائف">الطائف</SelectItem>
                    <SelectItem value="تبوك">تبوك</SelectItem>
                    <SelectItem value="بريدة">بريدة</SelectItem>
                    <SelectItem value="خميس مشيط">خميس مشيط</SelectItem>
                    <SelectItem value="الهفوف">الهفوف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* فلتر مصدر العميل */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  مصدر العميل
                </label>
                <Select
                  value={filters.customer_source || ''}
                  onValueChange={(value) => handleFilterChange('customer_source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المصادر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المصادر</SelectItem>
                    <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                    <SelectItem value="referral">إحالة</SelectItem>
                    <SelectItem value="social_media">وسائل التواصل</SelectItem>
                    <SelectItem value="advertisement">إعلان</SelectItem>
                    <SelectItem value="direct">مباشر</SelectItem>
                    <SelectItem value="phone">هاتف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* الفلاتر النشطة */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                البحث: {filters.search}
                <button onClick={() => clearFilter('search')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                الحالة: {filters.status === 'active' ? 'نشط' : 'غير نشط'}
                <button onClick={() => clearFilter('status')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary" className="gap-1">
                التقييم: {filters.rating}+ نجوم
                <button onClick={() => clearFilter('rating')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="gap-1">
                المدينة: {filters.city}
                <button onClick={() => clearFilter('city')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.customer_source && (
              <Badge variant="secondary" className="gap-1">
                المصدر: {filters.customer_source}
                <button onClick={() => clearFilter('customer_source')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* عدد النتائج */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            تم العثور على <span className="font-medium text-foreground">{totalResults}</span> عميل
          </p>
        </div>
      </CardContent>
    </Card>
  );
};