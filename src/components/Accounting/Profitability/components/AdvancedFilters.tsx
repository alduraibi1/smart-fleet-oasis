
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, RotateCcw, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface FilterOptions {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  quickPeriod: string;
  contractTypes: string[];
  vehicleStatuses: string[];
  customerTypes: string[];
  amountThreshold: number;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onApplyFilters }: AdvancedFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickPeriods = [
    { value: 'last_7_days', label: 'آخر 7 أيام' },
    { value: 'last_30_days', label: 'آخر 30 يوم' },
    { value: 'last_3_months', label: 'آخر 3 أشهر' },
    { value: 'last_6_months', label: 'آخر 6 أشهر' },
    { value: 'last_year', label: 'آخر سنة' },
    { value: 'current_month', label: 'الشهر الحالي' },
    { value: 'current_quarter', label: 'الربع الحالي' },
    { value: 'current_year', label: 'السنة الحالية' },
    { value: 'custom', label: 'فترة مخصصة' }
  ];

  const contractTypes = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'long_term', label: 'طويل المدى' }
  ];

  const vehicleStatuses = [
    { value: 'available', label: 'متاح' },
    { value: 'rented', label: 'مؤجر' },
    { value: 'maintenance', label: 'صيانة' },
    { value: 'out_of_service', label: 'خارج الخدمة' }
  ];

  const customerTypes = [
    { value: 'individual', label: 'أفراد' },
    { value: 'corporate', label: 'شركات' },
    { value: 'government', label: 'حكومي' },
    { value: 'vip', label: 'VIP' }
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {},
      quickPeriod: 'last_30_days',
      contractTypes: [],
      vehicleStatuses: [],
      customerTypes: [],
      amountThreshold: 0
    });
  };

  const applyQuickPeriod = (period: string) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;

    switch (period) {
      case 'last_7_days':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case 'last_30_days':
        from = new Date(now);
        from.setDate(now.getDate() - 30);
        break;
      case 'last_3_months':
        from = new Date(now);
        from.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        from = new Date(now);
        from.setMonth(now.getMonth() - 6);
        break;
      case 'last_year':
        from = new Date(now);
        from.setFullYear(now.getFullYear() - 1);
        break;
      case 'current_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'current_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'current_year':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
    }

    if (period !== 'custom') {
      updateFilter('dateRange', { from, to });
    }
    updateFilter('quickPeriod', period);
  };

  const activeFiltersCount = 
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    filters.contractTypes.length +
    filters.vehicleStatuses.length +
    filters.customerTypes.length +
    (filters.amountThreshold > 0 ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر متقدمة
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'إخفاء' : 'إظهار'} التفاصيل
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                مسح
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Period Selection */}
        <div className="space-y-2">
          <Label>الفترة الزمنية</Label>
          <Select value={filters.quickPeriod} onValueChange={applyQuickPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quickPeriods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {filters.quickPeriod === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ar })
                    ) : (
                      'اختر التاريخ'
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
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ar })
                    ) : (
                      'اختر التاريخ'
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
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Contract Types */}
            <div className="space-y-2">
              <Label>أنواع العقود</Label>
              <div className="grid grid-cols-2 gap-2">
                {contractTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`contract-${type.value}`}
                      checked={filters.contractTypes.includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter('contractTypes', type.value)}
                    />
                    <Label htmlFor={`contract-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Statuses */}
            <div className="space-y-2">
              <Label>حالة المركبات</Label>
              <div className="grid grid-cols-2 gap-2">
                {vehicleStatuses.map(status => (
                  <div key={status.value} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.vehicleStatuses.includes(status.value)}
                      onCheckedChange={() => toggleArrayFilter('vehicleStatuses', status.value)}
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Types */}
            <div className="space-y-2">
              <Label>أنواع العملاء</Label>
              <div className="grid grid-cols-2 gap-2">
                {customerTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`customer-${type.value}`}
                      checked={filters.customerTypes.includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter('customerTypes', type.value)}
                    />
                    <Label htmlFor={`customer-${type.value}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="outline" className="gap-1">
                {filters.dateRange.from && format(filters.dateRange.from, 'dd/MM', { locale: ar })}
                {filters.dateRange.from && filters.dateRange.to && ' - '}
                {filters.dateRange.to && format(filters.dateRange.to, 'dd/MM', { locale: ar })}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('dateRange', {})}
                />
              </Badge>
            )}
            {filters.contractTypes.map(type => (
              <Badge key={type} variant="outline" className="gap-1">
                {contractTypes.find(t => t.value === type)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleArrayFilter('contractTypes', type)}
                />
              </Badge>
            ))}
          </div>
        )}

        <Button onClick={onApplyFilters} className="w-full">
          تطبيق الفلاتر
        </Button>
      </CardContent>
    </Card>
  );
}
