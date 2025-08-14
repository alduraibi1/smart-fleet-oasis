
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Users, 
  FileText, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalVehicles: number;
  activeContracts: number;
  totalRevenue: number;
  pendingMaintenance: number;
  customerSatisfaction: number;
  utilizationRate: number;
  monthlyTrend: any[];
  vehicleStatusData: any[];
  revenueData: any[];
}

export const EnhancedDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeContracts: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
    customerSatisfaction: 0,
    utilizationRate: 0,
    monthlyTrend: [],
    vehicleStatusData: [],
    revenueData: []
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch vehicles data
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*');

      // Fetch contracts data - using rental_contracts table
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('*');

      // Fetch maintenance data - using vehicle_maintenance table
      const { data: maintenance } = await supabase
        .from('vehicle_maintenance')
        .select('*')
        .eq('status', 'scheduled');

      // Calculate stats
      const totalVehicles = vehicles?.length || 0;
      const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
      const totalRevenue = contracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
      const pendingMaintenance = maintenance?.length || 0;
      
      // Calculate utilization rate
      const utilizationRate = totalVehicles > 0 ? (activeContracts / totalVehicles) * 100 : 0;

      // Generate mock trend data
      const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
        month: `شهر ${i + 1}`,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        contracts: Math.floor(Math.random() * 50) + 20
      }));

      // Vehicle status distribution
      const availableVehicles = totalVehicles - activeContracts;
      const vehicleStatusData = [
        { name: 'متاحة', value: availableVehicles, color: '#22c55e' },
        { name: 'مؤجرة', value: activeContracts, color: '#3b82f6' },
        { name: 'صيانة', value: pendingMaintenance, color: '#f59e0b' }
      ];

      setStats({
        totalVehicles,
        activeContracts,
        totalRevenue,
        pendingMaintenance,
        customerSatisfaction: 4.2,
        utilizationRate,
        monthlyTrend,
        vehicleStatusData,
        revenueData: monthlyTrend
      });

      // Fetch alerts
      fetchAlerts();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    const alertsData = [
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
    setAlerts(alertsData);
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
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المركبات</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  +5% من الشهر الماضي
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العقود النشطة</p>
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  +12% من الشهر الماضي
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  +8% من الشهر الماضي
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الاستخدام</p>
                <p className="text-2xl font-bold">{stats.utilizationRate.toFixed(1)}%</p>
                <Progress value={stats.utilizationRate} className="mt-2" />
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            التنبيهات والإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
                  <LineChart data={stats.monthlyTrend}>
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
                  <BarChart data={stats.monthlyTrend}>
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
                    data={stats.vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.vehicleStatusData.map((entry, index) => (
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
                  <Progress value={stats.customerSatisfaction * 20} className="mt-2" />
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
