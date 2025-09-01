import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  TrendingDown, 
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useSmartInventoryAlerts } from '@/hooks/useSmartInventoryAlerts';

export function SmartInventoryAlerts() {
  const {
    alerts,
    loading,
    lastCheck,
    checkAlerts,
    getCriticalAlerts,
    getLowStockAlerts,
    getExpiryAlerts,
    getReorderAlerts,
    getAlertStats
  } = useSmartInventoryAlerts();

  const stats = getAlertStats();
  const criticalAlerts = getCriticalAlerts();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return Package;
      case 'expired': return AlertTriangle;
      case 'expiring_soon': return Clock;
      case 'reorder_needed': return TrendingDown;
      default: return AlertTriangle;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'low_stock': 'مخزون منخفض',
      'expired': 'منتهي الصلاحية',
      'expiring_soon': 'قرب الانتهاء',
      'reorder_needed': 'إعادة طلب'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">التنبيهات الذكية للمخزون</h2>
          <p className="text-muted-foreground">
            مراقبة تلقائية وتنبيهات ذكية للمخزون والصلاحية
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastCheck && (
            <span className="text-sm text-muted-foreground">
              آخر فحص: {lastCheck.toLocaleString('ar-SA')}
            </span>
          )}
          <Button 
            onClick={checkAlerts} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">تنبيهات عاجلة</p>
                <p className="text-2xl font-bold text-destructive">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium">مخزون منخفض</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">انتهاء صلاحية</p>
                <p className="text-2xl font-bold">{stats.expiry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">إعادة طلب</p>
                <p className="text-2xl font-bold">{stats.reorder}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات تحتاج انتباه عاجل ({criticalAlerts.length})
            </CardTitle>
            <CardDescription>
              هذه التنبيهات تتطلب اتخاذ إجراء فوري
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.slice(0, 5).map((alert, index) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <Alert key={index} className="border-destructive/50">
                    <Icon className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{alert.item_name}</span>
                          {alert.category && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({alert.category})
                            </span>
                          )}
                          <p className="text-sm mt-1">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(alert.priority)}>
                            {alert.priority === 'urgent' && 'عاجل'}
                            {alert.priority === 'high' && 'عالي'}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(alert.type)}
                          </Badge>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
              
              {criticalAlerts.length > 5 && (
                <div className="text-center">
                  <Button variant="ghost" size="sm">
                    عرض جميع التنبيهات العاجلة ({criticalAlerts.length - 5} أخرى)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Alerts by Category */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          {getLowStockAlerts().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  مخزون منخفض ({getLowStockAlerts().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getLowStockAlerts().slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium text-sm">{alert.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          متوفر: {alert.current_stock} | الحد الأدنى: {alert.minimum_stock}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(alert.priority)}>
                        {alert.priority === 'urgent' && 'عاجل'}
                        {alert.priority === 'high' && 'عالي'}
                        {alert.priority === 'medium' && 'متوسط'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiry Alerts */}
          {getExpiryAlerts().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  انتهاء الصلاحية ({getExpiryAlerts().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getExpiryAlerts().slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium text-sm">{alert.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.expiry_date && new Date(alert.expiry_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Badge variant={getPriorityColor(alert.priority)}>
                        {getTypeLabel(alert.type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reorder Alerts */}
          {getReorderAlerts().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  توقعات إعادة الطلب ({getReorderAlerts().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getReorderAlerts().slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium text-sm">{alert.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          سينتهي خلال: {alert.predicted_days_until_empty} يوم
                        </p>
                      </div>
                      <Badge variant="outline">
                        {alert.consumption_rate?.toFixed(1)} وحدة/يوم
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد تنبيهات حالياً</h3>
            <p className="text-muted-foreground mb-4">
              جميع عناصر المخزون في حالة جيدة
            </p>
            <Button onClick={checkAlerts} disabled={loading}>
              فحص التنبيهات
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}