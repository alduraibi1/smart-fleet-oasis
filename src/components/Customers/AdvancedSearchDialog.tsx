import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Search, Filter, X, SlidersHorizontal, Users, MapPin, Star } from 'lucide-react';
import { CustomerFilters } from './EnhancedCustomerFilters';
import { cn } from '@/lib/utils';

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  customers: any[];
}

export function AdvancedSearchDialog({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange,
  customers 
}: AdvancedSearchDialogProps) {
  const [tempFilters, setTempFilters] = useState<CustomerFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: CustomerFilters = {};
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getUniqueValues = (field: string) => {
    return [...new Set(customers.map(c => c[field]).filter(Boolean))];
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">البحث المتقدم</CardTitle>
            <p className="text-muted-foreground">استخدم الفلاتر المتقدمة للعثور على العملاء</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                أساسي
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                شخصي
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                موقع
              </TabsTrigger>
              <TabsTrigger value="rating" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                تقييم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">البحث العام</Label>
                  <Input
                    id="search"
                    placeholder="ابحث في الاسم، الهاتف، البريد الإلكتروني..."
                    value={tempFilters.search || ''}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>الحالة</Label>
                  <Select
                    value={tempFilters.status || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      status: value as any || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>مصدر العميل</Label>
                  <Select
                    value={tempFilters.customerSource || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      customerSource: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المصدر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {getUniqueValues('customer_source').map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>حالة الوثائق</Label>
                  <Select
                    value={tempFilters.documentStatus || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      documentStatus: value as any || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الوثائق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="valid">صالحة</SelectItem>
                      <SelectItem value="expiring">تنتهي قريباً</SelectItem>
                      <SelectItem value="expired">منتهية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="blacklisted"
                  checked={tempFilters.blacklisted || false}
                  onCheckedChange={(checked) => setTempFilters(prev => ({ 
                    ...prev, 
                    blacklisted: checked as boolean || undefined 
                  }))}
                />
                <Label htmlFor="blacklisted">القائمة السوداء فقط</Label>
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الجنسية</Label>
                  <Select
                    value={tempFilters.nationality || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      nationality: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنسية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {getUniqueValues('nationality').map(nationality => (
                        <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الجنس</Label>
                  <Select
                    value={tempFilters.gender || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      gender: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الحالة الاجتماعية</Label>
                  <Select
                    value={tempFilters.maritalStatus || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      maritalStatus: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة الاجتماعية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="single">أعزب</SelectItem>
                      <SelectItem value="married">متزوج</SelectItem>
                      <SelectItem value="divorced">مطلق</SelectItem>
                      <SelectItem value="widowed">أرمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>عدد الإيجارات</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="من"
                      value={tempFilters.minRentals || ''}
                      onChange={(e) => setTempFilters(prev => ({ 
                        ...prev, 
                        minRentals: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="إلى"
                      value={tempFilters.maxRentals || ''}
                      onChange={(e) => setTempFilters(prev => ({ 
                        ...prev, 
                        maxRentals: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>المدينة</Label>
                  <Select
                    value={tempFilters.city || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      city: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {getUniqueValues('city').map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الحي</Label>
                  <Select
                    value={tempFilters.district || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      district: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {getUniqueValues('district').map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>البلد</Label>
                  <Select
                    value={tempFilters.country || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      country: value || undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البلد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      {getUniqueValues('country').map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rating" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>التقييم الأدنى</Label>
                  <Select
                    value={tempFilters.rating?.toString() || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ 
                      ...prev, 
                      rating: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التقييم الأدنى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">الكل</SelectItem>
                      <SelectItem value="1">1 نجمة فأكثر</SelectItem>
                      <SelectItem value="2">2 نجمة فأكثر</SelectItem>
                      <SelectItem value="3">3 نجمة فأكثر</SelectItem>
                      <SelectItem value="4">4 نجمة فأكثر</SelectItem>
                      <SelectItem value="5">5 نجوم فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>تاريخ التسجيل</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !tempFilters.dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.dateFrom ? format(tempFilters.dateFrom, "PPP", { locale: ar }) : "من"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tempFilters.dateFrom}
                          onSelect={(date) => setTempFilters(prev => ({ ...prev, dateFrom: date }))}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !tempFilters.dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.dateTo ? format(tempFilters.dateTo, "PPP", { locale: ar }) : "إلى"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tempFilters.dateTo}
                          onSelect={(date) => setTempFilters(prev => ({ ...prev, dateTo: date }))}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {Object.keys(tempFilters).length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {Object.keys(tempFilters).length} فلتر نشط
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearFilters}>
                مسح الكل
              </Button>
              <Button onClick={handleApplyFilters}>
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}