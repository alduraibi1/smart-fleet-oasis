
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Search, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';
import { useContracts } from '@/hooks/useContracts';

const contractSchema = z.object({
  customer_id: z.string().min(1, 'يجب اختيار العميل'),
  vehicle_id: z.string().min(1, 'يجب اختيار المركبة'),
  start_date: z.date({ required_error: 'يجب تحديد تاريخ البداية' }),
  end_date: z.date({ required_error: 'يجب تحديد تاريخ النهاية' }),
  daily_rate: z.number().min(1, 'يجب تحديد السعر اليومي'),
  deposit_amount: z.number().min(0, 'مبلغ التأمين لا يمكن أن يكون سالباً').default(0),
  insurance_amount: z.number().min(0, 'مبلغ التأمين لا يمكن أن يكون سالباً').default(0),
  pickup_location: z.string().optional(),
  return_location: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.end_date > data.start_date, {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
});

type ContractFormData = z.infer<typeof contractSchema>;

interface SmartContractFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const SmartContractForm: React.FC<SmartContractFormProps> = ({ onSubmit, onCancel }) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [availabilityCheck, setAvailabilityCheck] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const [costCalculation, setCostCalculation] = useState<any>(null);

  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { createContract } = useContracts();
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      deposit_amount: 0,
      insurance_amount: 0,
    }
  });

  const watchedDates = form.watch(['start_date', 'end_date']);
  const watchedDailyRate = form.watch('daily_rate');

  // Calculate costs automatically
  useEffect(() => {
    const [startDate, endDate] = watchedDates;
    const dailyRate = watchedDailyRate;

    if (startDate && endDate && dailyRate && endDate > startDate) {
      const days = differenceInDays(endDate, startDate);
      const totalAmount = days * dailyRate;
      const depositAmount = form.getValues('deposit_amount') || 0;
      const insuranceAmount = form.getValues('insurance_amount') || 0;

      setCostCalculation({
        days,
        dailyRate,
        subtotal: totalAmount,
        deposit: depositAmount,
        insurance: insuranceAmount,
        total: totalAmount + depositAmount + insuranceAmount
      });
    } else {
      setCostCalculation(null);
    }
  }, [watchedDates, watchedDailyRate, form]);

  // Check vehicle availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedVehicle && watchedDates[0] && watchedDates[1]) {
        setAvailabilityCheck('checking');
        // Simulate API call to check availability
        setTimeout(() => {
          setAvailabilityCheck('available');
        }, 1000);
      }
    };

    checkAvailability();
  }, [selectedVehicle, watchedDates]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.national_id.includes(customerSearch)
  );

  const availableVehicles = vehicles.filter(vehicle => 
    vehicle.status === 'available' &&
    (vehicle.brand.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
     vehicle.model.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
     vehicle.plate_number.toLowerCase().includes(vehicleSearch.toLowerCase()))
  );

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValue('customer_id', customer.id);
    setCustomerOpen(false);
  };

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    form.setValue('vehicle_id', vehicle.id);
    form.setValue('daily_rate', vehicle.daily_rate);
    setVehicleOpen(false);
  };

  const handleSubmit = async (data: ContractFormData) => {
    if (!costCalculation) {
      toast({
        title: 'خطأ',
        description: 'لم يتم حساب التكلفة بشكل صحيح',
        variant: 'destructive'
      });
      return;
    }

    const contractData = {
      ...data,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
      total_amount: costCalculation.total,
      paid_amount: data.deposit_amount,
      remaining_amount: costCalculation.total - data.deposit_amount,
    };

    try {
      await onSubmit(contractData);
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء العقد بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء العقد',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            إنشاء عقد إيجار جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>العميل</Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomer ? selectedCustomer.name : "اختر العميل..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="بحث بالاسم أو الهاتف أو الهوية..."
                      value={customerSearch}
                      onValueChange={setCustomerSearch}
                    />
                    <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => handleCustomerSelect(customer)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {customer.phone} | {customer.national_id}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.formState.errors.customer_id && (
                <p className="text-sm text-destructive">{form.formState.errors.customer_id.message}</p>
              )}
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label>المركبة</Label>
              <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={vehicleOpen}
                    className="w-full justify-between"
                  >
                    {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate_number}` : "اختر المركبة..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="بحث بالماركة أو الموديل أو رقم اللوحة..."
                      value={vehicleSearch}
                      onValueChange={setVehicleSearch}
                    />
                    <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {availableVehicles.map((vehicle) => (
                        <CommandItem
                          key={vehicle.id}
                          onSelect={() => handleVehicleSelect(vehicle)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                            <span className="text-sm text-muted-foreground">
                              {vehicle.plate_number} | {vehicle.daily_rate} ريال/يوم
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {form.formState.errors.vehicle_id && (
                <p className="text-sm text-destructive">{form.formState.errors.vehicle_id.message}</p>
              )}

              {/* Availability Check */}
              {selectedVehicle && (
                <div className="mt-2">
                  {availabilityCheck === 'checking' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>جاري التحقق من توفر المركبة...</AlertDescription>
                    </Alert>
                  )}
                  {availabilityCheck === 'available' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">المركبة متاحة للفترة المحددة</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ البداية</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('start_date') ? (
                        format(form.watch('start_date'), 'PPP', { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('start_date')}
                      onSelect={(date) => form.setValue('start_date', date || new Date())}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>تاريخ النهاية</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('end_date') ? (
                        format(form.watch('end_date'), 'PPP', { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('end_date')}
                      onSelect={(date) => form.setValue('end_date', date || addDays(new Date(), 1))}
                      disabled={(date) => date <= (form.watch('start_date') || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Cost Calculation */}
            {costCalculation && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    حساب التكلفة التلقائي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>عدد الأيام: <Badge variant="secondary">{costCalculation.days}</Badge></div>
                    <div>السعر اليومي: <Badge variant="secondary">{costCalculation.dailyRate} ريال</Badge></div>
                    <div>المجموع الفرعي: <Badge variant="secondary">{costCalculation.subtotal} ريال</Badge></div>
                    <div>المجموع الكلي: <Badge className="bg-blue-600">{costCalculation.total} ريال</Badge></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>مبلغ التأمين</Label>
                <Input
                  type="number"
                  {...form.register('deposit_amount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>مبلغ التأمين الإضافي</Label>
                <Input
                  type="number"
                  {...form.register('insurance_amount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>موقع الاستلام</Label>
                <Input
                  {...form.register('pickup_location')}
                  placeholder="موقع استلام المركبة"
                />
              </div>

              <div className="space-y-2">
                <Label>موقع الإرجاع</Label>
                <Input
                  {...form.register('return_location')}
                  placeholder="موقع إرجاع المركبة"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات إضافية</Label>
              <Input
                {...form.register('notes')}
                placeholder="أي ملاحظات أو شروط إضافية"
              />
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={!costCalculation || availabilityCheck !== 'available'}
              >
                إنشاء العقد
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
