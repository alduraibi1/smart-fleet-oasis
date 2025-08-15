
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Activity } from 'lucide-react';

interface SystemComponent {
  name: string;
  status: 'online' | 'warning' | 'offline';
  lastChecked: string;
  responseTime?: number;
  details?: string;
}

const SystemStatus = () => {
  const [components, setComponents] = useState<SystemComponent[]>([
    {
      name: 'قاعدة البيانات',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 45,
      details: 'جميع الجداول تعمل بشكل طبيعي'
    },
    {
      name: 'نظام المركبات',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 32,
      details: 'جميع العمليات تعمل بشكل صحيح'
    },
    {
      name: 'نظام العقود',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 28,
      details: 'إدارة العقود تعمل بكامل طاقتها'
    },
    {
      name: 'نظام العملاء',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 41,
      details: 'قاعدة بيانات العملاء محدثة'
    },
    {
      name: 'نظام الصيانة',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 35,
      details: 'جدولة الصيانة تعمل بانتظام'
    },
    {
      name: 'النظام المالي',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 38,
      details: 'الحسابات والتقارير محدثة'
    },
    {
      name: 'نظام المخزون',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 42,
      details: 'إدارة المخزون تعمل بشكل مثالي'
    },
    {
      name: 'نظام الموارد البشرية',
      status: 'online',
      lastChecked: new Date().toLocaleString('ar-SA'),
      responseTime: 29,
      details: 'إدارة الموظفين والحضور'
    }
  ]);

  const [overallHealth, setOverallHealth] = useState(100);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 text-white">متصل</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">تحذير</Badge>;
      case 'offline':
        return <Badge className="bg-red-500 text-white">غير متصل</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const refreshStatus = () => {
    setIsRefreshing(true);
    
    // Simulate checking all components
    setTimeout(() => {
      const updatedComponents = components.map(comp => ({
        ...comp,
        lastChecked: new Date().toLocaleString('ar-SA'),
        responseTime: Math.floor(Math.random() * 50) + 20,
        status: Math.random() > 0.95 ? 'warning' : 'online' as any
      }));
      
      setComponents(updatedComponents);
      
      // Calculate overall health
      const onlineCount = updatedComponents.filter(c => c.status === 'online').length;
      const healthPercentage = (onlineCount / updatedComponents.length) * 100;
      setOverallHealth(healthPercentage);
      
      setIsRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>صحة النظام العامة</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-green-500">{overallHealth.toFixed(0)}%</div>
            <div>
              <p className="text-lg font-semibold">النظام يعمل بشكل مثالي</p>
              <p className="text-sm text-muted-foreground">
                آخر فحص: {new Date().toLocaleString('ar-SA')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة المكونات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {components.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <h3 className="font-medium">{component.name}</h3>
                    <p className="text-sm text-muted-foreground">{component.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(component.status)}
                  {component.responseTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {component.responseTime}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">متوسط وقت الاستجابة</p>
                <p className="text-xl font-bold">35ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">وقت التشغيل</p>
                <p className="text-xl font-bold">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="text-xl font-bold">الآن</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatus;
