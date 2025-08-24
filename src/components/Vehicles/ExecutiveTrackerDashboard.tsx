
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Fuel,
  Route,
  Users
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ExecutiveKPIs {
  totalRevenue: number;
  revenueGrowth: number;
  activeVehicles: number;
  utilizationRate: number;
  maintenanceCosts: number;
  fuelEfficiency: number;
  customerSatisfaction: number;
  contractRenewalRate: number;
}

interface VehiclePerformance {
  vehicleId: string;
  plateNumber: string;
  revenue: number;
  utilization: number;
  maintenanceCost: number;
  profitMargin: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface MonthlyData {
  month: string;
  revenue: number;
  maintenance: number;
  fuel: number;
  utilization: number;
}

const ExecutiveTrackerDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<ExecutiveKPIs>({
    totalRevenue: 1250000,
    revenueGrowth: 12.5,
    activeVehicles: 45,
    utilizationRate: 78,
    maintenanceCosts: 185000,
    fuelEfficiency: 8.2,
    customerSatisfaction: 94,
    contractRenewalRate: 87
  });

  const [vehiclePerformance, setVehiclePerformance] = useState<VehiclePerformance[]>([
    { vehicleId: '1', plateNumber: 'أ ب ج 1234', revenue: 28500, utilization: 89, maintenanceCost: 3200, profitMargin: 78, status: 'excellent' },
    { vehicleId: '2', plateNumber: 'د ه و 5678', revenue: 31200, utilization: 92, maintenanceCost: 2800, profitMargin: 85, status: 'excellent' },
    { vehicleId: '3', plateNumber: 'ز ح ط 9012', revenue: 19800, utilization: 65, maintenanceCost: 4500, profitMargin: 45, status: 'average' },
  ]);

  const monthlyData: MonthlyData[] = [
    { month: 'يناير', revenue: 980000, maintenance: 145000, fuel: 85000, utilization: 75 },
    { month: 'فبراير', revenue: 1050000, maintenance: 152000, fuel: 89000, utilization: 78 },
    { month: 'مارس', revenue: 1120000, maintenance: 148000, fuel: 92000, utilization: 82 },
    { month: 'أبريل', revenue: 1180000, maintenance: 165000, fuel: 88000, utilization: 79 },
    { month: 'مايو', revenue: 1250000, maintenance: 185000, fuel: 95000, utilization: 78 },
  ];

  const utilizationData = [
    { name: 'ممتاز (>85%)', value: 35, color: '#10B981' },
    { name: 'جيد (70-85%)', value: 40, color: '#3B82F6' },
    { name: 'متوسط (50-70%)', value: 20, color: '#F59E0B' },
    { name: 'ضعيف (<50%)', value: 5, color: '#EF4444' },
  ];

  const getStatusColor = (status: VehiclePerformance['status']) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusLabel = (status: VehiclePerformance['status']) => {
    switch (status) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'average': return 'متوسط';
      case 'poor': return 'ضعيف';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h2 className="text-2xl font-bold">لوحة التحكم التنفيذية</h2>
        <p className="text-muted-foreground">تحليل شامل لأداء أسطول المركبات والربحية</p>
      </div>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
                <p className="text-xs text-green-600">+{kpis.revenueGrowth}% عن الشهر السابق</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الاستخدام</p>
                <p className="text-2xl font-bold">{kpis.utilizationRate}%</p>
                <Progress value={kpis.utilizationRate} className="mt-1 h-1" />
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تكاليف الصيانة</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.maintenanceCosts)}</p>
                <p className="text-xs text-orange-600">15% من الإيرادات</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">رضا العملاء</p>
                <p className="text-2xl font-bold">{kpis.customerSatisfaction}%</p>
                <Progress value={kpis.customerSatisfaction} className="mt-1 h-1" />
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">الأداء المالي</TabsTrigger>
          <TabsTrigger value="operations">العمليات</TabsTrigger>
          <TabsTrigger value="vehicles">أداء المركبات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات المتقدمة</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الإيرادات والتكاليف الشهرية */}
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات والتكاليف الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="الإيرادات" />
                    <Area type="monotone" dataKey="maintenance" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="الصيانة" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* توزيع الاستخدام */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع معدلات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {utilizationData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* المؤشرات المالية الإضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">متوسط الربح لكل مركبة</p>
                  <p className="text-xl font-bold">{formatCurrency(kpis.totalRevenue / kpis.activeVehicles)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">كفاءة استهلاك الوقود</p>
                  <p className="text-xl font-bold">{kpis.fuelEfficiency} كم/لتر</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">معدل تجديد العقود</p>
                  <p className="text-xl font-bold">{kpis.contractRenewalRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* معدل الاستخدام الشهري */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاه معدل الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="utilization" stroke="#3B82F6" strokeWidth={3} name="معدل الاستخدام" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* حالة الأسطول */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الأسطول الحالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">المركبات النشطة</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{kpis.activeVehicles - 3}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">في الصيانة</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">3</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تحتاج صيانة</span>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">2</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">متوسط المسافة اليومية</span>
                  <span className="font-semibold">245 كم</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6 mt-6">
          {/* جدول أداء المركبات */}
          <Card>
            <CardHeader>
              <CardTitle>أداء المركبات الفردية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehiclePerformance.map((vehicle) => (
                  <div key={vehicle.vehicleId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{vehicle.plateNumber}</span>
                        <Badge className={getStatusColor(vehicle.status)}>
                          {getStatusLabel(vehicle.status)}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold">
                        {formatCurrency(vehicle.revenue)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">معدل الاستخدام</span>
                          <span className="font-medium">{vehicle.utilization}%</span>
                        </div>
                        <Progress value={vehicle.utilization} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">هامش الربح</span>
                          <span className="font-medium">{vehicle.profitMargin}%</span>
                        </div>
                        <Progress value={vehicle.profitMargin} className="h-2" />
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">تكلفة الصيانة</span>
                        <span className="font-medium">{formatCurrency(vehicle.maintenanceCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">التحليلات المتقدمة</h3>
            <p className="text-muted-foreground">
              قريباً: تحليلات الذكاء الاصطناعي والتنبؤات المتقدمة
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveTrackerDashboard;
