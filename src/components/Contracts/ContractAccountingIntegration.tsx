
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Receipt, 
  FileText, 
  TrendingUp,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { ContractPaymentManager } from './ContractPaymentManager';
import { ContractFinancialHistory } from './ContractFinancialHistory';

interface ContractAccountingIntegrationProps {
  contractId: string;
  contractData: {
    id: string;
    contract_number: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    deposit_amount: number;
    status: string;
    customer?: {
      name: string;
      phone: string;
    };
    vehicle?: {
      plate_number: string;
      brand: string;
      model: string;
    };
  };
}

export const ContractAccountingIntegration: React.FC<ContractAccountingIntegrationProps> = ({
  contractId,
  contractData
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePaymentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const profitMargin = contractData.total_amount > 0 
    ? ((contractData.paid_amount - (contractData.total_amount * 0.3)) / contractData.total_amount * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            الملخص المالي للعقد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {contractData.total_amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">إجمالي العقد (ر.س)</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {contractData.paid_amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">المحصل (ر.س)</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {contractData.remaining_amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">المتبقي (ر.س)</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">هامش الربح المتوقع</span>
              </div>
              <Badge variant={profitMargin > 20 ? 'default' : profitMargin > 0 ? 'secondary' : 'destructive'}>
                {profitMargin.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Management Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            إدارة المدفوعات
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            التاريخ المالي
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            القيود المحاسبية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <ContractPaymentManager
            contractId={contractId}
            contractData={contractData}
            onPaymentAdded={handlePaymentAdded}
          />
        </TabsContent>

        <TabsContent value="history">
          <ContractFinancialHistory
            contractId={contractId}
            contractNumber={contractData.contract_number}
            key={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle>القيود المحاسبية المرتبطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سيتم عرض القيود المحاسبية المرتبطة بهذا العقد هنا</p>
                <Button variant="outline" className="mt-4">
                  عرض القيود
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Alerts */}
      {contractData.remaining_amount > 0 && contractData.status === 'active' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  يوجد مبلغ متبقي على هذا العقد
                </div>
                <div className="text-sm text-orange-600">
                  المبلغ المتبقي: {contractData.remaining_amount.toLocaleString()} ريال
                  - يُنصح بمتابعة التحصيل
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
