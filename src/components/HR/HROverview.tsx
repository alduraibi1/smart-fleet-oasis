import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Award,
  Clock,
  UserCheck
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'يناير', employees: 45, attendance: 94, performance: 87 },
  { month: 'فبراير', employees: 47, attendance: 96, performance: 89 },
  { month: 'مارس', employees: 48, attendance: 92, performance: 91 },
  { month: 'أبريل', employees: 52, attendance: 95, performance: 88 },
  { month: 'مايو', employees: 54, attendance: 97, performance: 93 },
  { month: 'يونيو', employees: 56, attendance: 94, performance: 95 },
];

const departmentData = [
  { name: 'الصيانة', employees: 18, color: 'hsl(var(--chart-1))' },
  { name: 'المبيعات', employees: 12, color: 'hsl(var(--chart-2))' },
  { name: 'الإدارة', employees: 8, color: 'hsl(var(--chart-3))' },
  { name: 'المحاسبة', employees: 6, color: 'hsl(var(--chart-4))' },
  { name: 'التسويق', employees: 4, color: 'hsl(var(--chart-5))' },
  { name: 'أخرى', employees: 8, color: 'hsl(var(--muted))' },
];

const recentActivities = [
  { type: 'join', name: 'أحمد محمد', action: 'انضم للفريق', department: 'الصيانة', time: 'منذ ساعتين' },
  { type: 'leave', name: 'فاطمة أحمد', action: 'طلب إجازة', department: 'المبيعات', time: 'منذ 3 ساعات' },
  { type: 'performance', name: 'محمد علي', action: 'تقييم أداء ممتاز', department: 'الصيانة', time: 'منذ 5 ساعات' },
  { type: 'promotion', name: 'سارة خالد', action: 'ترقية إلى مدير قسم', department: 'المحاسبة', time: 'أمس' },
];

const HROverview = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +4 موظفين هذا الشهر
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1% من الشهر الماضي
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,500</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                راتب هذا الشهر
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.3 من الربع الماضي
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>اتجاهات الموارد البشرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="employees" stroke="hsl(var(--primary))" strokeWidth={2} name="عدد الموظفين" />
                <Line type="monotone" dataKey="attendance" stroke="hsl(var(--chart-2))" strokeWidth={2} name="الحضور %" />
                <Line type="monotone" dataKey="performance" stroke="hsl(var(--chart-3))" strokeWidth={2} name="الأداء %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employees"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة على الأقسام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentData.map((dept, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{dept.name}</h3>
                  <Badge variant="outline">{dept.employees} موظف</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>معدل الحضور:</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>متوسط الأداء:</span>
                    <span className="font-medium">4.3/5</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            النشاطات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'join' ? 'bg-green-100 text-green-600' :
                  activity.type === 'leave' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'performance' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'join' ? <Users className="h-5 w-5" /> :
                   activity.type === 'leave' ? <Calendar className="h-5 w-5" /> :
                   activity.type === 'performance' ? <Award className="h-5 w-5" /> :
                   <TrendingUp className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{activity.name}</span>
                    <Badge variant="outline" className="text-xs">{activity.department}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">إضافة موظف</h3>
            <p className="text-sm text-muted-foreground">تسجيل موظف جديد</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">إدارة الإجازات</h3>
            <p className="text-sm text-muted-foreground">مراجعة طلبات الإجازة</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">معالجة الرواتب</h3>
            <p className="text-sm text-muted-foreground">حساب وصرف الرواتب</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">تقييم الأداء</h3>
            <p className="text-sm text-muted-foreground">إجراء تقييمات دورية</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;