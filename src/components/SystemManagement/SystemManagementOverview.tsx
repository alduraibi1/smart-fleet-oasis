import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Settings, Activity } from 'lucide-react';

const SystemManagementOverview = () => {
  const stats = [
    {
      title: 'إجمالي المستخدمين',
      value: '12',
      icon: Users,
      trend: '+2 هذا الشهر'
    },
    {
      title: 'الأدوار النشطة',
      value: '7',
      icon: Shield,
      trend: 'جميع الأدوار مفعلة'
    },
    {
      title: 'الجلسات النشطة',
      value: '8',
      icon: Activity,
      trend: 'متصل الآن'
    },
    {
      title: 'إعدادات النظام',
      value: '15',
      icon: Settings,
      trend: 'آخر تحديث اليوم'
    }
  ];

  const recentActivities = [
    {
      user: 'أحمد محمد',
      action: 'تسجيل دخول',
      time: 'منذ 5 دقائق',
      status: 'success'
    },
    {
      user: 'فاطمة علي',
      action: 'إضافة مركبة جديدة',
      time: 'منذ 15 دقيقة',
      status: 'info'
    },
    {
      user: 'محمد حسن',
      action: 'تعديل عقد إيجار',
      time: 'منذ 30 دقيقة',
      status: 'warning'
    },
    {
      user: 'سارة أحمد',
      action: 'حذف عميل',
      time: 'منذ ساعة',
      status: 'destructive'
    }
  ];

  const systemRoles = [
    { name: 'مدير النظام', users: 2, permissions: 'كاملة' },
    { name: 'مدير عام', users: 1, permissions: 'تشغيلية' },
    { name: 'مدير مالي', users: 2, permissions: 'مالية' },
    { name: 'مدير أسطول', users: 3, permissions: 'المركبات' },
    { name: 'محاسب', users: 2, permissions: 'محاسبية' },
    { name: 'فني صيانة', users: 1, permissions: 'الصيانة' },
    { name: 'موظف استقبال', users: 1, permissions: 'العملاء' }
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأنشطة الحديثة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">الأنشطة الحديثة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activity.status as any}>
                      {activity.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الأدوار والصلاحيات */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">الأدوار النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {role.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {role.users} مستخدم
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemManagementOverview;