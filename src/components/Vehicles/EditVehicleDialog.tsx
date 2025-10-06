import { useState } from 'react';
import { Vehicle } from '@/types/vehicle';
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
import { useForm } from 'react-hook-form';
import { Pencil, AlertCircle } from 'lucide-react';
import { useVehicleDuplicateCheck } from '@/hooks/useVehicleDuplicateCheck';
import { handleSaveError } from '@/lib/duplicateErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  onUpdate: (id: string, data: Partial<Vehicle>) => Promise<void>;
  trigger?: React.ReactNode;
}

export const EditVehicleDialog = ({ vehicle, onUpdate, trigger }: EditVehicleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { plateDuplicate, vinDuplicate, checkPlateNumber, checkVIN } = useVehicleDuplicateCheck(vehicle.id);

  const form = useForm({
    defaultValues: {
      plate_number: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      status: vehicle.status,
      daily_rate: vehicle.daily_rate,
      mileage: vehicle.mileage,
      vin: vehicle.vin || '',
      engine_number: vehicle.engine_number || '',
      chassis_number: vehicle.chassis_number || '',
      fuel_type: vehicle.fuel_type,
      transmission: vehicle.transmission,
      seating_capacity: vehicle.seating_capacity,
      notes: vehicle.notes || '',
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
      await onUpdate(vehicle.id, data);
      setOpen(false);
      form.reset();
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
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المركبة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم اللوحة</FormLabel>
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
                    <FormLabel>الماركة</FormLabel>
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
                    <FormLabel>الموديل</FormLabel>
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
                    <FormLabel>سنة الصنع</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                    <FormLabel>اللون</FormLabel>
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
                    <FormLabel>الحالة</FormLabel>
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
                    <FormLabel>السعر اليومي</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="السعر اليومي" 
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
                        placeholder="عدد الكيلومترات" 
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
                    <FormLabel>نوع الوقود</FormLabel>
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
                    <FormLabel>ناقل الحركة</FormLabel>
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
                    <FormLabel>عدد المقاعد</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الشاسيه</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ملاحظات إضافية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
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
