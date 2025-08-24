
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  Wrench, 
  Calendar,
  CheckCircle,
  Bell,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  plateNumber: string;
  alertType: 'overdue' | 'due_soon' | 'scheduled' | 'predictive';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dueDate: string;
  estimatedCost: number;
  currentMileage: number;
  serviceMileage?: number;
  daysOverdue?: number;
  confidence?: number;
}

interface VehicleHealthStatus {
  vehicleId: string;
  plateNumber: string;
  overallHealth: number;
  batteryLevel?: number;
  engineHealth: number;
  transmissionHealth: number;
  brakeHealth: number;
  lastUpdate: string;
  alerts: number;
}

const SmartMaintenanceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [healthStatuses, setHealthStatuses] = useState<VehicleHealthStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMaintenanceAlerts();
    loadHealthStatuses();
  }, []);

  const loadMaintenanceAlerts = () => {
    const mockAlerts: MaintenanceAlert[] = [
      {
        id: '1',
        vehicleId: '1',
        plateNumber: 'أ ب ج 1234',
        alertType: 'overdue',
        priority: 'urgent',
        title: 'صيانة دورية متأخرة',
        description: 'الصيانة الدورية متأخرة بـ 15 يوم ويجب تنفيذها فوراً',
        dueDate: '2025-01-10',
        estimatedCost: 1200,
        currentMileage: 45300,
        serviceMileage: 45000,
        daysOverdue: 15
      },
      {
        id: '2',
        vehicleId: '2',
        plateNumber: 'د ه و 5678',
        alertType: 'due_soon',
        priority: 'high',
        title: 'تغيير زيت المحرك',
        description: 'موعد تغيير زيت المحرك خلال 5 أيام',
        dueDate: '2025-01-30',
        estimatedCost: 350,
        currentMileage: 38900,
        serviceMileage: 40000
      },
      {
        id: '3',
        vehicleId: '3',
        plateNumber: 'ز ح ط 9012',
        alertType: 'predictive',
        priority: 'medium',
        title: 'تنبؤ صيانة الفرامل',
        description: 'الذكاء الاصطناعي يتوقع الحاجة لصيانة الفرامل خلال شهر',
        dueDate: '2025-02-25',
        estimatedCost: 800,
        currentMileage: 32100,
        confidence: 78
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadHealthStatuses = () => {
    const mockStatuses: VehicleHealthStatus[] = [
      {
        vehicleId: '1',
        plateNumber: 'أ ب ج 1234',
        overallHealth: 65,
        batteryLevel: 78,
        engineHealth: 70,
        transmissionHealth: 85,
        brakeHealth: 45,
        lastUpdate: '2025-01-24T10:30:00',
        alerts: 2
      },
      {
        vehicleId: '2',
        plateNumber: 'د ه و 5678',
        overallHealth: 92,
        batteryLevel: 95,
        engineHealth: 88,
        transmissionHealth: 95,
        brakeHealth: 92,
        lastUpdate: '2025-01-24T10:25:00',
        alerts: 1
      },
      {
        vehicleId: '3',
        plateNumber: 'ز ح ط 9012',
        overallHealth: 78,
        batteryLevel: 82,
        engineHealth: 80,
        transmissionHealth: 75,
        brakeHealth: 72,
        lastUpdate: '2025-01-24T09:45:00',
        alerts: 1
      }
    ];
    setHealthStatuses(mockStatuses);
  };

  const getPriorityColor = (priority: MaintenanceAlert['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: MaintenanceAlert['priority']) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scheduleMaintenanceAction = async (alertId: string) => {
    toast({
      title: "تم جدولة الصيانة",
      description: "تم إنشاء موعد صيانة وإرسال تنبيه للفني",
      variant: "default"
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "تم إلغاء التنبيه",
      description: "تم إلغاء التنبيه بنجاح",
      variant: "default"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const urgentAlerts = alerts.filter(a => a.priority === 'urgent').length;
  const highAlerts = alerts.filter(a => a.priority === 'high').length;
  const totalEstimatedCost = alerts.reduce((sum, alert) => sum + alert.estimatedCost, 0);

  return (
    <div className="space-y-6">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تنبيهات عاجلة</p>
                <p className="text-2xl font-bold text-red-600">{urgentAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تنبيهات مهمة</p>
                <p className="text-2xl font-bold text-orange-600">{highAlerts}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي التنبيهات</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التكلفة المقدرة</p>
                <p className="text-2xl font-bold">{formatCurrency(totalEstimatedCost)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات الصيانة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            تنبيهات الصيانة الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority === 'urgent' && 'عاجل'}
                          {alert.priority === 'high' && 'مهم'}
                          {alert.priority === 'medium' && 'متوسط'}
                          {alert.priority === 'low' && 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">المركبة: </span>
                          <span className="font-medium">{alert.plateNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">الموعد المستحق: </span>
                          <span className="font-medium">
                            {new Date(alert.dueDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">التكلفة المقدرة: </span>
                          <span className="font-medium">{formatCurrency(alert.estimatedCost)}</span>
                        </div>
                      </div>

                      {alert.alertType === 'predictive' && alert.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">مستوى الثقة في التنبؤ</span>
                            <span className="text-xs font-medium">{alert.confidence}%</span>
                          </div>
                          <Progress value={alert.confidence} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => scheduleMaintenanceAction(alert.id)}
                      className="gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      جدولة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => dismissAlert(alert.id)}
                      className="gap-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* حالة صحة المركبات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            حالة صحة المركبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthStatuses.map((status) => (
              <div key={status.vehicleId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{status.plateNumber}</span>
                    <Badge variant={status.overallHealth >= 80 ? 'default' : status.overallHealth >= 60 ? 'secondary' : 'destructive'}>
                      الصحة العامة: {status.overallHealth}%
                    </Badge>
                    {status.alerts > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Bell className="h-3 w-3" />
                        {status.alerts} تنبيه
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    آخر تحديث: {new Date(status.lastUpdate).toLocaleTimeString('ar-SA')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">المحرك</span>
                      <span className={`text-sm font-medium ${getHealthColor(status.engineHealth)}`}>
                        {status.engineHealth}%
                      </span>
                    </div>
                    <Progress value={status.engineHealth} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">ناقل الحركة</span>
                      <span className={`text-sm font-medium ${getHealthColor(status.transmissionHealth)}`}>
                        {status.transmissionHealth}%
                      </span>
                    </div>
                    <Progress value={status.transmissionHealth} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">الفرامل</span>
                      <span className={`text-sm font-medium ${getHealthColor(status.brakeHealth)}`}>
                        {status.brakeHealth}%
                      </span>
                    </div>
                    <Progress value={status.brakeHealth} className="h-2" />
                  </div>

                  {status.batteryLevel && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">البطارية</span>
                        <span className={`text-sm font-medium ${getHealthColor(status.batteryLevel)}`}>
                          {status.batteryLevel}%
                        </span>
                      </div>
                      <Progress value={status.batteryLevel} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMaintenanceAlerts;
