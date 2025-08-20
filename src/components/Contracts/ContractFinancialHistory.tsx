
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Receipt, 
  FileText, 
  Calendar, 
  DollarSign,
  Download,
  Eye,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecord {
  id: string;
  receipt_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  notes?: string;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

interface ContractFinancialHistoryProps {
  contractId: string;
  contractNumber: string;
}

export const ContractFinancialHistory: React.FC<ContractFinancialHistoryProps> = ({
  contractId,
  contractNumber
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialHistory();
  }, [contractId]);

  const fetchFinancialHistory = async () => {
    try {
      // جلب الإيصالات
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('contract_id', contractId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // جلب الفواتير
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('contract_id', contractId)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      setPayments(paymentsData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching financial history:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب التاريخ المالي',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash': 'نقدي',
      'card': 'بطاقة',
      'bank_transfer': 'تحويل بنكي',
      'check': 'شيك'
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string, type: 'payment' | 'invoice') => {
    if (type === 'payment') {
      switch (status) {
        case 'confirmed':
          return <Badge className="bg-green-100 text-green-800">مؤكد</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
        case 'cancelled':
          return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'paid':
          return <Badge className="bg-green-100 text-green-800">مدفوع</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
        case 'overdue':
          return <Badge className="bg-red-100 text-red-800">متأخر</Badge>;
        case 'draft':
          return <Badge className="bg-gray-100 text-gray-800">مسودة</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            تاريخ المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مدفوعات مسجلة
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{payment.receipt_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(payment.payment_method)} • {' '}
                          {new Date(payment.payment_date).toLocaleDateString('ar-SA')}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {payment.amount.toLocaleString()} ر.س
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(payment.status, 'payment')}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تاريخ الفواتير
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير مسجلة
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{invoice.invoice_number}</div>
                        <div className="text-sm text-muted-foreground">
                          تاريخ الإصدار: {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          تاريخ الاستحقاق: {new Date(invoice.due_date).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {invoice.total_amount.toLocaleString()} ر.س
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(invoice.status, 'invoice')}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
