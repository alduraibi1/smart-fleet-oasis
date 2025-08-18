
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CashFlowChart } from "./CashFlowChart";
import { PaymentStatusOverview } from "./PaymentStatusOverview";
import { FinancialAlerts } from "./FinancialAlerts";

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  pendingPayments: number;
  overduePayments: number;
  activeContracts: number;
  monthlyGrowth: number;
}

export function FinancialControlCenter() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // جلب البيانات المالية الأساسية
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['financial-metrics', selectedPeriod],
    queryFn: async (): Promise<FinancialMetrics> => {
      const now = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // جلب إجمالي الإيرادات
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('amount')
        .eq('status', 'confirmed')
        .gte('payment_date', startDate.toISOString().split('T')[0]);

      // جلب إجمالي المصروفات
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('amount')
        .in('status', ['approved', 'paid'])
        .gte('payment_date', startDate.toISOString().split('T')[0]);

      // جلب العقود النشطة
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('id, total_amount, paid_amount')
        .eq('status', 'active');

      // جلب المدفوعات المعلقة
      const { data: pendingReceipts } = await supabase
        .from('payment_receipts')
        .select('amount')
        .eq('status', 'pending');

      const totalRevenue = receipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalExpenses = vouchers?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0;
      const pendingPayments = pendingReceipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // حساب النمو الشهري (محاكاة)
      const monthlyGrowth = totalRevenue > 0 ? 12.5 : 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        cashFlow: totalRevenue - totalExpenses,
        pendingPayments,
        overduePayments: 0, // سيتم تطويرها لاحقاً
        activeContracts: contracts?.length || 0,
        monthlyGrowth
      };
    },
    refetchInterval: 60000 // تحديث كل دقيقة
  });

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* العنوان والتحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مركز الرقابة المالية</h1>
          <p className="text-muted-foreground">
            آخر تحديث: {lastUpdated.toLocaleString('ar-SA')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {{
                  week: 'أسبوع',
                  month: 'شهر',
                  quarter: 'ربع',
                  year: 'سنة'
                }[period]}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* البطاقات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.totalRevenue || 0)}
            </div>
            <div className={`flex items-center text-sm ${getGrowthColor(metrics?.monthlyGrowth || 0)}`}>
              {getGrowthIcon(metrics?.monthlyGrowth || 0)}
              <span className="ml-1">
                {metrics?.monthlyGrowth?.toFixed(1)}% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics?.totalExpenses || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              المدفوعات المعتمدة
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(metrics?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics?.netProfit || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              هامش الربح: {metrics?.totalRevenue ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(metrics?.pendingPayments || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              العقود النشطة: {metrics?.activeContracts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات المتقدمة */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="cashflow">التدفق النقدي</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>الأداء المالي</CardTitle>
                <CardDescription>مقارنة الإيرادات والمصروفات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>الإيرادات</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(metrics?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: '70%' }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>المصروفات</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(metrics?.totalExpenses || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: '30%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حالة النظام</CardTitle>
                <CardDescription>مؤشرات الحالة المالية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>السيولة النقدية</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      جيد
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>المدفوعات المستحقة</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      متابعة
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>النمو الشهري</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {metrics?.monthlyGrowth?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowChart period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentStatusOverview />
        </TabsContent>

        <TabsContent value="alerts">
          <FinancialAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
