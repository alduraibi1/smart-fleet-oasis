
import { Car, Users, Calendar, DollarSign, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { useNavigate } from 'react-router-dom';

export function UnifiedDashboard() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { alerts, markAsRead, generateSmartAlerts } = useSystemAlerts();
  const navigate = useNavigate();

  const unreadAlerts = alerts.filter(alert => !alert.is_read);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم الموحدة</h1>
          <p className="text-muted-foreground">نظرة شاملة على جميع عمليات النظام</p>
        </div>
        <Button onClick={generateSmartAlerts} variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          فحص التنبيهات
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vehicles')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المركبات</p>
                <p className="text-2xl font-bold">{stats.total_vehicles}</p>
                <p className="text-xs text-green-600">
                  {stats.available_vehicles} متاحة | {stats.rented_vehicles} مؤجرة
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/customers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{stats.total_customers}</p>
                <p className="text-xs text-blue-600">عملاء مسجلون</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contracts')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العقود النشطة</p>
                <p className="text-2xl font-bold">{stats.active_contracts}</p>
                <p className="text-xs text-green-600">عقود سارية</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/accounting')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  الشهر الحالي
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/maintenance')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صيانة معلقة</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_maintenance}</p>
              </div>
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مدفوعات متأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue_payments}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">وثائق منتهية الصلاحية</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiring_documents}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              التنبيهات المهمة
              <Badge variant="destructive">{unreadAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {unreadAlerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getAlertColor(alert.severity) as any}>
                          {alert.severity === 'critical' ? 'حرج' : 
                           alert.severity === 'high' ? 'عالي' :
                           alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/vehicles')}>
              <Car className="h-6 w-6" />
              <span>إضافة مركبة</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/customers')}>
              <Users className="h-6 w-6" />
              <span>عميل جديد</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/contracts')}>
              <Calendar className="h-6 w-6" />
              <span>عقد إيجار</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/maintenance')}>
              <Settings className="h-6 w-6" />
              <span>طلب صيانة</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
