
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Vehicle } from '@/types/vehicle';
import { useToast } from '@/hooks/use-toast';
import { useVehicleDuplicateCheck } from '@/hooks/useVehicleDuplicateCheck';
import { handleSaveError } from '@/lib/duplicateErrorHandler';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleAdded: (vehicleData: Partial<Vehicle>) => Promise<void>;
}

const AddVehicleDialog = ({ open, onOpenChange, onVehicleAdded }: AddVehicleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { plateDuplicate, vinDuplicate, checkPlateNumber, checkVIN } = useVehicleDuplicateCheck();

  const form = useForm({
    defaultValues: {
      plate_number: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      status: 'available' as Vehicle['status'],
      daily_rate: 0,
      mileage: 0,
      vin: '',
      engine_number: '',
      chassis_number: '',
      fuel_type: 'gasoline' as Vehicle['fuel_type'],
      transmission: 'automatic' as Vehicle['transmission'],
      seating_capacity: 5,
      registration_expiry: '',
      notes: '',
    },
  });

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
    
    if (vinDuplicate.isDuplicate) {
      toast({
        title: "بيانات مكررة",
        description: "رقم الشاسيه (VIN) مستخدم مسبقاً",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await onVehicleAdded({
        ...data,
        registration_expiry: data.registration_expiry || undefined,
        created_by: 'current-user', // This should be replaced with actual user ID
      });
      
      form.reset();
      onOpenChange(false);
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المركبة بنجاح",
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة مركبة جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم اللوحة *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مثال: أ ب ج 1234" 
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
                      <Input placeholder="مثال: تويوتا" {...field} />
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
                      <Input placeholder="مثال: كامري" {...field} />
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
                        placeholder="2024" 
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
                      <Input placeholder="مثال: أبيض" {...field} />
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
                name="daily_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر اليومي (ريال) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="150" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        placeholder="50000" 
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
                        placeholder="5" 
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
                name="registration_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ انتهاء التسجيل</FormLabel>
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
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الشاسيه (VIN)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="رقم الشاسيه" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkVIN(e.target.value);
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
                name="chassis_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهيكل</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الهيكل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
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
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading || plateDuplicate.isDuplicate || vinDuplicate.isDuplicate || plateDuplicate.checking || vinDuplicate.checking}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ المركبة'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
