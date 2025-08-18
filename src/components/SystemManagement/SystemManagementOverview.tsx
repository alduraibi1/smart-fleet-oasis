
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Shield, 
  Activity, 
  Database,
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const SystemManagementOverview = () => {
  const systemStats = [
    {
      title: "المستخدمين النشطين",
      value: "12",
      icon: Users,
      description: "مستخدم متصل حالياً",
      status: "normal"
    },
    {
      title: "حالة الأمان",
      value: "جيد",
      icon: Shield,
      description: "3 تحذيرات أمنية",
      status: "warning"
    },
    {
      title: "أداء النظام",
      value: "ممتاز",
      icon: Activity,
      description: "استجابة سريعة",
      status: "good"
    },
    {
      title: "قاعدة البيانات",
      value: "متصلة",
      icon: Database,
      description: "جميع الاتصالات تعمل",
      status: "good"
    }
  ];

  const securityAlerts = [
    {
      id: 1,
      type: "warning",
      message: "بعض سياسات RLS تحتاج للمراجعة",
      timestamp: "منذ ساعتين"
    },
    {
      id: 2,
      type: "info",
      message: "تم تحديث صلاحيات المستخدمين بنجاح",
      timestamp: "منذ 4 ساعات"
    },
    {
      id: 3,
      type: "success",
      message: "تم تطبيق التحديثات الأمنية الجديدة",
      timestamp: "أمس"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">تحذير</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">نجح</Badge>;
      default:
        return <Badge variant="outline">معلومات</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات النظام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(stat.status)}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* التنبيهات الأمنية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            التنبيهات الأمنية الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
                {getAlertBadge(alert.type)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* نظرة عامة على الوحدات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              إدارة المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              إدارة حسابات المستخدمين والأدوار والصلاحيات
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>إجمالي المستخدمين:</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>المستخدمين النشطين:</span>
                <span className="font-medium text-green-600">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الأدوار المُعرَّفة:</span>
                <span className="font-medium">6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الأمان والصلاحيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              مراقبة الأمان وإدارة الصلاحيات والسياسات
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>الفحوصات الأمنية:</span>
                <span className="font-medium">5/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>السياسات النشطة:</span>
                <span className="font-medium text-green-600">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>التحذيرات:</span>
                <span className="font-medium text-amber-600">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              التحكم في إعدادات النظام العامة والتكوينات
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>آخر نسخة احتياطية:</span>
                <span className="font-medium">أمس</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>حالة النظام:</span>
                <span className="font-medium text-green-600">مستقر</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الإصدار:</span>
                <span className="font-medium">v2.1.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemManagementOverview;
