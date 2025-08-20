
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Calendar,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContractPaymentManagerProps {
  contractId: string;
  contractData: {
    contract_number: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    deposit_amount: number;
    customer?: {
      name: string;
      phone: string;
    };
    vehicle?: {
      plate_number: string;
    };
  };
  onPaymentAdded?: () => void;
}

export const ContractPaymentManager: React.FC<ContractPaymentManagerProps> = ({
  contractId,
  contractData,
  onPaymentAdded
}) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentProgress = contractData.total_amount > 0 
    ? (contractData.paid_amount / contractData.total_amount) * 100 
    : 0;

  const handleAddPayment = async () => {
    if (paymentAmount <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال مبلغ صحيح',
        variant: 'destructive',
      });
      return;
    }

    if (paymentAmount > contractData.remaining_amount) {
      toast({
        title: 'خطأ',
        description: 'لا يمكن أن يتجاوز المبلغ المبلغ المتبقي',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // احصل على بيانات العقد للحصول على customer_id و vehicle_id المطلوبة للإيصال
      const { data: contractRow, error: contractFetchError } = await supabase
        .from('rental_contracts')
        .select('customer_id, vehicle_id')
        .eq('id', contractId)
        .maybeSingle();

      if (contractFetchError || !contractRow?.customer_id) {
        throw new Error('تعذر الحصول على بيانات العميل لهذا العقد');
      }

      // توليد رقم إيصال صحيح من قاعدة البيانات
      const { data: generatedNumber, error: genErr } = await supabase.rpc('generate_receipt_number');
      const receiptNumber = generatedNumber || `REC-${Date.now()}`;
      if (genErr) {
        console.warn('generate_receipt_number RPC failed, fallback to timestamp-based number', genErr);
      }

      // إنشاء إيصال دفع مع الحقول المطلوبة حسب الأنواع
      const { data: receipt, error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          receipt_number: receiptNumber,
          contract_id: contractId,
          customer_id: contractRow.customer_id,
          customer_name: contractData.customer?.name || '',
          vehicle_id: contractRow.vehicle_id ?? undefined,
          amount: paymentAmount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString().split('T')[0],
          // استخدم نوع متوافق مع الأنواع
          receipt_type: 'rental_payment',
          status: 'confirmed',
          notes: paymentNotes || `دفعة إضافية للعقد ${contractData.contract_number}`,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // تحديث العقد بالمبلغ الجديد
      const newPaidAmount = contractData.paid_amount + paymentAmount;
      const newRemainingAmount = contractData.total_amount - newPaidAmount;

      const { error: contractError } = await supabase
        .from('rental_contracts')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          payment_status: newRemainingAmount <= 0 ? 'completed' : 'partial',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId);

      if (contractError) throw contractError;

      // إنشاء قيد محاسبي باستخدام رقم الإيصال الذي تم توليده
      const entryNumber = `JE-${receiptNumber}`;
      
      const { error: journalError } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: entryNumber,
          entry_date: new Date().toISOString().split('T')[0],
          description: `استلام دفعة من العقد ${contractData.contract_number}`,
          reference_type: 'payment_receipt',
          reference_id: (receipt as any)?.id,
          total_amount: paymentAmount,
          status: 'posted',
        });

      if (journalError) throw journalError;

      toast({
        title: 'تم بنجاح',
        description: `تم إضافة دفعة بقيمة ${paymentAmount} ريال وإنشاء الإيصال رقم ${receiptNumber}`,
      });

      setIsAddingPayment(false);
      setPaymentAmount(0);
      setPaymentNotes('');
      onPaymentAdded?.();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة الدفعة',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentStatus = () => {
    if (contractData.paid_amount >= contractData.total_amount) {
      return { status: 'completed', label: 'مكتمل الدفع', color: 'bg-green-500', icon: CheckCircle };
    } else if (contractData.paid_amount > 0) {
      return { status: 'partial', label: 'دفع جزئي', color: 'bg-yellow-500', icon: Clock };
    } else {
      return { status: 'pending', label: 'لم يدفع', color: 'bg-red-500', icon: AlertCircle };
    }
  };

  const paymentStatus = getPaymentStatus();
  const StatusIcon = paymentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              حالة المدفوعات
            </div>
            <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={contractData.remaining_amount <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة دفعة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة دفعة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      max={contractData.remaining_amount}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      المبلغ المتبقي: {contractData.remaining_amount.toLocaleString()} ريال
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-method">طريقة الدفع</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="card">بطاقة ائتمان</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="check">شيك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Input
                      id="notes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleAddPayment} 
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? 'جاري المعالجة...' : 'إضافة الدفعة'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingPayment(false)}
                      disabled={isProcessing}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>تقدم السداد</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-3" />
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${paymentStatus.color}`} />
            <Badge variant="secondary" className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {paymentStatus.label}
            </Badge>
          </div>

          {/* Payment Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>المبلغ الإجمالي:</span>
                <span className="font-medium">{contractData.total_amount.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الوديعة:</span>
                <span className="font-medium">{contractData.deposit_amount.toLocaleString()} ر.س</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>المدفوع:</span>
                <span className="font-medium text-green-600">
                  {contractData.paid_amount.toLocaleString()} ر.س
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>المتبقي:</span>
                <span className="font-medium text-orange-600">
                  {contractData.remaining_amount.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
