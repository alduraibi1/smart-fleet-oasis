
import { Car, Calendar, DollarSign, Settings, Users, Bell, Plus, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero-card text-center py-12 text-white">
        <h1 className="text-4xl font-bold mb-4 animate-slide-down">
          مرحباً بك في نظام إدارة تأجير المركبات
        </h1>
        <p className="text-xl opacity-90 animate-slide-up">
          نظرة عامة شاملة على أداء شركتك وأهم المؤشرات
        </p>
        <div className="mt-6 animate-bounce-in">
          <Button variant="glass" size="lg" className="gap-2">
            <TrendingUp className="w-5 h-5" />
            عرض التقارير التفصيلية
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Panel */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-warning animate-pulse-glow" />
              التنبيهات المهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-r-4 transition-all duration-300 hover:scale-105 cursor-pointer ${
                  alert.type === 'danger' 
                    ? 'bg-destructive/10 border-r-destructive hover:bg-destructive/20' 
                    : alert.type === 'warning'
                    ? 'bg-warning/10 border-r-warning hover:bg-warning/20'
                    : 'bg-info/10 border-r-info hover:bg-info/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.text}</span>
                  {alert.urgent && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      عاجل
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-accent/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.vehicle || activity.customer}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col gap-3 interactive-hover border-primary/20 hover:border-primary/50"
            >
              <Car className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">إضافة مركبة</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col gap-3 interactive-hover border-success/20 hover:border-success/50"
            >
              <Calendar className="h-8 w-8 text-success" />
              <span className="text-sm font-medium">عقد جديد</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col gap-3 interactive-hover border-warning/20 hover:border-warning/50"
            >
              <Users className="h-8 w-8 text-warning" />
              <span className="text-sm font-medium">عميل جديد</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-6 flex-col gap-3 interactive-hover border-info/20 hover:border-info/50"
            >
              <Settings className="h-8 w-8 text-info" />
              <span className="text-sm font-medium">طلب صيانة</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
