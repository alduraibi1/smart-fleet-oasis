
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Contract {
  id: string;
  contract_number: string;
  customer: { name: string };
  vehicle?: { brand: string; model: string; year: number; plate_number: string };
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  paid_amount?: number;
  remaining_amount?: number;
  mileage_start?: number;
  fuel_level_start?: string;
}

interface Props {
  contract: Contract;
  onReturn: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const VehicleReturnForm = ({ contract, onReturn, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    mileage_end: contract.mileage_start || 0,
    fuel_level_end: contract.fuel_level_start || 'full',
    additional_charges: 0,
    notes: '',
    vehicle_condition_notes: '',
    inspection_officer: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const remainingAmount = contract.remaining_amount || (contract.total_amount - (contract.paid_amount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inspection_officer.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم مسؤول الفحص',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onReturn({
        ...formData,
        status: 'completed',
        mileage_end: Number(formData.mileage_end),
        additional_charges: Number(formData.additional_charges),
      });
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إرجاع المركبة وإنهاء العقد بنجاح',
      });
    } catch (error) {
      console.error('Error returning vehicle:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرجاع المركبة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل العقد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">رقم العقد</Label>
              <p className="text-lg font-semibold">{contract.contract_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">العميل</Label>
              <p className="text-lg">{contract.customer.name}</p>
            </div>
          </div>
          
          {contract.vehicle && (
            <div>
              <Label className="text-sm font-medium">المركبة</Label>
              <p className="text-lg">
                {contract.vehicle.brand} {contract.vehicle.model} {contract.vehicle.year} - {contract.vehicle.plate_number}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">إجمالي العقد</Label>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(contract.total_amount)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">المبلغ المدفوع</Label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(contract.paid_amount || 0)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">المبلغ المتبقي</Label>
              <p className={`text-lg font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الإرجاع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actual_return_date">تاريخ الإرجاع الفعلي</Label>
                <Input
                  id="actual_return_date"
                  type="date"
                  value={formData.actual_return_date}
                  onChange={(e) => handleInputChange('actual_return_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage_end">عداد الكيلومترات عند الإرجاع</Label>
                <Input
                  id="mileage_end"
                  type="number"
                  value={formData.mileage_end}
                  onChange={(e) => handleInputChange('mileage_end', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel_level_end">مستوى الوقود عند الإرجاع</Label>
                <select
                  id="fuel_level_end"
                  value={formData.fuel_level_end}
                  onChange={(e) => handleInputChange('fuel_level_end', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="empty">فارغ</option>
                  <option value="quarter">ربع</option>
                  <option value="half">نصف</option>
                  <option value="three_quarters">ثلاثة أرباع</option>
                  <option value="full">ممتلئ</option>
                </select>
              </div>
              <div>
                <Label htmlFor="additional_charges">رسوم إضافية</Label>
                <Input
                  id="additional_charges"
                  type="number"
                  value={formData.additional_charges}
                  onChange={(e) => handleInputChange('additional_charges', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <Separator />

            {/* المبلغ المتبقي للعقد */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <Label className="text-sm font-medium text-muted-foreground">المبلغ المتبقي للعقد</Label>
              <p className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remainingAmount)}
              </p>
              {remainingAmount > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  يجب تحصيل هذا المبلغ من العميل قبل إنهاء العقد
                </p>
              )}
              {remainingAmount === 0 && (
                <p className="text-sm text-green-600 mt-1">
                  تم سداد كامل مبلغ العقد
                </p>
              )}
              {remainingAmount < 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  يوجد مبلغ زائد مدفوع يجب رده للعميل
                </p>
              )}
            </div>

            {/* ملاحظات حالة المركبة */}
            <div>
              <Label htmlFor="vehicle_condition_notes">ملاحظات على حالة المركبة عند الإرجاع</Label>
              <Textarea
                id="vehicle_condition_notes"
                value={formData.vehicle_condition_notes}
                onChange={(e) => handleInputChange('vehicle_condition_notes', e.target.value)}
                placeholder="مثال: يوجد خدش في الباب الأيمن للمركبة، تلف في المرآة الجانبية، إلخ..."
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                يرجى توثيق أي أضرار أو ملاحظات على حالة المركبة عند الإرجاع
              </p>
            </div>

            <div>
              <Label htmlFor="inspection_officer">مسؤول الفحص *</Label>
              <Input
                id="inspection_officer"
                type="text"
                value={formData.inspection_officer}
                onChange={(e) => handleInputChange('inspection_officer', e.target.value)}
                placeholder="اسم مسؤول فحص المركبة"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات عامة</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أي ملاحظات عامة حول عملية الإرجاع"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'تأكيد الإرجاع'}
          </Button>
        </div>
      </form>
    </div>
  );
};
