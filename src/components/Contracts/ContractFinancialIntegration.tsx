
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Receipt, 
  CreditCard, 
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useContractIntegration } from '@/hooks/useContractIntegration';

interface FinancialSummary {
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoicesCount: number;
  receiptsCount: number;
}

interface ContractFinancialIntegrationProps {
  contractId: string;
  contractData: {
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    deposit_amount: number;
    status: string;
  };
}

export const ContractFinancialIntegration: React.FC<ContractFinancialIntegrationProps> = ({
  contractId,
  contractData
}) => {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    invoicesCount: 0,
    receiptsCount: 0
  });

  const { handlePaymentReceived } = useContractIntegration();

  const paymentProgress = contractData.total_amount > 0 
    ? (contractData.paid_amount / contractData.total_amount) * 100 
    : 0;

  const getPaymentStatus = () => {
    if (contractData.paid_amount >= contractData.total_amount) {
      return { status: 'paid', label: 'مدفوع بالكامل', color: 'bg-green-500' };
    } else if (contractData.paid_amount > 0) {
      return { status: 'partial', label: 'مدفوع جزئياً', color: 'bg-yellow-500' };
    } else {
      return { status: 'pending', label: 'في الانتظار', color: 'bg-red-500' };
    }
  };

  const handleQuickPayment = async (amount: number, method: string) => {
    try {
      await handlePaymentReceived(contractId, amount, method);
      // تحديث البيانات المحلية
      // يمكن إضافة استدعاء لإعادة تحميل البيانات هنا
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-6">
      {/* Payment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            حالة المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Payment Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>تقدم السداد</span>
                <span>{paymentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>مدفوع: {contractData.paid_amount.toLocaleString()} ر.س</span>
                <span>متبقي: {contractData.remaining_amount.toLocaleString()} ر.س</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${paymentStatus.color}`} />
              <Badge variant="secondary">{paymentStatus.label}</Badge>
              {paymentStatus.status === 'paid' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {paymentStatus.status === 'pending' && (
                <Clock className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            التفاصيل المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>المبلغ الإجمالي:</span>
                <span className="font-medium">{contractData.total_amount.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الوديعة:</span>
                <span className="font-medium">{contractData.deposit_amount.toLocaleString()} ر.س</span>
              </div>
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

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>عدد الفواتير:</span>
                <span className="font-medium">{financialSummary.invoicesCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>عدد الإيصالات:</span>
                <span className="font-medium">{financialSummary.receiptsCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Payment Actions */}
      {contractData.remaining_amount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              إجراءات سريعة للدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPayment(contractData.remaining_amount, 'cash')}
                >
                  دفع المتبقي نقداً
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPayment(contractData.remaining_amount, 'card')}
                >
                  دفع بالبطاقة
                </Button>
              </div>
              
              {contractData.remaining_amount > 1000 && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPayment(1000, 'cash')}
                  >
                    دفع 1000 ر.س
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPayment(contractData.remaining_amount / 2, 'bank_transfer')}
                  >
                    دفع نصف المبلغ
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            حالة التكامل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                الفواتير التلقائية
              </span>
              <Badge variant="secondary">مفعل</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                إيصالات الدفع
              </span>
              <Badge variant="secondary">مفعل</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                تنبيهات الدفع
              </span>
              <Badge variant="secondary">مجدول</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
