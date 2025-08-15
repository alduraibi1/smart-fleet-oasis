import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Car, Users, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// بيانات تجريبية للمؤشرات
const monthlyRevenue = [
  { month: 'يناير', revenue: 120000, expenses: 85000, profit: 35000 },
  { month: 'فبراير', revenue: 135000, expenses: 92000, profit: 43000 },
  { month: 'مارس', revenue: 148000, expenses: 98000, profit: 50000 },
  { month: 'أبريل', revenue: 162000, expenses: 105000, profit: 57000 },
  { month: 'مايو', revenue: 175000, expenses: 112000, profit: 63000 },
  { month: 'يونيو', revenue: 188000, expenses: 118000, profit: 70000 },
];

const vehiclePerformance = [
  { type: 'سيدان', count: 45, utilization: 85, revenue: 85000 },
  { type: 'SUV', count: 32, utilization: 92, revenue: 95000 },
  { type: 'هاتشباك', count: 28, utilization: 78, revenue: 65000 },
  { type: 'كوبيه', count: 15, utilization: 88, revenue: 55000 },
  { type: 'بيك اب', count: 12, utilization: 95, revenue: 45000 },
];

const contractsData = [
  { month: 'يناير', active: 85, new: 12, expired: 8 },
  { month: 'فبراير', active: 89, new: 15, expired: 11 },
  { month: 'مارس', active: 93, new: 18, expired: 14 },
  { month: 'أبريل', active: 97, new: 16, expired: 12 },
  { month: 'مايو', active: 101, new: 20, expired: 16 },
  { month: 'يونيو', active: 105, new: 22, expired: 18 },
];

const departmentData = [
  { name: 'المبيعات', value: 35, color: '#3b82f6' },
  { name: 'المحاسبة', value: 25, color: '#10b981' },
  { name: 'الصيانة', value: 20, color: '#f59e0b' },
  { name: 'خدمة العملاء', value: 15, color: '#ef4444' },
  { name: 'الإدارة', value: 5, color: '#8b5cf6' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, trend, icon, color }: MetricCardProps) {
  return (
    <Card className="card-interactive hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? "text-success" : "text-destructive"
              )}>
                {change > 0 && '+'}
                {change}%
              </span>
              <span className="text-sm text-muted-foreground">عن الشهر السابق</span>
            </div>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            `bg-${color}/20`
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    totalInvoices: 0,
    totalVouchers: 0,
    totalNotifications: 0
  });

  // جلب البيانات الحقيقية من قاعدة البيانات
  const fetchRealData = async () => {
    setLoading(true);
    try {
      // جلب عدد الفواتير
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // جلب عدد السندات
      const { count: vouchersCount } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true });

      // جلب عدد الإشعارات
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      setRealTimeData({
        totalInvoices: invoicesCount || 0,
        totalVouchers: vouchersCount || 0,
        totalNotifications: notificationsCount || 0
      });
    } catch (error) {
      console.error('Error fetching real data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  return (
    <div className="space-y-6">
      {/* العنوان والفلاتر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
            لوحة التحكم التحليلية
          </h1>
          <p className="text-muted-foreground mt-1">
            مؤشرات الأداء الرئيسية وتحليلات متقدمة لأداء الشركة
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">آخر شهر</SelectItem>
            <SelectItem value="3months">آخر 3 أشهر</SelectItem>
            <SelectItem value="6months">آخر 6 أشهر</SelectItem>
            <SelectItem value="1year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="إجمالي الإيرادات"
          value="1,285,000 ريال"
          change={12.5}
          trend="up"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          color="primary"
        />
        <MetricCard
          title="عدد المركبات النشطة"
          value="132"
          change={8.2}
          trend="up"
          icon={<Car className="h-6 w-6 text-success" />}
          color="success"
        />
        <MetricCard
          title="العقود النشطة"
          value="105"
          change={5.1}
          trend="up"
          icon={<Calendar className="h-6 w-6 text-info" />}
          color="info"
        />
        <MetricCard
          title="معدل الاستخدام"
          value="87%"
          change={-2.3}
          trend="down"
          icon={<Activity className="h-6 w-6 text-warning" />}
          color="warning"
        />
      </div>

      {/* البيانات الحقيقية من قاعدة البيانات */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            البيانات الحقيقية من النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">
                {loading ? '...' : realTimeData.totalInvoices}
              </div>
              <p className="text-muted-foreground">إجمالي الفواتير</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-success/10 to-success/5 rounded-xl">
              <div className="text-3xl font-bold text-success mb-2">
                {loading ? '...' : realTimeData.totalVouchers}
              </div>
              <p className="text-muted-foreground">إجمالي السندات</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl">
              <div className="text-3xl font-bold text-warning mb-2">
                {loading ? '...' : realTimeData.totalNotifications}
              </div>
              <p className="text-muted-foreground">إجمالي الإشعارات</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسوم البيانية */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="vehicles">المركبات</TabsTrigger>
          <TabsTrigger value="contracts">العقود</TabsTrigger>
          <TabsTrigger value="departments">الأقسام</TabsTrigger>
        </TabsList>

        {/* تحليل الإيرادات */}
        <TabsContent value="revenue">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>تحليل الإيرادات والأرباح</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value?.toLocaleString()} ريال`,
                      name === 'revenue' ? 'الإيرادات' : 
                      name === 'expenses' ? 'المصروفات' : 'الأرباح'
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="profit" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* أداء المركبات */}
        <TabsContent value="vehicles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>أداء المركبات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehiclePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'count' ? `${value} مركبة` : 
                      name === 'utilization' ? `${value}%` : `${value?.toLocaleString()} ريال`,
                      name === 'count' ? 'العدد' : 
                      name === 'utilization' ? 'معدل الاستخدام' : 'الإيرادات'
                    ]} />
                    <Bar dataKey="count" fill="#3b82f6" />
                    <Bar dataKey="utilization" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle>معدلات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehiclePerformance.map((vehicle, index) => (
                  <div key={vehicle.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{vehicle.type}</span>
                      <Badge variant="outline">{vehicle.utilization}%</Badge>
                    </div>
                    <Progress value={vehicle.utilization} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تحليل العقود */}
        <TabsContent value="contracts">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>تحليل العقود الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={contractsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    `${value} عقد`,
                    name === 'active' ? 'نشط' : 
                    name === 'new' ? 'جديد' : 'منتهي'
                  ]} />
                  <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expired" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* توزيع الأقسام */}
        <TabsContent value="departments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CardTitle>تفاصيل الأقسام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentData.map((dept, index) => (
                  <div key={dept.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <Badge variant="outline">{dept.value}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}