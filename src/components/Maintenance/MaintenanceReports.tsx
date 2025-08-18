
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Filter, 
  TrendingUp, 
  DollarSign,
  Clock,
  Wrench,
  FileText,
  Calendar
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';

export const MaintenanceReports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const { maintenanceRecords, mechanics } = useMaintenance();

  // إعداد البيانات للرسوم البيانية
  const prepareChartData = () => {
    // بيانات التكلفة الشهرية
    const monthlyCosts = maintenanceRecords.reduce((acc, record) => {
      if (record.completed_date && record.total_cost) {
        const month = new Date(record.completed_date).toLocaleDateString('ar-SA', { month: 'short' });
        acc[month] = (acc[month] || 0) + Number(record.total_cost);
      }
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = Object.entries(monthlyCosts).map(([month, cost]) => ({
      month,
      cost: Number(cost.toFixed(0))
    }));

    // بيانات أنواع الصيانة
    const maintenanceTypes = maintenanceRecords.reduce((acc, record) => {
      const type = record.maintenance_type || 'أخرى';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(maintenanceTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));

    // بيانات حالة الصيانة
    const statusData = [
      { name: 'مكتمل', value: maintenanceRecords.filter(r => r.status === 'completed').length },
      { name: 'جاري', value: maintenanceRecords.filter(r => r.status === 'in_progress').length },
      { name: 'مجدول', value: maintenanceRecords.filter(r => r.status === 'scheduled').length },
      { name: 'متأخر', value: maintenanceRecords.filter(r => r.status === 'overdue').length }
    ];

    // بيانات أداء الميكانيكيين
    const mechanicPerformance = mechanics.map(mechanic => {
      const mechanicRecords = maintenanceRecords.filter(r => r.mechanic_id === mechanic.id);
      const completedJobs = mechanicRecords.filter(r => r.status === 'completed').length;
      const totalCost = mechanicRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0);
      
      return {
        name: mechanic.name,
        jobs: completedJobs,
        cost: Number(totalCost.toFixed(0)),
        avgCost: completedJobs > 0 ? Number((totalCost / completedJobs).toFixed(0)) : 0
      };
    }).filter(m => m.jobs > 0);

    return {
      monthlyData,
      typeData,
      statusData,
      mechanicPerformance
    };
  };

  const chartData = prepareChartData();

  // ألوان للرسوم البيانية
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  // حساب الإحصائيات الرئيسية
  const stats = {
    totalRecords: maintenanceRecords.length,
    completedRecords: maintenanceRecords.filter(r => r.status === 'completed').length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0),
    avgCost: maintenanceRecords.length > 0 
      ? maintenanceRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0) / maintenanceRecords.length 
      : 0,
    avgDuration: 2.5, // متوسط مدة الصيانة (أيام) - بيانات تجريبية
    onTimeRate: 87 // معدل الإنجاز في الوقت المحدد - بيانات تجريبية
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">تقارير الصيانة</h3>
          <p className="text-muted-foreground">تحليلات شاملة لأداء نظام الصيانة</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            فلاتر
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.totalRecords}</div>
                <div className="text-xs text-muted-foreground">إجمالي السجلات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xl font-bold">{stats.completedRecords}</div>
                <div className="text-xs text-muted-foreground">مكتمل</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{stats.totalCost.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">إجمالي التكلفة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-xl font-bold">{stats.avgCost.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">متوسط التكلفة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-xl font-bold">{stats.avgDuration}</div>
                <div className="text-xs text-muted-foreground">متوسط المدة (أيام)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-xl font-bold">{stats.onTimeRate}%</div>
                <div className="text-xs text-muted-foreground">الالتزام بالوقت</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التقارير التفصيلية */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="costs">التكاليف</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع أنواع الصيانة */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع أنواع الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* حالة السجلات */}
            <Card>
              <CardHeader>
                <CardTitle>حالة سجلات الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {/* اتجاه التكاليف الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه التكاليف الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'التكلفة']} />
                  <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* أداء الميكانيكيين */}
          <Card>
            <CardHeader>
              <CardTitle>أداء الميكانيكيين</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.mechanicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#8884d8" name="عدد المهام" />
                  <Bar dataKey="avgCost" fill="#82ca9d" name="متوسط التكلفة" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">تحليل الاتجاهات</h3>
              <p className="text-muted-foreground">سيتم إضافة تحليلات الاتجاهات المتقدمة قريباً</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
