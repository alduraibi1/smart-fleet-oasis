
import { Car, Calendar, DollarSign, Settings, Users, Bell } from 'lucide-react';
import MetricCard from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardOverview() {
  const metrics = [
    {
      title: 'إجمالي المركبات',
      value: 245,
      icon: Car,
      trend: { value: 12, isPositive: true },
      color: 'primary' as const
    },
    {
      title: 'المركبات المؤجرة',
      value: 189,
      icon: Calendar,
      trend: { value: 8, isPositive: true },
      color: 'success' as const
    },
    {
      title: 'الإيرادات الشهرية',
      value: '₪ 125,430',
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
      color: 'primary' as const
    },
    {
      title: 'صيانة معلقة',
      value: 23,
      icon: Settings,
      trend: { value: -5, isPositive: false },
      color: 'warning' as const
    }
  ];

  const alerts = [
    { text: 'انتهاء تأمين مركبة رقم أ ب ج 123', type: 'danger', urgent: true },
    { text: 'موعد صيانة دورية لـ 15 مركبة', type: 'warning', urgent: false },
    { text: 'مخزون قطع غيار منخفض', type: 'warning', urgent: false },
    { text: 'عقد إيجار ينتهي خلال 3 أيام', type: 'info', urgent: false }
  ];

  const recentActivity = [
    { action: 'تم إضافة مركبة جديدة', vehicle: 'تويوتا كامري 2023', time: 'منذ ساعتين' },
    { action: 'تم تجديد عقد إيجار', customer: 'محمد أحمد', time: 'منذ 4 ساعات' },
    { action: 'صيانة مكتملة', vehicle: 'هيونداي إلنترا', time: 'منذ 6 ساعات' },
    { action: 'عميل جديد مسجل', customer: 'سارة محمود', time: 'منذ يوم واحد' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-rental-warning" />
              التنبيهات المهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-r-4 ${
                  alert.type === 'danger' 
                    ? 'bg-red-50 border-r-red-500' 
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-r-yellow-500'
                    : 'bg-blue-50 border-r-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{alert.text}</span>
                  {alert.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      عاجل
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.vehicle || activity.customer}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              <Car className="h-8 w-8 mx-auto mb-2 text-rental-primary" />
              <span className="text-sm font-medium">إضافة مركبة</span>
            </button>
            <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-rental-success" />
              <span className="text-sm font-medium">عقد جديد</span>
            </button>
            <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              <Users className="h-8 w-8 mx-auto mb-2 text-rental-warning" />
              <span className="text-sm font-medium">عميل جديد</span>
            </button>
            <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              <Settings className="h-8 w-8 mx-auto mb-2 text-rental-danger" />
              <span className="text-sm font-medium">طلب صيانة</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
