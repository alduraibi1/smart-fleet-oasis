
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  AlertCircle,
  Download,
  Search,
  Filter,
  Eye,
  DollarSign,
  CreditCard,
  Wallet
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

interface BalanceResult {
  owner_id: string;
  total_receipts: number;
  total_vouchers: number;
  available_balance: number;
  has_sufficient_balance: boolean;
}

export function OwnerBalanceReport() {
  const [balances, setBalances] = useState<OwnerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOwnerBalances();
  }, []);

  const loadOwnerBalances = async () => {
    try {
      setLoading(true);

      // جلب قائمة المالكين
      const { data: owners, error: ownersError } = await supabase
        .from('owners')
        .select('id, name');

      if (ownersError) throw ownersError;

      const ownerBalances: OwnerBalance[] = [];

      for (const owner of owners || []) {
        // استدعاء دالة حساب الرصيد
        const { data: balanceData, error: balanceError } = await supabase
          .rpc('get_owner_balance', { owner_id: owner.id });

        if (balanceError) {
          console.error('Error getting balance for owner:', owner.id, balanceError);
          continue;
        }

        // التحقق من وجود البيانات وتحويلها
        if (!balanceData) continue;

        let balance: BalanceResult;
        try {
          balance = balanceData as unknown as BalanceResult;
        } catch (error) {
          console.error('Error parsing balance data:', error);
          continue;
        }

        // جلب السندات المعلقة
        const { data: pendingVouchers, error: vouchersError } = await supabase
          .from('payment_vouchers')
          .select('amount')
          .eq('owner_id', owner.id)
          .eq('status', 'pending');

        const pendingAmount = pendingVouchers?.reduce((sum, voucher) => sum + voucher.amount, 0) || 0;

        // جلب آخر معاملة
        const { data: lastTransaction, error: transactionError } = await supabase
          .from('payment_receipts')
          .select('payment_date')
          .eq('customer_id', owner.id)
          .order('payment_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const availableBalance = balance.available_balance || 0;
        const utilizationPercentage = balance.total_receipts > 0 
          ? (balance.total_vouchers / balance.total_receipts) * 100 
          : 0;

        let balanceStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (availableBalance < 1000) balanceStatus = 'critical';
        else if (availableBalance < 5000) balanceStatus = 'warning';

        ownerBalances.push({
          owner_id: owner.id,
          owner_name: owner.name,
          total_receipts: balance.total_receipts || 0,
          total_vouchers: balance.total_vouchers || 0,
          available_balance: availableBalance,
          pending_vouchers: pendingAmount,
          last_transaction_date: lastTransaction?.payment_date || 'لا يوجد',
          balance_status: balanceStatus,
          utilization_percentage: utilizationPercentage
        });
      }

      setBalances(ownerBalances);
    } catch (error) {
      console.error('Error loading owner balances:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل أرصدة المالكين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      healthy: { 
        label: 'جيد', 
        className: 'bg-success/10 text-success border-success/20 hover:bg-success/20' 
      },
      warning: { 
        label: 'تحذير', 
        className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' 
      },
      critical: { 
        label: 'حرج', 
        className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' 
      }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.healthy;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredBalances = balances.filter(balance => {
    const matchesSearch = balance.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || balance.balance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBalances = balances.reduce((acc, balance) => ({
    receipts: acc.receipts + balance.total_receipts,
    vouchers: acc.vouchers + balance.total_vouchers,
    available: acc.available + balance.available_balance,
    pending: acc.pending + balance.pending_vouchers
  }), { receipts: 0, vouchers: 0, available: 0, pending: 0 });

  const healthyCount = balances.filter(b => b.balance_status === 'healthy').length;
  const warningCount = balances.filter(b => b.balance_status === 'warning').length;
  const criticalCount = balances.filter(b => b.balance_status === 'critical').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                <div className="h-8 w-24 bg-muted rounded mb-2"></div>
                <div className="h-3 w-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            تقرير أرصدة المالكين
          </h2>
          <p className="text-muted-foreground">
            عرض تفصيلي لأرصدة جميع المالكين ومعدلات الاستخدام
          </p>
        </div>
        <Button 
          onClick={loadOwnerBalances} 
          className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي الإيصالات</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalances.receipts)}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي السندات</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalances.vouchers)}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">الرصيد المتاح</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalances.available)}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">السندات المعلقة</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalanes.pending)}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات الحالات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-success/20 bg-success/5 shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold text-success mb-1">{healthyCount}</p>
            <p className="text-sm text-success/80">مالك في حالة جيدة</p>
          </CardContent>
        </Card>

        <Card className="border border-warning/20 bg-warning/5 shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning mb-1">{warningCount}</p>
            <p className="text-sm text-warning/80">مالك يحتاج متابعة</p>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 bg-destructive/5 shadow-md hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive mb-1">{criticalCount}</p>
            <p className="text-sm text-destructive/80">مالك في حالة حرجة</p>
          </CardContent>
        </Card>
      </div>

      {/* تحذيرات الأرصدة المنخفضة */}
      {criticalCount > 0 && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            تحذير: يوجد {criticalCount} مالك لديهم أرصدة منخفضة تحتاج إلى متابعة فورية
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              تفاصيل أرصدة المالكين
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="البحث عن مالك..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-background border-input focus:border-primary focus:ring-primary/20"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:border-primary focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="healthy">جيد</option>
                <option value="warning">تحذير</option>
                <option value="critical">حرج</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border">
                  <TableHead className="text-right font-semibold text-foreground">المالك</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">إجمالي الإيصالات</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">إجمالي السندات</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">الرصيد المتاح</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">السندات المعلقة</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">معدل الاستخدام</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">الحالة</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">آخر معاملة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((balance, index) => {
                  const statusConfig = getStatusBadge(balance.balance_status);
                  return (
                    <TableRow 
                      key={balance.owner_id} 
                      className={`border-b border-border hover:bg-muted/30 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      <TableCell className="font-medium text-foreground py-4">
                        {balance.owner_name}
                      </TableCell>
                      <TableCell className="text-success font-medium">
                        {formatCurrency(balance.total_receipts)}
                      </TableCell>
                      <TableCell className="text-warning font-medium">
                        {formatCurrency(balance.total_vouchers)}
                      </TableCell>
                      <TableCell className="text-primary font-bold">
                        {formatCurrency(balance.available_balance)}
                      </TableCell>
                      <TableCell className="text-destructive font-medium">
                        {formatCurrency(balance.pending_vouchers)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                balance.utilization_percentage > 80 ? 'bg-destructive' :
                                balance.utilization_percentage > 60 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${Math.min(balance.utilization_percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground min-w-[40px]">
                            {balance.utilization_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {balance.last_transaction_date !== 'لا يوجد' ? 
                          new Date(balance.last_transaction_date).toLocaleDateString('ar-SA') : 
                          'لا يوجد'
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredBalances.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">لا توجد نتائج</p>
              <p className="text-muted-foreground">لم يتم العثور على مالكين يطابقون معايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
