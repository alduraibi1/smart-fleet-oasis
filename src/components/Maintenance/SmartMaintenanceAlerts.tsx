
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

export const SmartMaintenanceAlerts = () => {
  // Mock alerts data
  const alerts = [
    {
      id: 1,
      type: 'overdue',
      severity: 'high',
      title: 'صيانة متأخرة - أ ب ج 1234',
      message: 'المركبة كامري 2020 تحتاج صيانة دورية متأخرة بـ 5 أيام',
      entityType: 'vehicle',
      entityId: '1',
      createdAt: '2024-01-15T10:30:00Z',
      acknowledged: false,
      actionRequired: true,
      actionUrl: '/maintenance/schedule',
      autoResolve: false
    },
    {
      id: 2,
      type: 'prediction',
      severity: 'medium',
      title: 'توقع احتياج صيانة - د هـ و 5678',
      message: 'النظام يتوقع احتياج تغيير زيت للمركبة كورولا 2019 خلال 3 أيام',
      entityType: 'vehicle',
      entityId: '2',
      createdAt: '2024-01-15T09:15:00Z',
      acknowledged: false,
      actionRequired: true,
      actionUrl: '/maintenance/predictions',
      autoResolve: false
    },
    {
      id: 3,
      type: 'quality_issue',
      severity: 'high',
      title: 'مشكلة جودة - ز ح ط 9012',
      message: 'فحص الجودة للصيانة الأخيرة أظهر مشاكل تحتاج إعادة عمل',
      entityType: 'maintenance',
      entityId: '3',
      createdAt: '2024-01-15T08:45:00Z',
      acknowledged: false,
      actionRequired: true,
      actionUrl: '/maintenance/quality',
      autoResolve: false
    },
    {
      id: 4,
      type: 'inventory_low',
      severity: 'medium',
      title: 'نقص في المخزون - زيت محرك',
      message: 'مستوى زيت المحرك 5W-30 منخفض، يحتاج إعادة تموين',
      entityType: 'inventory',
      entityId: '4',
      createdAt: '2024-01-15T07:20:00Z',
      acknowledged: true,
      actionRequired: true,
      actionUrl: '/inventory',
      autoResolve: false
    },
    {
      id: 5,
      type: 'efficiency',
      severity: 'low',
      title: 'انخفاض كفاءة الميكانيكي',
      message: 'أداء الميكانيكي أحمد محمد انخفض إلى 75% هذا الأسبوع',
      entityType: 'mechanic',
      entityId: '5',
      createdAt: '2024-01-14T16:10:00Z',
      acknowledged: false,
      actionRequired: false,
      actionUrl: '/maintenance/mechanics',
      autoResolve: true
    }
  ];

  const alertStats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    pending: alerts.filter(a => !a.acknowledged && a.actionRequired).length
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return severity;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return Clock;
      case 'prediction':
        return TrendingUp;
      case 'quality_issue':
        return AlertTriangle;
      case 'inventory_low':
        return Wrench;
      case 'efficiency':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'متأخر';
      case 'prediction':
        return 'تنبؤ';
      case 'quality_issue':
        return 'مشكلة جودة';
      case 'inventory_low':
        return 'نقص مخزون';
      case 'efficiency':
        return 'كفاءة';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">التنبيهات الذكية</h3>
          <p className="text-muted-foreground">
            نظام تنبيهات ذكي لمراقبة الصيانة والتنبؤ بالمشاكل
          </p>
        </div>
        <Button className="gap-2">
          <Settings className="h-4 w-4" />
          إعدادات التنبيهات
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عالي الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertStats.high}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alertStats.medium}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              منخفض الأولوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alertStats.low}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تم الاطلاع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alertStats.acknowledged}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              يحتاج إجراء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertStats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            التنبيهات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => {
              const IconComponent = getTypeIcon(alert.type);
              return (
                <Card key={alert.id} className={`p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(alert.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {new Date(alert.createdAt).toLocaleString('ar')}
                          </span>
                          {alert.acknowledged && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>تم الاطلاع</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline">
                              تم الاطلاع
                            </Button>
                          )}
                          {alert.actionRequired && (
                            <Button size="sm" variant="default">
                              اتخاذ إجراء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التنبيهات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">تنبيهات الصيانة المتأخرة</h4>
              <p className="text-sm text-muted-foreground">
                تنبيه عند تأخر الصيانة المجدولة
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">نشط</span>
                <div className="w-10 h-6 bg-primary rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">التنبؤات الذكية</h4>
              <p className="text-sm text-muted-foreground">
                تنبيهات بناءً على التنبؤات بالذكاء الاصطناعي
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">نشط</span>
                <div className="w-10 h-6 bg-primary rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">مشاكل الجودة</h4>
              <p className="text-sm text-muted-foreground">
                تنبيه عند فشل فحوصات الجودة
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">نشط</span>
                <div className="w-10 h-6 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
