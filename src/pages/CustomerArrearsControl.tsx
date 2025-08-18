
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Settings,
  Download
} from 'lucide-react';
import { CustomerArrearsMonitoringDashboard } from '@/components/Customers/CustomerArrearsMonitoringDashboard';
import CustomerArrearsAlerts from '@/components/Contracts/CustomerArrearsAlerts';
import { useCustomerArrears } from '@/hooks/useCustomerArrears';

export default function CustomerArrearsControl() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedThreshold, setSelectedThreshold] = useState(1500);
  const { data: arrearsData, isLoading } = useCustomerArrears(selectedThreshold);

  const quickStats = {
    totalArrears: arrearsData?.reduce((sum, customer) => sum + (customer.outstanding_balance || 0), 0) || 0,
    customerCount: arrearsData?.length || 0,
    criticalCases: arrearsData?.filter(customer => (customer.outstanding_balance || 0) > 5000).length || 0,
    averageAmount: arrearsData && arrearsData.length > 0 
      ? (arrearsData.reduce((sum, customer) => sum + (customer.outstanding_balance || 0), 0) / arrearsData.length)
      : 0
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                نظام مراقبة المتعثرين
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                النظام المتقدم لمراقبة ومتابعة العملاء المتعثرين في السداد
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 ml-2" />
                الإعدادات
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">
                  إجمالي المتأخرات
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {quickStats.totalArrears.toLocaleString()} ر.س
                </div>
                <div className="text-xs text-red-600">
                  متوسط {quickStats.averageAmount.toLocaleString()} ر.س
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  العملاء المتعثرين
                </CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {quickStats.customerCount}
                </div>
                <div className="text-xs text-orange-600">
                  {quickStats.criticalCases} حالة حرجة
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  معدل الاسترداد
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  85%
                </div>
                <div className="text-xs text-blue-600">
                  تحسن بنسبة 5%
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  حالة النظام
                </CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  نشط
                </div>
                <Badge className="bg-green-500 text-white text-xs mt-1">
                  مراقبة 24/7
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                لوحة المراقبة
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                التنبيهات الفورية
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                التقارير التفصيلية
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                التحليلات المتقدمة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <CustomerArrearsMonitoringDashboard />
            </TabsContent>

            <TabsContent value="alerts">
              <div className="space-y-6">
                <CustomerArrearsAlerts threshold={selectedThreshold} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      إعدادات التنبيهات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">حد التنبيه (ريال)</label>
                        <div className="flex gap-2 mt-1">
                          {[1000, 1500, 2000, 5000].map((threshold) => (
                            <Button
                              key={threshold}
                              variant={selectedThreshold === threshold ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedThreshold(threshold)}
                            >
                              {threshold.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        سيتم إرسال تنبيهات للعملاء الذين تتجاوز متأخراتهم {selectedThreshold.toLocaleString()} ريال
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>التقارير التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">التقارير التفصيلية</h3>
                    <p className="text-muted-foreground mb-4">
                      قريباً - تقارير شاملة لتحليل أداء استرداد المتأخرات
                    </p>
                    <Button disabled>
                      إنشاء تقرير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>التحليلات المتقدمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">التحليلات المتقدمة</h3>
                    <p className="text-muted-foreground mb-4">
                      قريباً - تحليلات ذكية باستخدام الذكاء الاصطناعي
                    </p>
                    <Button disabled>
                      عرض التحليلات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
