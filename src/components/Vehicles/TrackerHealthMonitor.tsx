
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceHealth {
  deviceId: string;
  plate: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastSeen: Date;
  issues: string[];
  signalStrength?: number;
  batteryLevel?: number;
}

interface HealthAlert {
  id: string;
  type: 'device_offline' | 'low_battery' | 'poor_signal' | 'data_anomaly';
  message: string;
  severity: 'low' | 'medium' | 'high';
  deviceId: string;
  timestamp: Date;
}

const TrackerHealthMonitor: React.FC = () => {
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    offline: 0,
  });

  const { toast } = useToast();

  // محاكاة بيانات الأجهزة (في التطبيق الحقيقي ستأتي من API)
  const mockDevices: DeviceHealth[] = [
    {
      deviceId: 'TK001',
      plate: 'أ ب ج 1234',
      status: 'healthy',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 دقائق
      issues: [],
      signalStrength: 85,
      batteryLevel: 92,
    },
    {
      deviceId: 'TK002',
      plate: 'د ه و 5678',
      status: 'warning',
      lastSeen: new Date(Date.now() - 25 * 60 * 1000), // 25 دقيقة
      issues: ['إشارة ضعيفة', 'بطارية منخفضة'],
      signalStrength: 45,
      batteryLevel: 23,
    },
    {
      deviceId: 'TK003',
      plate: 'ز ح ط 9012',
      status: 'critical',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // ساعتين
      issues: ['منقطع لفترة طويلة', 'آخر إشارة غير طبيعية'],
      signalStrength: 0,
      batteryLevel: 0,
    },
  ];

  const loadDeviceHealth = () => {
    // في التطبيق الحقيقي، ستجلب البيانات من API
    setDevices(mockDevices);
    
    // حساب الإحصائيات
    const newStats = mockDevices.reduce((acc, device) => {
      acc.total += 1;
      acc[device.status] += 1;
      return acc;
    }, { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0 });
    
    setStats(newStats);

    // توليد تنبيهات للأجهزة المشكلة
    const newAlerts: HealthAlert[] = mockDevices
      .filter(device => device.status !== 'healthy')
      .map(device => ({
        id: `alert-${device.deviceId}-${Date.now()}`,
        type: device.status === 'offline' ? 'device_offline' : 
              device.batteryLevel && device.batteryLevel < 30 ? 'low_battery' : 'poor_signal',
        message: generateAlertMessage(device),
        severity: device.status === 'critical' ? 'high' : 'medium',
        deviceId: device.deviceId,
        timestamp: new Date(),
      }));
    
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // أحدث 10 تنبيهات
  };

  const generateAlertMessage = (device: DeviceHealth): string => {
    const timeSinceLastSeen = Math.floor((Date.now() - device.lastSeen.getTime()) / (1000 * 60));
    
    if (device.status === 'offline') {
      return `الجهاز ${device.plate} (${device.deviceId}) منقطع منذ ${timeSinceLastSeen} دقيقة`;
    }
    
    if (device.batteryLevel && device.batteryLevel < 30) {
      return `بطارية الجهاز ${device.plate} منخفضة (${device.batteryLevel}%)`;
    }
    
    if (device.signalStrength && device.signalStrength < 50) {
      return `إشارة ضعيفة للجهاز ${device.plate} (${device.signalStrength}%)`;
    }
    
    return `مشكلة في الجهاز ${device.plate} - يحتاج انتباه`;
  };

  const getStatusIcon = (status: DeviceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DeviceHealth['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
      offline: 'outline',
    } as const;

    const labels = {
      healthy: 'سليم',
      warning: 'تحذير',
      critical: 'حرج',
      offline: 'منقطع',
    };

    return (
      <Badge variant={variants[status]} className="gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    loadDeviceHealth(); // تحميل فوري
    
    const interval = setInterval(() => {
      loadDeviceHealth();
    }, 30000); // كل 30 ثانية

    toast({
      title: 'بدء المراقبة الفورية',
      description: 'سيتم تحديث حالة الأجهزة كل 30 ثانية',
      duration: 3000,
    });

    // تنظيف عند إلغاء المكون
    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: 'توقفت المراقبة',
      description: 'يمكنك تشغيلها مرة أخرى عند الحاجة',
      duration: 2000,
    });
  };

  useEffect(() => {
    loadDeviceHealth(); // تحميل أولي
  }, []);

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الأجهزة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">سليمة</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">تحذيرات</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">حرجة</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
              <WifiOff className="h-4 w-4 text-gray-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">منقطعة</p>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-2">
        <Button 
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          variant={isMonitoring ? 'destructive' : 'default'}
          className="gap-2"
        >
          {isMonitoring ? (
            <>
              <WifiOff className="h-4 w-4" />
              إيقاف المراقبة
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              بدء المراقبة الفورية
            </>
          )}
        </Button>

        <Button onClick={loadDeviceHealth} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* التنبيهات الحديثة */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              التنبيهات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <Alert key={alert.id} className={
                  alert.severity === 'high' ? 'border-red-200 bg-red-50' : 
                  alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                  'border-blue-200 bg-blue-50'
                }>
                  <AlertDescription className="flex justify-between items-center">
                    <span>{alert.message}</span>
                    <Badge variant="outline" className="text-xs">
                      {alert.timestamp.toLocaleTimeString('ar-SA')}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الأجهزة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            حالة الأجهزة التفصيلية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {devices.map(device => (
              <div key={device.deviceId} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{device.plate}</div>
                    <div className="text-sm text-muted-foreground">{device.deviceId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* معلومات البطارية والإشارة */}
                  {device.batteryLevel !== undefined && (
                    <div className="text-xs text-center">
                      <div className="text-muted-foreground">البطارية</div>
                      <div className={`font-medium ${device.batteryLevel < 30 ? 'text-red-500' : 'text-green-500'}`}>
                        {device.batteryLevel}%
                      </div>
                    </div>
                  )}

                  {device.signalStrength !== undefined && (
                    <div className="text-xs text-center">
                      <div className="text-muted-foreground">الإشارة</div>
                      <div className={`font-medium ${device.signalStrength < 50 ? 'text-red-500' : 'text-green-500'}`}>
                        {device.signalStrength}%
                      </div>
                    </div>
                  )}

                  {/* آخر اتصال */}
                  <div className="text-xs text-center">
                    <div className="text-muted-foreground">آخر اتصال</div>
                    <div className="font-medium">
                      {Math.floor((Date.now() - device.lastSeen.getTime()) / (1000 * 60))}د
                    </div>
                  </div>

                  {/* الحالة */}
                  {getStatusBadge(device.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackerHealthMonitor;
