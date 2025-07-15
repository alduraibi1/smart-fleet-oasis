import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Receipt,
  Banknote,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  installment_number?: number;
}

interface PaymentManagementProps {
  contractId: string;
  totalAmount: number;
  paidAmount: number;
  payments: Payment[];
  onPaymentAdd: (payment: Omit<Payment, 'id'>) => void;
}

export const PaymentManagement = ({ 
  contractId, 
  totalAmount, 
  paidAmount, 
  payments, 
  onPaymentAdd 
}: PaymentManagementProps) => {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
    installment_number: payments.length + 1
  });
  const { toast } = useToast();

  const remainingAmount = totalAmount - paidAmount;
  const paymentProgress = (paidAmount / totalAmount) * 100;

  const handleAddPayment = () => {
    if (newPayment.amount <= 0 || newPayment.amount > remainingAmount) {
      toast({
        title: "خطأ في المبلغ",
        description: "يجب أن يكون المبلغ أكبر من صفر وأقل من أو يساوي المبلغ المتبقي",
        variant: "destructive"
      });
      return;
    }

    onPaymentAdd({
      ...newPayment,
      status: 'completed'
    });

    setNewPayment({
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
      installment_number: payments.length + 2
    });

    setIsAddingPayment(false);

    toast({
      title: "تم إضافة الدفعة بنجاح",
      description: `تم تسجيل دفعة بمبلغ ${newPayment.amount.toLocaleString()} ريال`
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">مكتملة</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">معلقة</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">فاشلة</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const createInstallmentPlan = () => {
    const installmentAmount = remainingAmount / 3; // 3 أقساط متساوية
    const installments = [];
    
    for (let i = 0; i < 3; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      installments.push({
        amount: installmentAmount,
        payment_date: dueDate.toISOString().split('T')[0],
        payment_method: 'cash',
        notes: `قسط ${i + 1} من 3`,
        installment_number: payments.length + i + 1
      });
    }

    installments.forEach(installment => {
      onPaymentAdd({
        ...installment,
        status: 'pending'
      });
    });

    toast({
      title: "تم إنشاء خطة التقسيط",
      description: "تم إنشاء 3 أقساط متساوية للمبلغ المتبقي"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            إدارة المدفوعات
          </div>
          <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                إضافة دفعة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة دفعة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">المبلغ (ريال)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                    max={remainingAmount}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    المبلغ المتبقي: {remainingAmount.toLocaleString()} ريال
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment_date">تاريخ الدفع</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={newPayment.payment_date}
                    onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="payment_method">طريقة الدفع</Label>
                  <Select 
                    value={newPayment.payment_method} 
                    onValueChange={(value) => setNewPayment({ ...newPayment, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                      <SelectItem value="bank_transfer">حوالة بنكية</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    placeholder="أدخل أي ملاحظات إضافية..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddPayment} className="flex-1">
                    إضافة الدفعة
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingPayment(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
            <p className="text-xl font-bold">{totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">ريال</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المدفوع</p>
            <p className="text-xl font-bold text-green-600">{paidAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">ريال</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المتبقي</p>
            <p className="text-xl font-bold text-red-600">{remainingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">ريال</p>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>نسبة الدفع</span>
            <span>{Math.round(paymentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        {remainingAmount > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={createInstallmentPlan}>
              <Calendar className="h-4 w-4 mr-1" />
              إنشاء خطة تقسيط
            </Button>
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-1" />
              إرسال فاتورة
            </Button>
          </div>
        )}

        {/* Payments List */}
        <div className="space-y-4">
          <h4 className="font-medium">سجل المدفوعات</h4>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد مدفوعات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      {getPaymentMethodIcon(payment.payment_method)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{payment.amount.toLocaleString()} ريال</span>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.payment_date), 'PPP', { locale: ar })}
                        {payment.installment_number && ` • قسط ${payment.installment_number}`}
                      </p>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {payment.status === 'pending' && (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    {payment.status === 'failed' && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};