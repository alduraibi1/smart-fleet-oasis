
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  AlertCircle,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { useCustomerAccountSummary } from '@/hooks/useCustomerAccountSummary';

interface FinancialMetrics {
  totalRevenue: number;
  averageContractValue: number;
  paymentReliability: number;
  profitMargin: number;
  customerLifetimeValue: number;
  riskScore: number;
}

interface PaymentPattern {
  month: string;
  amount: number;
  onTime: boolean;
  daysLate?: number;
}

interface CustomerFinancialInsightsProps {
  customerId: string;
}

export function CustomerFinancialInsights({ customerId }: CustomerFinancialInsightsProps) {
  const { data: accountSummary, isLoading } = useCustomerAccountSummary(customerId);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    averageContractValue: 0,
    paymentReliability: 0,
    profitMargin: 0,
    customerLifetimeValue: 0,
    riskScore: 0
  });

  // Mock payment patterns - في التطبيق الحقيقي ستأتي من API
  const [paymentPatterns] = useState<PaymentPattern[]>([
    { month: 'يناير', amount: 2500, onTime: true },
    { month: 'فبراير', amount: 2500, onTime: true },
    { month: 'مارس', amount: 2500, onTime: false, daysLate: 5 },
    { month: 'أبريل', amount: 2800, onTime: true },
    { month: 'مايو', amount: 2800, onTime: false, daysLate: 12 },
    { month: 'يونيو', amount: 2800, onTime: true }
  ]);

  useEffect(() => {
    if (accountSummary) {
      // حساب المؤشرات المالية
      const totalPaid = accountSummary.total_paid || 0;
      const totalContracts = accountSummary.active_contracts || 1;
      const averageValue = totalPaid / totalContracts;
      const outstandingBalance = accountSummary.outstanding_balance || 0;
      const totalContracted = accountSummary.total_contracted || 1;
      
      // حساب موثوقية الدفع
      const reliability = totalContracted > 0 ? ((totalPaid / totalContracted) * 100) : 0;
      
      // حساب هامش الربح (تقديري)
      const estimatedCosts = totalPaid * 0.3; // 30% تكاليف تقديرية
      const profit = totalPaid - estimatedCosts;
      const profitMargin = totalPaid > 0 ? ((profit / totalPaid) * 100) : 0;
      
      // حساب القيمة المدى الطويل للعميل
      const monthlyAverage = totalPaid / 12; // متوسط شهري
      const projectedLifetime = monthlyAverage * 36; // توقع 3 سنوات
      
      // حساب درجة المخاطر
      let riskScore = 100;
      if (outstandingBalance > 5000) riskScore -= 30;
      if (reliability < 80) riskScore -= 20;
      if (accountSummary.overdue_contracts && accountSummary.overdue_contracts > 0) riskScore -= 25;
      
      setMetrics({
        totalRevenue: totalPaid,
        averageContractValue: averageValue,
        paymentReliability: reliability,
        profitMargin: profitMargin,
        customerLifetimeValue: projectedLifetime,
        riskScore: Math.max(0, riskScore)
      });
    }
  }, [accountSummary]);

  const getMetricTrend = (value: number, threshold: number) => {
    if (value >= threshold) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'إيجابي' };
    }
    return { icon: TrendingDown, color: 'text-red-600', label: 'سلبي' };
  };

  const getReliabilityStatus = (reliability: number) => {
    if (reliability >= 95) return { label: 'ممتاز', color: 'bg-green-500' };
    if (reliability >= 85) return { label: 'جيد', color: 'bg-blue-500' };
    if (reliability >= 70) return { label: 'مقبول', color: 'bg-yellow-500' };
    return { label: 'ضعيف', color: 'bg-red-500' };
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'منخفض', color: 'bg-green-500' };
    if (score >= 60) return { label: 'متوسط', color: 'bg-yellow-500' };
    if (score >= 40) return { label: 'عالي', color: 'bg-orange-500' };
    return { label: 'حرج', color: 'bg-red-500' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const reliabilityStatus = getReliabilityStatus(metrics.paymentReliability);
  const riskLevel = getRiskLevel(metrics.riskScore);
  const revenueTrend = getMetricTrend(metrics.totalRevenue, 50000);
  const profitTrend = getMetricTrend(metrics.profitMargin, 20);

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الإيرادات
            </CardTitle>
            <div className="flex items-center gap-1">
              <revenueTrend.icon className={`h-4 w-4 ${revenueTrend.color}`} />
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalRevenue.toLocaleString()} ر.س
            </div>
            <div className="text-xs text-muted-foreground">
              متوسط العقد: {metrics.averageContractValue.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              موثوقية الدفع
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.paymentReliability.toFixed(1)}%
            </div>
            <Badge className={`${reliabilityStatus.color} text-white text-xs mt-1`}>
              {reliabilityStatus.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              هامش الربح
            </CardTitle>
            <div className="flex items-center gap-1">
              <profitTrend.icon className={`h-4 w-4 ${profitTrend.color}`} />
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {profitTrend.label}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              القيمة المدى الطويل
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.customerLifetimeValue.toLocaleString()} ر.س
            </div>
            <div className="text-xs text-muted-foreground">
              توقع 3 سنوات
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              درجة المخاطر
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.riskScore.toFixed(0)}
            </div>
            <Badge className={`${riskLevel.color} text-white text-xs mt-1`}>
              {riskLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المتأخرات الحالية
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(accountSummary?.outstanding_balance || 0).toLocaleString()} ر.س
            </div>
            <div className="text-xs text-muted-foreground">
              {accountSummary?.overdue_contracts || 0} عقد متأخر
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="patterns">أنماط الدفع</TabsTrigger>
            <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
            <TabsTrigger value="forecasts">التوقعات</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                تحليل أنماط الدفع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">{pattern.month}</div>
                      <Badge variant={pattern.onTime ? 'default' : 'destructive'} className="text-xs">
                        {pattern.onTime ? 'في الموعد' : `متأخر ${pattern.daysLate} يوم`}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {pattern.amount.toLocaleString()} ر.س
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {paymentPatterns.filter(p => p.onTime).length}
                  </div>
                  <div className="text-xs text-muted-foreground">مدفوعات في الموعد</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {paymentPatterns.filter(p => !p.onTime).length}
                  </div>
                  <div className="text-xs text-muted-foreground">مدفوعات متأخرة</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(paymentPatterns.reduce((sum, p) => sum + p.amount, 0) / paymentPatterns.length).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">متوسط المبلغ</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((paymentPatterns.filter(p => p.onTime).length / paymentPatterns.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">معدل الالتزام</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الاتجاهات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">اتجاه الإيرادات</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 text-sm">+15%</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    نمو مستقر في الإيرادات خلال الأشهر الستة الماضية
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">اتجاه المتأخرات</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 text-sm">+8%</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    زيادة طفيفة في المتأخرات تتطلب المتابعة
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">اتجاه التعاقد</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 text-sm">مستقر</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    معدل تعاقد ثابت مع تحسن في قيمة العقود
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التوقعات المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {(metrics.totalRevenue * 1.15).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">إيرادات متوقعة (12 شهر)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {Math.round(metrics.paymentReliability + 2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">موثوقية متوقعة</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {(metrics.profitMargin + 3).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">هامش ربح متوقع</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-medium text-amber-800 mb-2">توصيات لتحسين الأداء:</div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• تطبيق نظام تذكيرات آلي لتقليل المتأخرات</li>
                    <li>• تقديم خصومات للدفع المبكر لتحسين التدفق النقدي</li>
                    <li>• مراجعة شروط التعاقد لزيادة القيمة المضافة</li>
                    <li>• تطوير برامج ولاء للعملاء عالي الجودة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
