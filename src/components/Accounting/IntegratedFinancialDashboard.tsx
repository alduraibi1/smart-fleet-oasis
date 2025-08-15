
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Receipt, FileText, TrendingUp, TrendingDown, Car, Users, Wrench, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreatePaymentReceiptDialog } from "./PaymentReceipts/CreatePaymentReceiptDialog";
import { CreatePaymentVoucherDialog } from "./PaymentVouchers/CreatePaymentVoucherDialog";
import { FinancialWarningsTable } from "./FinancialWarnings/FinancialWarningsTable";
import { useNavigate } from "react-router-dom";

interface FinancialSummary {
  totalReceipts: number;
  totalVouchers: number;
  netIncome: number;
  pendingApprovals: number;
  vehicleRevenue: { [vehicleId: string]: number };
  ownerCommissions: { [ownerId: string]: number };
}

export function IntegratedFinancialDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalReceipts: 0,
    totalVouchers: 0,
    netIncome: 0,
    pendingApprovals: 0,
    vehicleRevenue: {},
    ownerCommissions: {}
  });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // جلب سندات القبض
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      // جلب سندات الصرف
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      // حساب الملخص المالي
      const totalReceipts = receipts?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const totalVouchers = vouchers?.reduce((sum, v) => sum + v.amount, 0) || 0;
      const pendingApprovals = vouchers?.filter(v => v.status === 'pending_approval').length || 0;

      setSummary({
        totalReceipts,
        totalVouchers,
        netIncome: totalReceipts - totalVouchers,
        pendingApprovals,
        vehicleRevenue: {},
        ownerCommissions: {}
      });

      setRecentReceipts(receipts?.slice(0, 5) || []);
      setRecentVouchers(vouchers?.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'معلق', variant: 'secondary' as const },
      'confirmed': { label: 'مؤكد', variant: 'default' as const },
      'pending_approval': { label: 'في انتظار الموافقة', variant: 'outline' as const },
      'approved': { label: 'موافق عليه', variant: 'default' as const },
      'cancelled': { label: 'ملغي', variant: 'destructive' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المقبوضات</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceipts)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalVouchers)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صافي الدخل</p>
                <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netIncome)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${summary.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">في انتظار الموافقة</p>
                <p className="text-2xl font-bold text-orange-600">{summary.pendingApprovals}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <CreatePaymentReceiptDialog />
            <CreatePaymentVoucherDialog />
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              تقرير مالي
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/profitability-reports')}
            >
              <Car className="h-4 w-4" />
              تقارير الربحية
            </Button>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              أرباح المالكين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Warnings */}
      <FinancialWarningsTable />

      {/* Recent Transactions */}
      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts">سندات القبض الحديثة</TabsTrigger>
          <TabsTrigger value="vouchers">سندات الصرف الحديثة</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                أحدث سندات القبض
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReceipts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد سندات قبض حديثة</p>
              ) : (
                <div className="space-y-4">
                  {recentReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Receipt className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{receipt.receipt_number}</span>
                            <Badge variant={getStatusBadge(receipt.status).variant}>
                              {getStatusBadge(receipt.status).label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {receipt.customer_name} - {new Date(receipt.payment_date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(receipt.amount)}</p>
                        <p className="text-sm text-muted-foreground">{receipt.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                أحدث سندات الصرف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentVouchers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد سندات صرف حديثة</p>
              ) : (
                <div className="space-y-4">
                  {recentVouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{voucher.voucher_number}</span>
                            <Badge variant={getStatusBadge(voucher.status).variant}>
                              {getStatusBadge(voucher.status).label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {voucher.recipient_name} - {new Date(voucher.payment_date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(voucher.amount)}</p>
                        <p className="text-sm text-muted-foreground">{voucher.expense_category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
