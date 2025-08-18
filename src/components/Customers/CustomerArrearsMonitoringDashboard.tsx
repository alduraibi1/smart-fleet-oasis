
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Phone, 
  MessageSquare, 
  FileText,
  Clock,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';
import { useCustomerArrears } from '@/hooks/useCustomerArrears';
import { useCustomerArrearsActions } from '@/hooks/useCustomerArrearsActions';
import { useToast } from '@/hooks/use-toast';

interface ArrearsMetrics {
  totalArrears: number;
  customersCount: number;
  averageAmount: number;
  criticalCases: number;
  recoveryRate: number;
  trendsData: Array<{ month: string; amount: number; cases: number }>;
}

export function CustomerArrearsMonitoringDashboard() {
  const [selectedThreshold, setSelectedThreshold] = useState(1500);
  const [activeTab, setActiveTab] = useState('overview');
  const { data: arrearsData, isLoading } = useCustomerArrears(selectedThreshold);
  const { createArrearsNotification, generateCollectionActions, loading: actionLoading } = useCustomerArrearsActions();
  const { toast } = useToast();

  // Mock metrics - في التطبيق الحقيقي ستأتي من API
  const [metrics, setMetrics] = useState<ArrearsMetrics>({
    totalArrears: 0,
    customersCount: 0,
    averageAmount: 0,
    criticalCases: 0,
    recoveryRate: 85,
    trendsData: [
      { month: 'يناير', amount: 45000, cases: 12 },
      { month: 'فبراير', amount: 52000, cases: 15 },
      { month: 'مارس', amount: 38000, cases: 10 },
      { month: 'أبريل', amount: 67000, cases: 18 },
      { month: 'مايو', amount: 71000, cases: 22 },
      { month: 'يونيو', amount: 58000, cases: 16 }
    ]
  });

  useEffect(() => {
    if (arrearsData) {
      const totalAmount = arrearsData.reduce((sum, customer) => sum + (customer.outstanding_balance || 0), 0);
      const criticalCount = arrearsData.filter(customer => (customer.outstanding_balance || 0) > 5000).length;
      
      setMetrics(prev => ({
        ...prev,
        totalArrears: totalAmount,
        customersCount: arrearsData.length,
        averageAmount: arrearsData.length > 0 ? totalAmount / arrearsData.length : 0,
        criticalCases: criticalCount
      }));
    }
  }, [arrearsData]);

  const getRiskLevel = (amount: number) => {
    if (amount >= 10000) return { level: 'خطر عالي', color: 'destructive', priority: 'urgent' };
    if (amount >= 5000) return { level: 'خطر متوسط', color: 'default', priority: 'high' };
    return { level: 'خطر منخفض', color: 'secondary', priority: 'medium' };
  };

  const getOverdueDays = (oldest_overdue_date: string | null) => {
    if (!oldest_overdue_date) return 0;
    const days = Math.ceil(
      (new Date().getTime() - new Date(oldest_overdue_date).getTime()) / (1000 * 60 * 60 * 24)
    ) - 14;
    return days > 0 ? days : 0;
  };

  const handleBulkAction = async (actionType: string) => {
    if (!arrearsData || arrearsData.length === 0) return;

    const criticalCases = arrearsData.filter(customer => (customer.outstanding_balance || 0) > 5000);
    
    for (const customer of criticalCases) {
      try {
        await createArrearsNotification(customer.id, customer.name || 'عميل', customer.outstanding_balance || 0);
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    toast({
      title: 'تمت العملية بنجاح',
      description: `تم إنشاء ${criticalCases.length} إجراء متابعة للحالات الحرجة`,
    });
  };

  const priorityLevels = {
    urgent: { label: 'عاجل جداً', color: 'bg-red-500', count: 0 },
    high: { label: 'عاجل', color: 'bg-orange-500', count: 0 },
    medium: { label: 'متوسط', color: 'bg-yellow-500', count: 0 },
    low: { label: 'منخفض', color: 'bg-green-500', count: 0 }
  };

  // حساب مستويات الأولوية
  arrearsData?.forEach(customer => {
    const overdueDays = getOverdueDays(customer.oldest_overdue_date);
    if (overdueDays >= 30) priorityLevels.urgent.count++;
    else if (overdueDays >= 15) priorityLevels.high.count++;
    else if (overdueDays >= 7) priorityLevels.medium.count++;
    else priorityLevels.low.count++;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارِ تحميل بيانات المتعثرين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">لوحة مراقبة المتعثرين</h2>
          <p className="text-muted-foreground">
            نظام الإنذار المبكر والمتابعة الذكية للعملاء المتعثرين في السداد
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkAction('bulk_notification')}
            disabled={actionLoading || !arrearsData || arrearsData.length === 0}
          >
            <FileText className="h-4 w-4 ml-2" />
            إجراءات جماعية
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      {arrearsData && arrearsData.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium text-red-800">
              تحذير: يوجد {arrearsData.length} عميل متعثر بإجمالي متأخرات {metrics.totalArrears.toLocaleString()} ريال
            </div>
            <div className="text-sm text-red-700 mt-1">
              {metrics.criticalCases} حالة حرجة تتطلب تدخل فوري (أكثر من 5,000 ريال)
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المتأخرات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.totalArrears.toLocaleString()} ر.س
            </div>
            <div className="text-xs text-muted-foreground">
              متوسط {metrics.averageAmount.toLocaleString()} ر.س للعميل
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              العملاء المتعثرين
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.customersCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.criticalCases} حالة حرجة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل الاسترداد
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.recoveryRate}%
            </div>
            <Progress value={metrics.recoveryRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الاتجاه الشهري
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +12%
            </div>
            <div className="text-xs text-muted-foreground">
              مقارنة بالشهر السابق
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            توزيع مستويات الأولوية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(priorityLevels).map(([key, level]) => (
              <div key={key} className="text-center">
                <div className={`${level.color} w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                  {level.count}
                </div>
                <div className="text-sm font-medium">{level.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="customers">قائمة العملاء</TabsTrigger>
          <TabsTrigger value="actions">خطة العمل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الاتجاهات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.trendsData.slice(-3).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{month.month}</div>
                        <div className="text-sm text-muted-foreground">
                          {month.cases} حالة
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {month.amount.toLocaleString()} ر.س
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توصيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800">
                    إجراء فوري مطلوب
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {metrics.criticalCases} عميل بمتأخرات تزيد عن 5,000 ريال
                  </div>
                </div>
                
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">
                    مراجعة السياسات
                  </div>
                  <div className="text-xs text-orange-700 mt-1">
                    مراجعة شروط الدفع والضمانات للعملاء الجدد
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    تحسين المتابعة
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    تفعيل نظام التذكيرات الآلية للعملاء
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {arrearsData && arrearsData.length > 0 ? (
            arrearsData.map((customer) => {
              const overdueDays = getOverdueDays(customer.oldest_overdue_date);
              const riskLevel = getRiskLevel(customer.outstanding_balance || 0);
              
              return (
                <Card key={customer.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{customer.name || customer.id}</h3>
                        <Badge variant={riskLevel.color as any}>
                          {riskLevel.level}
                        </Badge>
                        {overdueDays > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 ml-1" />
                            متأخر {overdueDays} يوم
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">المتأخرات:</span>
                          <div className="font-medium text-red-600">
                            {(customer.outstanding_balance || 0).toLocaleString()} ر.س
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">العقود المتأخرة:</span>
                          <div className="font-medium">
                            {customer.overdue_contracts || 0}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">إجمالي التعاقد:</span>
                          <div className="font-medium">
                            {(customer.total_contracted || 0).toLocaleString()} ر.س
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">المدفوع:</span>
                          <div className="font-medium text-green-600">
                            {(customer.total_paid || 0).toLocaleString()} ر.س
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {customer.phone && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${customer.phone}`, '_self')}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const message = `مرحباً ${customer.name}، يتوجب عليكم سداد المتأخرات المستحقة بقيمة ${(customer.outstanding_balance || 0).toLocaleString()} ريال`;
                              window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => createArrearsNotification(customer.id, customer.name || 'عميل', customer.outstanding_balance || 0)}
                        disabled={actionLoading}
                      >
                        اتخاذ إجراء
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                لا توجد حالات تعثر تتطلب متابعة حالياً
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات المقترحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium text-red-600">للحالات الحرجة (أكثر من 30 يوم)</div>
                  <ul className="text-sm text-muted-foreground space-y-1 pr-4">
                    <li>• بدء إجراءات التحصيل القانوني</li>
                    <li>• سحب المركبة وإنهاء العقد</li>
                    <li>• إشعار شركات التصنيف الائتماني</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-orange-600">للحالات المتوسطة (15-30 يوم)</div>
                  <ul className="text-sm text-muted-foreground space-y-1 pr-4">
                    <li>• إنذار نهائي قبل اتخاذ إجراءات أخرى</li>
                    <li>• تحديد موعد نهائي للسداد</li>
                    <li>• التواصل مع الضامن</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-yellow-600">للحالات البسيطة (أقل من 15 يوم)</div>
                  <ul className="text-sm text-muted-foreground space-y-1 pr-4">
                    <li>• محاولة التواصل والوصول لتسوية ودية</li>
                    <li>• إرسال تذكيرات عبر الرسائل</li>
                    <li>• عرض خطة دفع مرنة</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الاسترداد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل الاسترداد الإجمالي</span>
                    <span className="font-bold text-green-600">{metrics.recoveryRate}%</span>
                  </div>
                  <Progress value={metrics.recoveryRate} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">127</div>
                      <div className="text-xs text-muted-foreground">حالة مستردة</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">23</div>
                      <div className="text-xs text-muted-foreground">حالة معلقة</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
