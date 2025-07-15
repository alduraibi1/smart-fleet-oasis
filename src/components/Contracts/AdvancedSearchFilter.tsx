import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Save, 
  Download,
  RotateCcw,
  Star,
  Settings,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Clock,
  User,
  Car
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SearchFilters {
  search: string;
  status: string[];
  contractType: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  amountRange: [number, number];
  customerType: string[];
  vehicleCategory: string[];
  location: string[];
  paymentStatus: string[];
  priority: string[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilters;
  isDefault: boolean;
  usageCount: number;
  lastUsed: string;
}

interface AdvancedSearchFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onExport: (format: string) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function AdvancedSearchFilter({ 
  onFiltersChange, 
  onExport, 
  initialFilters = {} 
}: AdvancedSearchFilterProps) {
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: [],
    contractType: [],
    dateRange: {},
    amountRange: [0, 100000],
    customerType: [],
    vehicleCategory: [],
    location: [],
    paymentStatus: [],
    priority: [],
    ...initialFilters
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'عقود نشطة عالية القيمة',
      filters: {
        search: '',
        status: ['active'],
        contractType: ['monthly'],
        dateRange: {},
        amountRange: [50000, 100000],
        customerType: ['corporate'],
        vehicleCategory: ['luxury'],
        location: [],
        paymentStatus: ['paid'],
        priority: ['high']
      },
      isDefault: false,
      usageCount: 23,
      lastUsed: '2024-01-15'
    },
    {
      id: '2', 
      name: 'عقود منتهية للمراجعة',
      filters: {
        search: '',
        status: ['expired', 'completed'],
        contractType: [],
        dateRange: {},
        amountRange: [0, 100000],
        customerType: [],
        vehicleCategory: [],
        location: [],
        paymentStatus: [],
        priority: []
      },
      isDefault: true,
      usageCount: 45,
      lastUsed: '2024-01-14'
    }
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Filter options
  const statusOptions = [
    { value: 'active', label: 'نشط', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'expired', label: 'منتهي', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'مكتمل', color: 'bg-blue-100 text-blue-800' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-gray-100 text-gray-800' }
  ];

  const contractTypeOptions = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'quarterly', label: 'ربع سنوي' },
    { value: 'annual', label: 'سنوي' }
  ];

  const customerTypeOptions = [
    { value: 'individual', label: 'أفراد' },
    { value: 'corporate', label: 'شركات' },
    { value: 'government', label: 'حكومي' },
    { value: 'tourist', label: 'سياحي' }
  ];

  const vehicleCategoryOptions = [
    { value: 'economy', label: 'اقتصادي' },
    { value: 'standard', label: 'عادي' },
    { value: 'luxury', label: 'فاخر' },
    { value: 'suv', label: 'رباعي الدفع' },
    { value: 'van', label: 'فان' },
    { value: 'truck', label: 'شاحنة' }
  ];

  const locationOptions = [
    { value: 'riyadh', label: 'الرياض' },
    { value: 'jeddah', label: 'جدة' },
    { value: 'dammam', label: 'الدمام' },
    { value: 'mecca', label: 'مكة' },
    { value: 'medina', label: 'المدينة' }
  ];

  const paymentStatusOptions = [
    { value: 'paid', label: 'مدفوع' },
    { value: 'partial', label: 'مدفوع جزئياً' },
    { value: 'pending', label: 'معلق' },
    { value: 'overdue', label: 'متأخر' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'منخفض' },
    { value: 'medium', label: 'متوسط' },
    { value: 'high', label: 'عالي' },
    { value: 'urgent', label: 'عاجل' }
  ];

  // Update active filter count
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.contractType.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.amountRange[0] > 0 || filters.amountRange[1] < 100000) count++;
    if (filters.customerType.length > 0) count++;
    if (filters.vehicleCategory.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.paymentStatus.length > 0) count++;
    if (filters.priority.length > 0) count++;
    
    setActiveFilterCount(count);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentValue = prev[key];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [key]: currentValue.includes(value) 
            ? currentValue.filter((item: string) => item !== value)
            : [...currentValue, value]
        };
      }
      return prev;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      contractType: [],
      dateRange: {},
      amountRange: [0, 100000],
      customerType: [],
      vehicleCategory: [],
      location: [],
      paymentStatus: [],
      priority: []
    });
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    // Update usage statistics
    setSavedFilters(prev => 
      prev.map(filter => 
        filter.id === savedFilter.id 
          ? { ...filter, usageCount: filter.usageCount + 1, lastUsed: new Date().toISOString() }
          : filter
      )
    );
  };

  const saveCurrentFilter = (name: string, isDefault = false) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      isDefault,
      usageCount: 0,
      lastUsed: new Date().toISOString()
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث السريع (رقم العقد، اسم العميل، رقم اللوحة...)"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pr-10 text-right"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={showAdvanced ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                بحث متقدم
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  مسح
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.status.map(status => (
                <Badge key={status} variant="outline" className="gap-1">
                  {statusOptions.find(opt => opt.value === status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('status', status)}
                  />
                </Badge>
              ))}
              {filters.contractType.map(type => (
                <Badge key={type} variant="outline" className="gap-1">
                  {contractTypeOptions.find(opt => opt.value === type)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('contractType', type)}
                  />
                </Badge>
              ))}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="outline" className="gap-1">
                  {filters.dateRange.from && format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ar })}
                  {filters.dateRange.from && filters.dateRange.to && ' - '}
                  {filters.dateRange.to && format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ar })}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('dateRange', {})}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث المتقدم والتصفية
            </CardTitle>
            <CardDescription>
              فلاتر متقدمة للبحث الدقيق والمفصل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">أساسي</TabsTrigger>
                <TabsTrigger value="financial">مالي</TabsTrigger>
                <TabsTrigger value="location">موقع وخدمات</TabsTrigger>
                <TabsTrigger value="saved">محفوظة</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contract Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">حالة العقد</Label>
                    <div className="space-y-2">
                      {statusOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`status-${option.value}`}
                            checked={filters.status.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('status', option.value)}
                          />
                          <Label 
                            htmlFor={`status-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            <Badge className={option.color} variant="outline">
                              {option.label}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">نوع العقد</Label>
                    <div className="space-y-2">
                      {contractTypeOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`type-${option.value}`}
                            checked={filters.contractType.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('contractType', option.value)}
                          />
                          <Label 
                            htmlFor={`type-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">نوع العميل</Label>
                    <div className="space-y-2">
                      {customerTypeOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`customer-${option.value}`}
                            checked={filters.customerType.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('customerType', option.value)}
                          />
                          <Label 
                            htmlFor={`customer-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">النطاق الزمني</Label>
                  <div className="flex gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-right">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {filters.dateRange.from ? (
                            format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ar })
                          ) : (
                            'من تاريخ'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-right">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {filters.dateRange.to ? (
                            format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ar })
                          ) : (
                            'إلى تاريخ'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount Range */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">نطاق المبلغ</Label>
                    <div className="space-y-3">
                      <Slider
                        value={filters.amountRange}
                        onValueChange={(value) => updateFilter('amountRange', value)}
                        max={100000}
                        min={0}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(filters.amountRange[0])}</span>
                        <span>{formatCurrency(filters.amountRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">حالة الدفع</Label>
                    <div className="space-y-2">
                      {paymentStatusOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`payment-${option.value}`}
                            checked={filters.paymentStatus.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('paymentStatus', option.value)}
                          />
                          <Label 
                            htmlFor={`payment-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">الموقع</Label>
                    <div className="space-y-2">
                      {locationOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`location-${option.value}`}
                            checked={filters.location.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('location', option.value)}
                          />
                          <Label 
                            htmlFor={`location-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Category */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">فئة المركبة</Label>
                    <div className="space-y-2">
                      {vehicleCategoryOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`vehicle-${option.value}`}
                            checked={filters.vehicleCategory.includes(option.value)}
                            onCheckedChange={() => toggleArrayFilter('vehicleCategory', option.value)}
                          />
                          <Label 
                            htmlFor={`vehicle-${option.value}`} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedFilters.map(filter => (
                    <Card key={filter.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{filter.name}</h4>
                              {filter.isDefault && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>استخدم {filter.usageCount} مرة</div>
                              <div>آخر استخدام: {format(new Date(filter.lastUsed), 'dd/MM/yyyy', { locale: ar })}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => applySavedFilter(filter)}
                          >
                            تطبيق
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التصفية الحالية
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Export Options */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">تصدير النتائج</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onExport('excel')} className="gap-2">
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport('pdf')} className="gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="gap-2">
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}