import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export interface CustomerFilters {
  search?: string;
  rating?: number;
  status?: 'active' | 'inactive';
  documentStatus?: 'valid' | 'expiring' | 'expired';
  blacklisted?: boolean;
  city?: string;
  nationality?: string;
  customerSource?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface EnhancedCustomerFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onExport?: () => void;
  onRefresh?: () => void;
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
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof CustomerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getFilterBadges = () => {
    const badges = [];
    
    if (filters.search) badges.push({ key: 'search', label: `البحث: ${filters.search}` });
    if (filters.rating) badges.push({ key: 'rating', label: `التقييم: ${filters.rating}+ نجوم` });
    if (filters.status) badges.push({ key: 'status', label: `الحالة: ${filters.status === 'active' ? 'نشط' : 'غير نشط'}` });
    if (filters.documentStatus) {
      const statusLabels = {
        valid: 'صالحة',
        expiring: 'تنتهي قريباً',
        expired: 'منتهية'
      };
      badges.push({ key: 'documentStatus', label: `المستندات: ${statusLabels[filters.documentStatus]}` });
    }
    if (filters.blacklisted !== undefined) {
      badges.push({ key: 'blacklisted', label: filters.blacklisted ? 'قائمة سوداء' : 'عملاء عاديين' });
    }
    if (filters.city) badges.push({ key: 'city', label: `المدينة: ${filters.city}` });
    if (filters.nationality) badges.push({ key: 'nationality', label: `الجنسية: ${filters.nationality}` });
    if (filters.customerSource) badges.push({ key: 'customerSource', label: `المصدر: ${filters.customerSource}` });
    if (filters.dateFrom) badges.push({ key: 'dateFrom', label: `من: ${format(filters.dateFrom, 'dd/MM/yyyy', { locale: ar })}` });
    if (filters.dateTo) badges.push({ key: 'dateTo', label: `إلى: ${format(filters.dateTo, 'dd/MM/yyyy', { locale: ar })}` });

    return badges;
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof CustomerFilters];
    onFiltersChange(newFilters);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">البحث والفلترة</CardTitle>
            <Badge variant="secondary">
              {filteredCount} من {totalCount} عميل
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              فلاتر متقدمة
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* البحث الأساسي */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث بالاسم أو رقم الهاتف أو البريد الإلكتروني..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="pl-10"
          />
        </div>

        {/* الفلاتر السريعة */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="حالة النشاط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العملاء</SelectItem>
              <SelectItem value="active">نشطين</SelectItem>
              <SelectItem value="inactive">غير نشطين</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.blacklisted === undefined ? 'all' : filters.blacklisted ? 'true' : 'false'} onValueChange={(value) => updateFilter('blacklisted', value === 'all' ? undefined : value === 'true')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="القائمة السوداء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العملاء</SelectItem>
              <SelectItem value="false">عملاء عاديين</SelectItem>
              <SelectItem value="true">قائمة سوداء</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.documentStatus || 'all'} onValueChange={(value) => updateFilter('documentStatus', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="حالة المستندات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستندات</SelectItem>
              <SelectItem value="valid">صالحة</SelectItem>
              <SelectItem value="expiring">تنتهي قريباً</SelectItem>
              <SelectItem value="expired">منتهية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* الفلاتر المتقدمة */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">التقييم</label>
                <Select value={filters.rating?.toString() || 'all'} onValueChange={(value) => updateFilter('rating', value === 'all' ? undefined : parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع التقييمات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التقييمات</SelectItem>
                    <SelectItem value="5">5 نجوم</SelectItem>
                    <SelectItem value="4">4 نجوم فأكثر</SelectItem>
                    <SelectItem value="3">3 نجوم فأكثر</SelectItem>
                    <SelectItem value="2">نجمتان فأكثر</SelectItem>
                    <SelectItem value="1">نجمة فأكثر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">المدينة</label>
                <Input
                  placeholder="أدخل المدينة"
                  value={filters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الجنسية</label>
                <Select value={filters.nationality || 'all'} onValueChange={(value) => updateFilter('nationality', value === 'all' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الجنسيات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجنسيات</SelectItem>
                    <SelectItem value="سعودي">سعودي</SelectItem>
                    <SelectItem value="مصري">مصري</SelectItem>
                    <SelectItem value="أردني">أردني</SelectItem>
                    <SelectItem value="سوري">سوري</SelectItem>
                    <SelectItem value="لبناني">لبناني</SelectItem>
                    <SelectItem value="فلسطيني">فلسطيني</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">مصدر العميل</label>
                <Select value={filters.customerSource || 'all'} onValueChange={(value) => updateFilter('customerSource', value === 'all' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المصادر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المصادر</SelectItem>
                    <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                    <SelectItem value="phone">الهاتف</SelectItem>
                    <SelectItem value="referral">إحالة</SelectItem>
                    <SelectItem value="social_media">وسائل التواصل</SelectItem>
                    <SelectItem value="advertising">الإعلانات</SelectItem>
                    <SelectItem value="walk_in">زيارة مباشرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">من تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter('dateFrom', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter('dateTo', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* الفلاتر النشطة */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">الفلاتر النشطة:</span>
            {getFilterBadges().map((badge) => (
              <Badge key={badge.key} variant="secondary" className="flex items-center gap-1">
                {badge.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter(badge.key)}
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
              مسح الكل
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};