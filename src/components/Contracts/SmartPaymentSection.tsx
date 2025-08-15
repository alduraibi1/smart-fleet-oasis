
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { FieldRequirement } from './ContractValidation';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SmartPaymentSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

type PaymentMode = 'full' | 'partial' | 'installments' | 'on_return';

export const SmartPaymentSection = ({ formData, setFormData }: SmartPaymentSectionProps) => {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('partial');

  // Auto-calculate payment details based on mode
  useEffect(() => {
    const totalAmount = formData.totalAmount || 0;
    
    switch (paymentMode) {
      case 'full':
        setFormData(prev => ({
          ...prev,
          paidAmount: totalAmount,
          remainingBalance: 0,
          paymentStatus: 'paid',
          depositAmount: 0,
        }));
        break;
        
      case 'partial':
        const suggestedDeposit = Math.round(totalAmount * 0.3); // 30% as deposit
        setFormData(prev => ({
          ...prev,
          paidAmount: prev.depositAmount || suggestedDeposit,
          remainingBalance: totalAmount - (prev.depositAmount || suggestedDeposit),
          paymentStatus: prev.depositAmount > 0 ? 'partial' : 'pending',
          depositAmount: prev.depositAmount || suggestedDeposit,
        }));
        break;
        
      case 'installments':
        const installmentAmount = Math.round(totalAmount / 3); // 3 installments
        setFormData(prev => ({
          ...prev,
          paidAmount: 0,
          remainingBalance: totalAmount,
          paymentStatus: 'pending',
          installmentAmount,
          numberOfInstallments: 3,
        }));
        break;
        
      case 'on_return':
        setFormData(prev => ({
          ...prev,
          paidAmount: 0,
          remainingBalance: totalAmount,
          paymentStatus: 'pending',
          depositAmount: 0,
        }));
        break;
    }
  }, [paymentMode, formData.totalAmount]);

  const getPaymentModeDescription = (mode: PaymentMode) => {
    switch (mode) {
      case 'full':
        return 'العميل يدفع كامل المبلغ مقدماً';
      case 'partial':
        return 'العميل يدفع عربون والباقي لاحقاً';
      case 'installments':
        return 'تقسيم المبلغ على عدة دفعات';
      case 'on_return':
        return 'الدفع عند إرجاع السيارة';
      default:
        return '';
    }
  };

  const getPaymentStatusBadge = () => {
    const status = formData.paymentStatus;
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">مدفوع بالكامل</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">مدفوع جزئياً</Badge>;
      case 'pending':
        return <Badge variant="secondary">معلق</Badge>;
      case 'overdue':
        return <Badge variant="destructive">متأخر</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  const paymentProgress = formData.totalAmount > 0 
    ? ((formData.paidAmount || 0) / formData.totalAmount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Payment Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            نوع الدفع
            <FieldRequirement required />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentMode">اختر طريقة الدفع</Label>
            <Select value={paymentMode} onValueChange={(value: PaymentMode) => setPaymentMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">💰 دفع كامل مقدماً</SelectItem>
                <SelectItem value="partial">💳 دفع جزئي (عربون)</SelectItem>
                <SelectItem value="installments">📅 أقساط</SelectItem>
                <SelectItem value="on_return">🚗 دفع عند الإرجاع</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {getPaymentModeDescription(paymentMode)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Based on Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            تفاصيل الدفع
            {getPaymentStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Payment Mode */}
          {paymentMode === 'full' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">دفع كامل</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  المبلغ الإجمالي: {(formData.totalAmount || 0).toLocaleString()} ر.س
                </p>
              </div>
              
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
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.paymentDate ? format(new Date(formData.paymentDate), "PPP") : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.paymentDate ? new Date(formData.paymentDate) : undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, paymentDate: date?.toISOString().split('T')[0] }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Partial Payment Mode */}
          {paymentMode === 'partial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depositAmount">مبلغ العربون (ر.س)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    max={formData.totalAmount || undefined}
                    value={formData.depositAmount || ''}
                    onChange={(e) => {
                      const deposit = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({ 
                        ...prev, 
                        depositAmount: deposit,
                        paidAmount: deposit,
                        remainingBalance: (prev.totalAmount || 0) - deposit
                      }));
                    }}
                    placeholder="أدخل مبلغ العربون"
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
                  <Label htmlFor="paymentDueDate">تاريخ استحقاق الباقي</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.paymentDueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.paymentDueDate ? format(new Date(formData.paymentDueDate), "PPP") : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.paymentDueDate ? new Date(formData.paymentDueDate) : undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, paymentDueDate: date?.toISOString().split('T')[0] }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

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
                    </SelectContent>
                  </Select>
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
            </div>
          )}

          {/* Installments Mode */}
          {paymentMode === 'installments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfInstallments">عدد الأقساط</Label>
                  <Select 
                    value={(formData.numberOfInstallments || 3).toString()} 
                    onValueChange={(value) => {
                      const installments = parseInt(value);
                      const installmentAmount = Math.round((formData.totalAmount || 0) / installments);
                      setFormData(prev => ({ 
                        ...prev, 
                        numberOfInstallments: installments,
                        installmentAmount 
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">قسطين</SelectItem>
                      <SelectItem value="3">3 أقساط</SelectItem>
                      <SelectItem value="4">4 أقساط</SelectItem>
                      <SelectItem value="6">6 أقساط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="installmentAmount">مبلغ القسط (ر.س)</Label>
                  <Input
                    id="installmentAmount"
                    type="number"
                    value={formData.installmentAmount || 0}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">خطة الأقساط</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>عدد الأقساط:</span>
                    <span>{formData.numberOfInstallments || 3} أقساط</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مبلغ كل قسط:</span>
                    <span>{(formData.installmentAmount || 0).toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>المبلغ الإجمالي:</span>
                    <span>{(formData.totalAmount || 0).toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* On Return Mode */}
          {paymentMode === 'on_return' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">دفع عند الإرجاع</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  سيتم الدفع عند إرجاع السيارة. المبلغ: {(formData.totalAmount || 0).toLocaleString()} ر.س
                </p>
              </div>

              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع المتوقعة</Label>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
