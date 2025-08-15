
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Users, 
  FileText, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { InteractiveKPICard } from "./InteractiveKPICard";
import { DateRangeFilter } from "./DateRangeFilter";
import { ExportControls } from "./ExportControls";
import { RealtimeIndicator } from "./RealtimeIndicator";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { DateRange } from "react-day-picker";

export const EnhancedDashboard = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [selectedPreset, setSelectedPreset] = useState("this_month");
  
  const {
    stats,
    revenueData,
    topVehicles,
    recentActivity,
    loading,
    isConnected,
    lastUpdated,
    refetch,
    reconnect
  } = useRealtimeDashboard();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    // Here you would typically filter the data based on the selected range
    // For now, we'll just refresh the data
    refetch();
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    // Apply preset logic and refresh data
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Mock alert data - in real implementation, this would come from your alerts system
  const alerts = [
    {
      id: 1,
      type: 'maintenance',
      title: 'صيانة مجدولة',
      message: '5 مركبات بحاجة لصيانة خلال الأسبوع القادم',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'document',
      title: 'وثائق منتهية الصلاحية',
      message: '3 رخص تسجيل ستنتهي صلاحيتها قريباً',
      priority: 'high'
    },
    {
      id: 3,
      type: 'revenue',
      title: 'زيادة في الإيرادات',
      message: 'زيادة 15% في الإيرادات مقارنة بالشهر الماضي',
      priority: 'low'
    }
  ];

  // Vehicle status distribution
  const availableVehicles = stats.totalVehicles - stats.activeContracts;
  const vehicleStatusData = [
    { name: 'متاحة', value: availableVehicles, color: '#22c55e' },
    { name: 'مؤجرة', value: stats.activeContracts, color: '#3b82f6' },
    { name: 'صيانة', value: stats.pendingMaintenance, color: '#f59e0b' }
  ];

  // Generate mock trend data
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
    month: `شهر ${i + 1}`,
    revenue: Math.floor(Math.random() * 100000) + 50000,
    contracts: Math.floor(Math.random() * 50) + 20
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div ref={dashboardRef} className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم المتقدمة</h1>
          <p className="text-muted-foreground mt-1">
            نظرة شاملة على الأداء والإحصائيات التفاعلية
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <RealtimeIndicator 
            isConnected={isConnected}
            lastUpdated={lastUpdated}
            onReconnect={reconnect}
          />
          <ExportControls 
            dashboardRef={dashboardRef}
            data={stats}
            title="لوحة التحكم المتقدمة"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="w-full lg:w-80">
        <DateRangeFilter
          onDateRangeChange={handleDateRangeChange}
          onPresetChange={handlePresetChange}
          onRefresh={refetch}
          isLoading={loading}
        />
      </div>

      {/* Interactive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InteractiveKPICard
          title="إجمالي المركبات"
          value={stats.totalVehicles}
          change="+5%"
          trend="up"
          icon={Car}
          color="bg-blue-100 text-blue-600"
          linkTo="/vehicles"
        />

        <InteractiveKPICard
          title="العقود النشطة"
          value={stats.activeContracts}
          change="+12%"
          trend="up"
          icon={FileText}
          color="bg-green-100 text-green-600"
          linkTo="/contracts"
        />

        <InteractiveKPICard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats.totalRevenue)}
          change="+8%"
          trend="up"
          icon={DollarSign}
          color="bg-yellow-100 text-yellow-600"
          linkTo="/accounting"
        />

        <InteractiveKPICard
          title="معدل الاستخدام"
          value={`${stats.utilizationRate.toFixed(1)}%`}
          progress={stats.utilizationRate}
          target="85%"
          icon={TrendingUp}
          color="bg-purple-100 text-purple-600"
          linkTo="/reports"
        />
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            التنبيهات والإشعارات الفورية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${
                    alert.priority === 'high' ? 'bg-red-100' :
                    alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {alert.priority === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : alert.priority === 'medium' ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
                <Badge variant={getPriorityColor(alert.priority) as any}>
                  {alert.priority === 'high' ? 'عالي' : 
                   alert.priority === 'medium' ? 'متوسط' : 'منخفض'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="vehicles">المركبات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اتجاه الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>العقود الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contracts" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>توزيع حالة المركبات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>رضا العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.customerSatisfaction}</div>
                  <div className="text-sm text-muted-foreground">من 5 نجوم</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الصيانة المعلقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats.pendingMaintenance}</div>
                  <div className="text-sm text-muted-foreground">مهمة صيانة</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>متوسط مدة الإيجار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">7.2</div>
                  <div className="text-sm text-muted-foreground">أيام</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
