import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Search, X, Save } from "lucide-react";
import { Customer } from "@/types";
import { CustomerFilters } from "./EnhancedCustomerFilters";
import { DateRange } from "react-day-picker";

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  onSearch: (filters: CustomerFilters) => void;
  customers: Customer[];
}

export const AdvancedSearchDialog = ({
  open,
  onOpenChange,
  filters,
  onSearch,
  customers
}: AdvancedSearchDialogProps) => {
  const [searchFilters, setSearchFilters] = useState<CustomerFilters>(filters);

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    setSearchFilters(prev => ({
      ...prev,
      dateRange,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to
    }));
  };

  const handleSearch = () => {
    onSearch(searchFilters);
  };

  const clearFilters = () => {
    const emptyFilters: CustomerFilters = {};
    setSearchFilters(emptyFilters);
  };

  const handleSaveSearch = () => {
    // يمكن إضافة وظيفة حفظ البحث المفضل هنا
    localStorage.setItem('customerSearchPreset', JSON.stringify(searchFilters));
  };

  const loadSavedSearch = () => {
    const saved = localStorage.getItem('customerSearchPreset');
    if (saved) {
      setSearchFilters(JSON.parse(saved));
    }
  };

  // إحصائيات سريعة
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const blacklistedCustomers = customers.filter(c => c.blacklisted).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث المتقدم في العملاء
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCustomers}</div>
              <div className="text-sm text-muted-foreground">إجمالي العملاء</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
              <div className="text-sm text-muted-foreground">عملاء نشطين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{blacklistedCustomers}</div>
              <div className="text-sm text-muted-foreground">قائمة سوداء</div>
            </div>
          </div>

          {/* نماذج البحث */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* البحث النصي */}
            <div className="space-y-4">
              <h3 className="font-medium">البحث النصي</h3>
              
              <div className="space-y-2">
                <Label htmlFor="search">البحث العام</Label>
                <Input
                  id="search"
                  placeholder="البحث في الاسم، الهاتف، البريد الإلكتروني..."
                  value={searchFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  placeholder="مثال: الرياض، جدة، الدمام"
                  value={searchFilters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">الجنسية</Label>
                <Input
                  id="nationality"
                  placeholder="مثال: سعودي، مصري، أردني"
                  value={searchFilters.nationality || ''}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                />
              </div>
            </div>

            {/* الفلاتر التصنيفية */}
            <div className="space-y-4">
              <h3 className="font-medium">الفلاتر التصنيفية</h3>
              
              <div className="space-y-2">
                <Label>حالة العميل</Label>
                <Select
                  value={searchFilters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    <SelectItem value="active">عملاء نشطين</SelectItem>
                    <SelectItem value="inactive">عملاء غير نشطين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>القائمة السوداء</Label>
                <Select
                  value={searchFilters.blacklisted === undefined ? 'all' : searchFilters.blacklisted ? 'blacklisted' : 'normal'}
                  onValueChange={(value) => 
                    handleFilterChange('blacklisted', value === 'all' ? undefined : value === 'blacklisted')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="حالة القائمة السوداء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    <SelectItem value="normal">عملاء عاديين</SelectItem>
                    <SelectItem value="blacklisted">في القائمة السوداء</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>التقييم الأدنى</Label>
                <Select
                  value={searchFilters.rating?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('rating', value === 'all' ? undefined : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التقييم الأدنى" />
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
              </div>
            </div>
          </div>

          {/* فلتر التواريخ */}
          <div className="space-y-2">
            <Label>فترة التسجيل</Label>
            <DatePickerWithRange
              date={searchFilters.dateRange}
              onDateChange={handleDateRangeChange}
            />
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 ml-2" />
              تطبيق البحث
            </Button>
            
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 ml-2" />
              مسح الفلاتر
            </Button>
            
            <Button variant="outline" onClick={handleSaveSearch}>
              <Save className="h-4 w-4 ml-2" />
              حفظ البحث
            </Button>
            
            <Button variant="ghost" onClick={loadSavedSearch}>
              تحميل البحث المحفوظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
