import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, FileText, RefreshCw, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';

interface ContractRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: {
    id: string;
    contract_number: string;
    customer?: {
      id?: string;
      name: string;
      phone: string;
    };
    vehicle?: {
      id?: string;
      brand: string;
      model: string;
      plate_number: string;
    };
    start_date: string;
    end_date: string;
    daily_rate: number;
    total_amount: number;
    status: string;
  } | null;
  onCreated: () => void;
  renewalType?: 'renewal' | 'extension';
}

export const ContractRenewalDialog: React.FC<ContractRenewalDialogProps> = ({
  open,
  onOpenChange,
  contract,
  onCreated,
  renewalType = 'renewal'
}) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    dailyRate: 0,
    totalAmount: 0,
    renewalReason: '',
    notes: '',
    priceAdjustment: 0,
    paymentTerms: 'immediate'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { renewContract, extendContract } = useContracts();

  useEffect(() => {
    if (contract && open) {
      const today = new Date();
      const defaultEndDate = new Date(today);
      defaultEndDate.setMonth(today.getMonth() + 1); // Default 1 month extension

      setFormData({
        startDate: renewalType === 'renewal' ? 
          new Date(contract.end_date).toISOString().split('T')[0] : 
          contract.start_date,
        endDate: defaultEndDate.toISOString().split('T')[0],
        dailyRate: contract.daily_rate,
        totalAmount: 0, // Will be calculated
        renewalReason: renewalType === 'renewal' ? 'انتهاء العقد السابق' : 'تمديد العقد الحالي',
        notes: '',
        priceAdjustment: 0,
        paymentTerms: 'immediate'
      });
    }
  }, [contract, open, renewalType]);

  // Calculate duration and total amount
  useEffect(() => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const adjustedRate = formData.dailyRate + formData.priceAdjustment;
      const total = diffDays * adjustedRate;
      
      setFormData(prev => ({
        ...prev,
        totalAmount: total
      }));
    }
  }, [formData.startDate, formData.endDate, formData.dailyRate, formData.priceAdjustment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    try {
      const renewalData = {
        originalContractId: contract.id,
        customer_id: contract.customer?.id || '',
        vehicle_id: contract.vehicle?.id || '',
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: formData.dailyRate + formData.priceAdjustment,
        total_amount: formData.totalAmount,
        renewal_type: renewalType,
        renewal_reason: formData.renewalReason,
        notes: formData.notes,
        payment_terms: formData.paymentTerms
      };

      if (renewalType === 'renewal') {
        await renewContract(renewalData);
        toast({
          title: 'تم تجديد العقد بنجاح',
          description: `تم إنشاء عقد جديد مرتبط بالعقد ${contract.contract_number}`,
        });
      } else {
        await extendContract(contract.id, {
          end_date: formData.endDate,
          daily_rate: formData.dailyRate + formData.priceAdjustment,
          total_amount: formData.totalAmount,
          extension_reason: formData.renewalReason,
          notes: formData.notes
        });
        toast({
          title: 'تم تمديد العقد بنجاح',
          description: `تم تمديد العقد ${contract.contract_number} حتى ${new Date(formData.endDate).toLocaleDateString('ar-SA')}`,
        });
      }

      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة طلب التجديد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return null;

  const isRenewal = renewalType === 'renewal';
  const dialogTitle = isRenewal ? 'تجديد العقد' : 'تمديد العقد';
  const submitButtonText = isRenewal ? 'تجديد العقد' : 'تمديد العقد';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRenewal ? <RefreshCw className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {isRenewal 
              ? 'إنشاء عقد جديد بناءً على العقد المنتهي الصلاحية'
              : 'تمديد فترة العقد الحالي'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Original Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات العقد الأصلي</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">رقم العقد</Label>
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{contract.contract_number}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">العميل</Label>
                <div className="mt-1">
                  <div className="font-medium">{contract.customer?.name}</div>
                  <div className="text-sm text-muted-foreground">{contract.customer?.phone}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">المركبة</Label>
                <div className="mt-1">
                  <div className="font-medium">{contract.vehicle?.brand} {contract.vehicle?.model}</div>
                  <div className="text-sm text-muted-foreground">{contract.vehicle?.plate_number}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">فترة العقد الأصلي</Label>
                <div className="mt-1 text-sm">
                  من {new Date(contract.start_date).toLocaleDateString('ar-SA')} 
                  إلى {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">السعر اليومي الحالي</Label>
                <div className="mt-1 font-medium">
                  {contract.daily_rate.toLocaleString()} ر.س
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">حالة العقد</Label>
                <div className="mt-1">
                  <Badge variant={contract.status === 'expired' ? 'destructive' : 'secondary'}>
                    {contract.status === 'expired' ? 'منتهي الصلاحية' : 
                     contract.status === 'completed' ? 'مكتمل' : 'نشط'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewal/Extension Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                تفاصيل {isRenewal ? 'التجديد' : 'التمديد'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البداية *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    disabled={!isRenewal} // Extension keeps original start date
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">تاريخ النهاية *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailyRate">السعر اليومي الأساسي</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dailyRate"
                      type="number"
                      value={formData.dailyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priceAdjustment">تعديل السعر (+/-)</Label>
                  <Input
                    id="priceAdjustment"
                    type="number"
                    value={formData.priceAdjustment}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  {formData.priceAdjustment !== 0 && (
                    <div className="text-sm mt-1">
                      السعر الجديد: {(formData.dailyRate + formData.priceAdjustment).toLocaleString()} ر.س
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTerms">شروط الدفع</Label>
                <Select 
                  value={formData.paymentTerms} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">فوري</SelectItem>
                    <SelectItem value="on_delivery">عند التسليم</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="renewalReason">سبب {isRenewal ? 'التجديد' : 'التمديد'} *</Label>
                <Input
                  id="renewalReason"
                  value={formData.renewalReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, renewalReason: e.target.value }))}
                  placeholder={isRenewal ? "مثال: انتهاء العقد السابق، رضا العميل" : "مثال: تأخير في التسليم، طلب العميل"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات أو تغييرات في الشروط..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.totalAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  ملخص {isRenewal ? 'التجديد' : 'التمديد'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">المدة</div>
                    <div className="font-medium">
                      {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">السعر اليومي النهائي</div>
                    <div className="font-medium">
                      {(formData.dailyRate + formData.priceAdjustment).toLocaleString()} ر.س
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                    <div className="font-medium text-lg">
                      {formData.totalAmount.toLocaleString()} ر.س
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري المعالجة...' : submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
