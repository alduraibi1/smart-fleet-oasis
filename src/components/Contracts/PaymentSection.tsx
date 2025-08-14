
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { FieldRequirement } from './ContractValidation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const PaymentSection = ({ formData, setFormData }: PaymentSectionProps) => {
  // Auto-calculate remaining balance
  useEffect(() => {
    const totalAmount = formData.totalAmount || 0;
    const paidAmount = formData.paidAmount || 0;
    const remainingBalance = totalAmount - paidAmount;
    
    setFormData(prev => ({
      ...prev,
      remainingBalance,
    }));
  }, [formData.totalAmount, formData.paidAmount]);

  // Auto-update payment status based on amounts
  useEffect(() => {
    const totalAmount = formData.totalAmount || 0;
    const paidAmount = formData.paidAmount || 0;
    
    let status = 'pending';
    if (paidAmount >= totalAmount && totalAmount > 0) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }
    
    // Check for overdue
    if (formData.paymentDueDate && status !== 'paid') {
      const dueDate = new Date(formData.paymentDueDate);
      const today = new Date();
      if (dueDate < today) {
        status = 'overdue';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      paymentStatus: status,
    }));
  }, [formData.totalAmount, formData.paidAmount, formData.paymentDueDate]);

  const paymentProgress = formData.totalAmount > 0 
    ? (formData.paidAmount / formData.totalAmount) * 100 
    : 0;

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="secondary">معلق</Badge>,
      partial: <Badge variant="outline" className="border-yellow-500 text-yellow-700">مدفوع جزئياً</Badge>,
      paid: <Badge variant="default" className="bg-green-500">مدفوع بالكامل</Badge>,
      overdue: <Badge variant="destructive">متأخر</Badge>,
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Payment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            تتبع المدفوعات
            <FieldRequirement recommended />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paidAmount" className="flex items-center gap-1">
                المبلغ المدفوع (ر.س)
                <FieldRequirement recommended />
              </Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                max={formData.totalAmount || undefined}
                value={formData.paidAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="remainingBalance">المبلغ المتبقي (ر.س)</Label>
              <Input
                id="remainingBalance"
                type="number"
                value={formData.remainingBalance || 0}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="paymentStatus">حالة الدفع</Label>
              <div className="mt-2">
                {getPaymentStatusBadge(formData.paymentStatus)}
              </div>
            </div>
          </div>

          {/* Payment Progress */}
          {formData.totalAmount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تقدم الدفع</span>
                <span>{Math.round(paymentProgress)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>مدفوع: {(formData.paidAmount || 0).toLocaleString()} ر.س</span>
                <span>متبقي: {(formData.remainingBalance || 0).toLocaleString()} ر.س</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            تفاصيل الدفع
            <FieldRequirement optional />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select 
                value={formData.paymentMethod || 'cash'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cheque">شيك</SelectItem>
                  <SelectItem value="installments">أقساط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentTerms">شروط الدفع</Label>
              <Select 
                value={formData.paymentTerms || 'upfront'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upfront">دفع مقدم</SelectItem>
                  <SelectItem value="on_delivery">عند الاستلام</SelectItem>
                  <SelectItem value="7_days">7 أيام</SelectItem>
                  <SelectItem value="14_days">14 يوم</SelectItem>
                  <SelectItem value="30_days">30 يوم</SelectItem>
                  <SelectItem value="installments">أقساط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentDate">تاريخ الدفع</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.paymentDate ? format(new Date(formData.paymentDate), "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.paymentDate ? new Date(formData.paymentDate) : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, paymentDate: date?.toISOString().split('T')[0] }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="paymentDueDate">تاريخ استحقاق الدفع</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.paymentDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.paymentDueDate ? format(new Date(formData.paymentDueDate), "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.paymentDueDate ? new Date(formData.paymentDueDate) : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, paymentDueDate: date?.toISOString().split('T')[0] }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="paymentReference">رقم المرجع / الإيصال</Label>
              <Input
                id="paymentReference"
                type="text"
                value={formData.paymentReference || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="رقم الإيصال أو المرجع"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            إدارة الودائع
            <FieldRequirement optional />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="securityDeposit">مبلغ التأمين (ر.س)</Label>
              <Input
                id="securityDeposit"
                type="number"
                min="0"
                value={formData.securityDeposit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="depositAmount">مبلغ العربون (ر.س)</Label>
              <Input
                id="depositAmount"
                type="number"
                min="0"
                value={formData.depositAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="depositStatus">حالة العربون</Label>
              <Select 
                value={formData.depositStatus || 'pending'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, depositStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="received">مستلم</SelectItem>
                  <SelectItem value="refunded">مرتد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deposit Summary */}
          {(formData.securityDeposit > 0 || formData.depositAmount > 0) && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="space-y-1 text-sm">
                {formData.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span>مبلغ التأمين:</span>
                    <span className="font-medium">{(formData.securityDeposit || 0).toLocaleString()} ر.س</span>
                  </div>
                )}
                {formData.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span>العربون:</span>
                    <span className="font-medium">{(formData.depositAmount || 0).toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>إجمالي الودائع:</span>
                    <span>{((formData.securityDeposit || 0) + (formData.depositAmount || 0)).toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
