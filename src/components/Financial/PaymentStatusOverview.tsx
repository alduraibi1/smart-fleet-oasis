
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Eye,
  Download,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface PaymentStatus {
  id: string;
  type: 'receipt' | 'voucher';
  number: string;
  amount: number;
  customerName?: string;
  recipientName?: string;
  dueDate: string;
  status: 'pending' | 'confirmed' | 'overdue' | 'cancelled';
  daysOverdue?: number;
}

export function PaymentStatusOverview() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-status', filter],
    queryFn: async (): Promise<PaymentStatus[]> => {
      // جلب سندات القبض
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // جلب سندات الصرف
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const allPayments: PaymentStatus[] = [];

      // معالجة سندات القبض
      receipts?.forEach(receipt => {
        const dueDate = new Date(receipt.payment_date);
        const today = new Date();
        const daysOverdue = receipt.status === 'pending' ? 
          Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        allPayments.push({
          id: receipt.id,
          type: 'receipt',
          number: receipt.receipt_number,
          amount: receipt.amount,
          customerName: receipt.customer_name,
          dueDate: receipt.payment_date,
          status: daysOverdue > 0 ? 'overdue' : receipt.status as any,
          daysOverdue: daysOverdue > 0 ? daysOverdue : undefined
        });
      });

      // معالجة سندات الصرف
      vouchers?.forEach(voucher => {
        const dueDate = new Date(voucher.payment_date);
        const today = new Date();
        const daysOverdue = voucher.status === 'pending_approval' ? 
          Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        allPayments.push({
          id: voucher.id,
          type: 'voucher',
          number: voucher.voucher_number,
          amount: voucher.amount,
          recipientName: voucher.recipient_name,
          dueDate: voucher.payment_date,
          status: daysOverdue > 0 ? 'overdue' : 
                   voucher.status === 'approved' || voucher.status === 'paid' ? 'confirmed' : 'pending',
          daysOverdue: daysOverdue > 0 ? daysOverdue : undefined
        });
      });

      // تطبيق التصفية
      let filteredPayments = allPayments;
      if (filter === 'pending') {
        filteredPayments = allPayments.filter(p => p.status === 'pending');
      } else if (filter === 'overdue') {
        filteredPayments = allPayments.filter(p => p.status === 'overdue');
      }

      return filteredPayments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }
  });

  const getStatusBadge = (status: string, daysOverdue?: number) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مؤكد
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            معلق
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            متأخر {daysOverdue && `(${daysOverdue} يوم)`}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            ملغي
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  // إحصائيات سريعة
  const stats = payments ? {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    overdueAmount: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)
  } : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>حالة المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            جاري التحميل...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* إحصائيات سريعة */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي المعاملات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">معلقة</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">متأخرة</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-muted-foreground">مؤكدة</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* جدول المدفوعات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تفاصيل المدفوعات</CardTitle>
              <CardDescription>آخر المعاملات المالية ومتابعة حالتها</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {(['all', 'pending', 'overdue'] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(f)}
                  >
                    {{
                      all: 'الكل',
                      pending: 'معلقة',
                      overdue: 'متأخرة'
                    }[f]}
                  </Button>
                ))}
              </div>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>الرقم</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الجهة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {payment.type === 'receipt' ? 'قبض' : 'صرف'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{payment.number}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {payment.customerName || payment.recipientName}
                  </TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status, payment.daysOverdue)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
