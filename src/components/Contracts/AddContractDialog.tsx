import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useContracts } from '@/hooks/useContracts';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';

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
    notes: '',
  });

  const { createContract } = useContracts();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate || !formData.dailyRate) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    try {
      await createContract({
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: parseFloat(formData.dailyRate),
        total_amount: parseFloat(formData.totalAmount) || parseFloat(formData.dailyRate),
        notes: formData.notes,
      });

      // Reset form
      setFormData({
        customerId: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        dailyRate: '',
        totalAmount: '',
        notes: '',
      });

      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Calculate total amount when daily rate or dates change
  const calculateTotal = () => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const total = days * parseFloat(formData.dailyRate);
      setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
    }
  };

  return (
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
                  setFormData(prev => ({ ...prev, startDate: e.target.value }));
                  setTimeout(calculateTotal, 100);
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
                  setFormData(prev => ({ ...prev, endDate: e.target.value }));
                  setTimeout(calculateTotal, 100);
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
                  setFormData(prev => ({ ...prev, dailyRate: e.target.value }));
                  setTimeout(calculateTotal, 100);
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

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
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
  );
}
