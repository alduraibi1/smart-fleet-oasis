import { useState, useEffect } from 'react';
import { Vehicle, VehicleInspectionPoints } from '@/types/vehicle';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { Pencil, AlertCircle, Car, FileText, Shield, Image as ImageIcon, ClipboardCheck } from 'lucide-react';
import { useVehicleDuplicateCheck } from '@/hooks/useVehicleDuplicateCheck';
import { handleSaveError } from '@/lib/duplicateErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PricingRangeSection } from './PricingRangeSection';
import { ImageUploadSection } from './ImageUploadSection';
import { VehicleInspectionChecklist } from './VehicleInspectionChecklist';

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  onUpdate: (id: string, data: Partial<Vehicle>, images?: File[], inspectionData?: Partial<VehicleInspectionPoints>) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EditVehicleDialog = ({ vehicle, onUpdate, trigger, open: controlledOpen, onOpenChange }: EditVehicleDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [inspectionData, setInspectionData] = useState<Partial<VehicleInspectionPoints> | undefined>(
    vehicle.inspectionPoints || undefined
  );
  const [owners, setOwners] = useState<Array<{ id: string; name: string; national_id: string }>>([]);
  const { toast } = useToast();
  const { plateDuplicate, vinDuplicate, checkPlateNumber, checkVIN } = useVehicleDuplicateCheck(vehicle.id);

  useEffect(() => {
    const fetchOwners = async () => {
      const { data, error } = await supabase
        .from('vehicle_owners')
        .select('id, name, national_id')
        .eq('is_active', true)
        .order('name');
      
      if (data && !error) {
        setOwners(data);
      }
    };
    fetchOwners();
  }, []);

  const form = useForm({
    defaultValues: {
      plate_number: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      status: vehicle.status,
      owner_id: vehicle.owner_id || '',
      daily_rate: vehicle.daily_rate,
      min_daily_rate: vehicle.min_daily_rate || vehicle.daily_rate * 0.8,
      max_daily_rate: vehicle.max_daily_rate || vehicle.daily_rate * 1.2,
      mileage: vehicle.mileage,
      vin: vehicle.vin || '',
      engine_number: vehicle.engine_number || '',
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      seating_capacity: vehicle.seating_capacity,
      registration_expiry: vehicle.registration_expiry || '',
      inspection_expiry: vehicle.inspection_expiry || '',
      insurance_expiry: vehicle.insurance_expiry || '',
      insurance_company: vehicle.insurance_company || '',
      insurance_policy_number: vehicle.insurance_policy_number || '',
      notes: vehicle.notes || '',
    },
  });

  const handlePricingChange = (field: 'min_daily_rate' | 'daily_rate' | 'max_daily_rate', value: number) => {
    form.setValue(field, value);
    
    // تحديث تلقائي للأسعار الأخرى إذا لم تكن محددة
    if (field === 'daily_rate') {
      const currentMin = form.getValues('min_daily_rate');
      const currentMax = form.getValues('max_daily_rate');
      
      if (!currentMin || currentMin === vehicle.daily_rate * 0.8) {
        form.setValue('min_daily_rate', value * 0.8);
      }
      if (!currentMax || currentMax === vehicle.daily_rate * 1.2) {
        form.setValue('max_daily_rate', value * 1.2);
      }
    }
  };

  const onSubmit = async (data: any) => {
    // التحقق من التكرارات قبل الحفظ
    if (plateDuplicate.isDuplicate) {
      toast({
        title: "بيانات مكررة",
        description: "رقم اللوحة مستخدم مسبقاً",
        variant: "destructive",
      });
      return;
    }
    
    if (data.vin && vinDuplicate.isDuplicate) {
      toast({
        title: "بيانات مكررة",
        description: "رقم الشاسيه (VIN) مستخدم مسبقاً",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await onUpdate(
        vehicle.id, 
        {
          ...data,
          registration_expiry: data.registration_expiry || undefined,
          inspection_expiry: data.inspection_expiry || undefined,
          insurance_expiry: data.insurance_expiry || undefined,
          insurance_company: data.insurance_company || undefined,
          insurance_policy_number: data.insurance_policy_number || undefined,
        },
        newImages.length > 0 ? newImages : undefined,
        inspectionData
      );
      setOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المركبة بنجاح",
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      const errorInfo = handleSaveError(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">تعديل بيانات المركبة - {vehicle.plate_number}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* معلومات أساسية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="plate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم اللوحة *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="رقم اللوحة" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            checkPlateNumber(e.target.value);
                          }}
                        />
                      </FormControl>
                      {plateDuplicate.checking && (
                        <p className="text-sm text-muted-foreground">جاري التحقق...</p>
                      )}
                      {plateDuplicate.isDuplicate && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            رقم اللوحة مستخدم مسبقاً
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الماركة *</FormLabel>
                      <FormControl>
                        <Input placeholder="الماركة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموديل *</FormLabel>
                      <FormControl>
                        <Input placeholder="الموديل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سنة الصنع *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          placeholder="سنة الصنع" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون *</FormLabel>
                      <FormControl>
                        <Input placeholder="اللون" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">متاحة</SelectItem>
                          <SelectItem value="rented">مؤجرة</SelectItem>
                          <SelectItem value="maintenance">صيانة</SelectItem>
                          <SelectItem value="out_of_service">خارج الخدمة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المالك</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المالك (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">بدون مالك</SelectItem>
                          {owners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              {owner.name} - {owner.national_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* المواصفات الفنية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">المواصفات الفنية</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>رقم الشاسيه / الهيكل (VIN)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="رقم الشاسيه" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value) checkVIN(e.target.value);
                          }}
                        />
                      </FormControl>
                      {vinDuplicate.checking && (
                        <p className="text-sm text-muted-foreground">جاري التحقق...</p>
                      )}
                      {vinDuplicate.isDuplicate && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            رقم الشاسيه مستخدم مسبقاً
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engine_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم المحرك</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم المحرك" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الوقود *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الوقود" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">بنزين</SelectItem>
                          <SelectItem value="diesel">ديزل</SelectItem>
                          <SelectItem value="hybrid">هايبرد</SelectItem>
                          <SelectItem value="electric">كهربائي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ناقل الحركة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر ناقل الحركة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">يدوي</SelectItem>
                          <SelectItem value="automatic">أوتوماتيك</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seating_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد المقاعد *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="2"
                          max="50"
                          placeholder="عدد المقاعد" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عدد الكيلومترات</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="عدد الكيلومترات" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* التأمين والفحص */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">التأمين والفحص والترخيص</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="insurance_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شركة التأمين</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: شركة التأمين الوطنية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insurance_policy_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم وثيقة التأمين</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم الوثيقة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insurance_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء التأمين</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspection_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء الفحص الدوري</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء رخصة السير</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* التسعير */}
            <PricingRangeSection
              minDailyRate={form.watch('min_daily_rate')}
              dailyRate={form.watch('daily_rate')}
              maxDailyRate={form.watch('max_daily_rate')}
              onChange={handlePricingChange}
            />

            <Separator />

            {/* تحديث الصور */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">إضافة صور جديدة</h3>
              </div>
              <ImageUploadSection
                vehicleId={vehicle.id}
                onImagesChange={setNewImages}
              />
              {vehicle.images && vehicle.images.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  الصور الحالية: {vehicle.images.length} صورة
                </p>
              )}
            </div>

            <Separator />

            {/* تحديث نقاط الفحص */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">تحديث نقاط الفحص الشاملة</h3>
              </div>
              <VehicleInspectionChecklist
                initialData={vehicle.inspectionPoints}
                onInspectionChange={setInspectionData}
              />
            </div>

            <Separator />

            {/* ملاحظات */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أي ملاحظات إضافية حول المركبة..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading || plateDuplicate.isDuplicate || vinDuplicate.isDuplicate || plateDuplicate.checking || vinDuplicate.checking}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
