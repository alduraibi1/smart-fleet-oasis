
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContractEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  onUpdated?: () => void;
}

export const ContractEditDialog = ({ open, onOpenChange, contract, onUpdated }: ContractEditDialogProps) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    daily_rate: 0,
    total_amount: 0,
    deposit_amount: 0,
    insurance_amount: 0,
    additional_charges: 0,
    discount_amount: 0,
    payment_method: 'cash',
    payment_status: 'pending',
    pickup_location: '',
    return_location: '',
    notes: '',
    status: 'active'
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contract && open) {
      setFormData({
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        daily_rate: contract.daily_rate || 0,
        total_amount: contract.total_amount || 0,
        deposit_amount: contract.deposit_amount || 0,
        insurance_amount: contract.insurance_amount || 0,
        additional_charges: contract.additional_charges || 0,
        discount_amount: contract.discount_amount || 0,
        payment_method: contract.payment_method || 'cash',
        payment_status: contract.payment_status || 'pending',
        pickup_location: contract.pickup_location || '',
        return_location: contract.return_location || '',
        notes: contract.notes || '',
        status: contract.status || 'active'
      });
      
      if (contract.start_date) setStartDate(new Date(contract.start_date));
      if (contract.end_date) setEndDate(new Date(contract.end_date));
    }
  }, [contract, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        start_date: startDate ? startDate.toISOString().split('T')[0] : formData.start_date,
        end_date: endDate ? endDate.toISOString().split('T')[0] : formData.end_date,
        paid_amount: formData.deposit_amount,
        remaining_amount: formData.total_amount - formData.deposit_amount,
      };

      const { error } = await supabase
        .from('rental_contracts')
        .update(updateData)
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العقد بنجاح',
      });

      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث العقد',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل العقد - {contract.contract_number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاريخ البداية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>تاريخ النهاية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily_rate">الأجرة اليومية</Label>
              <Input
                id="daily_rate"
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="total_amount">المبلغ الإجمالي</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deposit_amount">مبلغ التأمين</Label>
              <Input
                id="deposit_amount"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="status">حالة العقد</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أضف ملاحظات..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
