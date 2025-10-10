
import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useContracts } from '@/hooks/useContracts';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import { useContractNotifications } from '@/hooks/useContractNotifications';
import { AutoPDFGenerator } from './AutoPDFGenerator';

interface AddContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddContractDialog({ open, onOpenChange }: AddContractDialogProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    dailyRate: '',
    totalAmount: '',
    depositAmount: '1000',
    notes: '',
    vatIncluded: false,
    pickupLocation: '',
    mileageStart: '',
    fuelLevelStart: '100',
  });

  const { createContract } = useContracts();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { toast } = useToast();
  const { sendContractNotification } = useContractNotifications();
  const [generatedContract, setGeneratedContract] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate || !formData.dailyRate || !formData.pickupLocation || !formData.mileageStart) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة (العميل، المركبة، التواريخ، السعر، موقع الاستلام، قراءة العداد)",
      });
      return;
    }

    // تحقق من مدة العقد >= 90 يوم
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(days) || days < 90) {
      toast({
        variant: "destructive",
        title: "مدة العقد غير كافية",
        description: "الحد الأدنى لمدة العقد هو 90 يوماً",
      });
      return;
    }

    // تحقق من الوديعة >= 1000 ريال
    const depositNum = parseFloat(formData.depositAmount || '0');
    if (isNaN(depositNum) || depositNum < 1000) {
      toast({
        variant: "destructive",
        title: "قيمة الوديعة غير صالحة",
        description: "الحد الأدنى للوديعة هو 1000 ريال",
      });
      return;
    }

    try {
      const newContract = await createContract({
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: parseFloat(formData.dailyRate),
        total_amount: parseFloat(formData.totalAmount) || (days * parseFloat(formData.dailyRate)),
        deposit_amount: depositNum,
        notes: formData.notes,
        vat_included: formData.vatIncluded,
        pickup_location: formData.pickupLocation,
        mileage_start: formData.mileageStart ? parseInt(formData.mileageStart) : undefined,
        fuel_level_start: formData.fuelLevelStart || undefined,
      });

      // إرسال إشعار للعميل
      if (newContract?.id) {
        try {
          await sendContractNotification(newContract.id, 'created');
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // لا نوقف العملية إذا فشل الإشعار
        }
        
        // تفعيل توليد PDF التلقائي
        setGeneratedContract(newContract);
      }

      // Reset form
      setFormData({
        customerId: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        dailyRate: '',
        totalAmount: '',
        depositAmount: '1000',
        notes: '',
        vatIncluded: false,
        pickupLocation: '',
        mileageStart: '',
        fuelLevelStart: '100',
      });

      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Calculate total amount when daily rate or dates change
  const calculateTotal = (startDate: string, endDate: string, dailyRate: string) => {
    if (startDate && endDate && dailyRate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0 && !isNaN(parseFloat(dailyRate))) {
        // المبلغ المحسوب هو الأساسي (بدون ضريبة)
        const baseTotal = days * parseFloat(dailyRate);
        setFormData(prev => ({ ...prev, totalAmount: baseTotal.toFixed(2) }));
      }
    }
  };

  // حساب تفاصيل المبلغ للعرض
  const getAmountDetails = () => {
    const total = parseFloat(formData.totalAmount || '0');
    if (isNaN(total) || total === 0) return null;

    if (formData.vatIncluded) {
      // المبلغ المدخل شامل الضريبة
      const totalWithVat = total;
      const baseAmount = totalWithVat / 1.15;
      const vatAmount = totalWithVat - baseAmount;
      return { baseAmount, vatAmount, totalWithVat };
    } else {
      // المبلغ المدخل بدون ضريبة
      return { baseAmount: total, vatAmount: 0, totalWithVat: total };
    }
  };

  const amountDetails = getAmountDetails();

  return (
    <>
      {generatedContract && (
        <AutoPDFGenerator 
          contract={generatedContract} 
          onComplete={() => setGeneratedContract(null)}
        />
      )}
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة عقد جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال تفاصيل العقد الجديد
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">العميل</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicle">المركبة</Label>
              <Select value={formData.vehicleId} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setFormData(prev => ({ ...prev, startDate: newStartDate }));
                  calculateTotal(newStartDate, formData.endDate, formData.dailyRate);
                }}
              />
            </div>

            <div>
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  const newEndDate = e.target.value;
                  setFormData(prev => ({ ...prev, endDate: newEndDate }));
                  calculateTotal(formData.startDate, newEndDate, formData.dailyRate);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dailyRate">السعر اليومي (ر.س)</Label>
              <Input
                id="dailyRate"
                type="number"
                step="0.01"
                value={formData.dailyRate}
                onChange={(e) => {
                  const newDailyRate = e.target.value;
                  setFormData(prev => ({ ...prev, dailyRate: newDailyRate }));
                  calculateTotal(formData.startDate, formData.endDate, newDailyRate);
                }}
              />
            </div>

            <div>
              <Label htmlFor="totalAmount">المبلغ الإجمالي (ر.س)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="depositAmount">الوديعة (ر.س)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>المبلغ المدفوع من قبل العميل كضمان، ويُسترد بالكامل عند تسليم المركبة وإنهاء العقد بدون أضرار أو مخالفات</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="depositAmount"
                type="number"
                min={1000}
                step="0.01"
                value={formData.depositAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                الحد الأدنى للوديعة: 1000 ريال
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                💰 الوديعة هي مبلغ ضمان يُسترد للعميل عند إنهاء العقد بدون أضرار
              </p>
            </div>
            <div>
              {/* خيار الضريبة */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox
                    id="vatIncluded"
                    checked={formData.vatIncluded}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, vatIncluded: checked as boolean }))
                    }
                  />
                  <Label htmlFor="vatIncluded" className="text-sm font-normal cursor-pointer">
                    شامل ضريبة القيمة المضافة (15%)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          عند التفعيل، سيتم إضافة 15% ضريبة قيمة مضافة على المبلغ
                          الأساسي. ستظهر تفاصيل الضريبة في العقد والفاتورة المطبوعة.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {amountDetails && formData.vatIncluded && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">المبلغ الأساسي:</span>
                        <span className="font-medium">{amountDetails.baseAmount.toFixed(2)} ر.س</span>
                      </div>
                      <div className="flex justify-between text-yellow-700">
                        <span>الضريبة (15%):</span>
                        <span className="font-medium">
                          {amountDetails.vatAmount.toFixed(2)} ر.س
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-300 pt-1 mt-1">
                        <span className="font-semibold">المجموع شامل الضريبة:</span>
                        <span className="font-bold text-primary">
                          {amountDetails.totalWithVat.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {amountDetails && !formData.vatIncluded && formData.totalAmount && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">المجموع (بدون ضريبة):</span>
                        <span className="font-bold">{amountDetails.baseAmount.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ملخص المبالغ */}
          {formData.totalAmount && parseFloat(formData.totalAmount) > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border">
              <h4 className="font-semibold text-sm mb-3">📊 ملخص المبالغ</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي قيمة الإيجار:</span>
                  <span className="font-bold">{parseFloat(formData.totalAmount).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>الوديعة (قابلة للاسترداد):</span>
                  <span className="font-bold">{parseFloat(formData.depositAmount || '0').toLocaleString()} ر.س</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between text-primary">
                    <span className="font-semibold">المبلغ المطلوب الآن:</span>
                    <span className="font-bold text-lg">{parseFloat(formData.depositAmount || '0').toLocaleString()} ر.س</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    يُدفع فقط مبلغ الوديعة عند توقيع العقد
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pickupLocation">موقع الاستلام *</Label>
              <Input
                id="pickupLocation"
                placeholder="مثال: الرياض - الملز"
                value={formData.pickupLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="mileageStart">قراءة العداد (كم) *</Label>
              <Input
                id="mileageStart"
                type="number"
                min="0"
                placeholder="0"
                value={formData.mileageStart}
                onChange={(e) => setFormData(prev => ({ ...prev, mileageStart: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="fuelLevelStart">مستوى الوقود (%)</Label>
              <Input
                id="fuelLevelStart"
                type="number"
                min="0"
                max="100"
                value={formData.fuelLevelStart}
                onChange={(e) => setFormData(prev => ({ ...prev, fuelLevelStart: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="handoverNotes">حالة المركبة عند الاستلام</Label>
            <Textarea
              id="handoverNotes"
              placeholder="مثال: المركبة نظيفة، خدش صغير على الباب الأمامي الأيسر..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              سجّل أي ملاحظات أو أضرار موجودة في المركبة عند الاستلام
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              إضافة العقد
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};
