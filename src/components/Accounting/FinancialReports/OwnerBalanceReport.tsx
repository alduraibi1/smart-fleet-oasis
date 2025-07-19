
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Printer,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OwnerBalance {
  owner_id: string;
  owner_name: string;
  total_receipts: number;
  total_vouchers: number;
  available_balance: number;
  pending_vouchers: number;
  last_transaction_date: string;
  balance_status: 'healthy' | 'warning' | 'critical';
  utilization_percentage: number;
}

export function OwnerBalanceReport() {
  const [balances, setBalances] = useState<OwnerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalOwners: 0,
    healthyAccounts: 0,
    warningAccounts: 0,
    criticalAccounts: 0,
    totalAvailableBalance: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOwnerBalances();
  }, []);

  const fetchOwnerBalances = async () => {
    try {
      setLoading(true);

      // جلب جميع المالكين مع أرصدتهم
      const { data: owners, error: ownersError } = await supabase
        .from('vehicle_owners')
        .select('id, name');

      if (ownersError) throw ownersError;

      const ownerBalances: OwnerBalance[] = [];

      for (const owner of owners || []) {
        // استدعاء دالة حساب الرصيد
        const { data: balanceData, error: balanceError } = await supabase
          .rpc('get_owner_balance', { p_owner_id: owner.id });

        if (balanceError) {
          console.error(`Error fetching balance for owner ${owner.id}:`, balanceError);
          continue;
        }

        // جلب السندات المعلقة
        const { data: pendingVouchers, error: vouchersError } = await supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('recipient_id', owner.id)
          .eq('recipient_type', 'owner')
          .in('status', ['pending_approval', 'approved']);

        const pendingAmount = pendingVouchers?.reduce((sum, v) => sum + v.amount, 0) || 0;

        // جلب آخر معاملة
        const { data: lastTransaction } = await supabase
          .from('payment_receipts')
          .select('payment_date')
          .eq('customer_id', owner.id)
          .order('payment_date', { ascending: false })
          .limit(1)
          .single();

        const availableBalance = balanceData.available_balance;
        const utilizationPercentage = balanceData.total_receipts > 0 
          ? (balanceData.total_vouchers / balanceData.total_receipts) * 100 
          : 0;

        let balanceStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (availableBalance < 0) {
          balanceStatus = 'critical';
        } else if (availableBalance < 1000 || utilizationPercentage > 80) {
          balanceStatus = 'warning';
        }

        ownerBalances.push({
          owner_id: owner.id,
          owner_name: owner.name,
          total_receipts: balanceData.total_receipts,
          total_vouchers: balanceData.total_vouchers,
          available_balance: availableBalance,
          pending_vouchers: pendingAmount,
          last_transaction_date: lastTransaction?.payment_date || 'لا يوجد',
          balance_status: balanceStatus,
          utilization_percentage: Math.round(utilizationPercentage)
        });
      }

      setBalances(ownerBalances);

      // حساب الملخص
      const summary = {
        totalOwners: ownerBalances.length,
        healthyAccounts: ownerBalances.filter(b => b.balance_status === 'healthy').length,
        warningAccounts: ownerBalances.filter(b => b.balance_status === 'warning').length,
        criticalAccounts: ownerBalances.filter(b => b.balance_status === 'critical').length,
        totalAvailableBalance: ownerBalances.reduce((sum, b) => sum + b.available_balance, 0)
      };

      setSummary(summary);

    } catch (error) {
      console.error('Error fetching owner balances:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب أرصدة المالكين",
        variant: "destructive"
      });
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
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">سليم</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">تحذير</Badge>;
      case 'critical':
        return <Badge variant="destructive">حرج</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تقرير أرصدة المالكين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المالكين</p>
                <p className="text-2xl font-bold">{summary.totalOwners}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">حسابات سليمة</p>
                <p className="text-2xl font-bold text-green-600">{summary.healthyAccounts}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تحذيرات</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.warningAccounts}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">حسابات حرجة</p>
                <p className="text-2xl font-bold text-red-600">{summary.criticalAccounts}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأرصدة</p>
                <p className={`text-2xl font-bold ${summary.totalAvailableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.totalAvailableBalance)}
                </p>
              </div>
              {summary.totalAvailableBalance >= 0 ? 
                <TrendingUp className="h-6 w-6 text-green-600" /> : 
                <TrendingDown className="h-6 w-6 text-red-600" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات الحسابات الحرجة */}
      {summary.criticalAccounts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            يوجد {summary.criticalAccounts} حساب في وضع حرج (رصيد سالب). يرجى المراجعة الفورية.
          </AlertDescription>
        </Alert>
      )}

      {/* جدول الأرصدة التفصيلي */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                تقرير أرصدة المالكين التفصيلي
              </CardTitle>
              <CardDescription>
                عرض تفصيلي لأرصدة جميع مالكي المركبات ووضعهم المالي
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchOwnerBalances}>
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                طباعة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">اسم المالك</TableHead>
                  <TableHead className="text-right">إجمالي المقبوضات</TableHead>
                  <TableHead className="text-right">إجمالي المصروفات</TableHead>
                  <TableHead className="text-right">الرصيد المتاح</TableHead>
                  <TableHead className="text-right">سندات معلقة</TableHead>
                  <TableHead className="text-right">نسبة الاستخدام</TableHead>
                  <TableHead className="text-right">آخر معاملة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance.owner_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(balance.balance_status)}
                        {getStatusBadge(balance.balance_status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{balance.owner_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {formatCurrency(balance.total_receipts)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-red-600">
                        {formatCurrency(balance.total_vouchers)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${balance.available_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(balance.available_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(balance.pending_vouchers)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(balance.utilization_percentage, 100)} 
                          className="w-16 h-2"
                        />
                        <span className="text-sm">{balance.utilization_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {balance.last_transaction_date !== 'لا يوجد' 
                          ? new Date(balance.last_transaction_date).toLocaleDateString('ar-SA')
                          : 'لا يوجد'
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
