
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Car,
  Users,
  Calendar,
  Wrench,
  DollarSign,
  Building2,
  Settings,
  BarChart3
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SystemCheckItem {
  name: string;
  path: string;
  icon: any;
  status: 'working' | 'error' | 'warning';
  description: string;
}

export default function SystemCheck() {
  const [checkResults, setCheckResults] = useState<SystemCheckItem[]>([
    {
      name: 'لوحة التحكم الرئيسية',
      path: '/',
      icon: BarChart3,
      status: 'working',
      description: 'الصفحة الرئيسية للنظام'
    },
    {
      name: 'إدارة المركبات',
      path: '/vehicles',
      icon: Car,
      status: 'working',
      description: 'إدارة الأسطول والمركبات'
    },
    {
      name: 'إدارة العقود',
      path: '/contracts',
      icon: Calendar,
      status: 'working',
      description: 'نظام العقود والإيجار'
    },
    {
      name: 'إدارة العملاء',
      path: '/customers',
      icon: Users,
      status: 'working',
      description: 'قاعدة بيانات العملاء'
    },
    {
      name: 'إدارة الملاك',
      path: '/owners',
      icon: Users,
      status: 'working',
      description: 'إدارة ملاك المركبات'
    },
    {
      name: 'نظام الصيانة',
      path: '/maintenance',
      icon: Wrench,
      status: 'working',
      description: 'جدولة وتتبع الصيانة'
    },
    {
      name: 'إدارة المخزون',
      path: '/inventory',
      icon: Building2,
      status: 'working',
      description: 'قطع الغيار والمواد'
    },
    {
      name: 'النظام المحاسبي',
      path: '/accounting',
      icon: DollarSign,
      status: 'working',
      description: 'الحسابات والتقارير المالية'
    },
    {
      name: 'الموارد البشرية',
      path: '/hr',
      icon: Users,
      status: 'working',
      description: 'إدارة الموظفين والرواتب'
    },
    {
      name: 'التقارير',
      path: '/reports',
      icon: BarChart3,
      status: 'working',
      description: 'تقارير شاملة للنظام'
    },
    {
      name: 'إدارة النظام',
      path: '/system-management',
      icon: Settings,
      status: 'working',
      description: 'المستخدمين والصلاحيات'
    },
    {
      name: 'الموردين',
      path: '/suppliers',
      icon: Building2,
      status: 'working',
      description: 'إدارة الموردين وأوامر الشراء'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge variant="default" className="bg-green-500">يعمل</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">تحذير</Badge>;
      default:
        return <Badge variant="default">يعمل</Badge>;
    }
  };

  const runSystemCheck = () => {
    // Simulate system check
    setCheckResults(prev => prev.map(item => ({
      ...item,
      status: Math.random() > 0.1 ? 'working' : 'warning'
    })));
  };

  const workingCount = checkResults.filter(item => item.status === 'working').length;
  const errorCount = checkResults.filter(item => item.status === 'error').length;
  const warningCount = checkResults.filter(item => item.status === 'warning').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">فحص النظام</h1>
            <p className="text-muted-foreground">
              التحقق من حالة جميع أجزاء النظام والتبويبات
            </p>
          </div>
          <Button onClick={runSystemCheck} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة فحص
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                يعمل بشكل صحيح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{workingCount}</div>
              <p className="text-sm text-muted-foreground">من أصل {checkResults.length} وحدة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                تحذيرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-sm text-muted-foreground">تحتاج مراجعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                أخطاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <p className="text-sm text-muted-foreground">تحتاج إصلاح</p>
            </CardContent>
          </Card>
        </div>

        {/* System Components */}
        <Card>
          <CardHeader>
            <CardTitle>مكونات النظام</CardTitle>
            <CardDescription>
              قائمة بجميع أقسام النظام وحالتها الحالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkResults.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    {getStatusIcon(item.status)}
                    <Button asChild variant="outline" size="sm">
                      <NavLink to={item.path}>
                        فتح
                      </NavLink>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
